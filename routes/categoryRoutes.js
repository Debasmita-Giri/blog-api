const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Get all categories (public)
router.get('/', categoryController.getCategories);

// Get a specific category by ID (public)
router.get('/:id', categoryController.getCategoryById);

// Create a new category (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), categoryController.createCategory);

// Update a category by ID (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), categoryController.updateCategory);

// Delete a category by ID (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;
