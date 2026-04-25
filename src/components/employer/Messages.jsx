import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import apiClient from '../../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { UserSearchModal } from '../shared/UserSearchModal';
import { toast } from 'react-toastify';
import {
  Search, Send, MoreVertical, Paperclip, Phone,
  Video, Loader2, MessageCircle, Smile, X,
  Copy, Reply, Trash2, PenSquare, ChevronLeft
} from 'lucide-react';
import { slideUp, staggerContainer, cardVariants } from '../../lib/animations';

// ═══════════════════════════════════════════
// 💬 Framer Motion Typing Indicator
// ═══════════════════════════════════════════
function TypingIndicator({ name }) {
  const dotVariants = {
    animate: (i) => ({
      y: [0, -7, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay: i * 0.12,
      },
    }),
  };

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2"
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-muted-foreground/60 rounded-full"
            variants={dotVariants}
            animate="animate"
            custom={i}
          />
        ))}
      </div>
      {name && (
        <span className="text-xs text-muted-foreground">{name} is typing…</span>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 😀 Reaction Bar
// ═══════════════════════════════════════════
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function ReactionBar({ msgId, reactions = {}, userId, onReact }) {
  return (
    <motion.div
      className="flex gap-1 bg-background border rounded-full shadow-lg px-2 py-1 absolute -top-9 left-0 z-10"
      initial={{ opacity: 0, y: 6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {QUICK_REACTIONS.map((emoji) => {
        const users = reactions[emoji] || [];
        const reacted = users.includes(userId);
        return (
          <motion.button
            key={emoji}
            onClick={() => onReact(msgId, emoji)}
            className={`text-base leading-none hover:scale-125 transition-transform ${reacted ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            whileTap={{ scale: 0.85 }}
          >
            {emoji}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 📝 MessageBubble
// ═══════════════════════════════════════════
function MessageBubble({ msg, isOwn, userId, onReact, onReply, onDelete, onCopy }) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu,      setShowMenu]      = useState(false);
  const hoverTimeout = useRef(null);

  const statusIcon = () => {
    if (!isOwn)                    return null;
    if (msg.status === 'pending')  return <Loader2 className="animate-spin w-3 h-3" />;
    if (msg.status === 'read')     return <span className="text-blue-300 font-bold">✓✓</span>;
    return <span className="opacity-60">✓</span>;
  };

  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : msg.timestamp || '';

  const reactionEntries = msg.reactions
    ? Object.entries(typeof msg.reactions.toObject === 'function' ? msg.reactions.toObject() : msg.reactions)
    : [];

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowReactions(true), 300);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setShowReactions(false);
      setShowMenu(false);
    }, 500);
  };

  return (
    <motion.div
      className={`flex group ${isOwn ? 'justify-end' : 'justify-start'}`}
      variants={slideUp}
      initial="initial"
      animate="animate"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative max-w-xs lg:max-w-md">
        <AnimatePresence>
          {showReactions && !msg.isDeleted && (
            <ReactionBar msgId={msg._id} reactions={msg.reactions || {}} userId={userId} onReact={onReact} />
          )}
        </AnimatePresence>

        <div
          className={`px-4 py-2 rounded-2xl shadow-sm cursor-pointer ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          }`}
          onContextMenu={(e) => { e.preventDefault(); setShowMenu(prev => !prev); }}
        >
          {msg.replyTo && (
            <div className={`text-xs opacity-70 mb-1.5 border-l-2 pl-2 ${isOwn ? 'border-white/40' : 'border-primary/40'}`}>
              {typeof msg.replyTo === 'object' ? msg.replyTo.content : '…'}
            </div>
          )}
          {msg.isDeleted ? (
            <p className="text-sm italic opacity-60">This message was deleted.</p>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
          )}
          <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
            <span>{time}</span>
            {statusIcon()}
          </div>
        </div>

        <AnimatePresence>
          {showMenu && !msg.isDeleted && (
            <motion.div
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-background border rounded-xl shadow-xl z-20 overflow-hidden min-w-[140px]`}
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => { onCopy(msg.content); setShowMenu(false); }}>
                <Copy size={14} /> Copy
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => { onReply(msg); setShowMenu(false); }}>
                <Reply size={14} /> Reply
              </button>
               {isOwn && !msg.isDeleted && (
                 <>
                   <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                     onClick={() => { onEdit(msg); setShowMenu(false); }}>
                     <PenSquare size={14} /> Edit
                   </button>
                   <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                     onClick={() => { onDelete(msg._id); setShowMenu(false); }}>
                     <Trash2 size={14} /> Delete
                   </button>
                 </>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {reactionEntries.length > 0 && (
          <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {reactionEntries.map(([emoji, users]) => {
              const count = Array.isArray(users) ? users.length : 0;
              if (count === 0) return null;
              const iReacted = Array.isArray(users) && users.includes(userId);
              return (
                <motion.button key={emoji}
                  className={`text-xs px-1.5 py-0.5 rounded-full border ${iReacted ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border hover:bg-muted'}`}
                  onClick={() => onReact(msg._id, emoji)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                >
                  {emoji} {count}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 📋 ConversationItem
// ═══════════════════════════════════════════
function ConversationItem({ conv, isSelected, onClick }) {
  const name     = conv.otherUser?.name || 'Unknown';
  const initials = name.slice(0, 2).toUpperCase();
  const preview  = conv.lastMessage || 'No messages yet';
  const count    = conv.unreadCount || 0;

  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left ${isSelected ? 'bg-muted' : ''}`}
      whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
          {initials}
        </div>
        {conv.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm truncate">{name}</p>
          {count > 0 && (
            <motion.span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 ml-1 flex-shrink-0"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
              {count > 99 ? '99+' : count}
            </motion.span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{preview}</p>
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════
// 💬 Employer Messages — Main Component
// ═══════════════════════════════════════════
export function Messages() {
  const { user }   = useAuth();
  const params     = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();
  const userId     = user?._id || user?.id;

  const [conversations,  setConversations]  = useState([]);
  const [selectedChat,   setSelectedChat]   = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [typingUsers,    setTypingUsers]    = useState({});
  const [convLoading,    setConvLoading]    = useState(true);
  const [msgLoading,     setMsgLoading]     = useState(false);
  const [showEmoji,      setShowEmoji]      = useState(false);
  const [showCompose,    setShowCompose]    = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const chatEndRef  = useRef(null);
  const typingRef   = useRef(null);
  const emojiRef    = useRef(null);
  const messagesContainerRef = useRef(null);
  const socket      = useSocket();

  useEffect(() => {
    if (!userId || !socket) return;
    // Initial logic if needed
  }, [userId, socket]);

  useEffect(() => {
    if (!userId) return;
    setConvLoading(true);
    apiClient.get(`/message/conversations/${userId}`)
      .then(res => setConversations(res.data?.conversations || []))
      .catch(console.error)
      .finally(() => setConvLoading(false));
  }, [userId]);

  const handleSelectChat = useCallback(async (conv) => {
    if (selectedChat?._id && socket) {
      socket.emit('conversation_closed', { conversationId: selectedChat._id, userId });
    }
    setSelectedChat(conv);
    setShowChatOnMobile(true);
    setMessages([]);
    setTypingUsers({});
    setReplyTo(null);
    if (socket) {
      socket.emit('conversation_opened', { conversationId: conv._id, userId });
    }

    setMsgLoading(true);
    try {
      const res = await apiClient.get(`/message/conversation/${conv._id}`);
      const msgs = res.data?.messages || [];
      setMessages(msgs);
      const unread = msgs.filter(m => m.senderId?.toString() !== userId && m.status !== 'read');
      for (const m of unread) {
        if (socket) {
          socket.emit('message_read', { messageId: m._id, conversationId: conv._id, readerId: userId });
        }
      }
    } catch (err) { console.error(err); }
    finally { setMsgLoading(false); }
  }, [selectedChat, socket, userId]);

  // ─── Auto-open from location.state ────
  useEffect(() => {
    const state = location.state;
    if (!state?.openConversationId) return;
    if (convLoading) return; // Wait until initial fetch finishes

    const trySelect = (convList) => {
      const found = convList.find(c => c._id?.toString() === state.openConversationId?.toString());
      if (found) { handleSelectChat(found); return true; }
      if (state.newConversation) {
        const myId = userId;
        const other = state.newConversation.participant1Id?._id === myId || state.newConversation.participant1Id === myId
          ? state.newConversation.participant2Id
          : state.newConversation.participant1Id;
        const synthetic = {
          _id: state.newConversation._id,
          otherUser: { _id: other?._id || other, name: other?.name || 'User' },
          lastMessage: '',
          unreadCount: 0,
          isOnline: false,
        };
        setConversations(prev => [synthetic, ...prev.filter(c => c._id !== synthetic._id)]);
        handleSelectChat(synthetic);
        return true;
      }
      return false;
    };
    trySelect(conversations);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, conversations, convLoading, navigate, userId, handleSelectChat]);

  // ─── Socket events ────────────────────────
  useEffect(() => {
    if (!socket) return;
    const s = socket;

    const onReceiveMessage = (msg) => {
      if (msg.conversationId?.toString() === selectedChat?._id?.toString()) {
        setMessages(prev => {
          const exists = prev.some(m => m._id?.toString() === msg._id?.toString());
          return exists ? prev : [...prev, { ...msg, status: 'read' }];
        });
        s.emit('message_read', { messageId: msg._id, conversationId: msg.conversationId, readerId: userId });
      }
      setConversations(prev => prev.map(c =>
        c._id?.toString() === msg.conversationId?.toString()
          ? { ...c, lastMessage: msg.content, unreadCount: c._id?.toString() === selectedChat?._id?.toString() ? 0 : (c.unreadCount || 0) + 1 }
          : c
      ));
    };

    const onMessageSent = (msg) => {
      setMessages(prev => prev.map(m => (m._id === msg.tempId || m.tempId === msg.tempId) ? { ...m, ...msg, status: 'sent', _id: msg._id } : m));
    };

    const onMessageError = ({ error, tempId }) => {
      toast.error(`Error: ${error}`);
      setMessages(prev => prev.map(m => (m._id === tempId || m.tempId === tempId) ? { ...m, status: 'error' } : m));
    };

    const onUserTyping = ({ userId: tid, senderName, isTyping }) => {
      if (tid === userId) return;
      setTypingUsers(prev => {
        if (isTyping) return { ...prev, [tid]: senderName || 'Someone' };
        const next = { ...prev }; delete next[tid]; return next;
      });
    };
    const onReadReceipt  = ({ messageId }) => setMessages(prev => prev.map(m => m._id?.toString() === messageId?.toString() ? { ...m, status: 'read' } : m));
    const onUnreadUpdated = ({ conversationId, unreadCount }) => setConversations(prev => prev.map(c => c._id?.toString() === conversationId?.toString() ? { ...c, unreadCount } : c));
    const onStatusChanged = ({ userId: uid, isOnline }) => {
      setConversations(prev => prev.map(c => c.otherUser?._id?.toString() === uid?.toString() ? { ...c, isOnline } : c));
      setSelectedChat(prev => prev?.otherUser?._id?.toString() === uid?.toString() ? { ...prev, isOnline } : prev);
    };
    const onReactionUpdated = ({ messageId, reactions }) => setMessages(prev => prev.map(m => m._id?.toString() === messageId?.toString() ? { ...m, reactions } : m));

    const onMessageEdited = ({ messageId, content, isEdited, editedAt }) => {
      setMessages(prev => prev.map(m => m._id?.toString() === messageId?.toString() ? { ...m, content, isEdited, editedAt } : m));
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id?.toString() === messageId?.toString() ? { ...m, isDeleted: true } : m));
    };

    s.on('receive_message',      onReceiveMessage);
    s.on('message_sent',         onMessageSent);
    s.on('message_error',        onMessageError);
    s.on('user_typing',          onUserTyping);
    s.on('message_read_receipt', onReadReceipt);
    s.on('unread_count_updated', onUnreadUpdated);
    s.on('user_status_changed',  onStatusChanged);
    s.on('reaction_updated',     onReactionUpdated);
    s.on('message_edited',       onMessageEdited);
    s.on('message_deleted',      onMessageDeleted);

    return () => {
      s.off('receive_message',      onReceiveMessage);
      s.off('message_sent',         onMessageSent);
      s.off('message_error',        onMessageError);
      s.off('user_typing',          onUserTyping);
      s.off('message_read_receipt', onReadReceipt);
      s.off('unread_count_updated', onUnreadUpdated);
      s.off('user_status_changed',  onStatusChanged);
      s.off('reaction_updated',     onReactionUpdated);
      s.off('message_edited',       onMessageEdited);
      s.off('message_deleted',      onMessageDeleted);
    };
  }, [socket, selectedChat, userId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollHeight, scrollTop, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 200;
    
    if (isNearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

  // Force scroll to bottom on initial chat load
  useEffect(() => {
    if (!msgLoading && messages.length > 0) {
      setTimeout(() => chatEndRef.current?.scrollIntoView(), 100);
    }
  }, [selectedChat, msgLoading]);

  useEffect(() => {
    const handler = (e) => { if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleEdit = (msg) => {
    setEditingMsg(msg);
    setInputText(msg.content);
    setReplyTo(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMsg || !inputText.trim()) return;
    try {
      await apiClient.put(`/message/${editingMsg._id}/edit`, {
        userId,
        content: inputText.trim()
      });
      setMessages(prev => prev.map(m =>
        m._id === editingMsg._id ? { ...m, content: inputText.trim(), isEdited: true, editedAt: new Date().toISOString() } : m
      ));
      setEditingMsg(null);
      setInputText('');
    } catch { toast.error('Could not edit message'); }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!selectedChat || !socket) return;
    socket.emit('user_typing', { conversationId: selectedChat._id, userId, senderName: user?.name });
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('user_stopped_typing', { conversationId: selectedChat._id, userId });
      }
    }, 1500);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !selectedChat) return;
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      _id: tempId, content: text, senderId: userId,
      receiverId: selectedChat.otherUser?._id,
      conversationId: selectedChat._id,
      status: 'pending', createdAt: new Date().toISOString(),
      replyTo: replyTo || null,
    };
    setMessages(prev => [...prev, tempMsg]);
    setConversations(prev => prev.map(c => 
      c._id?.toString() === selectedChat._id?.toString()
        ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
        : c
    ));
    setInputText('');
    setReplyTo(null);
    setShowEmoji(false);
    
    // Force scroll down when sending a message
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    socket?.emit('user_stopped_typing', { conversationId: selectedChat._id, userId });
    
    socket?.emit('send_message', {
      senderId: userId,
      receiverId: selectedChat.otherUser?._id,
      content: text,
      conversationId: selectedChat._id,
      tempId,
      replyTo: replyTo?._id || null,
      senderName: user?.name
    });
  };

  const handleReact   = async (messageId, emoji) => { try { await apiClient.post(`/message/${messageId}/react`, { emoji, userId }); } catch { toast.error('Could not react'); } };
  const handleDelete  = async (messageId) => { try { await apiClient.delete(`/message/${messageId}`); setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true } : m)); } catch { toast.error('Could not delete'); } };
  const handleCopy    = (text) => navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));

  const filteredConversations = conversations.filter(c =>
    !searchQuery ||
    c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const typingList = Object.values(typingUsers);

  return (
    <>
      <UserSearchModal isOpen={showCompose} onClose={() => setShowCompose(false)} userRole="employer" />

      <div className="p-0 md:p-6 h-full md:h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 bg-card rounded-none md:rounded-2xl shadow-none md:shadow-xl border-none md:border overflow-hidden flex">
          {/* List Sidebar */}
          <div className={`${(selectedChat && showChatOnMobile) ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r flex flex-col bg-card`}>
            <div className="p-4 border-b flex-shrink-0 space-y-2">
              <h1 className="text-xl font-bold">Messages</h1>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search…"
                    className="pl-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowCompose(true)}>
                  <PenSquare size={16} />
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
                {convLoading ? (
                  <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="text-sm">No conversations yet</p>
                    <Button variant="link" size="sm" className="mt-1" onClick={() => setShowCompose(true)}>Start one →</Button>
                  </div>
                ) : (
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                    {filteredConversations.map(conv => (
                      <ConversationItem key={conv._id} conv={conv} isSelected={selectedChat?._id === conv._id} onClick={() => handleSelectChat(conv)} />
                    ))}
                  </motion.div>
                )}
              </div>
          </div>

          {/* Conversation Area */}
          <div className={`${(!selectedChat || !showChatOnMobile) ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col bg-background relative`}>
            {selectedChat ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-card z-10 sticky top-0">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="md:hidden p-0 h-8 w-8 -ml-1" onClick={() => setShowChatOnMobile(false)}>
                      <ChevronLeft size={24} />
                    </Button>
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {(selectedChat.otherUser?.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                      {selectedChat.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedChat.otherUser?.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {selectedChat.isOnline ? <span className="text-green-600 font-medium">🟢 Online</span> : '⚫ Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="sm" onClick={() => toast.info('📞 Voice calls coming soon!')}><Phone size={16} /></Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="sm" onClick={() => toast.info('🎥 Video calls coming soon!')}><Video size={16} /></Button>
                    </motion.div>
                    <div className="relative">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm"
                          onClick={() => document.getElementById('emp-more-menu')?.classList.toggle('hidden')}>
                          <MoreVertical size={16} />
                        </Button>
                      </motion.div>
                      <div id="emp-more-menu" className="hidden absolute right-0 top-10 bg-background border rounded-xl shadow-xl z-20 min-w-[180px] overflow-hidden">
                        {[
                          { label: '🔇 Mute notifications', action: () => toast.success('Muted') },
                          { label: '📌 Pin conversation',   action: () => toast.success('Pinned') },
                          { label: '🗑️ Clear history',       action: () => { setMessages([]); toast.success('Chat cleared'); } },
                          { label: '🚫 Block user',          action: () => toast.warning('User blocked') },
                        ].map(item => (
                          <button key={item.label}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                            onClick={() => { item.action(); document.getElementById('emp-more-menu')?.classList.add('hidden'); }}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
                  ) : (
                    <div className="space-y-3">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <MessageCircle className="mx-auto mb-2 opacity-30" size={32} />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((msg, i) => (
                          <MessageBubble key={msg._id || i} msg={msg}
                            isOwn={msg.senderId?.toString() === userId || msg.senderId?._id?.toString() === userId}
                            userId={userId}
                            onReact={handleReact}
                            onReply={setReplyTo}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCopy={handleCopy}
                          />
                        ))
                      )}
                      <AnimatePresence>
                        {typingList.length > 0 && (
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {(selectedChat.otherUser?.name || '?').slice(0, 1).toUpperCase()}
                            </div>
                            <TypingIndicator name={typingList[0]} />
                          </div>
                        )}
                      </AnimatePresence>
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* Editing bar */}
                <AnimatePresence>
                  {editingMsg && (
                    <motion.div
                      className="mx-4 px-3 py-2 bg-primary/10 rounded-t-lg border-l-4 border-primary flex items-start justify-between gap-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary">Editing message</p>
                        <p className="text-xs text-muted-foreground truncate italic">"{editingMsg.content}"</p>
                      </div>
                      <button onClick={() => { setEditingMsg(null); setInputText(''); }} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reply bar */}
                <AnimatePresence>
                  {replyTo && (
                    <motion.div className="mx-4 px-3 py-2 bg-muted rounded-t-lg border-l-4 border-primary flex items-start justify-between gap-2"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary">Replying to {replyTo.senderId === userId ? 'yourself' : selectedChat.otherUser?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Bar */}
                <div className="p-4 border-t flex gap-2 flex-shrink-0 relative">
                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div ref={emojiRef} className="absolute bottom-16 left-4 z-50"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                        <EmojiPicker onEmojiClick={(d) => setInputText(prev => prev + d.emoji)} skinTonesDisabled height={350} width={300} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm"
                      onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,.pdf,.doc,.docx'; i.onchange = () => toast.info('📎 File sharing coming soon!'); i.click(); }}>
                      <Paperclip size={16} />
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={() => setShowEmoji(prev => !prev)} className={showEmoji ? 'bg-muted' : ''}>
                      <Smile size={16} />
                    </Button>
                  </motion.div>

                  <Input
                    id="employer-message-input"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={editingMsg ? "Edit your message…" : "Type a message…"}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (editingMsg ? handleSaveEdit() : handleSend())}
                    className="flex-1"
                    disabled={msgLoading}
                  />

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      id="employer-send-btn"
                      onClick={editingMsg ? handleSaveEdit : handleSend}
                      disabled={!inputText.trim()}
                    >
                      {editingMsg ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </Button>
                  </motion.div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="mx-auto mb-3 opacity-30" size={48} />
                  <h3 className="text-lg font-semibold mb-1">No conversation selected</h3>
                  <p className="text-sm mb-3">Choose a conversation or start a new one</p>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={() => setShowCompose(true)}><PenSquare size={16} className="mr-2" /> New Message</Button>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Messages;
