# Messaging System Specification (SRS)

## 1. Socket Architecture
- **Provider**: `SocketContext.jsx` (Global Singleton)
- **Library**: `socket.io-client`
- **Connection Logic**: 
  - Initializes when `user` is authenticated.
  - Automatically joins personal room based on `userId`.
  - Automatically joins all active conversation rooms on connection via backend `user_connected` handler.

## 2. Real-Time Event flow

### 2.1 Sending Messages
1. **Frontend**: 
   - Generates `tempId` (e.g., `temp_171404`).
   - Appends message to local state with `status: 'pending'`.
   - Emits `send_message` with `tempId`.
2. **Backend**:
   - Receives `send_message`.
   - Persists to MongoDB.
   - Emits `message_sent` back to sender (including `tempId` and real `_id`).
   - Emits `receive_message` to the recipient's room.
3. **Frontend (Sender)**:
   - Receives `message_sent`.
   - Matches by `tempId`.
   - Updates `status` to `sent` and replaces `_id`.

### 2.2 Typing Indicators
- **Event**: `user_typing`
- **Data**: `{ conversationId, userId, senderName, isTyping: true/false }`
- **Trigger**: `onKeyDown` with a 1.5s debounce.
- **Cleanup**: `onBlur` or `user_stopped_typing` timer.

### 2.3 Notifications
- Handled globally in `SocketContext.jsx`.
- Suppressed if the user is currently viewing the active conversation (`window.location` + `selectedChat` checks).

## 3. Reliability & Edge Cases
- **Reconnection**: Socket auto-reconnects on drop.
- **Dependency Tracking**: All message listeners MUST include `socket` in their dependency arrays to ensure they re-bind on connection refresh.
- **Error Handling**: `message_error` listener displays toast notifications for persistence failures.
