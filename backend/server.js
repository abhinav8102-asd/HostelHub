const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow connections from any origin (will update if needed)
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Save io instance to express app to access in controllers
app.set('io', io);

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images from backend locally
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads with explicit CORS headers for native Android WebView downloads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes registration
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const settingRoutes = require('./routes/settingRoutes');
const messRoutes = require('./routes/messRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const managementRoutes = require('./routes/managementRoutes');

const messReviewRoutes = require('./routes/messReviewRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const staffTaskRoutes = require('./routes/staffTaskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/mess-reviews', messReviewRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/staff-tasks', staffTaskRoutes);



// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HostelHub API Service!', timestamp: Date.now() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// Socket Connections
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins a room based on their userID
  socket.on('join', (userId) => {
    if (userId) {
      const roomName = `user_${userId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Database Sync and Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Authenticate database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Auto migration check for mess_feedbacks table photo_url column
    try {
      await sequelize.query('ALTER TABLE mess_feedbacks ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255);');
      console.log('Migration check: mess_feedbacks photo_url column ready.');
    } catch (e) {
      console.log('Note on photo_url migration check:', e.message);
    }

    // Start listening
    server.listen(PORT, () => {
      console.log(`HostelHub Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
