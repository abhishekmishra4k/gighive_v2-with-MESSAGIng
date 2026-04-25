# 🚀 Messaging System - Quick Start Guide

**Get the messaging system up and running in 5 minutes!**

---

## 📋 Prerequisites

- Node.js v14+ installed
- MongoDB connection string in `.env`
- Backend running on port 5001
- Frontend running on port 3000

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Verify Backend Models
```bash
ls -la gighive-backend/models/
# Should see:
# - message.js ✅
# - conversation.js ✅
# - userStatus.js ✅
# - messageReadReceipt.js ✅
```

### Step 2: Start Backend Server
```bash
cd gighive-backend
npm run start
```

**Expected Output:**
```
🚀 Server running on port 5001
✅ MongoDB connected
✅ User connected: socket_id (userId: user123)
```

### Step 3: Start Frontend
```bash
npm run dev
```

**Expected Output:**
```
➜ Local: http://localhost:3000/
```

### Step 4: Test the System

Open two browser tabs:

**Tab 1 (Student):**
- Go to http://localhost:3000
- Login as student
- Click "Messages"

**Tab 2 (Employer):**
- Go to http://localhost:3000 (different browser or incognito)
- Login as employer
- Click "Messages"

---

## 🧪 Live Testing Checklist

### ✓ Test 1: Send Message
```
Student types: "Hi! Are you available?"
Press Send
→ Should appear instantly in Employer's chat
→ Show status: ✓ (sent)
→ Auto-mark as read: ✓✓
```

### ✓ Test 2: Typing Indicator
```
Student starts typing
→ Employer sees: "Student is typing..."
→ Animated dots (● ● ●)
Student stops typing (2 sec delay)
→ Indicator disappears
```

### ✓ Test 3: Online Status
```
Student's name shows: 🟢 Online
Employer's name shows: 🟢 Online
Unread badge shows: 1
Student reads message
→ Unread badge disappears
```

### ✓ Test 4: Conversation List
```
See all conversations
See last message preview
See unread count (if any)
Click conversation → Opens chat
→ Auto-scrolls to latest message
```

---

## 🔌 Socket.IO Events (Advanced Testing)

Open browser console and try:

```javascript
// Connect
const socket = io('http://localhost:5001', {
  auth: { userId: 'student-123' }
});

// Listen for messages
socket.on('receive_message', (msg) => {
  console.log('📨 New message:', msg);
});

// Send message manually
socket.emit('send_message', {
  senderId: 'student-123',
  receiverId: 'employer-456',
  conversationId: 'conv789',
  content: 'Hello from console!'
});

// Listen for typing
socket.on('user_typing', (data) => {
  console.log(data.senderName + ' is typing...');
});

// View online users
socket.on('user_status_changed', (data) => {
  console.log(data.userId + ' is ' + (data.isOnline ? 'online' : 'offline'));
});
```

---

## 📱 UI Components

### Message Bubble
```
┌─────────────────────────┐
│ Hello! How are you?     │
│                  2:30 PM ✓✓│
└─────────────────────────┘
```

### Typing Indicator
```
● ● ● (animated bouncing)
```

### Conversation Item
```
┌─────────────────────────┐
│ ● John Employer    2:30 │
│   @TechCorp             │
│   Hi there!       [1]   │ ← unread badge
└─────────────────────────┘
```

---

## 🛠️ API Endpoints (Postman)

### 1. Send Message
```
POST http://localhost:5001/api/message/send
Content-Type: application/json

{
  "senderId": "student-123",
  "receiverId": "employer-456",
  "content": "Are you free?",
  "conversationId": "conv789"
}
```

### 2. Get Conversation History
```
GET http://localhost:5001/api/message/conversation/conv789?limit=50
```

### 3. Mark as Read
```
PUT http://localhost:5001/api/message/mark-as-read
Content-Type: application/json

{
  "conversationId": "conv789",
  "userId": "student-123"
}
```

### 4. Get All Conversations
```
GET http://localhost:5001/api/message/conversations/student-123
```

### 5. Get User Online Status
```
GET http://localhost:5001/api/message/user-status/employer-456
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check port is not in use
lsof -ti:5001 | xargs kill -9

# Check MongoDB connection
# Verify MONGO_URI in .env

# Try again
npm run start
```

### No Messages Appearing
```bash
# 1. Check console for Socket errors
# 2. Verify userId is being passed
# 3. Check conversationId matches
# 4. Restart both servers
```

### Typing Indicator Stuck
```bash
# Refresh the page
# Clear browser cache
# Check network tab for events
```

### Green Dot Not Showing
```bash
# Check user_status_changed event is being received
# Verify isOnline field in UserStatus model
# Restart backend
```

---

## 📊 Database Check

### View Collections
```javascript
// In MongoDB Compass or mongosh
use gighive
show collections

// Query messages
db.messages.findOne()

// Check conversations
db.conversations.findOne()

// Check user status
db.userstatuses.findOne()
```

---

## 🎯 Next Features to Add

- [ ] Message search
- [ ] File uploads
- [ ] Voice messages
- [ ] Group chat
- [ ] Message reactions
- [ ] Voice/video calls

---

## 📞 Quick Support

**Socket not connecting?**
→ Check DevTools → Network → check for 'socket.io' connection

**Messages not saving?**
→ Check server logs: `npm run start` output

**UI not updating?**
→ Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## ✨ You're All Set!

The messaging system is ready to use! Start chatting and enjoy real-time communication. 🎉

**Have fun building! 🚀**
