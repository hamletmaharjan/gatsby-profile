import React from "react";
import { graphql } from "gatsby";

const Test = ({ data: { mdx }, children }) => {
  //   const post = data.mdx;
  console.log("here", children);
  return (
    <div className="blog-post-content">
      <h1>test</h1>
      {children}
    </div>
  );
};

export default Test;

export const query = graphql`
  query MyQuery {
    mdx(id: { eq: "b2acad83-a553-5470-98ed-601739403612" }) {
      body
    }
  }
`;
