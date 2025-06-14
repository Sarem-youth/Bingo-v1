const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');
// const authMiddleware = require('../middleware/auth.middleware.js'); // Example for route protection

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (example, assuming authMiddleware verifies JWT)
// router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);
// router.get('/:userId', authMiddleware.verifyToken, userController.getUserById);
// router.put('/:userId', authMiddleware.verifyToken, authMiddleware.isAdminOrSelf, userController.updateUser);
// router.delete('/:userId', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUser);

// For now, let's add some basic routes without full auth for testing
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser); // Simplified for now
router.delete('/:userId', userController.deleteUser); // Simplified for now


module.exports = router;
