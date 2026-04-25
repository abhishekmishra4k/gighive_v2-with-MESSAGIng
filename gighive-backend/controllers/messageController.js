const Message = require('../models/message');
const Conversation = require('../models/conversation');
const UserStatus = require('../models/userStatus');
const User = require('../models/user');

// 📤 Send a message (REST API - saves to DB)
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content, contentType = 'text', conversationId, gigId } = req.body;

        // Validation
        if (!senderId || !receiverId || !content?.trim()) {
            return res.status(400).json({
                error: 'Missing required fields: senderId, receiverId, content'
            });
        }

        if (senderId === receiverId) {
            return res.status(400).json({
                error: 'Cannot send message to yourself'
            });
        }

        // Create or update conversation
        let conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            conversation = new Conversation({
                participant1Id: senderId,
                participant2Id: receiverId,
                relatedGigId: gigId || null
            });
        }

        // Create message
        const message = new Message({
            senderId,
            receiverId,
            content: content.trim(),
            contentType,
            status: 'sent',
            conversationId: conversation._id,
            gigId: gigId || null
        });

        // Save message & conversation
        await message.save();

        conversation.lastMessageId = message._id;
        conversation.lastMessage = content.substring(0, 50); // Preview
        conversation.lastMessageTime = new Date();

        // Increment unread count for receiver
        if (conversation.participant1Id.toString() === receiverId) {
            conversation.unreadCount1 += 1;
        } else {
            conversation.unreadCount2 += 1;
        }

        await conversation.save();

        // Populate sender info
        const populatedMessage = await message.populate('senderId', 'name avatar email');

        res.status(201).json({
            success: true,
            message: populatedMessage,
            conversationId: conversation._id,
            timestamp: new Date()
        });

    } catch (err) {
        console.error('❌ Error sending message:', err);
        res.status(500).json({ error: 'Failed to send message', details: err.message });
    }
};

// 📥 Get conversation history
exports.getConversationHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        if (!conversationId) {
            return res.status(400).json({ error: 'Missing conversationId' });
        }

        // Get conversation details
        const conversation = await Conversation.findById(conversationId)
            .populate('participant1Id', 'name avatar')
            .populate('participant2Id', 'name avatar');

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Get paginated messages
        const messages = await Message.find({
            conversationId,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('senderId', 'name avatar email')
            .lean();

        // Get total count
        const totalCount = await Message.countDocuments({
            conversationId,
            isDeleted: false
        });

        res.json({
            success: true,
            conversation,
            messages: messages.reverse(), // Oldest first
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                skip: parseInt(skip),
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });

    } catch (err) {
        console.error('❌ Error getting conversation history:', err);
        res.status(500).json({ error: 'Failed to fetch conversation', details: err.message });
    }
};

// 💬 Get all conversations for a user
exports.getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, skip = 0, search = '' } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Find all conversations involving this user
        let query = {
            $or: [
                { participant1Id: userId },
                { participant2Id: userId }
            ]
        };

        // Build conversations
        const conversations = await Conversation.find(query)
            .sort({ lastMessageTime: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Enrich with participant info & online status
        const enriched = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participant1Id.toString() === userId
                    ? conv.participant2Id
                    : conv.participant1Id;

                const otherUser = await User.findById(otherUserId).select('name avatar email');
                const status = await UserStatus.findOne({ userId: otherUserId });

                const unreadCount = conv.participant1Id.toString() === userId
                    ? conv.unreadCount1
                    : conv.unreadCount2;

                return {
                    _id: conv._id,
                    otherUser,
                    lastMessage: conv.lastMessage,
                    lastMessageTime: conv.lastMessageTime,
                    unreadCount,
                    isOnline: status?.isOnline || false,
                    lastSeen: status?.lastSeen,
                    relatedGigId: conv.relatedGigId,
                    isPinned: conv.participant1Id.toString() === userId ? conv.isPinned1 : conv.isPinned2,
                    isMuted: conv.participant1Id.toString() === userId ? conv.isMutedBy1 : conv.isMutedBy2
                };
            })
        );

        // Apply search filter if provided
        const filtered = search
            ? enriched.filter(conv =>
                conv.otherUser?.name?.toLowerCase().includes(search.toLowerCase())
            )
            : enriched;

        res.json({
            success: true,
            conversations: filtered,
            total: filtered.length
        });

    } catch (err) {
        console.error('❌ Error getting conversations:', err);
        res.status(500).json({ error: 'Failed to fetch conversations', details: err.message });
    }
};

// ✅ Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;

        if (!conversationId || !userId) {
            return res.status(400).json({ error: 'Missing conversationId or userId' });
        }

        // Update all unread messages in conversation
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

        // Reset unread count in conversation
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            if (conversation.participant1Id.toString() === userId) {
                conversation.unreadCount1 = 0;
            } else {
                conversation.unreadCount2 = 0;
            }
            await conversation.save();
        }

        res.json({
            success: true,
            messagesUpdated: result.modifiedCount,
            timestamp: new Date()
        });

    } catch (err) {
        console.error('❌ Error marking as read:', err);
        res.status(500).json({ error: 'Failed to mark as read', details: err.message });
    }
};

// 👤 Get user online status
exports.getUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const status = await UserStatus.findOne({ userId });

        if (!status) {
            return res.json({
                success: true,
                userId,
                isOnline: false,
                lastSeen: null,
                deviceType: null
            });
        }

        res.json({
            success: true,
            userId,
            isOnline: status.isOnline,
            lastSeen: status.lastSeen,
            deviceType: status.deviceType,
            isIdle: status.isIdle,
            currentPage: status.currentPage
        });

    } catch (err) {
        console.error('❌ Error getting user status:', err);
        res.status(500).json({ error: 'Failed to fetch user status', details: err.message });
    }
};

// 🔍 Search messages
exports.searchMessages = async (req, res) => {
    try {
        const { conversationId, query, limit = 20 } = req.query;

        if (!conversationId || !query) {
            return res.status(400).json({ error: 'Missing conversationId or query' });
        }

        const results = await Message.find({
            conversationId,
            content: { $regex: query, $options: 'i' },
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('senderId', 'name avatar');

        res.json({
            success: true,
            query,
            results,
            totalCount: results.length
        });

    } catch (err) {
        console.error('❌ Error searching messages:', err);
        res.status(500).json({ error: 'Failed to search messages', details: err.message });
    }
};

// 🗑️ Delete message (soft delete)
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;

        if (!messageId || !userId) {
            return res.status(400).json({ error: 'Missing messageId or userId' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only sender can delete
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized - only sender can delete' });
        }

        // Soft delete
        message.isDeleted = true;
        await message.save();

        // Broadcast delete
        const io = req.app?.get('io');
        if (io && message.conversationId) {
            io.to(message.conversationId.toString()).emit('message_deleted', {
                messageId: messageId.toString(),
            });
        }

        res.json({
            success: true,
            message: 'Message deleted',
            messageId
        });

    } catch (err) {
        console.error('❌ Error deleting message:', err);
        res.status(500).json({ error: 'Failed to delete message', details: err.message });
    }
};

// ✏️ Edit message
exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId, content } = req.body;

        if (!messageId || !userId || !content?.trim()) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only sender can edit
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized - only sender can edit' });
        }

        // Can't edit deleted messages
        if (message.isDeleted) {
            return res.status(400).json({ error: 'Cannot edit deleted message' });
        }

        message.content = content.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        // Broadcast edit
        const io = req.app?.get('io');
        if (io && message.conversationId) {
            io.to(message.conversationId.toString()).emit('message_edited', {
                messageId: messageId.toString(),
                content: message.content,
                isEdited: true,
                editedAt: message.editedAt
            });
        }

        res.json({
            success: true,
            message: 'Message edited',
            _id: message._id,
            content: message.content,
            isEdited: true,
            editedAt: message.editedAt
        });

    } catch (err) {
        console.error('❌ Error editing message:', err);
        res.status(500).json({ error: 'Failed to edit message', details: err.message });
    }
};

// 📤 Upload message media
exports.uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // TODO: Use Cloudinary uploader from services
        const { conversationId, messageType } = req.body;

        res.status(201).json({
            success: true,
            url: `https://via-placeholder.com/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            contentType: messageType || 'file'
        });

    } catch (err) {
        console.error('❌ Error uploading media:', err);
        res.status(500).json({ error: 'Failed to upload media', details: err.message });
    }
};

// 🔗 Start or find existing conversation between two users
exports.startConversation = async (req, res) => {
    try {
        const { initiatorId, recipientId, gigId } = req.body;

        if (!initiatorId || !recipientId) {
            return res.status(400).json({ error: 'Missing initiatorId or recipientId' });
        }

        if (initiatorId === recipientId) {
            return res.status(400).json({ error: 'Cannot start a conversation with yourself' });
        }

        // Check if conversation already exists in either direction
        let conversation = await Conversation.findOne({
            $or: [
                { participant1Id: initiatorId, participant2Id: recipientId },
                { participant1Id: recipientId, participant2Id: initiatorId }
            ]
        })
        .populate('participant1Id', 'name avatar email role')
        .populate('participant2Id', 'name avatar email role');

        let isNew = false;

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({
                participant1Id: initiatorId,
                participant2Id: recipientId,
                relatedGigId: gigId || null,
            });
            await conversation.save();

            // Re-populate after save
            conversation = await Conversation.findById(conversation._id)
                .populate('participant1Id', 'name avatar email role')
                .populate('participant2Id', 'name avatar email role');

            isNew = true;
            console.log(`🆕 New conversation created: ${conversation._id} (${initiatorId} ↔ ${recipientId})`);
        } else {
            console.log(`♻️ Existing conversation found: ${conversation._id}`);
        }

        res.status(isNew ? 201 : 200).json({
            success: true,
            conversation,
            isNew
        });

    } catch (err) {
        console.error('❌ Error starting conversation:', err);
        res.status(500).json({ error: 'Failed to start conversation', details: err.message });
    }
};


// 😀 React to a message (toggle — add or remove)
exports.reactToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji, userId } = req.body;

        if (!emoji || !userId) {
            return res.status(400).json({ error: 'emoji and userId are required' });
        }

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        if (!message.reactions) message.reactions = new Map();

        const existing = message.reactions.get(emoji) || [];
        const alreadyReacted = existing.some(id => id.toString() === userId.toString());

        if (alreadyReacted) {
            message.reactions.set(emoji, existing.filter(id => id.toString() !== userId.toString()));
        } else {
            message.reactions.set(emoji, [...existing, userId]);
        }

        for (const [key, val] of message.reactions.entries()) {
            if (val.length === 0) message.reactions.delete(key);
        }

        await message.save();

        const reactionsObj = {};
        for (const [key, val] of message.reactions.entries()) {
            reactionsObj[key] = val.map(id => id.toString());
        }

        const io = req.app?.get('io');
        if (io && message.conversationId) {
            io.to(message.conversationId.toString()).emit('reaction_updated', {
                messageId: messageId.toString(),
                reactions: reactionsObj,
            });
        }

        res.json({ success: true, messageId: messageId.toString(), reactions: reactionsObj });

    } catch (err) {
        console.error('❌ reactToMessage error:', err);
        res.status(500).json({ error: 'Failed to react to message', details: err.message });
    }
};
