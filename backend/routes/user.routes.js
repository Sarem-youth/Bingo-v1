const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js'); // Import authMiddleware

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/', [authMiddleware.verifyToken, authMiddleware.isAdmin], userController.getAllUsers);
router.get('/:userId', authMiddleware.verifyToken, userController.getUserById); // Further checks like isAdminOrSelf can be added in controller or here
router.put('/:userId', [authMiddleware.verifyToken, authMiddleware.isAdminOrSelf], userController.updateUser);
router.delete('/:userId', [authMiddleware.verifyToken, authMiddleware.isAdmin], userController.deleteUser);

module.exports = router;
