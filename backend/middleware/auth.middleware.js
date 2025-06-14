const jwt = require('jsonwebtoken');
const db = require('../models'); // Assuming your User model is accessible via db.User
const User = db.User;

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_fallback', (err, decoded) => { // Fallback secret for safety, ensure JWT_SECRET is in .env
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.userId = decoded.id; // Assuming your JWT payload has an 'id' field for user_id
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user && user.role === 'admin') {
      next();
      return;
    }
    res.status(403).send({ message: 'Require Admin Role!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const isAgent = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user && user.role === 'agent') {
      next();
      return;
    }
    res.status(403).send({ message: 'Require Agent Role!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const isCashier = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user && user.role === 'cashier') {
      next();
      return;
    }
    res.status(403).send({ message: 'Require Cashier Role!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Middleware to check if the user is an Admin or the user themselves (for operations like updating own profile)
const isAdminOrSelf = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }
    // Check if the logged-in user is an admin OR if the logged-in user's ID matches the target user's ID from params
    if (user.role === 'admin' || (req.params.userId && req.userId === parseInt(req.params.userId))) {
      next();
    } else {
      res.status(403).send({ message: 'Require Admin Role or to be the user themselves!' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


const authMiddleware = {
  verifyToken,
  isAdmin,
  isAgent,
  isCashier,
  isAdminOrSelf,
};

module.exports = authMiddleware;
