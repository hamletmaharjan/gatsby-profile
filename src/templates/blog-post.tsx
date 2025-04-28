import * as React from "react";
import { graphql } from "gatsby";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { getImage } from "gatsby-plugin-image";
import { Navbar } from "../components/navbar";
import { SEO } from "../components/seo";

const BlogPost = ({ data }: any) => {
  let post = data.markdownRemark;

  let featuredImg = getImage(
    post.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData
  );

  return (
    <>
      <SEO title={post.frontmatter.title} />
      <Navbar />
      <Container maxW="960px" py={8}>
        <Heading mb={4}>{post.frontmatter.title}</Heading>
        <Text fontSize="sm" color="gray.500" mb={8}>
          {post.frontmatter.date}
        </Text>
        <Box className="blog-post-content">
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </Box>
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
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800)
          }
        }
      }
    }
  }
`;
