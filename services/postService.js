const db = require('../config/db.connect.js');
const { isUUID } = require('validator');
const { ValidationError, UniqueConstraintError, Sequelize } = require('sequelize');


const createPost = async (postData, author_id) => {
  try {
    if (!postData.title || postData.title.trim() === '' || !postData.content || postData.content.trim() === '')  {
      throw { status: 400, message: 'Title, content are required' };
    }
    const validPostStatus = db.Post.rawAttributes.status.values;

    if (postData.status && !validPostStatus.includes(postData.status)) {
      throw { status: 400, message: 'Invalid Post status specified' };
    }
    const newPost = await db.Post.create({
      title: postData.title,
      content: postData.content,
      author_id,
      ...(postData.status && { status: postData.status })
    });
    return newPost;
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw {
        status: 409,
        message: err.errors.map(e => `${e.path} already exists`).join(', ')
      };
    }
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => `Invalid ${e.path}`).join(', ');
      throw {
        status: 422,
        message: messages
      };
    }
    if (err instanceof Sequelize.DatabaseError) {
      throw {
        status: 500,
        message: 'Database error'
      };
    }
    throw {
      status: err.status || 500,
      message: err.message || 'Error creating post'
    };
  }
};

const getAllPosts = async () => {
  try {
    const posts = await db.Post.findAll();
    if (posts.length === 0) {
      throw { status: 404, message: 'No posts found' };
    }
    return posts;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error fetching posts' };
  }
};

const getPostById = async (postId) => {
  try {
    if (!postId || !isUUID(postId)) {
      throw { status: 400, message: 'Invalid post ID' };
    }
    const post = await db.Post.findByPk(postId);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    return post;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error fetching posts' };
  }
};

const getPostByCategoryId = async (category_id) => {
  try {
    if (!category_id || isNaN(category_id)) {
      throw { status: 400, message: 'Invalid post ID' };
    }
    const posts = await db.Post.findAll({
      where: { category_id },
    });
if (posts.length === 0) {
      throw { status: 404, message: 'No Posts found for specified category' };
    }
    return posts;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error fetching posts' };
  }
};

const updatePost = async (postId, user, postData) => {
  try {
    if (!postId || !isUUID(postId)) {
      throw { status: 400, message: 'Invalid post ID' };
    }

  const post= await db.Post.findByPk(postId);
  if(!post){
    throw { status: 404, message: 'Post not found for update' };
   }

    if (user.userId !== post.author_id && user.userRole !== 'admin') {
      throw { status: 403, message: 'You are not authorized to update this post' };
    }   

    const requiredFields = ['title', 'content','status'];
    const hasValidField = requiredFields.some(field => postData[field]?.trim());
    if (!hasValidField) {
      throw { status: 400, message: 'At least one of title ,content or status must be provided and non-blank for update' };
    }

    requiredFields.forEach(field => {
      if (postData[field]?.trim() === '') {
        throw { status: 400, message: `${field} cannot be blank` };
      }
    });

    const [updated] = await db.Post.update( postData, { where: { post_id: postId } });

    if (!updated) {
      throw { status: 404, message: 'Post not found for update' };
    }

    return { message: 'Post updated successfully' };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw { status: 409, message: err.errors.map(e => `${e.path} already exists`).join(', ') };
    }
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => `Invalid ${e.path}`).join(', ');
      throw { status: 422, message: messages };
    }
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error updating post' };
  }
};

const deletePost = async (postId, user) => {
  try {
    if (!postId || !isUUID(postId)) {
      throw { status: 400, message: 'Invalid post ID' };
    }

    const post = await db.Post.findByPk(postId);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    if (user.userId !== post.author_id && user.role !== 'admin') {
      throw { status: 403, message: 'You are not authorized to delete this post' };
    }

    await db.Post.destroy({ where: { post_id: postId } });

    return { status: 204, message: 'Post deleted' };
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error deleting post' };
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostByCategoryId
};
