import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, RefreshCcw, Home, Terminal } from 'lucide-react';
import { Card, CardContent, Button } from './Primitives';

// ==================== 404 VIEW ====================
export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 border flex items-center justify-center text-slate-900 dark:text-white shadow-premium">
        <Terminal size={28} />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold tracking-tight">404 Error</h1>
        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-300">Route Coordinates Unresolved</h2>
        <p className="text-xs text-muted-foreground">
          The module or page coordinate you are trying to access does not exist or has been restricted by active role permissions.
        </p>
      </div>
      <Link to="/">
        <Button className="flex items-center space-x-1.5 shadow-premium">
          <Home size={14} />
          <span>Return Home</span>
        </Button>
      </Link>
    </div>
  );
};

// ==================== 500 VIEW ====================
export const InternalError: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-premium">
        <ShieldAlert size={28} />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold tracking-tight text-rose-600 dark:text-rose-450">500 Exception</h1>
        <h2 className="text-lg font-bold text-slate-805 dark:text-zinc-300">Sandbox Database Execution Exception</h2>
        <p className="text-xs text-muted-foreground">
          The database query or state provider encountered an unhandled execution exception. Please refresh the browser tab.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition"
        >
          <RefreshCcw size={14} />
          <span>Refresh Page</span>
        </button>
        <Link to="/">
          <Button className="flex items-center space-x-1.5">
            <Home size={14} />
            <span>Return Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
