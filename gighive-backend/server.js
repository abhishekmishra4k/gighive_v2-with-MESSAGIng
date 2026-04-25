const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db.js');

// Cloud-agnostic media uploader setup
const { setUploader } = require('./services/mediaUploader');
const cloudinaryUploader = require('./services/storageService');
setUploader(cloudinaryUploader);

// DB Models used in socket handlers
const Message = require('./models/message');
const Conversation = require('./models/conversation');
const UserStatus = require('./models/userStatus');

// Load env vars
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Parse JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS — allow any localhost port (Vite can run on 3000, 3001, 5173, etc.)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman) or any localhost
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});


// ✅ Attach io to app
app.set('io', io);

// 👥 Store online users in memory (Map: userId -> { socketId, deviceType, lastSeen })
const onlineUsers = new Map();

// ✅ Validate socket handshake
io.use((socket, next) => {
  const { userId } = socket.handshake.auth;
  if (!userId) {
    console.warn("⚠️ No userId provided — using socket.id as fallback:", socket.id);
    socket.userId = socket.id;
  } else {
    socket.userId = userId;
  }
  socket.join(socket.userId); // Join personal room
  next();
});


// 🔌 Socket.IO events
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id} (userId: ${socket.userId})`);

  // ═══════════════════════════════════════════
  // 👤 USER CONNECTION EVENTS
  // ═══════════════════════════════════════════

  socket.on('user_connected', async (data) => {
    const { userId, deviceType = 'desktop', currentPage = 'messages' } = data;

    // Update online users map
    onlineUsers.set(userId, {
      socketId: socket.id,
      deviceType,
      lastSeen: new Date(),
      currentPage
    });

    console.log(`🟢 User online: ${userId} (${onlineUsers.size} users online)`);

    // ✅ Auto-join all existing conversation rooms (SRS requirement)
    // This ensures typing indicators and messages reach the user immediately
    try {
      const conversations = await Conversation.find({
        $or: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      }).select('_id').lean();

      conversations.forEach(conv => {
        socket.join(conv._id.toString());
      });

      console.log(`📎 ${userId} joined ${conversations.length} conversation room(s)`);
    } catch (err) {
      console.error('❌ Error joining conversation rooms:', err.message);
    }

    // ✅ Update persistent status in database
    try {
      await UserStatus.findOneAndUpdate(
        { userId },
        {
          isOnline: true,
          socketId: socket.id,
          deviceType,
          currentPage,
          lastActivity: new Date(),
          connectedAt: new Date(),
          isIdle: false
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('❌ Error updating user status in DB:', err.message);
    }

    // ✅ Broadcast to all users
    io.emit('user_status_changed', {
      userId,
      isOnline: true,
      deviceType,
      connectedAt: new Date(),
      connectedUsers: onlineUsers.size
    });
  });

  // ═══════════════════════════════════════════
  // 💬 MESSAGING EVENTS
  // ═══════════════════════════════════════════

  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, content, conversationId, gigId, tempId } = data;

      if (!senderId || !receiverId || !content?.trim()) {
        return socket.emit('message_error', { error: 'Missing required fields', tempId });
      }

      console.log(`📨 Message from ${senderId} to ${receiverId}: "${content.substring(0, 30)}..."`);

      // ✅ Find or create conversation
      let conversation = conversationId
        ? await Conversation.findById(conversationId)
        : null;

      if (!conversation) {
        conversation = new Conversation({
          participant1Id: senderId,
          participant2Id: receiverId,
          relatedGigId: gigId || null
        });
      }

      // ✅ Save message to DB
      const message = new Message({
        senderId,
        receiverId,
        content: content.trim(),
        contentType: data.contentType || 'text',
        status: 'sent',
        conversationId: conversation._id,
        gigId: gigId || null
      });
      await message.save();

      // ✅ Update conversation metadata
      conversation.lastMessageId = message._id;
      conversation.lastMessage = content.substring(0, 50);
      conversation.lastMessageTime = new Date();
      if (conversation.participant1Id.toString() === receiverId.toString()) {
        conversation.unreadCount1 += 1;
      } else {
        conversation.unreadCount2 += 1;
      }
      await conversation.save();

      // ✅ Auto-join receiver to conversation room if not already in it
      const receiverSocketId = onlineUsers.get(receiverId.toString())?.socketId;
      if (receiverSocketId) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket && !receiverSocket.rooms.has(conversation._id.toString())) {
          receiverSocket.join(conversation._id.toString());
        }
      }

      // ✅ Confirm to SENDER with real message ID
      socket.emit('message_sent', {
        tempId: tempId || null,
        _id: message._id,
        status: 'sent',
        conversationId: conversation._id,
        timestamp: message.createdAt
      });

      // ✅ Deliver to everyone in the room (including other tabs of sender)
      io.to(conversation._id.toString()).emit('receive_message', {
        _id: message._id,
        senderId,
        content: message.content,
        status: 'delivered',
        createdAt: message.createdAt,
        conversationId: conversation._id,
        senderName: data.senderName || 'User'
      });

      // ✅ Notify receiver of updated unread count
      const unreadCount = conversation.participant1Id.toString() === receiverId.toString()
        ? conversation.unreadCount1
        : conversation.unreadCount2;

      io.to(receiverId.toString()).emit('unread_count_updated', {
        conversationId: conversation._id,
        unreadCount,
        senderName: data.senderName || 'User'
      });

    } catch (err) {
      console.error('❌ Error in send_message:', err);
      socket.emit('message_error', { error: 'Failed to send message', details: err.message });
    }
  });

  // ═══════════════════════════════════════════
  // ⌨️ TYPING INDICATOR EVENTS
  // ═══════════════════════════════════════════

  socket.on('user_typing', (data) => {
    const { conversationId, userId, senderName } = data;

    console.log(`⌨️ ${senderName || userId} is typing in ${conversationId}`);

    // Broadcast to OTHER participants in conversation (except sender)
    socket.broadcast.to(conversationId).emit('user_typing', {
      userId,
      senderName,
      isTyping: true,
      timestamp: new Date()
    });
  });

  socket.on('user_stopped_typing', (data) => {
    const { conversationId, userId } = data;

    // Broadcast to others
    socket.broadcast.to(conversationId).emit('user_typing', {
      userId,
      isTyping: false
    });
  });

  // ═══════════════════════════════════════════
  // ✅ READ RECEIPT EVENTS
  // ═══════════════════════════════════════════

  socket.on('message_read', async (data) => {
    try {
      const { messageId, conversationId, userId, readAt } = data;

      console.log(`👁️ Message ${messageId} read by ${userId}`);

      // ✅ Update message status in DB
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: 'read', readAt: readAt || new Date() },
        { new: true }
      );

      if (message) {
        // ✅ Notify the original SENDER via their personal room
        io.to(message.senderId.toString()).emit('message_read_receipt', {
          messageId,
          readBy: userId,
          readAt: message.readAt,
          readerName: data.readerName || 'User'
        });
      }

    } catch (err) {
      console.error('❌ Error in message_read:', err);
    }
  });

  // ═══════════════════════════════════════════
  // 👤 PRESENCE / ONLINE STATUS EVENTS
  // ═══════════════════════════════════════════

  socket.on('presence_update', (data) => {
    const { userId, isOnline, currentPage, lastActivity } = data;

    // Update in-memory map
    if (onlineUsers.has(userId)) {
      const userInfo = onlineUsers.get(userId);
      userInfo.lastSeen = lastActivity || new Date();
      userInfo.currentPage = currentPage;
    }

    // Broadcast presence to all (less frequently - every 30s)
    io.emit('presence_updated', {
      userId,
      isOnline,
      lastActivity: new Date(),
      currentPage
    });
  });

  // ═══════════════════════════════════════════
  // 💬 CONVERSATION MANAGEMENT
  // ═══════════════════════════════════════════

  socket.on('conversation_opened', (data) => {
    const { conversationId, userId } = data;

    console.log(`🔓 Conversation ${conversationId} opened by ${userId}`);

    // Join the conversation room
    socket.join(conversationId);

    // Broadcast that user is viewing this conversation
    socket.broadcast.to(conversationId).emit('user_viewing_conversation', {
      userId,
      isViewing: true
    });
  });

  socket.on('conversation_closed', (data) => {
    const { conversationId, userId } = data;

    console.log(`🔒 Conversation ${conversationId} closed by ${userId}`);

    // Leave the conversation room
    socket.leave(conversationId);

    // Notify others
    socket.broadcast.to(conversationId).emit('user_viewing_conversation', {
      userId,
      isViewing: false
    });
  });

  // ═══════════════════════════════════════════
  // 🔌 DISCONNECTION
  // ═══════════════════════════════════════════

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id} (userId: ${socket.userId})`);

    // Remove from online users
    if (onlineUsers.has(socket.userId)) {
      onlineUsers.delete(socket.userId);

      console.log(`🔴 User offline: ${socket.userId} (${onlineUsers.size} users online)`);

      // ✅ Update persistent status in database
      UserStatus.findOneAndUpdate(
        { userId: socket.userId },
        {
          isOnline: false,
          lastSeen: new Date(),
          socketId: null,
          isIdle: false
        }
      ).catch(err => console.error('❌ Error updating offline status:', err.message));

      // Broadcast offline status
      io.emit('user_status_changed', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
        connectedUsers: onlineUsers.size
      });
    }
  });
});

// API Routes
app.use('/api/gigs', require('./routes/gig.js'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/profile', require('./routes/profile.js'));
app.use('/api/user', require('./routes/user.js'));
app.use('/api/message', require('./routes/message.js')); // ✅ Add message routes

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

// Connect to MongoDB
connectDB()
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Reset online status on server startup to handle stale connections from previous crashes
    try {
      await UserStatus.updateMany({}, { isOnline: false, socketId: null });
      console.log('🧹 Cleaned up stale user statuses');
    } catch (err) {
      console.error('❌ Error cleaning up user statuses:', err.message);
    }
  })
  .catch((err) => console.error('❌ MongoDB connection failed:', err));
