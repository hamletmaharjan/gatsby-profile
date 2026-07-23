import * as React from "react";
import { graphql } from "gatsby";
import { Helmet } from "react-helmet";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { getImage } from "gatsby-plugin-image";
import { Navbar } from "../components/navbar";
import { SEO } from "../components/seo";
import { AdUnit } from "../components/ad-unit";

const BlogPost = ({ data }: any) => {
  let post = data.markdownRemark;

  let featuredImg = getImage(
    post.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData,
  );

  return (
    <>
      {/* <Helmet>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11378801',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
        <meta name="test-helmet-check" content="hello" />
      </Helmet> */}
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description}
      />
      <Navbar />
      <Container maxW="960px" py={8}>
        <Heading mb={4}>{post.frontmatter.title}</Heading>
        <Text fontSize="sm" color="gray.500" mb={8}>
          {post.frontmatter.date}
        </Text>
        <Box
          className="blog-post-content"
          sx={{
            fontSize: "lg",
            lineHeight: "1.75",
            color: "gray.800",

            "&& h1": {
              fontSize: "3xl",
              fontWeight: "bold",
              mt: 12,
              mb: 5,
              lineHeight: "1.3",
            },
            "&& h2": {
              fontSize: "2xl",
              fontWeight: "bold",
              mt: 12,
              mb: 4,
              lineHeight: "1.3",
            },
            "&& h3": {
              fontSize: "xl",
              fontWeight: "bold",
              mt: 8,
              mb: 3,
              lineHeight: "1.3",
            },
            "&& h4": { fontSize: "lg", fontWeight: "semibold", mt: 6, mb: 2 },

            "&& p": { mb: 5 },
            "&& ul, && ol": { pl: 6, mb: 5 },
            "&& li": { mb: 2 },
            "&& hr": { my: 10, borderColor: "gray.200" },

            "&& a": { color: "blue.500", textDecoration: "underline" },

            "&& blockquote": {
              borderLeftWidth: "4px",
              borderLeftColor: "gray.300",
              pl: 4,
              py: 1,
              my: 6,
              color: "gray.600",
              fontStyle: "italic",
            },

            "&& img": { borderRadius: "md", my: 6, maxW: "100%" },

            "&& p code, && li code": {
              bg: "gray.100",
              color: "pink.600",
              px: "0.3em",
              py: "0.15em",
              borderRadius: "sm",
              fontSize: "0.9em",
              fontFamily: "mono",
            },

            "&& pre[class*='language-']": {
              borderRadius: "md",
              p: 4,
              my: 6,
              overflowX: "auto",
              fontSize: "sm",
              lineHeight: "1.6",
            },

            "&& table": { width: "100%", my: 6, borderCollapse: "collapse" },
            "&& th, && td": {
              border: "1px solid",
              borderColor: "gray.200",
              px: 3,
              py: 2,
            },
            "&& th": { bg: "gray.50", fontWeight: "semibold" },
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </Box>
        {/* <AdUnit slot="2222222222" /> */}
        <script src="https://nap5k.com/tag.min.js" data-zone="11378801" async />
      </Container>
    </>
  );
};

export default BlogPost;

export const query = graphql`
  query PostQuery($id: String) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        description
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800)
          }
        }
      }
    }
  }
`;
