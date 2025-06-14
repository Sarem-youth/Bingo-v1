const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sentry = require('@sentry/node'); // Import Sentry
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_fallback'; // Fallback for safety

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password, role, parent_agent_id, commission_rate } = req.body;

    // Basic validation
    if (!username || !password || !role) {
      return res.status(400).send({ message: 'Username, password, and role are required.' });
    }

    if (role === 'cashier' && !parent_agent_id) {
      return res.status(400).send({ message: 'Cashier role requires a parent_agent_id.' });
    }
    if (role === 'agent' && commission_rate === undefined) {
      return res.status(400).send({ message: 'Agent role requires a commission_rate.' });
    }


    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).send({ message: 'Username already exists.' });
    }

    // Create user (password will be hashed by the model's hook)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password_hash: hashedPassword,
      role, // 'admin', 'agent', 'cashier'
      parent_agent_id: role === 'cashier' ? parent_agent_id : null,
      commission_rate: role === 'agent' ? commission_rate : null,
      is_active: true,
    });

    // Log registration in AuditLog
    try {
      await db.AuditLog.create({
        user_id: newUser.user_id, // or req.user.id if available and more appropriate
        action: `User registered: ${newUser.username} (Role: ${newUser.role})`,
      });
    } catch (auditLogError) {
      console.error('Failed to log registration to AuditLog:', auditLogError);
      // Optionally, log this failure to Sentry as well if critical
      Sentry.captureException(auditLogError);
    }


    res.status(201).send({
      message: 'User registered successfully!',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    Sentry.captureException(error); // Log error with Sentry
    res.status(500).send({ message: error.message || 'Some error occurred while registering the user.' });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    const passwordIsValid = await user.validPassword(password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid Password!' });
    }

    if (!user.is_active) {
      return res.status(403).send({ message: 'User account is inactive.' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'YOUR_FALLBACK_JWT_SECRET', // Fallback for safety
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Log login in AuditLog
    try {
      await db.AuditLog.create({
        user_id: user.user_id,
        action: `User logged in: ${user.username}`,
      });
    } catch (auditLogError) {
      console.error('Failed to log login to AuditLog:', auditLogError);
      Sentry.captureException(auditLogError);
    }

    res.status(200).send({
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      accessToken: token,
    });
  } catch (error) {
    console.error('Login error:', error);
    Sentry.captureException(error); // Log error with Sentry
    res.status(500).send({ message: error.message || 'Some error occurred while logging in.' });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'username', 'role', 'parent_agent_id', 'commission_rate', 'is_active', 'createdAt', 'updatedAt'],
    });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'username', 'role', 'parent_agent_id', 'commission_rate', 'is_active', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }
    // Add additional authorization if needed (e.g., only admin or self can view)
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, role, parent_agent_id, commission_rate, is_active, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Prevent non-admins from updating other users or critical fields
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId, 10)) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }
    if (req.user.role !== 'admin' && (role || is_active !== undefined)) {
        return res.status(403).json({ message: 'Forbidden: You cannot change role or active status.' });
    }


    // Fields that can be updated
    if (username) user.username = username;
    if (password) {
      // TODO: Add password complexity requirements
      user.password_hash = await bcrypt.hash(password, 10);
    }
    if (role && req.user.role === 'admin') user.role = role; // Only admin can change role
    if (parent_agent_id !== undefined && (req.user.role === 'admin' || user.role === 'cashier')) {
        user.parent_agent_id = parent_agent_id;
    }
    if (commission_rate !== undefined && (req.user.role === 'admin' || user.role === 'agent')) {
        user.commission_rate = commission_rate;
    }
    if (is_active !== undefined && req.user.role === 'admin') user.is_active = is_active; // Only admin can change active status

    await user.save();

    // Log update in AuditLog
    try {
      await db.AuditLog.create({
        user_id: req.user.userId, // The user performing the action
        action: `User profile updated for: ${user.username} (ID: ${user.user_id}) by ${req.user.username}`,
      });
    } catch (auditLogError) {
      console.error('Failed to log update to AuditLog:', auditLogError);
      Sentry.captureException(auditLogError);
    }

    res.json({ message: 'User updated successfully', user: user });
  } catch (error) {
    console.error('Update user error:', error);
    Sentry.captureException(error); // Log error with Sentry
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Instead of deleting, mark as inactive (soft delete)
    // userToDelete.is_active = false;
    // await userToDelete.save();
    // Or, if hard delete is required:
    await user.destroy();


    // Log deletion in AuditLog
    try {
      await db.AuditLog.create({
        user_id: req.user.userId, // The admin performing the action
        action: `User deleted: ${user.username} (ID: ${user.user_id}) by ${req.user.username}`,
      });
    } catch (auditLogError) {
      console.error('Failed to log deletion to AuditLog:', auditLogError);
      Sentry.captureException(auditLogError);
    }

    // res.json({ message: 'User marked as inactive successfully' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    Sentry.captureException(error); // Log error with Sentry
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
