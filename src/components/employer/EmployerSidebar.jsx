import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../lib/apiClient";
import { io } from "socket.io-client";
import {
  Plus,
  FileText,
  MessageSquare,
  BarChart3,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Briefcase,
  Users2,
} from "lucide-react";

export function EmployerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = user?._id || user?.id;
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

  // ─── Fetch total unread count from conversations ───
  useEffect(() => {
    if (!userId) return;

    const fetchUnread = async () => {
      try {
        const res = await apiClient.get(`/message/conversations/${userId}`);
        const conversations = res.data?.conversations || [];
        const total = conversations.reduce((sum, c) => {
          const isParticipant1 = c.participant1Id === userId || c.participant1Id?._id === userId;
          return sum + (isParticipant1 ? (c.unreadCount1 || 0) : (c.unreadCount2 || 0));
        }, 0);
        setUnreadCount(total);
      } catch {
        // silently fail
      }
    };

    fetchUnread();

    // ─── Real-time socket updates ───
    const socket = io(SOCKET_URL, { auth: { userId }, transports: ['websocket'] });

    socket.on('connect', () => {
      socket.emit('user_connected', { userId, deviceType: 'desktop' });
    });

    socket.on('unread_count_updated', () => fetchUnread());
    socket.on('receive_message', () => fetchUnread());
    socket.on('message_read_receipt', () => fetchUnread());

    return () => {
      socket.off('unread_count_updated');
      socket.off('receive_message');
      socket.off('message_read_receipt');
      socket.disconnect();
    };
  }, [userId]);

  const messageBadge = unreadCount > 0
    ? (unreadCount > 99 ? '99+' : String(unreadCount))
    : null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      path: "/employer-dashboard/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      badge: null,
    },
    {
      path: "/employer-dashboard/post-gig",
      icon: Plus,
      label: "Post a Gig",
      badge: null,
    },
    {
      path: "/employer-dashboard/applications",
      icon: FileText,
      label: "Applications",
      badge: null,
    },
    {
      path: "/employer-dashboard/people",
      icon: Users2,
      label: "People",
      badge: null,
    },
    {
      path: "/employer-dashboard/messages",
      icon: MessageSquare,
      label: "Messages",
      badge: messageBadge,
    },
    {
      path: "/employer-dashboard/plans",
      icon: CreditCard,
      label: "Plans",
      badge: null,
    },
  ];

  return (
    <motion.div
      className={`bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="font-bold text-sidebar-foreground">
                  GigHive
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0"
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sidebar-foreground truncate">
                  {user?.name || "Employer"}
                </p>
                <p className="text-sm text-sidebar-foreground/70 truncate">
                  {user?.company || "Company"}
                </p>
                {user?.verified && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Verified
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bell size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon size={20} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="px-2 pb-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground gap-3 border-none px-3 py-2 h-auto ${
                collapsed ? "px-3" : ""
              }`}
            >
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </nav>
      </div>
    </motion.div>
  );
}
export default EmployerSidebar;
