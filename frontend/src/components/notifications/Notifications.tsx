import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, AlertTriangle, AlertCircle, Info, Trash2, 
  MailOpen, Mail, ChevronRight, Inbox, Compass 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '../ui/Primitives';
import { formatDate } from '../../utils/format';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSystemState();
  const { success } = useToast();
  const navigate = useNavigate();

  // Active selected notification
  const [selectedId, setSelectedId] = useState<string | null>(
    notifications.length > 0 ? notifications[0].id : null
  );

  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'maintenance'>('all');

  const selectedNotification = useMemo(() => {
    return notifications.find(n => n.id === selectedId) || null;
  }, [selectedId, notifications]);

  // Filter lists
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];
    if (filter === 'unread') {
      result = result.filter(n => !n.read);
    } else if (filter === 'critical') {
      result = result.filter(n => n.severity === 'critical' || n.type === 'Alert');
    } else if (filter === 'maintenance') {
      result = result.filter(n => n.type === 'Maintenance Due');
    }
    return result;
  }, [notifications, filter]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    success("All notification alerts marked as read");
  };

  // Helper to route or act on notification deep links
  const handleResolveAction = (n: typeof notifications[number]) => {
    success(`Acknowledged notification: ${n.id}`);
    
    // Deep-linking routing based on alert keywords
    if (n.message.includes('VEH-')) {
      const match = n.message.match(/VEH-\d+/);
      if (match) navigate(`/fleet?id=${match[0]}`);
    } else if (n.message.includes('DRV-')) {
      const match = n.message.match(/DRV-\d+/);
      if (match) navigate(`/drivers?id=${match[0]}`);
    } else if (n.message.includes('TRP-')) {
      const match = n.message.match(/TRP-\d+/);
      if (match) navigate(`/trips?id=${match[0]}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Security Alert Desk</h1>
          <p className="text-sm text-muted-foreground">Monitor system audits, licensing expiries, and vehicle route exceptions.</p>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.read) && (
            <Button variant="outline" onClick={handleMarkAllRead} className="bg-card flex items-center space-x-1.5 text-xs">
              <Check size={14} />
              <span>Mark All Read</span>
            </Button>
          )}
        </div>
      </div>

      {/* --- GRID 1: EMAIL-STYLE SPLIT PANEL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left Side: Inbox Filters & List (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col overflow-hidden shadow-premium-subtle">
          <CardHeader className="pb-3 border-b p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center">
                <Inbox size={15} className="mr-1.5 text-muted-foreground" />
                <span>Inbox Alerts</span>
              </CardTitle>
            </div>
            
            {/* Filter pills */}
            <div className="flex items-center space-x-1 mt-3">
              {(['all', 'unread', 'critical', 'maintenance'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                    filter === f 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-subtle' 
                      : 'hover:bg-slate-105/50 dark:hover:bg-zinc-800 text-muted-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto premium-scroll divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No alerts matching filters.
              </div>
            ) : (
              filteredNotifications.map(n => {
                const isSelected = selectedId === n.id;
                const icons = {
                  critical: <AlertCircle className="text-rose-500" size={14} />,
                  warning: <AlertTriangle className="text-amber-500" size={14} />,
                  info: <Info className="text-blue-500" size={14} />
                };

                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelect(n.id)}
                    className={`p-4 cursor-pointer text-left transition ${
                      isSelected 
                        ? 'bg-slate-100 dark:bg-slate-800 text-foreground border-l-4 border-slate-900 dark:border-white' 
                        : 'hover:bg-slate-50/50 dark:hover:bg-zinc-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        {!n.read && <div className="w-1.5 h-1.5 bg-blue-550 dark:bg-blue-500 rounded-full" />}
                        <span className="text-[9px] font-mono font-bold text-slate-400">{n.id}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{formatDate(n.date)}</span>
                    </div>

                    <p className={`text-xs truncate ${!n.read ? 'font-bold text-slate-900 dark:text-slate-50' : 'text-slate-650 dark:text-zinc-400'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{n.message}</p>
                    
                    <div className="flex items-center justify-between mt-2.5">
                      <Badge variant="outline" className="text-[8px] tracking-wide uppercase px-1 py-0">{n.type}</Badge>
                      <span className="flex-shrink-0">{icons[n.severity as keyof typeof icons] || icons.info}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Side: Detailed Detail Pane (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col overflow-hidden shadow-premium-subtle">
          {selectedNotification ? (
            <div className="flex-1 flex flex-col h-full">
              
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-zinc-900/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-slate-450 tracking-wider block">{selectedNotification.id}</span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedNotification.title}</h2>
                  </div>
                  <Badge variant={selectedNotification.severity === 'critical' ? 'error' : 'warning'}>
                    {selectedNotification.severity}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  <span>Logged at: {formatDate(selectedNotification.date, true)}</span>
                </div>
              </div>

              {/* Detail Message Body */}
              <div className="p-6 flex-1 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed border-b border-slate-100 dark:border-slate-800/60 space-y-4">
                <p>{selectedNotification.message}</p>
                <div className="bg-slate-50 dark:bg-zinc-900/30 border p-4 rounded-xl text-xs space-y-2">
                  <span className="font-bold block text-[10px] uppercase text-slate-400">Trigger Audit Data</span>
                  <p>This entry was compiled automatically by the TransitOps background telemetry scanner matching compliance triggers.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 flex items-center justify-end space-x-2 bg-slate-50/50 dark:bg-zinc-900/10">
                <Button 
                  onClick={() => handleResolveAction(selectedNotification)}
                  className="flex items-center space-x-1.5 text-xs shadow-premium"
                >
                  <Compass size={14} />
                  <span>Navigate & Resolve Alert</span>
                </Button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground text-center">
              <Bell size={32} className="mb-2 text-slate-300" />
              <p className="text-xs">Select an alert item from the inbox to audit details.</p>
            </div>
          )}
        </Card>

      </div>

    </div>
  );
};
