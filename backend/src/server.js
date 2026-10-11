const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { Server: SocketServer } = require('socket.io');

dotenv.config();

const { initializeDatabase } = require('./services/seedRunner');
const { initSocket } = require('./services/socket');

// Routers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const collegeRoutes = require('./routes/colleges');
const campusRoutes = require('./routes/campuses');
const departmentRoutes = require('./routes/departments');
const canteenRoutes = require('./routes/canteens');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const inventoryRoutes = require('./routes/inventory');
const wasteRoutes = require('./routes/waste');
const predictionRoutes = require('./routes/predictions');
const analyticsRoutes = require('./routes/analytics');
const announcementRoutes = require('./routes/announcements');
const eventRoutes = require('./routes/events');
const rewardRoutes = require('./routes/rewards');
const complaintRoutes = require('./routes/complaints');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});
initSocket(io);

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// API Routes (Section 38 REST Architecture)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/copilot', predictionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    platform: 'CanteenX Smart Campus Food Service API',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const PORT = process.env.PORT || 3001;

// Initialize DB and start HTTP server
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  CANTEENX API SERVER RUNNING ON PORT ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/health`);
    console.log(`====================================================`);
  });
});
