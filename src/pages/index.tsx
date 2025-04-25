import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { SEO } from "../components/seo";

const pageStyles = {
  color: "#232129",
  padding: "64px 32px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
  maxWidth: 960,
  margin: "0 auto",
};

const sectionStyles = {
  marginBottom: "48px",
};

const headingStyles = {
  marginTop: 0,
  marginBottom: "32px",
  fontSize: "2.5rem",
};

const headingAccentStyles = {
  color: "#663399",
};

const projectCard = {
  background: "#fff",
  padding: "16px",
  marginBottom: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const linkStyle = {
  color: "#663399",
  textDecoration: "none",
};

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main style={pageStyles}>
      <header style={sectionStyles}>
        <h1 style={headingStyles}>
          Hello, I’m <span style={headingAccentStyles}>Hamlet Maharjan</span> 👋
        </h1>
        <p>
          I’m a full-stack developer specializing in React, NestJS, and AWS.
          Welcome to my portfolio!
        </p>
      </header>
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <SEO title="Hamlet Maharjan" />;
