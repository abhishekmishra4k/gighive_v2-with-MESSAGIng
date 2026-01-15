import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Home,
  Search,
  Video,
  GraduationCap,
  Heart,
  Users,
  MessageSquare,
  BarChart3,
  Award,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Upload,
} from "lucide-react";

export function StudentSidebar({ user, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      path: "/student-dashboard/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      badge: null,
    },
    {
      path: "/student-dashboard/find-gigs",
      icon: Search,
      label: "Find Gigs",
      badge: "15",
    },
    {
      path: "/student-dashboard/gig-reels",
      icon: Video,
      label: "Gig Reels",
      badge: null,
    },
    {
      path: "/student-dashboard/upload",
      icon: Upload,
      label: "Upload Reel",
      badge: null,
    },
    {
      path: "/student-dashboard/college-gigs",
      icon: GraduationCap,
      label: "College Gigs",
      badge: "3",
    },
    {
      path: "/student-dashboard/feed",
      icon: Heart,
      label: "Feed",
      badge: "9+",
    },
    {
      path: "/student-dashboard/collaboration",
      icon: Users,
      label: "Collaboration",
      badge: null,
    },
    {
      path: "/student-dashboard/messages",
      icon: MessageSquare,
      label: "Messages",
      badge: "2",
    },
    {
      path: "/student-dashboard/credits",
      icon: Award,
      label: "Credits",
      badge: user?.credits || "0",
    },
    {
      path: "/student-dashboard/profile",
      icon: User,
      label: "Profile",
      badge: null,
    },
    {
      path: "/student-dashboard/settings",
      icon: Settings,
      label: "Settings",
      badge: null,
    },
  ];

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
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
                <span className="font-bold text-sm">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sidebar-foreground truncate">
                  {user?.name || "Student"}
                </p>
                <p className="text-sm text-sidebar-foreground/70 truncate">
                  {user?.college || "University"}
                </p>
                <div className="mt-2">
                  <Progress value={60} className="h-1" />
                  <p className="text-xs text-sidebar-foreground/70 mt-1">
                    Profile 60% complete
                  </p>
                </div>
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

            {/* Logout Button integrated into the menu */}
            <Button
              variant="ghost"
              onClick={onLogout}
              className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground gap-3 border-none px-3 py-2 h-auto mt-1 ${
                collapsed ? "px-3" : ""
              }`}
            >
              <LogOut size={20} />
              {!collapsed && <span className="flex-1 text-left">Logout</span>}
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
