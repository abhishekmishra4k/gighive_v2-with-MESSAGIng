import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
const PING_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(new Audio(PING_SOUND_URL));
  const navigate = useNavigate();
  const location = useLocation();

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
      newSocket.emit('user_connected', { userId, deviceType: 'desktop' });
    });

    // ─── Global Message Notification ───
    newSocket.on('receive_message', (message) => {
      // Logic: Don't show toast if we are ALREADY chat-viewing this conversation
      // We can use a ref or check a global state, but for now, simple check:
      const isMessagesPage = location.pathname.includes('/messages');
      
      // If we're on the messages page, we might still want the sound but maybe skip toast
      // For now, let's play sound if it's a NEW message from ANYONE
      playPing();

      if (!isMessagesPage) {
        showNotification(message);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, userId, location.pathname]); // Listen to pathname for smarter notifications

  const playPing = () => {
    try {
      audioRef.current.volume = 0.5;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn('🔊 Audio play failed:', e));
    } catch (err) {
      console.warn('🔊 Audio error:', err);
    }
  };

  const showNotification = (message) => {
    const senderName = message.senderName || message.senderId?.name || 'Someone';
    const text = message.content || message.text || 'Sent an attachment';

    toast(
      <div 
        className="flex items-start gap-3 p-1 cursor-pointer group" 
        onClick={() => {
          const basePath = user?.role === 'employer' ? '/employer-dashboard' : '/student-dashboard';
          navigate(`${basePath}/messages`, { state: { openConversationId: message.conversationId } });
        }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary font-bold border border-primary/20">
          {senderName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="font-bold text-sm text-foreground truncate">{senderName}</p>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Just now</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {text}
          </p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "bg-background border border-border shadow-xl rounded-2xl p-3",
        bodyClassName: "p-0",
        progressClassName: "bg-primary",
      }
    );
  };

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
