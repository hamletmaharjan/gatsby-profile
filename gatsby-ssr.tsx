// gatsby-ssr.ts
import React from "react";

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    // <script
    //   key="adsense"
    //   async
    //   src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9309967587775978"
    //   crossOrigin="anonymous"
    // />,
    <meta name="monetag" content="ceb53c5b4bf067f7439edec66e812a01"></meta>,
  ]);
};
