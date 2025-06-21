require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bandRoutes = require('./routes/bandRoutes');
const rehearsalRoutes = require('./routes/rehearsalRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

const { verifyToken } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rehearsal Scheduler API',
      version: '1.0.0',
      description: 'API for the Rehearsal Scheduler application',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/bands', verifyToken, bandRoutes);
app.use('/api/rehearsals', verifyToken, rehearsalRoutes);
app.use('/api/resources', verifyToken, resourceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('join_band', (bandId) => {
    socket.join(`band:${bandId}`);
  });

  socket.on('leave_band', (bandId) => {
    socket.leave(`band:${bandId}`);
  });

  socket.on('rehearsal_update', (data) => {
    io.to(`band:${data.bandId}`).emit('rehearsal_updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, httpServer }; // Export for testing