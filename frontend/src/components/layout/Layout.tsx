import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, hasAccess } = useAuth();
  const { toggleTheme } = useTheme();
  const { info } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      // Toggle Sidebar (Ctrl+B or Cmd+B)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setCollapsed(prev => !prev);
      }
      // Toggle Theme (Ctrl+L or Cmd+L)
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        toggleTheme();
        info("Visual theme updated via shortcut");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Help toast on initial load to guide user on shortcuts
    const hasSeenHelp = sessionStorage.getItem('transitops-shortcut-help');
    if (!hasSeenHelp && isAuthenticated) {
      setTimeout(() => {
        info("Pro-Tip: Press Ctrl+K for search, Ctrl+B to collapse menu, or Ctrl+L to toggle theme!");
        sessionStorage.setItem('transitops-shortcut-help', 'true');
      }, 3000);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, info, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-950 text-2xl animate-pulse mb-4">
          T
        </div>
        <p className="text-sm font-semibold tracking-wide text-zinc-400">Loading TransitOps Sandbox...</p>
        <div className="w-48 h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-slate-50 animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Route protection by module name
  const getModuleName = (path: string): string => {
    if (path === '/') return 'Dashboard';
    const firstSegment = path.split('/')[1];
    if (!firstSegment) return 'Dashboard';
    return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
  };

  const activeModule = getModuleName(location.pathname);
  
  if (!hasAccess(activeModule)) {
    // If user has no access to the current route, send them to dashboard or profile
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Primary Layout Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <Header onSearchClick={() => setIsSearchOpen(true)} />
        
        {/* Dynamic page outlet container with animations */}
        <main className="flex-1 overflow-y-auto premium-scroll bg-slate-50/40 dark:bg-background/20 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
