const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/user');
const messageController = require('../controllers/messageController');

// 📤 Send a message
router.post('/send', auth, messageController.sendMessage);

// 📥 Get conversation history
router.get('/conversation/:conversationId', auth, messageController.getConversationHistory);

// 💬 Get all conversations for a user
router.get('/conversations/:userId', auth, messageController.getUserConversations);

// 🔗 Start or find existing conversation (MUST be before /:messageId wildcard)
router.post('/conversations/start', auth, messageController.startConversation);

// ✅ Mark messages as read
router.put('/mark-as-read', auth, messageController.markAsRead);

// 👤 Get user online status
router.get('/user-status/:userId', messageController.getUserStatus);

// 🔍 Search messages
router.get('/search', auth, messageController.searchMessages);

// 🗑️ Delete message
router.delete('/:messageId', auth, messageController.deleteMessage);

// ✏️ Edit message
router.put('/:messageId/edit', auth, messageController.editMessage);

// 😀 React to a message
router.post('/:messageId/react', auth, messageController.reactToMessage);

// 📤 Upload media
router.post('/upload', auth, messageController.uploadMedia);

module.exports = router;

