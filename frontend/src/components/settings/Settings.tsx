import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Shield, Globe, Paintbrush, 
  Building, Check, CheckCircle2, AlertTriangle, Key 
} from 'lucide-react';
import { useAuth, ROLE_PERMISSIONS, UserRole } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Primitives';

export const Settings: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, warning } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  
  // Local company profile fields
  const [profile, setProfile] = useState({
    name: 'TransitOps Logistics Inc.',
    hq: 'Chicago Depot Hub, Illinois',
    radius: 1200,
    prefix: 'TRP'
  });

  // Permissions configuration state (reconciles with ROLE_PERMISSIONS config)
  const [permissions, setPermissions] = useState<Record<UserRole, string[]>>(() => {
    return { ...ROLE_PERMISSIONS };
  });

  const handleTogglePermission = (role: UserRole, module: string) => {
    const active = permissions[role] || [];
    let updated: string[];

    if (active.includes(module)) {
      // Don't let Super Admin revoke settings access to prevent locking themselves out!
      if (role === 'Super Admin' && module === 'Settings') {
        warning("Super Admin cannot revoke settings module permissions");
        return;
      }
      updated = active.filter(m => m !== module);
    } else {
      updated = [...active, module];
    }

    const updatedPermissions = {
      ...permissions,
      [role]: updated
    };

    setPermissions(updatedPermissions);
    
    // Dynamically update global imported permission config mapping!
    ROLE_PERMISSIONS[role] = updated;

    success(`Updated ${role} access to ${module}`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success("Company configuration profiles saved successfully");
  };

  // Modules array
  const allModules = [
    'Dashboard', 'Fleet', 'Drivers', 'Trips', 'Dispatch', 'Maintenance', 
    'Fuel', 'Expenses', 'Reports', 'Analytics', 'Notifications', 'Documents', 
    'Settings', 'Profile'
  ];

  const rolesList: UserRole[] = [
    'Super Admin', 'Fleet Manager', 'Dispatcher', 
    'Driver', 'Safety Officer', 'Financial Analyst'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 flex items-center justify-center font-bold">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground">Adjust company profile boundaries, role permissions, and aesthetics.</p>
        </div>
      </div>

      {/* --- GRID 1: TABBED CONTROLS --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="profile" activeTab={activeTab} onClick={setActiveTab}>Company Profile</TabsTrigger>
          <TabsTrigger value="roles" activeTab={activeTab} onClick={setActiveTab}>Roles & RBAC</TabsTrigger>
          <TabsTrigger value="regions" activeTab={activeTab} onClick={setActiveTab}>Regions & Types</TabsTrigger>
          <TabsTrigger value="appearance" activeTab={activeTab} onClick={setActiveTab}>Appearance</TabsTrigger>
        </TabsList>

        {/* TAB 1: Company Profile */}
        <TabsContent value="profile" activeTab={activeTab}>
          <Card className="max-w-xl shadow-premium-subtle">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Adjust operational headers used for spreadsheet printouts and compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Registered Company Name</label>
                  <Input 
                    required 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Headquarters Location</label>
                  <Input 
                    required 
                    value={profile.hq} 
                    onChange={(e) => setProfile({ ...profile, hq: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Operating Radius (km)</label>
                    <Input 
                      type="number" 
                      required 
                      value={profile.radius} 
                      onChange={(e) => setProfile({ ...profile, radius: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Trip ID Prefix</label>
                    <Input 
                      required 
                      value={profile.prefix} 
                      onChange={(e) => setProfile({ ...profile, prefix: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit">Save Configurations</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Roles & Permissions Grid */}
        <TabsContent value="roles" activeTab={activeTab}>
          <Card className="shadow-premium-subtle">
            <CardHeader>
              <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
              <CardDescription>Toggle module checkbox blocks. Modifying boxes alters sidebar navigation filters in real-time.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground uppercase font-bold tracking-wider">
                    <th className="p-4">Module Name</th>
                    {rolesList.map(r => (
                      <th key={r} className="p-4 text-center">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allModules.map(mod => (
                    <tr key={mod} className="hover:bg-slate-55/40 dark:hover:bg-zinc-900/10">
                      <td className="p-4 font-semibold text-slate-800 dark:text-zinc-350">{mod}</td>
                      {rolesList.map(role => {
                        const hasAccess = (permissions[role] || []).includes(mod);
                        return (
                          <td key={role} className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={hasAccess}
                              onChange={() => handleTogglePermission(role, mod)}
                              className="rounded bg-zinc-900 border-slate-800 text-slate-50 focus:ring-slate-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Regions & Vehicle Types list */}
        <TabsContent value="regions" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Regions list */}
            <Card className="shadow-premium-subtle">
              <CardHeader>
                <CardTitle>Operating Regions</CardTitle>
                <CardDescription>Configure shipping corridors and depot tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {['North Region Depot', 'South Region Depot', 'East Corridor Depot', 'West Depot', 'Central Hub Office'].map(r => (
                    <div key={r} className="flex justify-between items-center text-xs p-2.5 border rounded-lg bg-card">
                      <span className="font-semibold">{r}</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle categories */}
            <Card className="shadow-premium-subtle">
              <CardHeader>
                <CardTitle>Asset Classifications</CardTitle>
                <CardDescription>Configure vehicle types allowed for load dispatches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {['Heavy Duty Truck', 'Medium Duty Box', 'Light Utility Van', 'Electric Hauler'].map(v => (
                    <div key={v} className="flex justify-between items-center text-xs p-2.5 border rounded-lg bg-card">
                      <span className="font-semibold">{v}</span>
                      <Badge variant="outline">Verified Type</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* TAB 4: Appearance settings */}
        <TabsContent value="appearance" activeTab={activeTab}>
          <Card className="max-w-xl shadow-premium-subtle">
            <CardHeader>
              <CardTitle>Theme & Appearance Settings</CardTitle>
              <CardDescription>Customize aesthetics for the platform sandbox</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Theme toggle */}
              <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                <div>
                  <span className="text-xs font-bold block">Interface Visual Theme</span>
                  <span className="text-[10px] text-muted-foreground">Toggle Light Mode or premium Vercel Dark Mode</span>
                </div>
                <Button size="sm" variant="outline" onClick={toggleTheme} className="text-xs">
                  Switch to {theme === 'light' ? 'Dark Theme' : 'Light Theme'}
                </Button>
              </div>

              {/* Layout Radius */}
              <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                <div>
                  <span className="text-xs font-bold block">Layout Borders</span>
                  <span className="text-[10px] text-muted-foreground">Select rounding border radius presets for layout cards</span>
                </div>
                <Select className="w-28 text-xs bg-card">
                  <option value="8">Rounded-lg (8px)</option>
                  <option value="12">Rounded-xl (12px)</option>
                  <option value="16">Rounded-2xl (16px)</option>
                </Select>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};
