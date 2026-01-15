import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
} from "lucide-react";

export function EmployerSidebar({ user, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
      badge: "23",
    },
    {
      path: "/employer-dashboard/messages",
      icon: MessageSquare,
      label: "Messages",
      badge: "7",
    },
    {
      path: "/employer-dashboard/plans",
      icon: CreditCard,
      label: "Plans",
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
              onClick={onLogout}
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
    </div>
  );
}
export default EmployerSidebar;
