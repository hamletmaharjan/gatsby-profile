import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { SEO } from "../components/seo";
import { Navbar } from "../components/navbar";
import { StaticImage } from "gatsby-plugin-image";

const pageStyles = {
  color: "#232129",
  padding: "64px 16px", // Adjust padding for smaller screens
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
  maxWidth: 960,
  margin: "0 auto",
};

const sectionStyles = {
  marginBottom: "64px",
};

const headingStyles = {
  marginTop: 0,
  marginBottom: "32px",
  fontSize: "2.5rem",
};

const headingAccentStyles = {
  color: "#663399",
};

const subheadingStyles = {
  fontSize: "1.5rem",
  marginBottom: "16px",
  color: "#663399",
};

const paragraphStyles = {
  fontSize: "1.1rem",
  lineHeight: 1.6,
};

const projectGridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", // Responsive grid
  gap: "24px",
};

const projectCard = {
  background: "#fff",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column" as const,
};

const projectImage = {
  width: "100%",
  height: "180px",
  objectFit: "cover" as const,
  borderRadius: "8px 8px 0 0",
  marginBottom: "12px",
};

const projectTitle = {
  fontSize: "1.25rem",
  margin: "8px 0",
};

const projectLinks = {
  marginTop: "auto",
  display: "flex",
  gap: "8px",
  flexWrap: "wrap" as const,
};

const projectLink = {
  fontSize: "0.9rem",
  color: "#663399",
  textDecoration: "none",
};

const contactLinkStyles = {
  display: "inline-block",
  marginTop: "16px",
  fontSize: "1.1rem",
  color: "#663399",
  textDecoration: "none",
};

const PortfolioPage: React.FC<PageProps> = () => {
  return (
    <>
      <Navbar />
      <main style={pageStyles}>
        {/* Header */}
        <header style={sectionStyles}>
          <h1 style={headingStyles}>
            Hello, I’m <span style={headingAccentStyles}>Hamlet Maharjan</span>{" "}
            👋
          </h1>
          <p style={paragraphStyles}>
            I’m a software developer specializing in React, Node, SQL and AWS.
            Welcome to my portfolio!
          </p>
        </header>

        {/* About Section */}
        <section style={sectionStyles}>
          <h2 style={subheadingStyles}>About Me</h2>
          <p style={paragraphStyles}>
            I am passionate about building scalable web applications and
            cloud-based solutions. I love turning ideas into reality with clean,
            maintainable code.
          </p>
        </section>

        {/* Skills Section */}
        <section style={sectionStyles}>
          <h2 style={subheadingStyles}>Skills</h2>
          <ul
            style={{
              ...paragraphStyles,
              listStyleType: "disc",
              paddingLeft: "20px",
            }}
          >
            <li>React, Next.js, Gatsby</li>
            <li>Node.js, NestJS, Express</li>
            <li>AWS</li>
            <li>TypeScript, JavaScript, GraphQL</li>
            <li>SQL, MongoDB</li>
            <li>Git, GitHub</li>
          </ul>
        </section>

        {/* Projects Section */}
        <section style={sectionStyles}>
          <h2 style={subheadingStyles}>Projects</h2>
          <div style={projectGridStyles}>
            {/* Project 1 */}
            <div style={projectCard}>
              <StaticImage
                src="../images/doodle-jump.png"
                alt="Doodle Jump"
                style={projectImage}
                placeholder="blurred"
              />
              <h3 style={projectTitle}>Doodle Jump</h3>
              <p style={paragraphStyles}>
                A simple game made with vanilla JS using Canvas API.
              </p>
              <div style={projectLinks}>
                <a
                  href="https://github.com/yourusername/doodle-jump"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={projectLink}
                >
                  Source Code
                </a>
              </div>
            </div>

            {/* Project 2 */}
            <div style={projectCard}>
              <StaticImage
                src="../images/placeholder.png"
                alt="Lit Calendar"
                style={projectImage}
                placeholder="blurred"
              />
              <h3 style={projectTitle}>Lit Calendar</h3>
              <p style={paragraphStyles}>
                A calendar component built with LitElement featuring event
                management and drag-drop functionality.
              </p>
              <div style={projectLinks}>
                <a
                  href="https://github.com/yourusername/lit-calendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={projectLink}
                >
                  Source Code
                </a>
              </div>
            </div>

            {/* Project 3 */}
            <div style={projectCard}>
              <StaticImage
                src="../images/placeholder.png"
                alt="Worst Launcher"
                style={projectImage}
                placeholder="blurred"
              />
              <h3 style={projectTitle}>Worst Launcher</h3>
              <p style={paragraphStyles}>
                A fun Android launcher app that randomly launches apps, removing
                user choice for fun.
              </p>
              <div style={projectLinks}>
                <a
                  href="https://github.com/yourusername/worst-launcher"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={projectLink}
                >
                  Source Code
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section style={sectionStyles}>
          <h2 style={subheadingStyles}>Contact</h2>
          <p style={paragraphStyles}>
            Want to work together or have a chat? Feel free to reach out!
          </p>
          <a href="mailto:imhamlet.hams@gmail.com" style={contactLinkStyles}>
            Send me an email 📬
          </a>
        </section>
      </main>
    </>
  );
};

export default PortfolioPage;

export const Head: HeadFC = () => <SEO title="Hamlet Maharjan - Portfolio" />;
