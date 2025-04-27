import React from "react";

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

const paragraphStyles = {
  marginBottom: "16px",
  lineHeight: 1.6,
};

const AboutMe = () => {
  return (
    <main style={pageStyles}>
      <section style={sectionStyles}>
        <h1 style={headingStyles}>About Me</h1>
        <p style={paragraphStyles}>Work in progress</p>
      </section>
    </main>
  );
};

export default AboutMe;
