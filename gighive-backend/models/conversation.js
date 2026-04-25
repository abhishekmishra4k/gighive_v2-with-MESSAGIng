const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Participants (always 2 people)
    participant1Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    participant2Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },

    // Message references
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message',
        default: null
    },
    lastMessage: {
        type: String,
        default: null
    },
    lastMessageTime: {
        type: Date,
        default: null
    },

    // Unread counts (separate for each participant)
    unreadCount1: {
        type: Number,
        default: 0
    },
    unreadCount2: {
        type: Number,
        default: 0
    },

    // Context
    relatedGigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gig',
        default: null
    },
    relatedApplicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'application',
        default: null
    },

    // Flags for participant1
    isPinned1: {
        type: Boolean,
        default: false
    },
    isMutedBy1: {
        type: Boolean,
        default: false
    },
    isBlockedBy1: {
        type: Boolean,
        default: false
    },

    // Flags for participant2
    isPinned2: {
        type: Boolean,
        default: false
    },
    isMutedBy2: {
        type: Boolean,
        default: false
    },
    isBlockedBy2: {
        type: Boolean,
        default: false
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Composite index for finding conversations between two users
conversationSchema.index({ participant1Id: 1, participant2Id: 1 });
conversationSchema.index({ participant1Id: 1, createdAt: -1 });
conversationSchema.index({ participant2Id: 1, createdAt: -1 });

module.exports = mongoose.model('conversation', conversationSchema);
