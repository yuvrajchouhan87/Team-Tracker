const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Task = require('./models/Task');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://team-tracker-blue.vercel.app'
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/timelogs', require('./routes/timeLogRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Static uploads (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  // Join personal room for notifications
  socket.join(`user_${socket.user.id}`);

  socket.on('joinTask', (taskId) => {
    if (!taskId) return;
    socket.join(`task_${taskId}`);
  });

  socket.on('leaveTask', (taskId) => {
    if (!taskId) return;
    socket.leave(`task_${taskId}`);
  });

  socket.on('sendMessage', async (payload, callback) => {
    try {
      const { taskId, text, receiverId } = payload || {};
      if (!taskId || !text || !receiverId) {
        if (callback) callback({ error: 'Missing message data' });
        return;
      }

      const task = await Task.findById(taskId).select('createdBy assignedTo');
      if (!task) {
        if (callback) callback({ error: 'Task not found' });
        return;
      }

      const senderId = String(socket.user.id);
      const isParticipant =
        String(task.createdBy) === senderId ||
        String(task.assignedTo) === senderId;

      if (!isParticipant) {
        if (callback) callback({ error: 'Not authorized for this task' });
        return;
      }

      const message = await Message.create({
        task: taskId,
        sender: senderId,
        receiver: String(receiverId),
        text: String(text).trim(),
      });

      const populated = await Message.findById(message._id)
        .populate('sender', 'name role')
        .populate('receiver', 'name role')
        .lean();

      const toSend = { ...populated, _id: message._id };
      io.to(`task_${taskId}`).emit('newMessage', toSend); // For active chat
      io.to(`user_${receiverId}`).emit('newMessage', toSend); // For notifications

      if (callback) callback({ success: true, message: toSend });
    } catch (error) {
      console.error('sendMessage error:', error);
      if (callback) callback({ error: error.message || 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
  });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log('Database connection error:', err));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});
