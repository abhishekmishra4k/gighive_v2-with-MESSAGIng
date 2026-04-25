# 📨 GigHive — User Connection & Messaging SRS

**Software Requirements Specification**  
How students and employers discover, connect, and message each other.

---

## 1. Overview

GigHive connects two types of users:
- **Students** — looking for gig opportunities
- **Employers** — posting gigs and hiring students

Messaging is **initiated by an employer** after viewing a student's profile or application, or by a **student replying** to an employer's message. Direct student → employer initiation happens via **"Message Employer"** on a gig listing.

---

## 2. Connection Entry Points

There are **3 ways** a conversation is started:

| # | Who | Action | Entry Point |
|---|-----|--------|-------------|
| 1 | Employer | Reviews application → clicks "Message Student" | Applications page |
| 2 | Student | Views a gig → clicks "Message Employer" | Find Gigs / Gig Detail |
| 3 | Either | Clicks existing conversation | Messages page |

---

## 3. User Flow Diagrams

### Flow A — Employer Messages a Student

```
Employer Dashboard
    └── Applications tab
            └── View application card
                    └── Click "💬 Message"
                            ↓
                    Navigate to /employer-dashboard/messages/:studentId
                            ↓
                    Backend: GET /api/message/conversations/:employerId
                    → Find or create conversation with this student
                            ↓
                    Chat window opens, history loaded
                    Socket emits: user_connected, conversation_opened
                            ↓
                    Employer types message → Send
                    Socket: send_message → server saves to DB
                            ↓
                    Student sees message in real-time (receive_message)
                    + unread badge updates on their Messages tab
```

### Flow B — Student Messages an Employer

```
Student Dashboard
    └── Find Gigs tab
            └── View gig card
                    └── Click "View Details"
                            ↓
                    Gig detail modal opens
                            ↓
                    Click "💬 Message Employer" button
                            ↓
                    Navigate to /student-dashboard/messages
                    Auto-opens conversation with this employer
                            ↓
                    Backend: GET /api/message/conversations/:studentId
                    → Find or create conversation
                            ↓
                    Socket: send_message
                    Employer notified in real-time
```

### Flow C — Continuing an Existing Conversation

```
Student/Employer Dashboard
    └── Click "Messages" in sidebar
            ↓
    GET /api/message/conversations/:userId
    → List of all conversations, sorted by lastMessageTime
            ↓
    Click on a conversation
            ↓
    GET /api/message/conversation/:conversationId?limit=50
    → Load message history (most recent 50)
            ↓
    PUT /api/message/mark-as-read { conversationId, userId }
    → Unread count cleared
    → Socket: message_read → receipt shown to sender (✓ → ✓✓)
            ↓
    Real-time socket: conversation_opened
    Both users now receive live typing indicators + messages
```

---

## 4. API Endpoints Required

### Conversations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/message/conversations/:userId` | ✅ JWT | Get all conversations for user |
| `GET` | `/api/message/conversation/:conversationId` | ✅ JWT | Get message history (paginated) |
| `PUT` | `/api/message/mark-as-read` | ✅ JWT | Mark all messages in conversation as read |
| `POST` | `/api/message/send` | ✅ JWT | Send message via REST (fallback) |
| `DELETE` | `/api/message/:messageId` | ✅ JWT | Delete message (soft delete) |

### Conversation Creation (Missing — needs to be implemented)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/message/conversations/start` | ✅ JWT | Create or find existing conversation between two users |

---

## 5. Socket.IO Events Required

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `user_connected` | `{ userId, deviceType }` | Register user as online on mount |
| `send_message` | `{ senderId, receiverId, content, conversationId?, tempId }` | Send a message (saved to DB on server) |
| `user_typing` | `{ conversationId, userId, senderName }` | Notify other party typing started |
| `user_stopped_typing` | `{ conversationId, userId }` | Notify other party typing stopped |
| `message_read` | `{ messageId, conversationId, userId }` | Mark message as read |
| `conversation_opened` | `{ conversationId, userId }` | Join conversation room |
| `conversation_closed` | `{ conversationId, userId }` | Leave conversation room |
| `presence_update` | `{ userId, isOnline, lastActivity }` | Heartbeat every 30s |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `{ _id, senderId, content, createdAt, conversationId }` | New message |
| `message_sent` | `{ tempId, _id, status, conversationId }` | Confirm sender's message saved |
| `message_error` | `{ error, tempId }` | Send failed |
| `user_typing` | `{ userId, senderName, isTyping }` | Show/hide typing indicator |
| `message_read_receipt` | `{ messageId, readBy, readAt }` | Update ✓ → ✓✓ for sender |
| `unread_count_updated` | `{ conversationId, unreadCount }` | Update badge |
| `user_status_changed` | `{ userId, isOnline, lastSeen }` | Online/offline dot |

---

## 6. Database Models

### Conversation

```javascript
{
  _id: ObjectId,
  participant1Id: ObjectId  → ref User,   // always the initiator
  participant2Id: ObjectId  → ref User,   // recipient
  relatedGigId:  ObjectId  → ref Gig,    // optional — which gig prompted this
  lastMessage:   String,
  lastMessageTime: Date,
  lastMessageId: ObjectId,
  unreadCount1:  Number,   // unread for participant1
  unreadCount2:  Number,   // unread for participant2
  isPinned:      Boolean,  // pinned by participant
  isMuted:       Boolean,  // muted notifications
  isBlocked:     Boolean,  // blocked conversation
  createdAt:     Date,
  updatedAt:     Date
}
```

### Message

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId → ref Conversation,
  senderId:       ObjectId → ref User,
  receiverId:     ObjectId → ref User,
  content:        String,
  contentType:    'text' | 'image' | 'file' | 'link',
  status:         'pending' | 'sent' | 'delivered' | 'read',
  isDeleted:      Boolean,
  isEdited:       Boolean,
  editHistory:    [String],
  gigId:          ObjectId → ref Gig,   // optional context
  mediaUrl:       String,
  readAt:         Date,
  createdAt:      Date
}
```

---

## 7. Missing Pieces to Implement

The following are **NOT yet implemented** and needed for the full user connection flow:

### 7.1 "Start Conversation" API — HIGH PRIORITY

**Current problem:** When an employer clicks "Message" on an application, or a student clicks "Message Employer" on a gig, there is no API to create a new conversation. The socket `send_message` event auto-creates one, but there's no way for the UI to get the `conversationId` BEFORE sending the first message.

**Required endpoint:**
```
POST /api/message/conversations/start
Body: { initiatorId, recipientId, gigId? }
Response: { conversation: { _id, ... }, isNew: true/false }
```

### 7.2 "Message Employer" Button on Find Gigs — HIGH PRIORITY

Currently the `Find Gigs` page has no "Message Employer" button. Need to add:
```jsx
// In the gig detail modal, after description:
<Button onClick={() => startConversation(gig.employerId)}>
  💬 Message Employer
</Button>
```

### 7.3 "Message Student" Button on Applications — HIGH PRIORITY

The employer `Applications` page shows applicants but has no "Message" button linking to `/employer-dashboard/messages/:studentId`.

### 7.4 Real-time Conversation List — MEDIUM PRIORITY

After send_message, the conversations list should auto-update (lastMessage preview, time, unread badge). Currently needs a full `fetchConversations()` re-fetch.

**Fix:** In the `message_sent` socket handler on the client, update the conversation list in place:
```js
setConversations(prev => prev.some(c => c._id === data.conversationId)
  ? prev.map(c => c._id === data.conversationId ? { ...c, lastMessage: data.content, ... } : c)
  : [{ _id: data.conversationId, ... }, ...prev]
);
```

---

## 8. Implementation Priority

| Priority | Feature | Status |
|----------|---------|--------|
| 🔴 P0 | Backend: POST /api/message/conversations/start | ❌ Missing |
| 🔴 P0 | Applications page: "Message Student" button → navigate | ❌ Missing |
| 🔴 P0 | Find Gigs: "Message Employer" button → start conversation | ❌ Missing |
| 🟡 P1 | Real-time conversation list update (no re-fetch) | ❌ Missing |
| 🟡 P1 | Conversation search | ❌ Missing |
| 🟢 P2 | File / image attachments | ❌ Missing |
| 🟢 P2 | Message reactions | ❌ Missing |
| 🟢 P2 | Read receipts per-message (not bulk) | ⚠️ Partial |

---

## 9. Security Rules

| Rule | Implementation |
|------|----------------|
| Users can only read conversations they are a participant in | `req.user.id === participant1Id OR participant2Id` check in controller |
| Users can only send messages as themselves | `senderId === req.user.id` validation on backend |
| JWT required for all message API calls | `auth` middleware on all `/api/message/*` routes |
| Socket.IO auth validates userId | `socket.handshake.auth.userId` check in middleware |
| Rate limiting on send_message | 🔴 Not yet implemented — needed |

---

## 10. Implementation Plan (in order)

```
Step 1: POST /api/message/conversations/start backend endpoint
Step 2: "Message Student" button in Applications.jsx → navigate to /employer-dashboard/messages/:studentId
Step 3: "Message Employer" button in FindGigs.jsx modal → navigate to /student-dashboard/messages with pre-selected employer
Step 4: Messages components auto-detect opened conversation from navigation state (useLocation)
Step 5: Real-time conversation list update without re-fetch
Step 6: Test end-to-end: employer messages student, student replies, receipts update
```
