import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

import { SEO } from "../components/seo"

const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
}
const headingAccentStyles = {
  color: "#663399",
}



const IndexPage: React.FC<PageProps> = () => {
  return (
    <main style={pageStyles}>
      <h1 style={headingStyles}>
        Hello
        <br />
        <span style={headingAccentStyles}>— Welcome! 🎉🎉🎉</span>
      </h1>
      
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => (<SEO />)
