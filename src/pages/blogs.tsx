import * as React from "react";
import { graphql, Link } from "gatsby";
import { Box, Heading, Text, VStack, Container, Image } from "@chakra-ui/react";
import { Navbar } from "../components/navbar";
import { SEO } from "../components/seo";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

const BlogsPage = ({ data }: any) => {
  const posts = data.allMarkdownRemark.nodes;

  return (
    <>
      <SEO title="Blogs" />
      <Navbar />
      <Container maxW="960px" py={8}>
        <Heading mb={6}>Blogs</Heading>
        <VStack spacing={8} align="stretch">
          {posts.map((post: any, index: number) => {
            let featuredImg = getImage(
              post.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData
            );

            return (
              <Box key={post.id}>
                {featuredImg && (
                  <Box overflow="hidden" borderRadius="md" width="100%" mb={4}>
                    <GatsbyImage
                      image={featuredImg}
                      alt={post.frontmatter.title}
                      style={{
                        width: "100%",
                        height: "220px", // Fixed height
                        objectFit: "cover", // Crop neatly
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                )}
                <Box>
                  <Link to={`/blogs/${post.frontmatter.slug}`}>
                    <Heading fontSize="xl" color="purple.500" mb={2}>
                      {post.frontmatter.title}
                    </Heading>
                  </Link>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    {post.frontmatter.date}
                  </Text>
                  <Text noOfLines={3}>{post.frontmatter.excerpt}</Text>
                </Box>

                {/* Add Divider except after the last post */}
                {index !== posts.length - 1 && (
                  <Box borderBottom="1px solid #E2E8F0" my={8} width="100%" />
                )}
              </Box>
            );
          })}
        </VStack>
      </Container>
    </>
  );
};

export default BlogsPage;

export const query = graphql`
  query {
    allMarkdownRemark {
      nodes {
        frontmatter {
          title
          author
          date
          description
          excerpt
          slug
          featuredImage {
            childImageSharp {
              gatsbyImageData(width: 800)
            }
          }
        }
      }
    }
  }
`;
