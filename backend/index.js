const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const Sentry = require('@sentry/node');

dotenv.config(); // Load environment variables from .env file

// Initialize Sentry
// Make sure to replace 'YOUR_SENTRY_DSN' with your actual DSN
Sentry.init({ 
  dsn: process.env.SENTRY_DSN || 'YOUR_SENTRY_DSN', 
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app: express() }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const db = require('./models'); // This will load ./models/index.js

// Basic configuration (in a real app, move to a config file)
const PORT = process.env.PORT || 3001;

const app = express();

// Sentry request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

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

// Sentry test route
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});

// API routes
const userRoutes = require('./routes/user.routes.js');
app.use('/api/users', userRoutes);
// TODO: Add other routes (companies, transactions, game sessions etc.)
// const companyRoutes = require('./routes/company.routes.js');
// app.use('/api/companies', companyRoutes);

// The Sentry error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional: Custom error handler (ensure it's after Sentry.Handlers.errorHandler())
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\\n");
});

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
