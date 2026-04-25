import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Home, Search, MessageSquare, User, Menu, X, 
  Settings, LogOut, Bell, Sun, Moon, Briefcase, GraduationCap
} from 'lucide-react';
import { Button } from '../ui/button';

/**
 * 📱 MobileNav
 * Provides a bottom bar for quick actions and a top header with a drawer for mobile users.
 */
export function MobileNav({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isAdmin    = role === 'admin';
  const isEmployer = role === 'employer';
  const isStudent  = role === 'student';

  const basePath = `/${role}-dashboard`;

  const tabs = [
    { label: 'Home',     icon: Home,          path: `${basePath}/dashboard` },
    { label: 'Search',   icon: Search,        path: isStudent ? `${basePath}/find-gigs` : `${basePath}/people` },
    { label: 'Messages', icon: MessageSquare, path: `${basePath}/messages` },
    { label: 'Profile',  icon: User,          path: `${basePath}/profile` },
  ];

  const drawerItems = [
    ...(isStudent ? [
      { label: 'College Gigs', icon: GraduationCap, path: `${basePath}/college-gigs` },
      { label: 'Credits',      icon: Briefcase,     path: `${basePath}/credits` },
    ] : []),
    ...(isEmployer ? [
      { label: 'Post a Gig',   icon: Home,          path: `${basePath}/post-gig` },
      { label: 'Applications', icon: Home,          path: `${basePath}/applications` },
    ] : []),
    { label: 'People',   icon: Search,   path: `${basePath}/people` },
    { label: 'Settings', icon: Settings, path: `${basePath}/settings` },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="md:hidden contents">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-lg">GigHive</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-0 h-9 w-9" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          </Button>
          <Button variant="ghost" size="sm" className="p-0 h-9 w-9" onClick={() => setIsDrawerOpen(true)}>
            <Menu size={24} />
          </Button>
        </div>
      </header>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-background z-50 shadow-2xl p-6 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-8">
                <p className="font-bold text-lg">Menu</p>
                <Button variant="ghost" size="sm" onClick={() => setIsDrawerOpen(false)}>
                  <X size={24} />
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                {drawerItems.map(item => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted font-medium transition-colors"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <item.icon size={20} className="text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t space-y-4">
                <div className="flex items-center gap-3 px-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-3" onClick={handleLogout}>
                  <LogOut size={20} />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-40 flex items-center justify-around px-2 pb-safe">
        {tabs.map(tab => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={isActive ? 'p-1 rounded-full bg-primary/10' : ''}
              >
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Spacer to prevent content from being hidden behind headers/footers */}
      <div className="h-16 shrink-0" />
    </div>
  );
}
