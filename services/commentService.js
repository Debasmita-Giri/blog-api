const { isUUID } = require('validator');
const db = require('../config/db.connect.js');
const { ValidationError, UniqueConstraintError, Sequelize } = require('sequelize');

const createComment = async (postData, author_id) => {
  try {
    if (!postData.post_id || !isUUID(postData.post_id)) {
      throw { status: 400, message: 'Invalid post ID' };
    }
    const post = await db.Post.findByPk(postData.post_id);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    if (!postData.content || postData.content.trim() === '') {
      throw { status: 400, message: 'Content is required' };
    }
    const newComment = await db.Comment.create({ 
      content:postData.content, 
      post_id:postData.post_id, 
      author_id });

    return newComment;

  } catch (err) {

    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error fetching comments' };
  }
};

const getCommentsByPost = async (post_id) => {
  try {
    if (!post_id || !isUUID(post_id)) {
      throw { status: 400, message: 'Invalid post ID' };
    }

    const post = await db.Post.findByPk(post_id);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    const comments = await db.Comment.findAll({ where: { post_id } });
    if (comments.length === 0) {
      throw { status: 404, message: 'No comments found for this post' };
    }

    return comments;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error fetching comments' }
  }
};

const getCommentById = async (commentId) => {
  try {
    if (!commentId || !isUUID(commentId)) {
      throw { status: 400, message: 'Invalid comment ID' };
    }

    const comment = await db.Comment.findByPk(commentId);
    if (!comment) {
      throw { status: 404, message: 'Comment not found' };
    }

    return comment;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error fetching comments' }
  }
};

const updateComment = async (commentId, commentData,user) => {
  try {
    if (!commentId || !isUUID(commentId)) {
      throw { status: 400, message: 'Invalid comment ID' };
    }

    if (!commentData.content || commentData.content.trim() === '') {
      throw { status: 400, message: 'Content is required' };
    }

    const comment = await db.Comment.findByPk(commentId);
    if (comment) {
      if (user.userId !== comment.author_id && user.userRole !== 'admin') {
        throw { status: 403, message: 'You are not authorized to update this comment' };
      }
    }

    const [updated] = await db.Comment.update({ content:commentData.content }, { where: { comment_id: commentId } });
    if (!updated) {
      throw { status: 404, message: 'Comment not found' };
    }

    const updatedComment = await db.Comment.findByPk(commentId);
    return updatedComment;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error updating comments' }
  }
};

const deleteComment = async (commentId, userId, userRole) => {
  try {
    if (!commentId || !isUUID(commentId)) {
      throw { status: 400, message: 'Invalid comment ID' };
    }

    const comment = await db.Comment.findByPk(commentId, {
      include: {
        model: db.Post,
        attributes: ['author_id'],
      },
    });
    if (!comment) {
      throw { status: 404, message: 'Comment not found' };
    }

    if (userId !== comment.author_id && userRole !== 'admin' && userId !== comment.Post.author_id) {
      throw { status: 403, message: 'You are not authorized to delete this comment' };
    }

    await db.Comment.destroy({ where: { comment_id: commentId } });
    return { message: 'Comment deleted' };
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: err.status || 500, message: err.message || 'Error deleting comments' }
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};
