# 💬 GigHive Real-Time Messaging System - SRS

**Version:** 1.0  
**Date:** April 2026  
**Module:** Messaging & Real-Time Communication  
**Status:** Complete Specification  

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Database Design](#database-design)
4. [API Endpoints](#api-endpoints)
5. [Socket.IO Events](#socketio-events)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Real-Time Features](#real-time-features)
9. [User Status Management](#user-status-management)
10. [Typing Indicators](#typing-indicators)
11. [Message Delivery Status](#message-delivery-status)
12. [Testing Guide](#testing-guide)
13. [Error Handling](#error-handling)

---

## 🎯 Overview

The **GigHive Messaging System** is a real-time chat platform that connects students and employers. It features:

- ✅ **Real-time messaging** with Socket.io
- ✅ **Online/Offline status** tracking
- ✅ **Typing indicators** (see when someone is typing)
- ✅ **Message read receipts** (seen status)
- ✅ **Conversation history** persistence
- ✅ **Unread message counters**
- ✅ **User presence** awareness
- ✅ **Fast message delivery** (sub-second)

### **Use Case:**
```
Student → Applies for Gig → 
Employer Reviews → 
Both can chat in real-time about the job → 
Negotiate terms/details → 
Accept/Decline gig
```

---

## ⭐ Features

### **Core Messaging**
- 💬 Send and receive messages instantly
- 📝 Message history/persistence
- 🔍 Search conversations
- 📌 Pin important messages
- 🗑️ Delete messages (soft delete)
- ✏️ Edit sent messages
- 📎 Share files/images

### **Real-Time Status**
- 🟢 Online/Offline indicator
- ⏱️ Last seen timestamp
- 👁️ Message read/delivered status
- ⌨️ Typing indicator ("User is typing...")
- 📱 Device type indicator (mobile/desktop)

### **User Experience**
- 🔔 Unread message badge
- 📱 Responsive on all devices
- 🎨 Dark/Light mode support
- 🔊 Optional message notifications
- ⚡ Auto-scroll to latest message
- 💾 Auto-save drafts
- 🌙 Timestamp formatting (2m ago, 1h ago, etc)

---

## 📊 Database Design

### **1. Message Model (Collection)**

```javascript
{
  _id: ObjectId,
  
  // Participants
  senderId: ObjectId (ref: User) → Who sent the message,
  receiverId: ObjectId (ref: User) → Who receives the message,
  
  // Content
  content: String → The actual message text,
  contentType: String → 'text' | 'image' | 'file' | 'emoji',
  
  // Media (optional)
  mediaUrl: String → Cloudinary URL if file/image,
  fileName: String → Original filename,
  fileSize: Number → In bytes,
  
  // Status
  status: String → 'sent' | 'delivered' | 'read',
  isDeleted: Boolean → Soft delete flag,
  isEdited: Boolean → True if message was edited,
  editedAt: Date → When message was last edited,
  
  // Timestamps
  createdAt: Date → When message was sent,
  readAt: Date → When receiver read message,
  updatedAt: Date,
  
  // Metadata
  conversationId: ObjectId (ref: Conversation),
  replyTo: ObjectId (ref: Message) → For threading,
  gigId: ObjectId (ref: Gig) → Which gig this relates to
}
```

**Indexes for Performance:**
```javascript
// Fast queries for conversations
db.messages.createIndex({ senderId: 1, receiverId: 1, createdAt: -1 })
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
db.messages.createIndex({ receiverId: 1, status: 1 }) // Unread messages
```

---

### **2. Conversation Model (Collection)**

```javascript
{
  _id: ObjectId,
  
  // Participants (always 2 people)
  participant1Id: ObjectId (ref: User) → First person,
  participant2Id: ObjectId (ref: User) → Second person,
  
  // Message references
  lastMessageId: ObjectId (ref: Message) → Most recent message,
  lastMessage: String → Preview of last message,
  lastMessageTime: Date → When last message was sent,
  
  // Unread counts
  unreadCount1: Number → Messages unread by participant1,
  unreadCount2: Number → Messages unread by participant2,
  
  // Context
  relatedGigId: ObjectId (ref: Gig) → What gig they're discussing,
  relatedApplicationId: ObjectId (ref: Application) → Job application context,
  
  // Flags
  isPinned1: Boolean → Pinned for participant1,
  isPinned2: Boolean → Pinned for participant2,
  isMutedBy1: Boolean → Notifications muted for participant1,
  isMutedBy2: Boolean → Notifications muted for participant2,
  isBlockedBy1: Boolean → Participant2 blocked by participant1,
  isBlockedBy2: Boolean → Participant1 blocked by participant2,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

### **3. UserStatus Model (Collection)**

```javascript
{
  _id: ObjectId,
  
  // User info
  userId: ObjectId (ref: User),
  
  // Online status
  isOnline: Boolean → True if user is currently online,
  lastSeen: Date → When user was last active,
  
  // Session info
  socketId: String → Current Socket.io connection ID,
  deviceType: String → 'mobile' | 'desktop' | 'tablet',
  browserAgent: String → User-Agent string,
  ipAddress: String → User's IP address,
  
  // Activity
  currentPage: String → What page user is viewing,
  activeConversationId: ObjectId → If in chat, which one,
  isTyping: Boolean → Currently typing,
  lastActivity: Date → Last action timestamp,
  
  // Timestamps
  connectedAt: Date → When user came online,
  createdAt: Date,
  updatedAt: Date
}
```

---

### **4. MessageReadReceipt Model (Optional)**

```javascript
{
  _id: ObjectId,
  
  messageId: ObjectId (ref: Message),
  receiverId: ObjectId (ref: User),
  
  // Status progression
  deliveredAt: Date → When server received/stored,
  readAt: Date → When user read message,
  acknowledgedAt: Date → When user saw the "read" tick,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### **REST API Routes** (`/api/message`)

#### **1. Send Message**
```
POST /api/message/send
```

**Request Body:**
```json
{
  "senderId": "user123",
  "receiverId": "user456",
  "content": "Hey! Are you available for this gig?",
  "contentType": "text",
  "conversationId": "conv789",
  "gigId": "gig123" // optional
}
```

**Response (201 Created):**
```json
{
  "_id": "msg001",
  "senderId": "user123",
  "receiverId": "user456",
  "content": "Hey! Are you available for this gig?",
  "status": "sent",
  "createdAt": "2026-04-25T10:30:00Z",
  "conversationId": "conv789"
}
```

---

#### **2. Get Conversation History**
```
GET /api/message/conversation/:conversationId
```

**Query Parameters:**
```
?limit=50&skip=0&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "conversation": {
    "_id": "conv789",
    "participant1Id": "user123",
    "participant2Id": "user456",
    "lastMessageTime": "2026-04-25T10:30:00Z",
    "unreadCount1": 0,
    "unreadCount2": 3
  },
  "messages": [
    {
      "_id": "msg001",
      "senderId": "user123",
      "receiverId": "user456",
      "content": "Hello!",
      "status": "read",
      "readAt": "2026-04-25T10:35:00Z",
      "createdAt": "2026-04-25T10:30:00Z"
    },
    // ... more messages
  ],
  "totalCount": 150
}
```

---

#### **3. Get All Conversations**
```
GET /api/message/conversations
```

**Query Parameters:**
```
?userId=user123&limit=20&skip=0&search=employer
```

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "_id": "conv789",
      "participant": {
        "_id": "user456",
        "name": "John Employer",
        "avatar": "url_to_avatar",
        "isOnline": true,
        "lastSeen": "2026-04-25T10:45:00Z"
      },
      "lastMessage": "Sounds great!",
      "lastMessageTime": "2026-04-25T10:45:00Z",
      "unreadCount": 3,
      "gigTitle": "UI/UX Design Project"
    },
    // ... more conversations
  ],
  "totalCount": 12
}
```

---

#### **4. Mark Messages as Read**
```
PUT /api/message/mark-as-read
```

**Request Body:**
```json
{
  "conversationId": "conv789",
  "userId": "user123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "messagesUpdated": 5,
  "timestamp": "2026-04-25T10:50:00Z"
}
```

---

#### **5. Upload Message Media**
```
POST /api/message/upload
```

**Request (multipart/form-data):**
```
file: <binary_file>
conversationId: conv789
messageType: image
```

**Response (201 Created):**
```json
{
  "url": "https://cloudinary.com/image123.jpg",
  "fileName": "screenshot.jpg",
  "fileSize": 256000,
  "contentType": "image"
}
```

---

#### **6. Delete Message**
```
DELETE /api/message/:messageId
```

**Request Body:**
```json
{
  "userId": "user123",
  "hardDelete": false // true = permanent, false = soft delete
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "_id": "msg001",
  "isDeleted": true
}
```

---

#### **7. Edit Message**
```
PUT /api/message/:messageId
```

**Request Body:**
```json
{
  "userId": "user123",
  "content": "Updated message content",
  "editedReason": "typo" // optional
}
```

**Response (200 OK):**
```json
{
  "_id": "msg001",
  "content": "Updated message content",
  "isEdited": true,
  "editedAt": "2026-04-25T10:55:00Z"
}
```

---

#### **8. Get User Online Status**
```
GET /api/message/user-status/:userId
```

**Response (200 OK):**
```json
{
  "userId": "user456",
  "isOnline": true,
  "lastSeen": "2026-04-25T11:00:00Z",
  "deviceType": "desktop",
  "currentPage": "messages",
  "isTyping": false
}
```

---

#### **9. Search Messages**
```
GET /api/message/search
```

**Query Parameters:**
```
?conversationId=conv789&query=gig&limit=20
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "_id": "msg005",
      "content": "Can we discuss the gig details?",
      "createdAt": "2026-04-25T09:00:00Z",
      "sender": { "_id": "user123", "name": "John" }
    }
  ],
  "totalCount": 3
}
```

---

## 🔌 Socket.IO Events

### **Connection Lifecycle**

#### **1. User Connects**
```javascript
// CLIENT sends on connection
socket.emit('user_connected', {
  userId: 'user123',
  deviceType: 'desktop',
  currentPage: 'messages'
});

// SERVER broadcasts to all users
io.emit('user_status_changed', {
  userId: 'user123',
  isOnline: true,
  connectedAt: '2026-04-25T11:00:00Z',
  deviceType: 'desktop'
});
```

---

#### **2. User Disconnects**
```javascript
// Automatic when socket closes
io.on('disconnect', (socket) => {
  console.log('User disconnected:', socket.userId);
  
  // Broadcast to all users
  io.emit('user_status_changed', {
    userId: socket.userId,
    isOnline: false,
    lastSeen: new Date(),
    reason: 'disconnect'
  });
});
```

---

### **Real-Time Messaging**

#### **3. Send Message (Real-Time)**
```javascript
// CLIENT emits
socket.emit('send_message', {
  senderId: 'user123',
  receiverId: 'user456',
  conversationId: 'conv789',
  content: 'Hello! Can you start next week?',
  timestamp: new Date()
});

// SERVER receives, saves to DB, then:

// ✅ Confirm to SENDER (sent status)
socket.emit('message_sent', {
  _id: 'msg001',
  status: 'sent',
  timestamp: '2026-04-25T11:05:00Z'
});

// ✅ Send to RECEIVER (real-time receive)
io.to(receiverId).emit('receive_message', {
  _id: 'msg001',
  senderId: 'user123',
  content: 'Hello! Can you start next week?',
  status: 'delivered',
  createdAt: '2026-04-25T11:05:00Z'
});

// ✅ Notify RECEIVER of new unread count
io.to(receiverId).emit('unread_count_updated', {
  conversationId: 'conv789',
  unreadCount: 1,
  senderName: 'John Student'
});
```

---

### **Real-Time Typing Indicators**

#### **4. User Started Typing**
```javascript
// CLIENT emits when user starts typing
socket.emit('user_typing', {
  conversationId: 'conv789',
  senderId: 'user123',
  senderName: 'John Student',
  timestamp: new Date()
});

// SERVER broadcasts to OTHER participants in conversation
socket.broadcast.to('conv789').emit('user_typing', {
  userId: 'user123',
  senderName: 'John Student',
  isTyping: true
});

// FRONTEND shows: "John Student is typing..."
```

---

#### **5. User Stopped Typing**
```javascript
// CLIENT emits when user stops typing
socket.emit('user_stopped_typing', {
  conversationId: 'conv789',
  senderId: 'user123'
});

// SERVER broadcasts
socket.broadcast.to('conv789').emit('user_typing', {
  userId: 'user123',
  isTyping: false
});

// FRONTEND removes typing indicator
```

---

### **Message Read Receipts**

#### **6. Message Read**
```javascript
// CLIENT emits when message becomes visible
socket.emit('message_read', {
  messageId: 'msg001',
  conversationId: 'conv789',
  userId: 'user456',
  readAt: new Date()
});

// SERVER updates DB and broadcasts
io.to('user123').emit('message_read_receipt', {
  messageId: 'msg001',
  readBy: 'user456',
  readAt: '2026-04-25T11:10:00Z',
  readerName: 'John Employer'
});

// FRONTEND shows double checkmark (✓✓) on message
```

---

### **User Presence / Online Status**

#### **7. Presence Update**
```javascript
// CLIENT broadcasts presence every 30 seconds
socket.emit('presence_update', {
  userId: 'user123',
  isOnline: true,
  currentPage: 'messages',
  activeConversationId: 'conv789',
  lastActivity: new Date()
});

// SERVER updates UserStatus collection
// SERVER broadcasts to all connected users
io.emit('presence_updated', {
  userId: 'user123',
  isOnline: true,
  lastActivity: '2026-04-25T11:12:00Z'
});

// Other participants see green dot next to name
```

---

### **Conversation Management**

#### **8. Conversation Opened**
```javascript
// CLIENT emits when user opens/focuses conversation
socket.emit('conversation_opened', {
  conversationId: 'conv789',
  userId: 'user123'
});

// SERVER:
// 1. Mark all unread messages as read
// 2. Join user to conversation room
// 3. Broadcast "typing stopped" to clear indicators
```

---

#### **9. Conversation Closed**
```javascript
// CLIENT emits when user leaves conversation
socket.emit('conversation_closed', {
  conversationId: 'conv789',
  userId: 'user123'
});

// SERVER leaves room
socket.leave('conv789');
```

---

### **Event Summary Table**

| Event Name | Emitted By | Received By | Purpose |
|-----------|-----------|-----------|---------|
| `user_connected` | Client | Server | User comes online |
| `user_status_changed` | Server | All Clients | Broadcast online status |
| `send_message` | Client | Server | Send message |
| `receive_message` | Server | Recipient | Deliver message real-time |
| `message_sent` | Server | Sender | Confirm delivery |
| `user_typing` | Client | Room | Show typing indicator |
| `user_stopped_typing` | Client | Room | Hide typing indicator |
| `message_read` | Client | Server | Mark as read |
| `message_read_receipt` | Server | Sender | Confirm read status |
| `unread_count_updated` | Server | User | Update badge count |
| `presence_update` | Client | Server | Update online status |
| `presence_updated` | Server | All | Broadcast presence |
| `conversation_opened` | Client | Server | User opened chat |
| `conversation_closed` | Client | Server | User left chat |

---

## 🎨 Frontend Implementation

### **Component Structure**

```
src/components/student/Messages.jsx (or employer)
│
├── MessagesContainer (Main wrapper)
│   ├── ConversationList
│   │   ├── SearchBar
│   │   ├── FilterTabs (All, Unread, Pinned)
│   │   └── ConversationItem[] (shows online status)
│   │
│   └── ChatWindow
│       ├── ChatHeader (shows user status, video call btn)
│       ├── MessagesList (auto-scroll)
│       │   ├── Message (sender)
│       │   │   ├── Avatar
│       │   │   ├── Content
│       │   │   ├── Read receipt (✓✓)
│       │   │   ├── Timestamp
│       │   │   └── Reactions/Menu
│       │   │
│       │   ├── TypingIndicator (animated dots)
│       │   └── DateSeparator
│       │
│       └── MessageInput
│           ├── TextInput (grows with content)
│           ├── Attachments button
│           ├── Emoji picker
│           ├── Send button
│           └── Draft auto-save
```

---

### **React Hooks Used**

```javascript
// Connection & Socket setup
useEffect(() => {
  socket = io('http://localhost:5001');
  
  socket.on('connect', () => {
    socket.emit('user_connected', { userId, deviceType });
  });
  
  return () => socket.disconnect();
}, []);

// Load conversation history
useEffect(() => {
  fetchConversationHistory(selectedConvId);
}, [selectedConvId]);

// Real-time message reception
useEffect(() => {
  socket.on('receive_message', (msg) => {
    setMessages(prev => [...prev, msg]);
    markAsRead(msg._id); // Auto-mark as read
    scrollToBottom();
  });
}, []);

// Typing indicator with debounce
useEffect(() => {
  if (isTyping) {
    socket.emit('user_typing', { conversationId });
    
    // Clear typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      socket.emit('user_stopped_typing', { conversationId });
      setIsTyping(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }
}, [isTyping]);

// Online status polling
useEffect(() => {
  const interval = setInterval(() => {
    socket.emit('presence_update', {
      userId,
      isOnline: true,
      lastActivity: new Date()
    });
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

---

### **Key Frontend Features**

#### **1. Message Component**
```jsx
function Message({ msg, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs ${isOwn ? 'bg-blue-500' : 'bg-gray-300'} rounded-lg p-3`}>
        <p className="text-sm">{msg.content}</p>
        <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
          <span>{formatTime(msg.createdAt)}</span>
          {isOwn && (
            <span>
              {msg.status === 'read' && '✓✓'} {/* Double checkmark */}
              {msg.status === 'delivered' && '✓'} {/* Single checkmark */}
              {msg.status === 'sent' && '◌'} {/* Sending indicator */}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

#### **2. Typing Indicator Animation**
```jsx
function TypingIndicator() {
  return (
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}
```

Renders: `● ● ●` (animated bouncing)

---

#### **3. Message Input with Debounce**
```jsx
function MessageInput() {
  const [input, setInput] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Emit typing event on first character
    if (e.target.value.length === 1) {
      socket.emit('user_typing', { conversationId });
    }
    
    // Reset debounce timer
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user_stopped_typing', { conversationId });
    }, 2000);
  };

  const handleSend = () => {
    socket.emit('send_message', {
      senderId: userId,
      receiverId: recipientId,
      content: input,
      conversationId
    });
    
    setInput('');
    socket.emit('user_stopped_typing', { conversationId });
  };

  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="flex-1 border rounded px-3 py-2"
      />
      <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
        <Send size={20} />
      </button>
    </div>
  );
}
```

---

#### **4. Online Status Indicator**
```jsx
function ConversationItem({ conversation }) {
  const isOnline = conversation.participant.isOnline;
  const lastSeen = formatDistanceToNow(
    new Date(conversation.participant.lastSeen)
  ); // "2m ago"

  return (
    <div className="flex items-center gap-3 p-4">
      {/* Avatar with status indicator */}
      <div className="relative">
        <img
          src={conversation.participant.avatar}
          alt={conversation.participant.name}
          className="w-10 h-10 rounded-full"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      <div className="flex-1">
        <h4 className="font-medium">{conversation.participant.name}</h4>
        <p className="text-xs text-gray-500">
          {isOnline ? 'Online' : `Last seen ${lastSeen}`}
        </p>
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
          {conversation.unreadCount}
        </span>
      )}
    </div>
  );
}
```

---

## 🔧 Backend Implementation

### **Server Setup with Socket.IO**

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach io to app for use in routes
app.set('io', io);

// Store online users in memory (or Redis for scaling)
const onlineUsers = new Map(); // userId -> { socketId, deviceType, lastSeen }

// Socket.IO Connection Handler
io.use((socket, next) => {
  const { userId } = socket.handshake.auth;
  
  if (!userId) {
    return next(new Error('Missing userId'));
  }
  
  socket.userId = userId;
  socket.join(userId); // Join personal room
  
  next();
});

// Connection Event
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId} (socket: ${socket.id})`);

  // User connects
  socket.on('user_connected', async (data) => {
    const { userId, deviceType } = data;
    
    // Update online status
    onlineUsers.set(userId, {
      socketId: socket.id,
      deviceType,
      lastSeen: new Date()
    });

    // Broadcast to all users
    io.emit('user_status_changed', {
      userId,
      isOnline: true,
      deviceType
    });

    // Join conversation rooms for this user's conversations
    const conversations = await Conversation.find({
      $or: [
        { participant1Id: userId },
        { participant2Id: userId }
      ]
    });

    conversations.forEach(conv => {
      socket.join(conv._id.toString());
    });
  });

  // Send Message
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, content, conversationId, gigId } = data;

      // Save message to DB
      const message = new Message({
        senderId,
        receiverId,
        content,
        contentType: 'text',
        status: 'sent',
        conversationId,
        gigId
      });

      await message.save();

      // Confirm to sender
      socket.emit('message_sent', {
        _id: message._id,
        status: 'sent',
        timestamp: message.createdAt
      });

      // Deliver to receiver (if online)
      io.to(receiverId).emit('receive_message', {
        _id: message._id,
        senderId,
        content,
        status: 'delivered',
        createdAt: message.createdAt,
        conversationId
      });

      // Update unread count
      io.to(receiverId).emit('unread_count_updated', {
        conversationId,
        count: 1
      });

    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // User Typing
  socket.on('user_typing', (data) => {
    const { conversationId, senderId, senderName } = data;

    // Broadcast to all in conversation except sender
    socket.broadcast.to(conversationId).emit('user_typing', {
      userId: senderId,
      senderName,
      isTyping: true
    });
  });

  // User Stopped Typing
  socket.on('user_stopped_typing', (data) => {
    const { conversationId, senderId } = data;

    socket.broadcast.to(conversationId).emit('user_typing', {
      userId: senderId,
      isTyping: false
    });
  });

  // Message Read
  socket.on('message_read', async (data) => {
    try {
      const { messageId, conversationId, userId } = data;

      // Update message status in DB
      await Message.findByIdAndUpdate(messageId, {
        status: 'read',
        readAt: new Date()
      });

      // Get original sender
      const message = await Message.findById(messageId);

      // Notify sender of read receipt
      io.to(message.senderId.toString()).emit('message_read_receipt', {
        messageId,
        readBy: userId,
        readAt: new Date()
      });

    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  });

  // User Disconnects
  socket.on('disconnect', async () => {
    console.log(`❌ User disconnected: ${socket.userId}`);

    // Update online status
    if (onlineUsers.has(socket.userId)) {
      onlineUsers.delete(socket.userId);

      // Broadcast offline status
      io.emit('user_status_changed', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    }
  });

  // Presence update (every 30 seconds)
  socket.on('presence_update', async (data) => {
    const { userId, isOnline, lastActivity } = data;

    if (onlineUsers.has(userId)) {
      const user = onlineUsers.get(userId);
      user.lastSeen = lastActivity;
    }

    // Update DB
    await UserStatus.findOneAndUpdate(
      { userId },
      { isOnline, lastSeen: lastActivity },
      { upsert: true }
    );
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

### **Message Controller**

```javascript
// controllers/messageController.js
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const UserStatus = require('../models/userStatus');

// Get conversation history
exports.getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('senderId', 'name avatar')
      .lean();

    res.json({
      messages: messages.reverse(),
      total: await Message.countDocuments({ conversationId })
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all conversations for user
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const conversations = await Conversation.find({
      $or: [
        { participant1Id: userId },
        { participant2Id: userId }
      ]
    })
      .sort({ lastMessageTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('lastMessageId', 'content')
      .lean();

    // Enrich with online status
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participant1Id === userId 
          ? conv.participant2Id 
          : conv.participant1Id;

        const status = await UserStatus.findOne({ userId: otherUserId });

        return {
          ...conv,
          otherUserStatus: {
            isOnline: status?.isOnline || false,
            lastSeen: status?.lastSeen
          }
        };
      })
    );

    res.json({ conversations: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        status: { $ne: 'read' }
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      updated: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user online status
exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const status = await UserStatus.findOne({ userId });

    res.json({
      userId,
      isOnline: status?.isOnline || false,
      lastSeen: status?.lastSeen,
      deviceType: status?.deviceType
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

---

### **Message Routes**

```javascript
// routes/message.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/user');
const messageController = require('../controllers/messageController');

// Get conversation history
router.get('/conversation/:conversationId', auth, messageController.getConversationHistory);

// Get user's conversations
router.get('/conversations/:userId', auth, messageController.getUserConversations);

// Mark messages as read
router.put('/mark-as-read', auth, messageController.markAsRead);

// Get user status
router.get('/user-status/:userId', messageController.getUserStatus);

module.exports = router;
```

---

## 🔄 Real-Time Features

### **1. Typing Indicator Flow**

```
User Types 'H'
    ↓
Emit 'user_typing' → Server
    ↓
Server broadcasts to room
    ↓
Recipient sees: "John is typing..."
    ↓
User stops typing (2s debounce)
    ↓
Emit 'user_stopped_typing' → Server
    ↓
Recipient sees indicator disappears
```

---

### **2. Message Delivery Timeline**

```
SENDER's View:
User clicks Send
    ↓
Show "◌ Sending..." (pending state)
    ↓
Server confirms → "✓ Sent"
    ↓
Recipient reads → "✓✓ Read"


RECEIVER's View:
Message arrives (real-time via Socket)
    ↓
Auto-marked as read
    ↓
Sender sees double checkmark
```

---

### **3. Online Status Update**

```
User Logs In
    ↓
emit 'user_connected'
    ↓
Server adds to onlineUsers map
    ↓
Broadcast to all: "User is online"
    ↓
Conversations show green dot
    ↓
Every 30 seconds: emit 'presence_update'
    ↓
If no update for 2 minutes: assume offline
    ↓
User Logs Out / Closes Tab
    ↓
emit 'disconnect'
    ↓
Server removes from onlineUsers
    ↓
Broadcast: "User is offline"
```

---

## 👤 User Status Management

### **UserStatus Document**

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  
  // Connection
  isOnline: Boolean,
  socketId: String,
  connectedAt: Date,
  lastSeen: Date,
  
  // Activity
  currentPage: String,
  activeConversationId: ObjectId,
  isTyping: Boolean,
  
  // Device
  deviceType: String,
  browserAgent: String,
  
  // Idle detection
  lastActivity: Date,
  isIdle: Boolean
}
```

### **Status State Machine**

```
┌─────────────────────────────────────────────────┐
│                  ONLINE (Green Dot)             │
│                                                 │
│  User is active on the platform                │
│  Typing, reading, scrolling, etc.              │
│  Updates every 10 seconds                      │
└──────────────────┬──────────────────────────────┘
                   │
        No activity for 5 minutes
                   ↓
┌─────────────────────────────────────────────────┐
│                  IDLE (Yellow Dot)              │
│                                                 │
│  User is still connected but inactive          │
│  Browser window may be minimized               │
│  No updates in 5 minutes                       │
└──────────────────┬──────────────────────────────┘
                   │
        Socket disconnects or 30 min inactivity
                   ↓
┌─────────────────────────────────────────────────┐
│              OFFLINE (Gray Dot)                 │
│                                                 │
│  lastSeen timestamp is shown                   │
│  "Was online 2 hours ago"                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ⌨️ Typing Indicators

### **Implementation Details**

**Throttling Strategy:**
```javascript
const TYPING_DEBOUNCE_TIME = 2000; // 2 seconds
const TYPING_THROTTLE_TIME = 500; // Emit max every 500ms

let isUserTyping = false;
let lastTypingEmit = 0;
let typingTimeout = null;

function handleInputChange(text) {
  const now = Date.now();

  // First character - emit immediately
  if (text.length === 1) {
    socket.emit('user_typing', { conversationId });
    lastTypingEmit = now;
    isUserTyping = true;
  }

  // Throttle: emit max every 500ms
  if (now - lastTypingEmit >= TYPING_THROTTLE_TIME) {
    socket.emit('user_typing', { conversationId });
    lastTypingEmit = now;
  }

  // Clear previous timeout
  clearTimeout(typingTimeout);

  // Set new timeout to stop typing after 2 seconds of inactivity
  typingTimeout = setTimeout(() => {
    socket.emit('user_stopped_typing', { conversationId });
    isUserTyping = false;
  }, TYPING_DEBOUNCE_TIME);
}
```

**Why This Approach?**
- ✅ Reduces server load (not emitting for every keystroke)
- ✅ Better UX (typing indicator appears immediately)
- ✅ Automatic cleanup (after 2 seconds of no input)
- ✅ Scales well with many concurrent users

---

## 📬 Message Delivery Status

### **Status Progression**

```
┌──────────┐    ┌───────────┐    ┌────────┐    ┌──────┐
│  Pending │ → │   Sent    │ → │Delivered│ → │ Read │
│    ◌     │   │     ✓     │   │    ✓    │   │  ✓✓  │
└──────────┘    └───────────┘    └────────┘    └──────┘
```

**Status Meanings:**

| Status | Meaning | UI | When |
|--------|---------|-----|------|
| **Pending** | Message being sent | ◌ | Before server ack |
| **Sent** | Server received | ✓ | Message in DB |
| **Delivered** | Receiver is online | ✓ | Socket delivered |
| **Read** | Receiver read | ✓✓ | Message viewed |

**Implementation:**

```javascript
// CLIENT: Show status based on message object
function getStatusIcon(message) {
  switch (message.status) {
    case 'pending':
      return <Loader className="animate-spin w-3 h-3" />; // Spinning icon
    case 'sent':
      return '✓';
    case 'delivered':
      return '✓'; // Same as sent (often hidden)
    case 'read':
      return '✓✓'; // Color it blue
    default:
      return '';
  }
}
```

---

## 🧪 Testing Guide

### **Unit Tests (Jest)**

```javascript
// __tests__/messaging.test.js
const mongoose = require('mongoose');
const Message = require('../models/message');
const Conversation = require('../models/conversation');

describe('Messaging System', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Should save message to DB', async () => {
    const message = new Message({
      senderId: '123',
      receiverId: '456',
      content: 'Test message',
      conversationId: 'conv789'
    });

    const saved = await message.save();
    expect(saved._id).toBeDefined();
    expect(saved.status).toBe('sent');
  });

  test('Should get conversation history', async () => {
    const messages = await Message.find({ conversationId: 'conv789' });
    expect(Array.isArray(messages)).toBe(true);
  });

  test('Should mark message as read', async () => {
    const message = await Message.findOneAndUpdate(
      { _id: 'msg001' },
      { status: 'read', readAt: new Date() },
      { new: true }
    );

    expect(message.status).toBe('read');
    expect(message.readAt).toBeDefined();
  });
});
```

---

### **Socket.IO Integration Tests**

```javascript
// __tests__/socket.test.js
const io = require('socket.io-client');
const Server = require('../server');

describe('Socket.IO Messaging', () => {
  let clientSocket1, clientSocket2, server;

  beforeAll((done) => {
    server = require('../server');
    clientSocket1 = io('http://localhost:5001', {
      auth: { userId: 'user123' }
    });
    clientSocket2 = io('http://localhost:5001', {
      auth: { userId: 'user456' }
    });

    clientSocket1.on('connect', () => {
      clientSocket2.on('connect', done);
    });
  });

  afterAll(() => {
    clientSocket1.close();
    clientSocket2.close();
    server.close();
  });

  test('Should send and receive message', (done) => {
    clientSocket2.on('receive_message', (msg) => {
      expect(msg.content).toBe('Hello!');
      expect(msg.senderId).toBe('user123');
      done();
    });

    clientSocket1.emit('send_message', {
      senderId: 'user123',
      receiverId: 'user456',
      content: 'Hello!',
      conversationId: 'conv789'
    });
  });

  test('Should show typing indicator', (done) => {
    clientSocket2.on('user_typing', (data) => {
      expect(data.isTyping).toBe(true);
      expect(data.userId).toBe('user123');
      done();
    });

    clientSocket1.emit('user_typing', {
      conversationId: 'conv789',
      senderId: 'user123'
    });
  });

  test('Should broadcast online status', (done) => {
    clientSocket2.on('user_status_changed', (data) => {
      if (data.userId === 'user123') {
        expect(data.isOnline).toBe(true);
        done();
      }
    });

    clientSocket1.emit('user_connected', {
      userId: 'user123',
      deviceType: 'desktop'
    });
  });
});
```

---

### **Manual Testing Checklist**

#### **Test Case 1: Basic Messaging**
- [ ] User A sends message to User B
- [ ] Message appears on User B's screen in real-time
- [ ] Message status shows: Sent → Delivered → Read
- [ ] Message persists in database
- [ ] Conversation history loads correctly

#### **Test Case 2: Typing Indicator**
- [ ] User A starts typing
- [ ] User B sees "User A is typing..."
- [ ] User A stops typing after 2 seconds
- [ ] Typing indicator disappears from User B's screen
- [ ] Multiple users typing shows multiple indicators

#### **Test Case 3: Online Status**
- [ ] User A comes online → shows green dot
- [ ] User A goes idle (5+ min) → shows yellow dot
- [ ] User A disconnects → shows "last seen 2m ago"
- [ ] User A refreshes page → reconnects as online
- [ ] Online status updates in real-time for all viewers

#### **Test Case 4: Message Read Receipts**
- [ ] User A sends message
- [ ] User B receives (✓ Delivered)
- [ ] Message appears in User B's chat
- [ ] Double checkmark appears (✓✓ Read)
- [ ] Timestamp shows when read

#### **Test Case 5: Unread Badges**
- [ ] User B has unread messages → shows badge (number)
- [ ] User B opens conversation → badge disappears
- [ ] Unread count updates in real-time
- [ ] Unread count persists across page refreshes

#### **Test Case 6: Multiple Conversations**
- [ ] User A has 3 conversations
- [ ] Can switch between conversations
- [ ] Each conversation has separate message history
- [ ] Online status per person (not global)

#### **Test Case 7: Network Issues**
- [ ] Disconnect internet
- [ ] Try sending message → shows error
- [ ] Reconnect internet
- [ ] Message sends (retry logic)
- [ ] No duplicate messages

#### **Test Case 8: Performance**
- [ ] Load 1000+ messages → still scrolls smoothly
- [ ] Typing indicator with 100+ concurrent users
- [ ] New message appears < 100ms
- [ ] No memory leaks after 1 hour of chatting

---

## ❌ Error Handling

### **Frontend Error Handling**

```javascript
// ErrorBoundary component for messaging
class MessagingErrorBoundary extends React.Component {
  state = { error: null, errorInfo: null };

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    console.error('Messaging Error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <h2 className="font-bold">Chat Error</h2>
          <p className="text-sm text-gray-700">
            {this.state.error.toString()}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            Reload Chat
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **Common Errors & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| **"Connection refused"** | Backend not running | Start backend: `npm run start` |
| **"Missing userId"** | Socket auth failed | Check JWT token in localStorage |
| **"Message not sending"** | Server error | Check browser console & server logs |
| **"Typing indicator stuck"** | Socket disconnect | Check internet connection |
| **"Unread badges not updating"** | Event not emitted | Verify Socket.io event listeners |
| **"Messages duplicating"** | Double emit | Use `socket.once()` instead of `socket.on()` |
| **"Conversations not loading"** | DB query error | Check MongoDB connection |
| **"Real-time not working"** | CORS misconfigured | Verify CORS in `server.js` |

---

### **Logging Strategy**

```javascript
// services/logger.js
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  if (level === 'error') {
    console.error('[ERROR]', logEntry);
    // Send to error tracking service (e.g., Sentry)
  } else if (level === 'warn') {
    console.warn('[WARN]', logEntry);
  } else {
    console.log('[INFO]', logEntry);
  }
};

// Usage:
log('info', 'Message sent', { messageId, conversationId });
log('error', 'Failed to save message', { error: err.message });
log('warn', 'User disconnected without cleanup', { userId });
```

---

## 📈 Performance Optimization

### **Database Query Optimization**

```javascript
// ✅ GOOD: Use lean() for read-only queries
const messages = await Message.find({ conversationId })
  .lean()
  .sort({ createdAt: -1 });

// ✅ GOOD: Limit results (pagination)
const messages = await Message.find({ conversationId })
  .limit(50)
  .skip(pageNum * 50);

// ✅ GOOD: Select only needed fields
const messages = await Message.find({ conversationId })
  .select('content senderId createdAt status')
  .lean();

// ❌ BAD: N+1 query problem
for (const msg of messages) {
  const sender = await User.findById(msg.senderId); // ❌ Loop query
}

// ✅ GOOD: Populate in one query
const messages = await Message.find({ conversationId })
  .populate('senderId', 'name avatar');
```

### **Frontend Performance**

```javascript
// ✅ Virtualization for long message lists
import { FixedSizeList } from 'react-window';

function MessageList({ messages }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <div style={style}>
          <Message msg={messages[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}

// ✅ Memoization to prevent re-renders
const Message = React.memo(({ msg }) => (
  <div>{msg.content}</div>
));

// ✅ Debounced search
const debouncedSearch = useCallback(
  debounce((query) => {
    searchMessages(query);
  }, 300),
  []
);
```

---

## 🚀 Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB indexes created
- [ ] Socket.IO CORS configured for production domain
- [ ] Error logging setup (Sentry/DataDog)
- [ ] Rate limiting configured
- [ ] Database backups setup
- [ ] Load testing done (k6/Artillery)
- [ ] Security headers set
- [ ] HTTPS enabled
- [ ] CDN configured for static files
- [ ] Monitoring/alerting setup
- [ ] API documentation deployed

---

## 📞 Support & Resources

- Socket.IO Docs: https://socket.io/docs/
- MongoDB Docs: https://docs.mongodb.com/
- React Docs: https://react.dev
- Best Practices: https://socket.io/docs/v4/server-api/

---

**Version:** 1.0  
**Last Updated:** April 25, 2026  
**Status:** ✅ Ready for Implementation
