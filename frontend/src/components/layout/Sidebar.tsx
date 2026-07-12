import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Users, Navigation, Send, Wrench, 
  Droplet, CreditCard, FileText, BarChart3, Bell, FolderClosed, 
  Settings, User, ChevronLeft, ChevronRight, Power
} from 'lucide-react';
import { useAuth, ROLE_PERMISSIONS } from '../../contexts/AuthContext';
import { cn } from '../../utils/format';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  // Map module names to Lucide icons
  const iconMap: Record<string, React.ReactNode> = {
    Dashboard: <LayoutDashboard size={18} />,
    Fleet: <Truck size={18} />,
    Drivers: <Users size={18} />,
    Trips: <Navigation size={18} />,
    Dispatch: <Send size={18} />,
    Maintenance: <Wrench size={18} />,
    Fuel: <Droplet size={18} />,
    Expenses: <CreditCard size={18} />,
    Reports: <FileText size={18} />,
    Analytics: <BarChart3 size={18} />,
    Notifications: <Bell size={18} />,
    Documents: <FolderClosed size={18} />,
    Settings: <Settings size={18} />,
    Profile: <User size={18} />
  };

  const getModuleRoute = (mod: string) => {
    if (mod === 'Dashboard') return '/';
    return `/${mod.toLowerCase()}`;
  };

  // Filter links based on user role permissions
  const activePermissions = user ? (ROLE_PERMISSIONS[user.role] || []) : [];

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar-light dark:bg-sidebar-dark border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 relative z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Platform Title */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 flex items-center justify-center font-bold text-lg flex-shrink-0">
            T
          </div>
          {!collapsed && (
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-50 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              TransitOps
            </span>
          )}
        </div>
      </div>

      {/* Logged-in User Info Strip */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-zinc-900/20">
          <div className="flex items-center space-x-2.5">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-100"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate leading-tight">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto premium-scroll px-3 py-4 space-y-1">
        {activePermissions.map((mod: string) => {
          const route = getModuleRoute(mod);
          const icon = iconMap[mod] || <LayoutDashboard size={18} />;

          return (
            <NavLink
              key={mod}
              to={route}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative",
                isActive 
                  ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 font-medium" 
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
              )}
            >
              <div className="flex-shrink-0">{icon}</div>
              {!collapsed && (
                <span className="ml-3 transition-opacity duration-200 truncate">
                  {mod}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-16 bg-slate-900 dark:bg-zinc-800 text-white dark:text-zinc-100 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-800">
                  {mod}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Sign Out */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center justify-center p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors duration-150",
            !collapsed && "space-x-3 justify-start px-3"
          )}
        >
          <Power size={18} />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Sidebar Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 w-6 h-6 rounded-full border border-slate-100 dark:border-slate-800 bg-card flex items-center justify-center text-muted-foreground hover:text-slate-900 dark:hover:text-slate-50 shadow-subtle hover:scale-105 active:scale-95 transition z-40"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};
