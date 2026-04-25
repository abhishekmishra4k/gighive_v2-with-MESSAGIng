import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
    Search,
    Send,
    MoreVertical,
    Paperclip,
    Phone,
    Video,
    Loader
} from 'lucide-react';

// ═══════════════════════════════════════════
// 🔌 Socket.IO Connection
// ═══════════════════════════════════════════
let socket;

const getSocket = () => {
    if (!socket) {
        const userId = localStorage.getItem('userId') || 'anonymous';
        socket = io('http://localhost:5001', {
            auth: { userId },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });
    }
    return socket;
};

// ═══════════════════════════════════════════
// 💬 TypingIndicator Component
// ═══════════════════════════════════════════
function TypingIndicator() {
    return (
        <div className="flex gap-1 py-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    );
}

// ═══════════════════════════════════════════
// 📝 Message Component
// ═══════════════════════════════════════════
function Message({ msg, isOwn }) {
    const getStatusIcon = () => {
        switch (msg.status) {
            case 'pending':
                return <Loader className="animate-spin w-3 h-3" />;
            case 'read':
                return '✓✓';
            case 'delivered':
                return '✓';
            case 'sent':
                return '✓';
            default:
                return '';
        }
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                    }`}
            >
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isOwn && getStatusIcon()}
                </div>
            </div>
        </div>
    );
}

export default function StudentMessages() {
    const socket = getSocket();
    const userId = localStorage.getItem('userId') || 'anonymous';

    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [conversations, setConversations] = useState([
        {
            _id: 1,
            otherUser: { _id: 'emp1', name: 'Employer 1', avatar: 'E1' },
            lastMessage: 'Looking forward to working with you!',
            lastMessageTime: new Date(),
            unreadCount: 1,
            isOnline: true
        },
        {
            _id: 2,
            otherUser: { _id: 'emp2', name: 'Employer 2', avatar: 'E2' },
            lastMessage: 'We\'ll schedule a meeting soon!',
            lastMessageTime: new Date(Date.now() - 3600000),
            unreadCount: 0,
            isOnline: false
        }
    ]);

    const chatEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // ═══════════════════════════════════════════
    // 🔌 Socket.IO Events Setup
    // ═══════════════════════════════════════════

    useEffect(() => {
        // ✅ Connect to Socket.IO
        socket.emit('user_connected', { userId, deviceType: 'desktop', currentPage: 'messages' });

        // ✅ Receive messages in real-time
        socket.on('receive_message', (msg) => {
            if (selectedChat && msg.conversationId === selectedChat._id.toString()) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        // ✅ Receive typing indicator
        socket.on('user_typing', (data) => {
            if (data.isTyping) {
                setTypingUsers((prev) => new Set([...prev, data.userId]));
            } else {
                setTypingUsers((prev) => {
                    const updated = new Set(prev);
                    updated.delete(data.userId);
                    return updated;
                });
            }
        });

        // ✅ Receive read receipt
        socket.on('message_read_receipt', (data) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === data.messageId ? { ...msg, status: 'read' } : msg
                )
            );
        });

        // ✅ Receive unread count update
        socket.on('unread_count_updated', (data) => {
            setConversations((prev) =>
                prev.map((conv) =>
                    conv._id.toString() === data.conversationId
                        ? { ...conv, unreadCount: data.unreadCount }
                        : conv
                )
            );
        });

        // ✅ User status changed
        socket.on('user_status_changed', (data) => {
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.otherUser._id === data.userId
                        ? { ...conv, isOnline: data.isOnline }
                        : conv
                )
            );
        });

        // Cleanup on unmount
        return () => {
            socket.off('receive_message');
            socket.off('user_typing');
            socket.off('message_read_receipt');
            socket.off('unread_count_updated');
            socket.off('user_status_changed');
        };
    }, [selectedChat]);

    // ═══════════════════════════════════════════
    // Auto-scroll to latest message
    // ═══════════════════════════════════════════

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    // ═══════════════════════════════════════════
    // Handle sending message
    // ═══════════════════════════════════════════

    const handleSendMessage = useCallback(() => {
        if (!message.trim() || !selectedChat) return;

        const newMessage = {
            _id: `temp_${Date.now()}`,
            senderId: userId,
            receiverId: selectedChat.otherUser._id,
            conversationId: selectedChat._id.toString(),
            content: message,
            status: 'pending',
            createdAt: new Date()
        };

        // Add to local messages
        setMessages((prev) => [...prev, { ...newMessage, isOwn: true }]);

        // Emit via Socket.IO for real-time delivery
        socket.emit('send_message', newMessage);

        setMessage('');

        // Stop typing
        socket.emit('user_stopped_typing', {
            conversationId: selectedChat._id.toString(),
            userId
        });
    }, [message, selectedChat, userId]);

    // ═══════════════════════════════════════════
    // Handle typing with debounce
    // ═══════════════════════════════════════════

    const handleInputChange = useCallback((e) => {
        setMessage(e.target.value);

        // Emit typing on first character
        if (e.target.value.length === 1 && selectedChat) {
            socket.emit('user_typing', {
                conversationId: selectedChat._id.toString(),
                userId,
                senderName: 'You'
            });
        }

        // Clear previous timeout
        clearTimeout(typingTimeoutRef.current);

        // Set new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            if (selectedChat) {
                socket.emit('user_stopped_typing', {
                    conversationId: selectedChat._id.toString(),
                    userId
                });
            }
        }, 2000);
    }, [selectedChat, userId]);

    // ═══════════════════════════════════════════
    // Handle conversation selection
    // ═══════════════════════════════════════════

    const handleSelectChat = useCallback((conversation) => {
        setSelectedChat(conversation);
        setMessages([]);
        setTypingUsers(new Set());

        // Emit conversation opened event
        socket.emit('conversation_opened', {
            conversationId: conversation._id.toString(),
            userId
        });

        // Reset unread count
        setConversations((prev) =>
            prev.map((conv) =>
                conv._id === conversation._id
                    ? { ...conv, unreadCount: 0 }
                    : conv
            )
        );
    }, [userId]);

    // ═══════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════

    return (
        <div className="p-6 h-[calc(100vh-6rem)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-muted-foreground">Real-time chat with employers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* 📋 Conversation List */}
                <Card className="lg:col-span-1 h-fit max-h-full overflow-hidden flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                                <Input placeholder="Search conversations..." className="pl-10" />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {conversations.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">No conversations</div>
                            ) : (
                                conversations.map((conversation) => (
                                    <div
                                        key={conversation._id}
                                        onClick={() => handleSelectChat(conversation)}
                                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedChat?._id === conversation._id ? 'bg-muted' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar with online status */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                                                    <span className="font-semibold text-sm">{conversation.otherUser.avatar}</span>
                                                </div>
                                                {conversation.isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>

                                            {/* Conversation info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium text-sm truncate">{conversation.otherUser.name}</h4>
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        {new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground truncate flex-1">
                                                        {conversation.lastMessage}
                                                    </p>
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge variant="default" className="text-xs ml-2 flex-shrink-0">
                                                            {conversation.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 💬 Chat Area */}
                <Card className="lg:col-span-2 flex flex-col h-full">
                    {selectedChat ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                                        <span className="font-semibold">{selectedChat.otherUser.avatar}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{selectedChat.otherUser.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            <span className={selectedChat.isOnline ? 'text-green-600 font-medium' : ''}>
                                                {selectedChat.isOnline ? '🟢 Online' : '🔴 Offline'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"><Phone size={16} /></Button>
                                    <Button variant="outline" size="sm"><Video size={16} /></Button>
                                    <Button variant="outline" size="sm"><MoreVertical size={16} /></Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 p-4 overflow-y-auto">
                                <div className="space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8">
                                            No messages yet. Start the conversation!
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <Message key={i} msg={msg} isOwn={msg.senderId === userId} />
                                        ))
                                    )}

                                    {/* Typing indicator */}
                                    {typingUsers.size > 0 && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                            <div className="bg-gray-200 rounded-lg px-4">
                                                <TypingIndicator />
                                            </div>
                                        </div>
                                    )}

                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t flex gap-2">
                                <Button variant="outline" size="sm"><Paperclip size={16} /></Button>
                                <Input
                                    value={message}
                                    onChange={handleInputChange}
                                    placeholder="Type a message..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1"
                                />
                                <Button onClick={handleSendMessage}><Send size={16} /></Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
