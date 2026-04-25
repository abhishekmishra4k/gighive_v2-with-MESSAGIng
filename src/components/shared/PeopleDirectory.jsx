import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient';
import { io } from 'socket.io-client';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Search, MessageCircle, Loader2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { pageVariants, staggerContainer, cardVariants, fadeUp, viewport } from '../../lib/animations';
import { toast } from 'react-toastify';

const ROLE_TABS = [
  { label: 'All',       value: '' },
  { label: 'Students',  value: 'student' },
  { label: 'Employers', value: 'employer' },
];

const PAGE_SIZE = 12;

/**
 * 👥 PeopleDirectory
 * Browse and search all users with pagination.
 * Accessible via /student-dashboard/people and /employer-dashboard/people
 */
export function PeopleDirectory() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [query,        setQuery]        = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [users,        setUsers]        = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [starting,     setStarting]     = useState(null);
  const debounceRef = useRef(null);

  const userRole  = user?.role;
  const isSearch  = query.trim().length > 0;

  const fetchUsers = useCallback(async (q, role, skip) => {
    setLoading(true);
    try {
      let res;
      if (q.trim()) {
        const params = new URLSearchParams({ q: q.trim(), limit: PAGE_SIZE, skip });
        if (role) params.set('role', role);
        res = await apiClient.get(`/user/search?${params}`);
      } else {
        const params = new URLSearchParams({ limit: PAGE_SIZE, skip });
        if (role) params.set('role', role);
        res = await apiClient.get(`/user/directory?${params}`);
      }
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Directory fetch error', err);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(query, roleFilter, 0);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, roleFilter, fetchUsers]);

  useEffect(() => {
    fetchUsers(query, roleFilter, page * PAGE_SIZE);
  }, [page]);

  // ─── Real-time status updates ───
  useEffect(() => {
    if (!user) return;
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const socket = io(SOCKET_URL, { auth: { userId: user?.id || user?._id }, transports: ['websocket'] });

    socket.on('user_status_changed', ({ userId: uid, isOnline }) => {
      setUsers(prev => prev.map(u => 
        u._id === uid ? { ...u, isOnline } : u
      ));
    });

    return () => {
      socket.off('user_status_changed');
      socket.disconnect();
    };
  }, [user]);

  const handleStartConversation = async (targetUser) => {
    const myId = user?._id || user?.id;
    if (!myId) return;
    setStarting(targetUser._id);
    try {
      const res = await apiClient.post('/message/conversations/start', {
        initiatorId: myId,
        recipientId: targetUser._id,
      });
      const conv = res.data.conversation;
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

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const getInitials = (name = '') => name.slice(0, 2).toUpperCase() || '??';
  const getRoleLabel = (role) => role === 'student' ? '🎓 Student' : '💼 Employer';
  const getRoleColor = (role) => role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-primary" size={32} />
          People
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and connect with {userRole === 'employer' ? 'students and talent' : 'employers and companies'} on GigHive
        </p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search by name or email…"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {ROLE_TABS.map(tab => (
            <motion.button
              key={tab.value}
              onClick={() => { setRoleFilter(tab.value); setPage(0); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                roleFilter === tab.value
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {!loading && (
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {total > 0 ? `${total} ${isSearch ? 'results' : 'people'} found` : ''}
        </motion.p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted" />
                  <div className="space-y-2 w-full">
                    <div className="h-3 bg-muted rounded mx-auto w-3/4" />
                    <div className="h-3 bg-muted rounded mx-auto w-1/2" />
                  </div>
                  <div className="h-8 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          variants={fadeUp}
          initial="initial"
          animate="animate"
        >
          <Users size={56} className="mb-4 opacity-25" />
          <h3 className="text-lg font-semibold">
            {isSearch ? `No results for "${query}"` : 'No users found'}
          </h3>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {users.map((u) => (
            <motion.div
              key={u._id}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex flex-col items-center gap-3 text-center">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                        {getInitials(u.name)}
                      </div>
                      {u.isOnline && (
                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <p className="font-semibold text-sm leading-tight">{u.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{u.email}</p>
                      {u.isOnline ? (
                        <p className="text-[11px] text-green-600 font-medium">🟢 Online</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">⚫ Offline</p>
                      )}
                    </div>

                    {/* Action */}
                    <motion.div className="w-full" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleStartConversation(u)}
                        disabled={starting === u._id}
                      >
                        {starting === u._id
                          ? <Loader2 size={14} className="animate-spin mr-2" />
                          : <MessageCircle size={14} className="mr-2" />
                        }
                        Message
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft size={16} />
            </Button>
          </motion.div>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight size={16} />
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default PeopleDirectory;
