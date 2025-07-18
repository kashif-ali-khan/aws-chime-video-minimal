const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const meetingRoutes = require('./routes/meeting');
const SocketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize socket handler
const socketHandler = new SocketHandler();
socketHandler.setupSocket(server);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all origins for development
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Routes
app.use('/api/meeting', meetingRoutes);

// Socket stats endpoint
app.get('/api/socket/stats', (req, res) => {
  res.json(socketHandler.getStats());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    socket: socketHandler.getStats()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`🚀 AWS Chime Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket server: http://localhost:${PORT}/socket`);
});