const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Create a new post
router.post('/', authenticateToken, authorizeRoles('admin', 'user'), postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

router.get('/category/:id', postController.getPostsByCategoryId);
// Get a single post by ID
router.get('/:id', postController.getPostById);

// Update a post by ID
router.put('/:id', authenticateToken, authorizeRoles('admin', 'user'), postController.updatePost);

// Delete a post by ID
router.delete('/:id', authenticateToken, authorizeRoles('admin','user'), postController.deletePost);

module.exports = router;

