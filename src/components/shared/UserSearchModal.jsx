import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, X, MessageCircle, Loader2, Users } from 'lucide-react';
import { overlayVariants, modalVariants, staggerContainer, cardVariants } from '../../lib/animations';
import { toast } from 'react-toastify';

const ROLE_TABS = [
  { label: 'All',       value: '' },
  { label: 'Students',  value: 'student' },
  { label: 'Employers', value: 'employer' },
];

/**
 * 🔍 UserSearchModal
 * Slide-up modal to search any user and start a conversation.
 * Triggered by the ✏️ compose button in Messages.
 */
export function UserSearchModal({ isOpen, onClose, userRole }) {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [query,       setQuery]       = useState('');
  const [roleFilter,  setRoleFilter]  = useState('');
  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [starting,    setStarting]    = useState(null); // userId being loaded
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setRoleFilter('');
    }
  }, [isOpen]);

  // Default fetch when empty string or Debounced search
  const runSearch = useCallback(async (q, role) => {
    setLoading(true);
    try {
      if (!q.trim()) {
        const params = new URLSearchParams({ limit: 10 });
        if (role) params.set('role', role);
        const res = await apiClient.get(`/user/directory?${params}`);
        setResults(res.data.users || []);
      } else {
        const params = new URLSearchParams({ q: q.trim(), limit: 20 });
        if (role) params.set('role', role);
        const res = await apiClient.get(`/user/search?${params}`);
        setResults(res.data.users || []);
      }
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query, roleFilter), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, roleFilter, runSearch]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleStartConversation = async (targetUser) => {
    if (!user?._id && !user?.id) return;
    const myId = user._id || user.id;
    setStarting(targetUser._id);
    try {
      const res = await apiClient.post('/message/conversations/start', {
        initiatorId: myId,
        recipientId: targetUser._id,
      });
      const conv = res.data.conversation;
      onClose();
      const basePath = userRole === 'employer'
        ? '/employer-dashboard/messages'
        : '/student-dashboard/messages';
      navigate(basePath, { state: { openConversationId: conv._id, newConversation: conv } });
    } catch (err) {
      console.error('Start conversation error', err);
      toast.error('Could not start conversation. Please try again.');
    } finally {
      setStarting(null);
    }
  };

  const getInitials = (name = '') => name.slice(0, 2).toUpperCase() || '??';
  const getRoleColor = (role) => role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">New Message</h2>
              </div>
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  ref={inputRef}
                  placeholder="Search people by name or email…"
                  className="pl-10 pr-4"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex gap-1 px-4 py-2 border-b">
              {ROLE_TABS.map(tab => (
                <motion.button
                  key={tab.value}
                  onClick={() => setRoleFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    roleFilter === tab.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col gap-3 p-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
                  <Search size={36} className="mb-3 opacity-30" />
                  <p className="font-medium">No results for {query ? `"${query}"` : "this category"}</p>
                  <p className="text-sm mt-1">Try a different name or switch filter tabs</p>
                </div>
              ) : (
                <motion.div
                  className="p-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {results.map((u) => (
                    <motion.div
                      key={u._id}
                      variants={cardVariants}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {getInitials(u.name)}
                        </div>
                        {u.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{u.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getRoleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>

                      {/* Message Button */}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={() => handleStartConversation(u)}
                          disabled={starting === u._id}
                        >
                          {starting === u._id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <><MessageCircle size={14} className="mr-1" /> Message</>
                          }
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UserSearchModal;
