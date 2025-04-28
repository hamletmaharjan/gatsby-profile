import path from "path";

const createBlogPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    query allBlogsQuery {
      allMarkdownRemark {
        nodes {
          id
          frontmatter {
            title
            author
            slug
            date
          }
        }
      }
    }
  `);

  console.log(
    "Creating blog pages...",
    result.data.allMarkdownRemark.nodes.length
  );
  result.data.allMarkdownRemark.nodes.forEach((node) => {
    createPage({
      path: `/blogs/${node.frontmatter.slug}`,
      component: path.resolve("./src/templates/blog-post.tsx"), // Use path.resolve
      context: { id: node.id },
    });
  });
};

exports.createPages = async (props) => {
  await createBlogPages(props);
};
