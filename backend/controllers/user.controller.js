const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    const newUser = await User.create({
      username,
      password_hash: password, // Pass plain password, hook will hash it
      role,
      parent_agent_id: role === 'cashier' ? parent_agent_id : null,
      commission_rate: role === 'agent' ? commission_rate : null,
      // created_by: req.userId // If registration is done by an authenticated user (e.g. admin creating users)
    });

    // TODO: Log registration in AuditLog
    // await db.AuditLog.create({ user_id: newUser.user_id, action: `User registered: ${newUser.username}` });


    res.status(201).send({
      message: 'User registered successfully!',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        role: newUser.role,
      }
    });
  } catch (error) {
    // TODO: Log error with system monitoring tool
    console.error('Registration error:', error);
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

    const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || 86400, // 24 hours
    });

    // TODO: Log login in AuditLog
    // await db.AuditLog.create({ user_id: user.user_id, action: `User logged in: ${user.username}` });

    res.status(200).send({
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      accessToken: token,
    });
  } catch (error) {
    // TODO: Log error with system monitoring tool
    console.error('Login error:', error);
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

    // Fields to update
    if (username) user.username = username;
    if (role) user.role = role;
    if (parent_agent_id !== undefined) user.parent_agent_id = parent_agent_id; // Allow setting to null
    if (commission_rate !== undefined) user.commission_rate = commission_rate; // Allow setting to null
    if (is_active !== undefined) user.is_active = is_active;
    if (password) user.password_hash = password; // Password will be hashed by the hook

    await user.save();

    // TODO: Log update in AuditLog
    // await db.AuditLog.create({ user_id: req.userId, action: `User updated: ${user.username} (ID: ${user.user_id})` });


    res.status(200).send({ message: 'User updated successfully.', user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        is_active: user.is_active
    }});
  } catch (error) {
    // TODO: Log error with system monitoring tool
    console.error('Update user error:', error);
    res.status(500).send({ message: error.message });
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

    const deletedUsername = user.username; // Store for logging before deletion
    await user.destroy();

    // TODO: Log deletion in AuditLog
    // await db.AuditLog.create({ user_id: req.userId, action: `User deleted: ${deletedUsername} (ID: ${userId})` });

    res.status(200).send({ message: 'User deleted successfully.' });
  } catch (error) {
    // TODO: Log error with system monitoring tool
    console.error('Delete user error:', error);
    res.status(500).send({ message: error.message });
  }
};
