import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Sun, Moon, Bell, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSystemState } from '../../contexts/StateContext';
import { formatDate } from '../../utils/format';

interface HeaderProps {
  onSearchClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSystemState();
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  // Create breadcrumbs from location path
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-card/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center space-x-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          Home
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <React.Fragment key={to}>
              <ChevronRight size={14} className="text-slate-350" />
              {isLast ? (
                <span className="font-semibold text-slate-805 dark:text-slate-100">{label}</span>
              ) : (
                <Link to={to} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right-Side Actions Group */}
      <div className="flex items-center space-x-4">
        
        {/* Universal Search Bar Trigger */}
        <button
          onClick={onSearchClick}
          className="hidden md:flex items-center space-x-2 text-xs text-muted-foreground border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-900/40 hover:dark:bg-zinc-900/80 transition-colors w-48 text-left"
        >
          <Search size={14} />
          <span className="flex-1">Search...</span>
          <kbd className="inline-flex h-4 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[9px] font-medium text-slate-400 dark:border-slate-800 dark:bg-zinc-900">
            ⌘K
          </kbd>
        </button>
        
        <button 
          onClick={onSearchClick}
          className="md:hidden p-2 text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg"
        >
          <Search size={18} />
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Dynamic Notification bell dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 bg-rose-550 dark:bg-rose-600 text-white font-bold text-[9px] px-1 min-w-[14px] h-3.5 rounded-full flex items-center justify-center border border-white dark:border-card">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Drawer Overlay for notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 max-h-96 bg-card border rounded-xl shadow-premium dark:shadow-premium-dark border-slate-200 dark:border-slate-800 z-50 flex flex-col animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-zinc-900/10">
                <span className="text-xs font-bold tracking-tight text-foreground flex items-center">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      {unreadCount} new
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-450 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto premium-scroll p-1 divide-y divide-slate-105/50 dark:divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-left transition-colors cursor-pointer rounded-lg ${!n.read ? 'bg-slate-50/70 dark:bg-zinc-900/30' : 'hover:bg-slate-50/40 dark:hover:bg-zinc-900/10'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-semibold tracking-wide uppercase ${
                          n.severity === 'critical' ? 'text-rose-600 dark:text-rose-400' 
                          : n.severity === 'warning' ? 'text-amber-600 dark:text-amber-400'
                          : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {n.type}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{formatDate(n.date)}</span>
                      </div>
                      <p className={`text-xs ${!n.read ? 'font-semibold text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-zinc-400'}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-slate-105 dark:border-slate-800/60 text-center bg-slate-50/50 dark:bg-zinc-900/10">
                <Link 
                  to="/notifications" 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-slate-800 dark:text-slate-300 hover:text-slate-905 dark:hover:text-slate-100 transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile indicator details */}
        {user && (
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-100 dark:border-slate-800">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">
                {user.name}
              </span>
              <span className="block text-[10px] text-muted-foreground">
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
