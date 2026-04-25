const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Participants
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },

  // Content
  content: {
    type: String,
    required: true,
    trim: true
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'file', 'emoji'],
    default: 'text'
  },

  // Media (optional)
  mediaUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },

  // Status & Tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read'],
    default: 'pending'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Metadata
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversation',
    required: true,
    index: true
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message',
    default: null
  },
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'gig',
    default: null
  },
  // Emoji reactions: { "👍": [userId1, userId2], "❤️": [userId3] }
  reactions: {
    type: Map,
    of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    default: {}
  }
});

// Compound index for fast conversation queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 }); // For unread messages

module.exports = mongoose.model('message', messageSchema);
