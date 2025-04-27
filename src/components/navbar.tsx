import * as React from "react";
import { Link } from "gatsby";

const navStyles = {
  width: "100%",
  backgroundColor: "#fff",
  padding: "16px 32px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: "-apple-system, Roboto, sans-serif, serif", // Consistent with other content
  maxWidth: 960,
  margin: "0 auto",
};

// const pageStyles = {
//     color: "#232129",
//     padding: "64px 32px",
//     fontFamily: "-apple-system, Roboto, sans-serif, serif",
//   };

const navBrandStyles = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#663399",
  textDecoration: "none",
};

const navLinksContainer = {
  display: "flex",
  gap: "24px",
  alignItems: "center",
};

const linkStyles = {
  fontSize: "1rem",
  color: "#232129",
  textDecoration: "none",
  padding: "8px 16px",
};

const activeLinkStyles = {
  ...linkStyles,
  color: "#663399", // Active link will be purple
};

export const Navbar: React.FC = () => {
  const [activePath, setActivePath] = React.useState<string>("");

  React.useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  return (
    <nav style={navStyles}>
      <Link to="/" style={navBrandStyles}>
        Hamlet
      </Link>
      <div style={navLinksContainer}>
        <Link to="/" style={activePath === "/" ? activeLinkStyles : linkStyles}>
          Home
        </Link>
        <Link
          to="/portfolio"
          style={
            activePath.includes("/portfolio") ? activeLinkStyles : linkStyles
          }
        >
          Portfolio
        </Link>
        <Link
          to="/about-me"
          style={activePath.includes("/about") ? activeLinkStyles : linkStyles}
        >
          About
        </Link>
        <Link
          to="/blogs"
          style={activePath.includes("/blogs") ? activeLinkStyles : linkStyles}
        >
          Blogs
        </Link>
        <Link
          to="/contact"
          style={
            activePath.includes("/contact") ? activeLinkStyles : linkStyles
          }
        >
          Contact
        </Link>
      </div>
    </nav>
  );
};
