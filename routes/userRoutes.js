const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Get all users
router.get('/', authenticateToken,authorizeRoles('admin'),userController.getAllUsers);

// Create a new user
router.post('/', userController.createUser);

//Login a User
router.post('/login', userController.loginUser);

// Get a user by ID
router.get('/:id',authenticateToken,authorizeRoles('admin'), userController.getUserById);

// Update a user by ID
router.put('/:id', authenticateToken,authorizeRoles('user','admin'),userController.updateUser);

// Delete a user by ID
router.delete('/:id', authenticateToken,authorizeRoles('admin'),userController.deleteUser);


module.exports = router;
