const mongoose = require('mongoose');

const userStatusSchema = new mongoose.Schema({
    // User reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true,
        index: true
    },

    // Online status
    isOnline: {
        type: Boolean,
        default: false,
        index: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },

    // Session info
    socketId: {
        type: String,
        default: null
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet'],
        default: 'desktop'
    },
    browserAgent: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },

    // Activity tracking
    currentPage: {
        type: String,
        default: null
    },
    activeConversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation',
        default: null
    },
    isTyping: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },

    // Idle status
    isIdle: {
        type: Boolean,
        default: false
    },

    // Timestamps
    connectedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-update updatedAt on every save
userStatusSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('userStatus', userStatusSchema);
