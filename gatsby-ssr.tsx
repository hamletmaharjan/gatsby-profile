// gatsby-ssr.ts
import React from "react";

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <script
      key="adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9309967587775978"
      crossOrigin="anonymous"
    />,
  ]);
};
