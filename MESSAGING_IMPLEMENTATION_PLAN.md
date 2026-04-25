# 💬 Messaging System - Implementation Plan

**Project:** GigHive Real-Time Messaging  
**Start Date:** April 25, 2026  
**Target Completion:** May 10, 2026  
**Status:** 🚀 In Progress

---

## 📋 Implementation Phases

### **Phase 1: Database Models & Schema (Days 1-2)** ✅ TODO
- [ ] Create Message Model
- [ ] Create Conversation Model
- [ ] Create UserStatus Model
- [ ] Create MessageReadReceipt Model
- [ ] Add database indexes
- [ ] Test model relationships

### **Phase 2: Backend API Routes (Days 3-4)** ⏳ TODO
- [ ] Create message controller
- [ ] Implement `/send` endpoint
- [ ] Implement `/conversation/:id` endpoint
- [ ] Implement `/conversations` endpoint
- [ ] Implement `/mark-as-read` endpoint
- [ ] Implement `/upload` endpoint
- [ ] Implement `/user-status/:userId` endpoint
- [ ] Add error handling & validation

### **Phase 3: Socket.IO Setup (Days 5-6)** ⏳ TODO
- [ ] Update server.js with Socket.IO configuration
- [ ] Implement connection/disconnection handlers
- [ ] Implement `user_connected` event
- [ ] Implement `send_message` event
- [ ] Implement `user_typing` events
- [ ] Implement `message_read` event
- [ ] Implement `presence_update` event
- [ ] Test all Socket events

### **Phase 4: Frontend Components (Days 7-9)** ⏳ TODO
- [ ] Create MessagesContainer component
- [ ] Create ConversationList component
- [ ] Create ChatWindow component
- [ ] Create Message component
- [ ] Create TypingIndicator component
- [ ] Create MessageInput component
- [ ] Implement Socket.io client setup
- [ ] Add real-time event listeners

### **Phase 5: Real-Time Features (Days 10-11)** ⏳ TODO
- [ ] Implement typing indicators
- [ ] Implement read receipts
- [ ] Implement online/offline status
- [ ] Implement unread badges
- [ ] Implement auto-scroll to latest message
- [ ] Implement message delivery timeline

### **Phase 6: Testing & Bug Fixes (Days 12-13)** ⏳ TODO
- [ ] Unit tests for models
- [ ] API endpoint tests
- [ ] Socket.IO integration tests
- [ ] Manual testing checklist
- [ ] Performance testing
- [ ] Bug fixes & optimization

### **Phase 7: Deployment & Documentation (Day 14)** ⏳ TODO
- [ ] Environment setup
- [ ] Production CORS configuration
- [ ] API documentation
- [ ] User guide
- [ ] Deployment verification

---

## 🎯 Detailed Tasks

### **PHASE 1: Database Models (Days 1-2)**

#### Task 1.1: Create Message Model
```
File: gighive-backend/models/message.js
Features:
- senderId, receiverId fields
- content, contentType
- status tracking (sent, delivered, read)
- mediaUrl for files/images
- Timestamps: createdAt, readAt, updatedAt
- Soft delete support
- Edit tracking
```

#### Task 1.2: Create Conversation Model
```
File: gighive-backend/models/conversation.js
Features:
- participant1Id, participant2Id
- lastMessageId, lastMessage, lastMessageTime
- unreadCount tracking
- relatedGigId, relatedApplicationId
- Muting, pinning, blocking flags
```

#### Task 1.3: Create UserStatus Model
```
File: gighive-backend/models/userStatus.js
Features:
- userId, isOnline, lastSeen
- socketId, deviceType
- currentPage, activeConversationId
- isTyping flag
- Timestamps
```

#### Task 1.4: Database Indexes
```
Create indexes for:
- Messages: conversationId, senderId+receiverId+createdAt
- Conversations: participant1Id, participant2Id
- UserStatus: userId
```

---

### **PHASE 2: Backend API Routes (Days 3-4)**

#### Task 2.1: Message Controller
```
File: gighive-backend/controllers/messageController.js
Functions:
- sendMessage(req, res)
- getConversationHistory(req, res)
- getUserConversations(req, res)
- markAsRead(req, res)
- uploadMedia(req, res)
- getUserStatus(req, res)
- deleteMessage(req, res)
- editMessage(req, res)
- searchMessages(req, res)
```

#### Task 2.2: Message Routes
```
File: gighive-backend/routes/message.js
POST   /send
GET    /conversation/:conversationId
GET    /conversations/:userId
PUT    /mark-as-read
POST   /upload
GET    /user-status/:userId
DELETE /:messageId
PUT    /:messageId
GET    /search
```

#### Task 2.3: Error Handling
- Validation middleware
- Try-catch blocks
- Proper HTTP status codes
- Error logging

---

### **PHASE 3: Socket.IO Setup (Days 5-6)**

#### Task 3.1: Update server.js
```
Changes:
- Import Socket.IO
- Setup Socket.IO with CORS
- Configure connection handlers
- Create onlineUsers Map
```

#### Task 3.2: Implement Events
```
Events to implement:
- user_connected
- send_message
- receive_message
- user_typing
- user_stopped_typing
- message_read
- message_read_receipt
- presence_update
- conversation_opened
- conversation_closed
- disconnect
```

#### Task 3.3: Event Broadcasting
- Broadcast to specific users
- Broadcast to conversation rooms
- Error event handling

---

### **PHASE 4: Frontend Components (Days 7-9)**

#### Task 4.1: MessagesContainer
```
File: src/components/student/Messages.jsx (or employer)
Features:
- Two-column layout (conversations + chat)
- Socket.io initialization
- State management
- Event listeners setup
```

#### Task 4.2: ConversationList
```
Features:
- List all conversations
- Search functionality
- Unread badges
- Online status indicators
- Last message preview
- Click to select conversation
```

#### Task 4.3: ChatWindow
```
Features:
- Header with user info
- Message list (scrollable)
- Typing indicator area
- Message input area
```

#### Task 4.4: Message Component
```
Features:
- Message content
- Sender avatar
- Timestamp
- Read receipts (✓ ✓✓)
- Edit/delete options
- Reactions (optional)
```

#### Task 4.5: Utility Components
- TypingIndicator (animated dots)
- MessageInput (with auto-grow)
- DateSeparator
- OnlineStatus indicator

---

### **PHASE 5: Real-Time Features (Days 10-11)**

#### Task 5.1: Typing Indicators
```
Implementation:
- Detect input change
- Emit 'user_typing' on first char
- Debounce (2 second timeout)
- Throttle emissions (max every 500ms)
- Show animated dots on receiver
- Clear after 2 seconds inactivity
```

#### Task 5.2: Read Receipts
```
Implementation:
- Use Intersection Observer for visibility
- Emit 'message_read' when visible
- Update message status to 'read'
- Show double checkmark
- Track read timestamp
```

#### Task 5.3: Online Status
```
Implementation:
- Emit 'user_connected' on login
- Poll presence every 30 seconds
- Show green/yellow/gray dot
- Display "last seen X minutes ago"
- Update on every user action
```

#### Task 5.4: Unread Badges
```
Implementation:
- Track unread count per conversation
- Show number badge
- Clear when opening conversation
- Update in real-time
- Persist across refreshes
```

---

### **PHASE 6: Testing (Days 12-13)**

#### Task 6.1: Unit Tests
```
Test:
- Message creation
- Conversation queries
- User status updates
- Message marking as read
```

#### Task 6.2: Integration Tests
```
Test:
- Send/receive messages
- Typing indicators
- Online status broadcasting
- Read receipts
```

#### Task 6.3: Manual Tests
```
8 test cases with checklists:
1. Basic messaging
2. Typing indicators
3. Online status
4. Read receipts
5. Unread badges
6. Multiple conversations
7. Network issues
8. Performance
```

---

### **PHASE 7: Documentation & Deployment (Day 14)**

#### Task 7.1: Setup & Configuration
- Verify all environment variables
- Create MongoDB indexes
- Test Socket.IO connection

#### Task 7.2: Documentation
- API documentation
- Deployment guide
- Troubleshooting guide

---

## 🚀 Implementation Priority

**CRITICAL (Must have):**
1. Message Model & saving to DB
2. Real-time message sending/receiving
3. Conversation list & history
4. Socket.IO connection setup

**IMPORTANT (Should have):**
1. Typing indicators
2. Read receipts
3. Online status
4. Unread badges

**NICE TO HAVE (Could have):**
1. Message search
2. Message editing/deletion
3. File uploads
4. Reactions

---

## 📊 Current Status

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| 1 | 4 | 4/4 | � ✅ DONE |
| 2 | 3 | 3/3 | � ✅ DONE |
| 3 | 3 | 3/3 | � ✅ DONE |
| 4 | 5 | 1/5 | � In Progress |
| 5 | 4 | 0/4 | 🔴 Not Started |
| 6 | 3 | 0/3 | 🔴 Not Started |
| 7 | 2 | 0/2 | 🔴 Not Started |
| **TOTAL** | **24** | **14/24** | **� 58%** |

---

## ✅ Completed

### Phase 1: Database Models ✅
- [x] Message Model (`gighive-backend/models/message.js`) - Full schema with status tracking
- [x] Conversation Model (`gighive-backend/models/conversation.js`) - Two-person chat containers
- [x] UserStatus Model (`gighive-backend/models/userStatus.js`) - Online/offline tracking
- [x] MessageReadReceipt Model (`gighive-backend/models/messageReadReceipt.js`) - Delivery tracking
- [x] Database indexes created for performance

### Phase 2: Backend API ✅
- [x] Message Controller (`gighive-backend/controllers/messageController.js`) - 8 functions implemented
- [x] Message Routes (`gighive-backend/routes/message.js`) - 9 endpoints
- [x] Error handling & validation

### Phase 3: Socket.IO ✅
- [x] Updated `server.js` with Socket.IO setup
- [x] Implemented all Socket events:
  - user_connected / disconnect
  - send_message / receive_message
  - user_typing / user_stopped_typing
  - message_read / message_read_receipt
  - presence_update
  - conversation_opened / closed
- [x] Online users tracking with Map
- [x] Event broadcasting

### Phase 4: Frontend (In Progress)
- [x] Created MessagesV2.jsx component with:
  - Socket.IO client setup
  - Message component with read receipts
  - TypingIndicator animation
  - Real-time event listeners
- [ ] Test and integrate into main Messages.jsx
- [ ] Create utility components (DateSeparator, StatusIndicator)
- [ ] Message list virtualization for performance

---

## 🚀 Next Steps (Phase 5-7)
