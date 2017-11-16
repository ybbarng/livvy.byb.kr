import React from 'react';
import PropTypes from 'prop-types';
import Post from '../Post';

class CategoryTemplateDetails extends React.Component {
  render() {
    const items = [];
    const { authors } = this.props.data.site.siteMetadata;
    const category = this.props.pathContext.category;
    const posts = this.props.data.allMarkdownRemark.edges;
    posts.forEach((postData) => {
      const post = postData;
      post.node.author = authors.find(
        authorData => authorData.id === post.node.frontmatter.authorId);
      items.push(
        <Post data={post} key={post.node.fields.slug} />
      );
    });

    return (
      <div className="content">
        <div className="content__inner">
          <div className="page">
            <h1 className="page__title">
              {category}
            </h1>
            <div className="page__body">
              {items}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CategoryTemplateDetails.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        authors: PropTypes.array.isRequired
      })
    }),
    allMarkdownRemark: PropTypes.shape({
      edges: PropTypes.array.isRequired
    })
  }),
  pathContext: PropTypes.shape({
    category: PropTypes.string.isRequired
  })
};

export default CategoryTemplateDetails;