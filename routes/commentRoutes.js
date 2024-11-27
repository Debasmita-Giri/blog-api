const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Create a new comment
router.post('/', authenticateToken, authorizeRoles('admin', 'user'), commentController.createComment);

// Get comments for a specific post by post ID
router.get('/post/:id', authenticateToken,authorizeRoles('admin', 'user'), commentController.getCommentsByPost);

// Get a single comment by ID
router.get('/:id', authenticateToken,authorizeRoles('admin', 'user'), commentController.getCommentById);

// Update a comment by ID
router.put('/:id', authenticateToken, authorizeRoles('admin', 'user'), commentController.updateComment);

// Delete a comment by ID
router.delete('/:id', authenticateToken, authorizeRoles('admin'), commentController.deleteComment);

module.exports = router;
