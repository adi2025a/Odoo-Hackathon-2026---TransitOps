import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Truck, Users, MapPin, Terminal } from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useAuth, ROLE_PERMISSIONS } from '../../contexts/AuthContext';
import { cn } from '../../utils/format';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { vehicles, drivers, trips } = useSystemState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close palette on Escape, open/close key handlers
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Gather allowed navigation routes
  const allowedModules = user ? ROLE_PERMISSIONS[user.role] : [];
  
  const navigationItems = allowedModules.map(mod => ({
    type: 'nav' as const,
    label: `Go to ${mod}`,
    route: `/${mod.toLowerCase() === 'dashboard' ? '' : mod.toLowerCase()}`,
    icon: <Compass size={16} className="text-slate-405" />
  }));

  // Filter based on search input
  const query = search.toLowerCase().trim();

  const filteredNavs = navigationItems.filter(item => 
    item.label.toLowerCase().includes(query)
  );

  const filteredVehicles = vehicles
    .filter(v => v.id.toLowerCase().includes(query) || v.regNumber.toLowerCase().includes(query) || v.name.toLowerCase().includes(query))
    .slice(0, 5)
    .map(v => ({
      type: 'vehicle' as const,
      label: `${v.name} (${v.regNumber})`,
      subLabel: v.id,
      route: `/fleet?id=${v.id}`,
      icon: <Truck size={16} className="text-blue-500" />
    }));

  const filteredDrivers = drivers
    .filter(d => d.id.toLowerCase().includes(query) || d.name.toLowerCase().includes(query) || d.licenseNumber.toLowerCase().includes(query))
    .slice(0, 5)
    .map(d => ({
      type: 'driver' as const,
      label: d.name,
      subLabel: `${d.id} • ${d.licenseCategory}`,
      route: `/drivers?id=${d.id}`,
      icon: <Users size={16} className="text-emerald-500" />
    }));

  const filteredTrips = trips
    .filter(t => t.id.toLowerCase().includes(query) || t.source.toLowerCase().includes(query) || t.destination.toLowerCase().includes(query))
    .slice(0, 5)
    .map(t => ({
      type: 'trip' as const,
      label: `${t.source} to ${t.destination}`,
      subLabel: `${t.id} • ${t.status}`,
      route: `/trips?id=${t.id}`,
      icon: <MapPin size={16} className="text-violet-500" />
    }));

  // Combine items for flat keyboard navigation list
  const combinedItems = [
    ...filteredNavs,
    ...filteredVehicles,
    ...filteredDrivers,
    ...filteredTrips
  ];

  // Handle keyboard events in command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % combinedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + combinedItems.length) % combinedItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedItems[selectedIndex]) {
        handleSelect(combinedItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: typeof combinedItems[number]) => {
    navigate(item.route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] bg-slate-900/35 dark:bg-black/60 backdrop-blur-[2px]">
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-card border rounded-xl shadow-premium-lg dark:shadow-premium-dark flex flex-col overflow-hidden max-h-[50vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search header input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search size={18} className="text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, vehicle, driver name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-0 ring-0 outline-none text-sm text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:bg-zinc-900">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto premium-scroll p-2 space-y-2">
          {combinedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Terminal size={24} className="mb-2 text-slate-300 dark:text-zinc-700" />
              <p className="text-xs">No matches found for "{search}"</p>
            </div>
          ) : (
            <>
              {/* Render lists dynamically with category separators */}
              {filteredNavs.length > 0 && (
                <div>
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Navigation</div>
                  {filteredNavs.map((item, idx) => {
                    const itemIdx = idx;
                    const isSelected = selectedIndex === itemIdx;
                    return (
                      <div
                        key={item.route}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg text-sm cursor-pointer transition-all",
                          isSelected ? "bg-slate-100 dark:bg-slate-800 text-foreground" : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredVehicles.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-2">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vehicles</div>
                  {filteredVehicles.map((item, idx) => {
                    const itemIdx = filteredNavs.length + idx;
                    const isSelected = selectedIndex === itemIdx;
                    return (
                      <div
                        key={item.route}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all",
                          isSelected ? "bg-slate-100 dark:bg-slate-800 text-foreground" : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.subLabel}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredDrivers.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-2">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Drivers</div>
                  {filteredDrivers.map((item, idx) => {
                    const itemIdx = filteredNavs.length + filteredVehicles.length + idx;
                    const isSelected = selectedIndex === itemIdx;
                    return (
                      <div
                        key={item.route}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all",
                          isSelected ? "bg-slate-100 dark:bg-slate-800 text-foreground" : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.subLabel}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredTrips.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-2">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trips</div>
                  {filteredTrips.map((item, idx) => {
                    const itemIdx = filteredNavs.length + filteredVehicles.length + filteredDrivers.length + idx;
                    const isSelected = selectedIndex === itemIdx;
                    return (
                      <div
                        key={item.route}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all",
                          isSelected ? "bg-slate-100 dark:bg-slate-800 text-foreground" : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.subLabel}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/40 text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center space-x-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>↵ Select</span>
          </div>
          <span>TransitOps Global Command Menu</span>
        </div>
      </div>
    </div>
  );
};
