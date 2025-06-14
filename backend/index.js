const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const db = require('./models'); // This will load ./models/index.js

// Basic configuration (in a real app, move to a config file)
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Sync database (optional, can be part of a migration strategy)
// db.sequelize.sync({ alter: true }).then(() => {
//   console.log('Database synced.');
// }).catch(err => {
//   console.error('Failed to sync db: ' + err.message);
// });

// Basic Routes (to be expanded into separate route files)
app.get('/', (req, res) => {
  res.send('Bingo Backend is Running!');
});

// API routes
const userRoutes = require('./routes/user.routes.js');
app.use('/api/users', userRoutes);
// TODO: Add other routes (companies, transactions, game sessions etc.)
// const companyRoutes = require('./routes/company.routes.js');
// app.use('/api/companies', companyRoutes);

const server = http.createServer(app);

// WebSocket Server Setup (to be expanded)
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    console.log('received: %s', message);
    // Broadcast message to all clients or handle specific game logic
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString()); // Ensure message is a string
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.send('Welcome to the Bingo WebSocket server!');
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

module.exports = app; // For potential testing
