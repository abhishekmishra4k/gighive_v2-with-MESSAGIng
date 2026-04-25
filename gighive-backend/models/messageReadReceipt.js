const mongoose = require('mongoose');

const messageReadReceiptSchema = new mongoose.Schema({
    // Message & User reference
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message',
        required: true,
        index: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },

    // Status progression
    deliveredAt: {
        type: Date,
        default: null
    },
    readAt: {
        type: Date,
        default: null
    },
    acknowledgedAt: {
        type: Date,
        default: null
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Composite index for fast lookups
messageReadReceiptSchema.index({ messageId: 1, receiverId: 1 });

module.exports = mongoose.model('messageReadReceipt', messageReadReceiptSchema);
