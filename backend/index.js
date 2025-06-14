const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

// Basic configuration (in a real app, move to a config file)
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Placeholder for Database Configuration (to be expanded)
// const dbConfig = require('./config/db.config.js');

// Basic Routes (to be expanded into separate route files)
app.get('/', (req, res) => {
  res.send('Bingo Backend is Running!');
});

// TODO: Add routes for users, companies, transactions, game sessions etc.
// Example: const userRoutes = require('./routes/user.routes');
// app.use('/api/users', userRoutes);

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
        client.send(message.toString());
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
