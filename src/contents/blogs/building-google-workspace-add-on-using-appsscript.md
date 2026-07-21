---
date: "2026-07-21"
description: A hands-on walkthrough of building a Gmail & Calendar
  Workspace Add-on with Apps Script and TypeScript --- Auth0 sign-in,
  CardService UI, and the gnarly edge cases nobody tells you about.
title: "Building a Google Workspace Add-on with Apps Script: A Practical
  Guide"
author: "Hamlet Maharjan"
slug: "building-google-workspace-addon"
featuredImage: "../../images/addon.jpg"
---

![addon](../../images/addon.jpg)

Google Workspace Add-ons let you inject custom UI directly into Gmail
and Calendar --- a panel in the right-hand sidebar that can read the
current email or event, call your own backend, and send it to your own
backend. If you've ever wanted a personal "second brain" that quietly
stores the emails and meetings that matter to you, without ever leaving
your inbox, this is the tool for the job.

This post walks through everything involved in building one for real:
project setup, Auth0 sign-in, the CardService UI model (and its very
real constraints), and a handful of hard-won lessons from building a
meeting-store feature that syncs Calendar events into a custom backend.

The example throughout: **a knowledge hub app** --- think of it as a
private journal that automatically captures important emails and
meetings you flag from Gmail/Calendar, so you have a searchable personal
record without manual copy-pasting.

---

## 1. What you're actually building

A Workspace Add-on is a server-rendered UI that Gmail/Calendar hosts
inside an iframe-like panel. There's no DOM access, no custom CSS, no
client-side JavaScript. Every button, every text block, every layout
choice is described declaratively in Apps Script using **CardService**,
and Google renders it into native-looking widgets. This is the single
biggest mental shift if you're coming from web development --- you're
not building a webpage, you're building a spec that Gmail interprets.

The add-on we'll reference throughout: a **Gmail + Calendar add-on that
stores emails and meetings into a personal application**, written in
TypeScript and compiled to Apps Script. Since it's single-user by design
(your own knowledge hub, not a multi-org product), there's no
organization concept to manage --- just "is this user signed in with
Auth0 or not."

---

## 2. Project setup

### 2.1 Tooling

Apps Script projects live in Google's own runtime, but you don't have to
write vanilla `.gs` files. Using
[`clasp`](https://github.com/google/clasp) (Command Line Apps Script
Projects), you can write TypeScript locally, transpile it, and push the
compiled output to Apps Script.

```bash
npm install -g @google/clasp
clasp login
clasp create --type standalone --title "Knowledge Hub Add-on"
```

A minimal `tsconfig.json` for Apps Script:

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "none",
    "lib": ["ES2019"],
    "types": ["google-apps-script"],
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
```

Install the type definitions so CardService, Gmail, and Calendar APIs
autocomplete properly:

```bash
npm install --save-dev @types/google-apps-script
```

### 2.2 The manifest --- `appsscript.json`

This file declares which Google APIs and OAuth scopes your add-on needs,
and where it hooks into Gmail/Calendar:

```json
{
  "timeZone": "Asia/Kathmandu",
  "dependencies": {
    "enabledAdvancedServices": [
      { "userSymbol": "Calendar", "version": "v3", "serviceId": "calendar" }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.addons.execute",
    "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
    "https://www.googleapis.com/auth/calendar.addons.execute",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/userinfo.email"
  ],
  "gmail": {
    "name": "Knowledge Hub",
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#4A86E8",
    "contextualTriggers": [
      {
        "unconditional": {},
        "onTriggerFunction": "onGmailMessage"
      }
    ]
  },
  "calendar": {
    "eventOpenTrigger": {
      "runFunction": "onCalendarEventOpen"
    }
  },
  "addOns": {
    "common": {
      "name": "Knowledge Hub",
      "logoUrl": "https://example.com/logo.png"
    }
  }
}
```

Since this is personal-use only, the scope list stays lean --- no Drive
access, no external organization routing, just Gmail/Calendar read
access plus one external HTTP scope to talk to your own backend.

### 2.3 File organization

Apps Script has no real module system, so a common pattern is one file
per concern, relying on the fact that everything shares a global scope
at runtime:

    src/
      Code.ts          // entry points: onGmailMessage, onCalendarEventOpen
      Auth.ts          // Auth0 sign-in and token handling
      Meeting.ts       // meeting synchronization flow
      Email.ts         // email store flow
      Utils.ts         // safeParams, ICS parsing helpers

---

## 3. Authentication with Auth0

Because this is a personal, single-user app, auth is refreshingly simple
compared to a multi-organization product: there's exactly one Auth0
identity to check for, and once it's connected, every card just checks
"do I have a valid token."

### 3.1 Setting up the Auth0 service

The [OAuth2 for Apps Script
library](https://github.com/googleworkspace/apps-script-oauth2) handles
the token dance. Add it as a library (script ID:
`1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`), then:

```typescript
function getAuth0Service(): GoogleAppsScriptOAuth2.OAuth2Service {
  return OAuth2.createService("auth0")
    .setAuthorizationBaseUrl("https://your-organization.auth0.com/authorize")
    .setTokenUrl("https://your-organization.auth0.com/oauth/token")
    .setClientId(
      PropertiesService.getScriptProperties().getProperty("CLIENT_ID")!,
    )
    .setClientSecret(
      PropertiesService.getScriptProperties().getProperty("CLIENT_SECRET")!,
    )
    .setCallbackFunction("authCallback")
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope("openid profile email offline_access")
    .setParam("audience", "https://your-personal-store-api.com")
    .setParam("access_type", "offline");
}

function authCallback(request: object): GoogleAppsScript.HTML.HtmlOutput {
  const service = getAuth0Service();
  const authorized = service.handleCallback(request);
  return HtmlService.createHtmlOutput(
    authorized
      ? "Success! You can close this tab."
      : "Denied. You can close this tab.",
  );
}
```

`PropertyStore` is set to `getUserProperties()` --- since it's your own
account using your own add-on, the token just needs to persist per
Google user, with no organization dimension to key it on at all.

### 3.2 A simple sign-in gate

Every entry point starts the same way: check if Auth0 access exists, and
if not, show a sign-in prompt instead of the main card. No organization
lookup, no routing --- just a single boolean gate:

```typescript
function onGmailMessage(
  e: GoogleAppsScript.Addons.EventObject,
): GoogleAppsScript.Card.Card[] {
  const service = getAuth0Service();

  if (!service.hasAccess()) {
    return [buildSignInCard(service.getAuthorizationUrl())];
  }

  const token = service.getAccessToken();
  return [buildMainCard(e, token)];
}

function buildSignInCard(authUrl: string): GoogleAppsScript.Card.Card {
  const section = CardService.newCardSection().addWidget(
    CardService.newTextParagraph().setText(
      "Sign in with Auth0 to start archiving your emails and meetings.",
    ),
  );

  section.addWidget(
    CardService.newTextButton()
      .setText("Sign in")
      .setOpenLink(CardService.newOpenLink().setUrl(authUrl)),
  );

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Sign in required"))
    .addSection(section)
    .build();
}
```

That's the entire auth surface for a personal app: one service, one
gate, no organization resolution step to get wrong.

---

## 4. CardService: the UI model

CardService is declarative and server-rendered. No CSS, no custom fonts,
no inline styles. Your primary formatting tool is `DecoratedText`, which
gives you a top label, bottom label, and optional icon/button --- close
to as flexible as it gets.

### 4.1 A basic card

```typescript
function buildMainCard(
  e: GoogleAppsScript.Addons.EventObject,
  token: string,
): GoogleAppsScript.Card.Card {
  const section = CardService.newCardSection().setHeader("Message details");

  section.addWidget(
    CardService.newDecoratedText()
      .setTopLabel("Subject")
      .setText(e.gmail!.messageMetadata!.subject ?? "(no subject)"),
  );

  section.addWidget(
    CardService.newTextButton()
      .setText("Archive this email")
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName("storeEmail")
          .setParameters({ messageId: e.gmail!.messageMetadata!.accessToken! }),
      ),
  );

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Knowledge Hub"))
    .addSection(section)
    .build();
}
```

### 4.2 Propagating state through every widget

CardService cards are stateless between renders --- Apps Script doesn't
remember what was on screen a moment ago. Every interactive widget's
`setParameters()` needs the **complete** state required to reconstruct
context on the next click, not just what's new. A pagination bug is
almost always this: some widget on the "next page" button is missing a
parameter that a widget on the "previous page" button had.

For state too large or structured to pass as flat key/value parameters
(e.g. which stored tags are toggled across paginated results), serialize
it:

```typescript
function buildTagRow(
  tag: Tag,
  tagEdits: Record<string, TagEdit>,
): GoogleAppsScript.Card.Widget {
  const serialized = JSON.stringify(tagEdits);

  return CardService.newDecoratedText()
    .setText(tag.name)
    .setSwitchControl(
      CardService.newSwitch()
        .setFieldName(`tag_${tag.id}`)
        .setValue(String(tagEdits[tag.id]?.applied ?? false))
        .setOnChangeAction(
          CardService.newAction()
            .setFunctionName("onTagToggle")
            .setParameters({ tagId: tag.id, tagEdits: serialized }),
        ),
    );
}
```

This `tagEdits` JSON-blob-as-parameter pattern is the fix for the
classic "I paginate to page 2 and my page 1 selections vanish" bug ---
the state was never being carried forward, just implicitly assumed to
persist.

### 4.3 Two-widget layouts and read-only rows

A trick for laying out a checkbox next to label text with visual
indentation (since there's no padding/margin API): pair a `Switch`
widget with a `TextParagraph` that uses non-breaking spaces
(`&nbsp;&nbsp;&nbsp;`) to fake indentation:

```typescript
section.addWidget(
  CardService.newTextParagraph().setText("&nbsp;&nbsp;&nbsp;Tagged: Family"),
);
```

For an email already stored, a read-only `DecoratedText` (no click
action, no switch) communicates "this is already saved" without extra
explanatory copy:

```typescript
CardService.newDecoratedText()
  .setTopLabel("Already stored")
  .setText("Saved on " + storedDate)
  .setIcon(CardService.Icon.STAR);
```

### 4.4 Typeahead / search widgets

`MULTI_SELECT` widgets backed by an external data source are the closest
thing CardService has to a live-search autocomplete --- useful here for
picking existing tags or folders in your knowledge hub:

```typescript
CardService.newSelectionInput()
  .setType(CardService.SelectionInputType.MULTI_SELECT)
  .setFieldName("tags")
  .setTitle("Tags")
  .setExternalDataSource(CardService.newAction().setFunctionName("searchTags"));
```

The gotcha: the callback function **must** return a plain object shaped
like `{ items: [...] }`, not a `CardService` builder response:

```typescript
function searchTags(e: { parameters: { keyword: string } }) {
  const results = queryArchiveTags(e.parameters.keyword);
  return {
    items: results.map((r) => ({
      text: r.name,
      value: r.id,
      selected: false,
    })),
  };
}
```

Returning a `CardService.newCardBuilder()...build()` here silently fails
--- this endpoint expects raw JSON, not a Card object.

### 4.5 Tab simulation with ButtonSet

CardService has no native tabs. A `ButtonSet` at the top of a card,
where each button re-renders a different section via `updateCard`,
simulates the effect --- handy for switching between "Details" and
"Attachments" views on an stored item:

```typescript
function buildTabbedCard(
  activeTab: "details" | "attachments",
): GoogleAppsScript.Card.Card {
  const buttonSet = CardService.newButtonSet()
    .addButton(
      CardService.newTextButton()
        .setText("Details")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("switchTab")
            .setParameters({ tab: "details" }),
        ),
    )
    .addButton(
      CardService.newTextButton()
        .setText("Attachments")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("switchTab")
            .setParameters({ tab: "attachments" }),
        ),
    );

  const section = CardService.newCardSection().addWidget(buttonSet);
  // ...append tab-specific widgets based on `activeTab`
  return CardService.newCardBuilder().addSection(section).build();
}

function switchTab(e: { parameters: { tab: "details" | "attachments" } }) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(buildTabbedCard(e.parameters.tab)),
    )
    .build();
}
```

`updateCard` replaces the current card in place; `pushCard` stacks a new
one on top with a back button. Use `updateCard` for tab-like switches,
`pushCard` for drill-downs.

---

## 5. The meeting synchronization feature

This is where most of the real complexity lives. Archiving a Calendar
event means parsing the event's ICS data, detecting whether it's
new/updated/cancelled, and rendering the right UI in both the Calendar
add-on _and_ the Gmail add-on (since meeting invites also show up as
email).

### 5.1 One parser, two entry points

Calendar events and Gmail invite emails both expose ICS data, but
through different APIs. Rather than writing two parsers, funnel both
paths through a single function:

```typescript
function getMeetingDescriptionHtml(icsContent: string): string {
  const vevent = extractVeventBlock(icsContent);
  const dtstart = parseDtstart(vevent);
  const summary = parseField(vevent, "SUMMARY");
  const location = parseField(vevent, "LOCATION");

  return `
    <b>${escapeHtml(summary)}</b><br/>
    ${dtstart.toLocaleString()}<br/>
    ${location ? escapeHtml(location) + "<br/>" : ""}
  `;
}
```

### 5.2 Scoping DTSTART to the VEVENT block

A subtle but nasty bug: `ICS` files often contain a `VTIMEZONE` block
_before_ the `VEVENT` block, and both can contain `DTSTART`-like fields
(`TZID`, `DTSTART` for timezone transition rules). A regex that isn't
scoped to `VEVENT` will happily match the wrong one --- producing an
event date that silently resolves to the Unix epoch.

The fix is to extract the `VEVENT` block first, then search _only_
within it:

```typescript
function extractVeventBlock(ics: string): string {
  const match = ics.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/);
  if (!match) throw new Error("No VEVENT block found in ICS content");
  return match[0];
}

function parseDtstart(veventBlock: string): Date {
  const match = veventBlock.match(/DTSTART(?:;[^:]*)?:(\d{8}T\d{6}Z?)/);
  if (!match) throw new Error("DTSTART not found within VEVENT block");
  return parseIcsDate(match[1]);
}
```

Lesson: **always scope regex extraction to the specific ICS component
you care about.** ICS is a flat text format with repeating field names
across different component types --- treat it structurally, not as one
big string to pattern-match.

### 5.3 Detecting updates via SEQUENCE

ICS events carry a `SEQUENCE` number that increments every time the
organizer edits the event. Comparing the incoming `SEQUENCE` against the
one stored at last store tells you whether to show "Already stored" or
"New updates available":

```typescript
function getMeetingArchiveStatus(
  eventId: string,
  incomingSequence: number,
): "not_stored" | "up_to_date" | "update_available" {
  const stored = getStoredArchiveRecord(eventId);
  if (!stored) return "not_stored";
  if (incomingSequence > stored.sequence) return "update_available";
  return "up_to_date";
}
```

```typescript
section.addWidget(
  CardService.newDecoratedText()
    .setTopLabel("Archive status")
    .setText(
      status === "update_available"
        ? "New updates available"
        : status === "up_to_date"
          ? "Already stored"
          : "Not yet stored",
    ),
);
```

### 5.4 Cancellation detection --- the MIME content-type gotcha

Cancelled meetings arrive as a separate ICS payload with `METHOD:CANCEL`
instead of `METHOD:REQUEST`. If your cancellation-prefix logic
(e.g. prepending "CANCELLED:" to a previously-stored meeting's title)
isn't firing consistently, check how you're reading the MIME content
type of the invite attachment --- a **strict equality check** against a
content-type string (e.g. `"text/calendar"`) will silently fail against
variants like `"text/calendar; method=CANCEL"` or different casing:

```typescript
function isCancellationInvite(contentType: string): boolean {
  // Don't do: contentType === "text/calendar; method=CANCEL"
  // Content-type strings carry extra parameters and vary in casing.
  return contentType.toLowerCase().includes("method=cancel");
}
```

Strict `===` checks against MIME strings are brittle by nature --- MIME
parameters (`charset`, `method`, `boundary`) get appended in whatever
order the sending client chooses. Parse out just the piece you need
instead of comparing the whole string.

### 5.5 Conditionally hiding UI based on invite context

Not every meeting card should show every widget --- e.g. a "View
original invite" link only makes sense if the event actually came in as
a Gmail invite rather than being created directly in Calendar. The
decision of _whether_ that context applies belongs in the calling
function (the trigger handler), not buried inside a shared data-fetching
utility:

```typescript
// Good: context decision lives where the trigger fires
function onCalendarEventOpen(e: GoogleAppsScript.Addons.EventObject) {
  const event = fetchCalendarEvent(e);
  const inviteContext = tryResolveInviteContext(event); // returns null if none
  return [
    buildMeetingCard(
      event,
      { showOriginalInvite: inviteContext !== null },
      inviteContext,
    ),
  ];
}

// Bad: baking the "should I show this" decision into the fetch utility
// makes it unreusable for callers that don't need invite-context logic at all
```

Keeping this separation means `fetchCalendarEvent` stays a pure
data-fetching function usable in more than one flow (Calendar open
trigger, Gmail invite trigger, a background sync job), while each caller
decides what UI implications follow from the data.

### 5.6 Recurring events and the composite ID

The Calendar Advanced Service returns recurring event instances with an
ID shaped like `eventId_20260721T090000Z`. If you're storing store
records keyed by event ID, split off the recurrence suffix so all
instances of a series map to the same base record where that's the
intended behavior:

```typescript
function getBaseEventId(eventId: string): string {
  return eventId.split("_")[0];
}
```

### 5.7 Safe parameter handling

CardService action parameters occasionally arrive `null` or `undefined`
depending on which widget triggered the action (a `Switch` versus a
`TextButton` populate parameters slightly differently). Wrapping access
in a small helper avoids a class of "Cannot read properties of
undefined" runtime errors that are otherwise hard to reproduce locally:

```typescript
function safeParams<T extends Record<string, string>>(
  e: { parameters?: Partial<T> } | undefined,
): Partial<T> {
  return e?.parameters ?? {};
}

// Usage
function onTagToggle(e: {
  parameters?: { tagId?: string; tagEdits?: string };
}) {
  const { tagId, tagEdits } = safeParams(e);
  if (!tagId) return; // defensive early exit
  const edits = tagEdits ? JSON.parse(tagEdits) : {};
  // ...
}
```

### 5.8 Stripping artifacts from stored HTML

Descriptions pulled from Calendar/Gmail sometimes carry inline `border`
styling artifacts (a leftover from how Google renders quoted content)
that look broken once stored into your own app's rich-text renderer. A
simple pass strips them before the payload goes out:

```typescript
function stripBorderArtifacts(html: string): string {
  return html.replace(/style="[^"]*border[^"]*"/gi, "");
}
```

### 5.9 Wiring in the conference ID

If your knowledge hub should link a meeting record back to its
video-conferencing link, pull `conferenceData` off the Calendar event
and pass the ID through the same payload as everything else --- no
special-casing needed once your payload shape already has room for it:

```typescript
function buildMeetingPayload(
  event: GoogleAppsScript.Calendar.Schema.Event,
): MeetingPayload {
  return {
    title: event.summary ?? "",
    start: event.start?.dateTime ?? event.start?.date ?? "",
    end: event.end?.dateTime ?? event.end?.date ?? "",
    conferenceId: event.conferenceData?.conferenceId ?? null,
  };
}
```

---

## 6. Putting the attachments section together

A small but easy-to-skip detail: when a card section lists attachments
you can optionally save alongside an stored email, a one-line
descriptive `TextParagraph` above the list ("Select which attachments to
include in your store") measurably reduces confusion versus a bare list
of checkboxes with no framing:

```typescript
section.addWidget(
  CardService.newTextParagraph().setText(
    "Select which attachments to include in your store.",
  ),
);

attachments.forEach((att) => {
  section.addWidget(
    CardService.newDecoratedText()
      .setText(att.filename)
      .setSwitchControl(
        CardService.newSwitch()
          .setFieldName(`attachment_${att.id}`)
          .setOnChangeAction(
            CardService.newAction()
              .setFunctionName("onAttachmentToggle")
              .setParameters({ attachmentId: att.id }),
          ),
      ),
  );
});
```

---

## 7. Wrapping up

A few patterns worth carrying into any Workspace Add-on project,
regardless of what backend you're archiving to:

- **Auth for a personal app can stay genuinely simple.** One Auth0
  service, one `hasAccess()` gate, no organization layer to
  accidentally get the ordering wrong on.
- **Context decisions belong with the caller**, not the shared utility
  --- keep data-fetching pure and let trigger handlers decide what UI
  implications follow.
- **State must be threaded through every widget explicitly.**
  CardService has no implicit memory between renders.
- **Treat ICS as structured data, not a flat string** --- scope every
  regex to the component (`VEVENT`, `VALARM`, etc.) you're actually
  targeting.
- **MIME and content-type comparisons should never be strict
  equality** --- parse out the piece you need.
- **Recurring event IDs need normalization** (`.split("_")[0]`) before
  you use them as storage keys.

None of this is exotic --- it's the accumulated result of a lot of small
edge cases, each one boring in isolation, that together make the
difference between a personal add-on that mostly works and one that
quietly, reliably stores every email and every meeting you care about,
cancelled invites and recurring series included.
