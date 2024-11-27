const commentService = require('../services/commentService');

const createComment = async (req, res) => {
  try {
    const newComment = await commentService.createComment(req.body, req.user.userId);
    res.status(201).json({ message: 'Comment created successfully', data: newComment });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const getCommentsByPost = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByPost(req.params.id);
    res.status(200).json({ message: 'Comments fetched successfully', data: comments });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const getCommentById = async (req, res) => {
  try {
    const comment = await commentService.getCommentById(req.params.id);
    res.status(200).json({ message: 'Comment fetched successfully', data: comment });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const updateComment = async (req, res) => {
  try {   
    const updatedComment = await commentService.updateComment(req.params.id, req.body,req.user);
    res.status(200).json({message: 'Comment updated successfully',data: updatedComment});
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const response = await commentService.deleteComment(req.params.id, req.user);
    res.status(204).json(response);
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};