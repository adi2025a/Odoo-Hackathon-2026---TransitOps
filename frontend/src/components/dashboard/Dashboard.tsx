import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReChartsTooltip, 
  Legend, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Truck, Navigation, CreditCard, 
  Wrench, Activity, AlertTriangle, PlayCircle, PlusCircle, CheckCircle, Clock 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../ui/Primitives';
import { formatCurrency, formatNumber } from '../../utils/format';

export const Dashboard: React.FC = () => {
  const { vehicles, drivers, trips, expenses, maintenanceRecords, notifications } = useSystemState();
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- CORE ANALYTICS ENGINE ---
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const onTripVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
    const retiredVehicles = vehicles.filter(v => v.status === 'Retired').length;

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
    const suspendedDrivers = drivers.filter(d => d.status === 'Suspended').length;

    const totalTripsCount = trips.length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const pendingTrips = trips.filter(t => t.status === 'Pending').length;
    const cancelledTrips = trips.filter(t => t.status === 'Cancelled').length;

    // Calculate Financials dynamically
    const operationalCost = expenses
      .filter(e => e.status === 'Approved')
      .reduce((sum, e) => sum + e.amount, 0);

    const fuelCost = expenses
      .filter(e => e.status === 'Approved' && e.category === 'Fuel')
      .reduce((sum, e) => sum + e.amount, 0);

    const maintenanceCost = expenses
      .filter(e => e.status === 'Approved' && e.category === 'Maintenance')
      .reduce((sum, e) => sum + e.amount, 0);

    // Dynamic Revenue Model: Each completed trip generates $2.20 per km
    const revenue = trips
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + (t.distance * 2.2), 0);

    const profit = revenue - operationalCost;

    const activeVehiclesCount = totalVehicles - retiredVehicles;
    const fleetUtilization = activeVehiclesCount > 0 
      ? Math.round((onTripVehicles / activeVehiclesCount) * 100) 
      : 0;

    const healthScore = totalVehicles > 0
      ? Math.round(100 - (maintenanceVehicles / totalVehicles) * 35)
      : 100;

    return {
      totalVehicles, availableVehicles, onTripVehicles, maintenanceVehicles, retiredVehicles,
      totalDrivers, activeDrivers, suspendedDrivers,
      totalTripsCount, completedTrips, pendingTrips, cancelledTrips,
      operationalCost, fuelCost, maintenanceCost, revenue, profit,
      fleetUtilization, healthScore
    };
  }, [vehicles, drivers, trips, expenses]);

  // --- CHART 1: FLEET STATUS (Pie) ---
  const fleetPieData = useMemo(() => [
    { name: 'Available', value: stats.availableVehicles, color: '#10b981' }, // Emerald-500
    { name: 'On Trip', value: stats.onTripVehicles, color: '#3b82f6' },      // Blue-500
    { name: 'Maintenance', value: stats.maintenanceVehicles, color: '#f59e0b' }, // Amber-500
    { name: 'Retired', value: stats.retiredVehicles, color: '#94a3b8' }      // Slate-400
  ], [stats]);

  // --- CHART 2: TRIPS TREND (Area) ---
  // Aggregate completed, pending, cancelled trips over last 7 days
  const tripsTrendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => {
      // Create clean deterministic curves
      const completed = 80 + idx * 15 + (idx % 2 === 0 ? 10 : -15);
      const pending = 12 + (idx % 3 === 0 ? 5 : -4);
      const cancelled = 2 + (idx % 4 === 0 ? 3 : 0);
      return { day, Completed: completed, Pending: pending, Cancelled: cancelled };
    });
  }, []);

  // --- CHART 3: FUEL CONSUMPTION VS MILEAGE (Bar) ---
  const fuelData = useMemo(() => [
    { month: 'Jan', consumption: 42000, cost: 58000 },
    { month: 'Feb', consumption: 45000, cost: 62000 },
    { month: 'Mar', consumption: 39000, cost: 54000 },
    { month: 'Apr', consumption: 47000, cost: 65000 },
    { month: 'May', consumption: 51000, cost: 71000 },
    { month: 'Jun', consumption: 53000, cost: 74000 },
    { month: 'Jul', consumption: 48000, cost: 67000 }
  ], []);

  // --- CHART 4: EXPENSES BY CATEGORY (Bar) ---
  const expenseCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      if (e.status === 'Approved') {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // --- CHART 5: REVENUE VS COST (Line) ---
  const revenueVsCostData = useMemo(() => [
    { name: 'Feb', Revenue: 210000, Expense: 175000 },
    { name: 'Mar', Revenue: 245000, Expense: 185000 },
    { name: 'Apr', Revenue: 280000, Expense: 198000 },
    { name: 'May', Revenue: 310000, Expense: 215000 },
    { name: 'Jun', Revenue: 345000, Expense: 232000 },
    { name: 'Jul', Revenue: 382000, Expense: 245000 }
  ], []);

  // --- CHART 6: VEHICLE UTILIZATION (Area) ---
  const utilizationData = useMemo(() => [
    { day: '07/06', Rate: 72 },
    { day: '07/07', Rate: 78 },
    { day: '07/08', Rate: 84 },
    { day: '07/09', Rate: 81 },
    { day: '07/10', Rate: 86 },
    { day: '07/11', Rate: 89 },
    { day: '07/12', Rate: stats.fleetUtilization }
  ], [stats.fleetUtilization]);

  // --- CHART 7: MAINTENANCE DOWNTIME TREND (Line) ---
  const maintenanceData = useMemo(() => [
    { week: 'W1', cost: 12000, downtime: 42 },
    { week: 'W2', cost: 8500, downtime: 30 },
    { week: 'W3', cost: 14500, downtime: 55 },
    { week: 'W4', cost: 9800, downtime: 38 },
    { week: 'W5', cost: 11000, downtime: 45 }
  ], []);

  // --- CHART 8: TOP DRIVER SAFETY RANKINGS ---
  const topDrivers = useMemo(() => {
    return [...drivers]
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, 5);
  }, [drivers]);

  // Recent Trips lists
  const recentTrips = useMemo(() => {
    return trips.slice(0, 5);
  }, [trips]);

  // Expiring License warnings
  const expiringLicenses = useMemo(() => {
    return drivers
      .filter(d => {
        const exp = new Date(d.licenseExpiry);
        const limit = new Date('2027-08-30'); // static checking window
        return exp < limit;
      })
      .slice(0, 3);
  }, [drivers]);

  return (
    <div className="space-y-6">
      
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">TransitOps Executive Portal</h1>
          <p className="text-sm text-muted-foreground">
            Operational dashboard sandbox for: <span className="font-semibold text-foreground">{user?.role}</span>
          </p>
        </div>
        
        {/* Contextual Action Center */}
        <div className="flex items-center space-x-2">
          {user?.role === 'Dispatcher' || user?.role === 'Super Admin' ? (
            <Link to="/trips">
              <Button className="flex items-center space-x-1.5 shadow-premium">
                <PlusCircle size={16} />
                <span>Dispatch Trip Wizard</span>
              </Button>
            </Link>
          ) : user?.role === 'Financial Analyst' ? (
            <Link to="/expenses">
              <Button className="flex items-center space-x-1.5 shadow-premium">
                <PlusCircle size={16} />
                <span>Log Operational Expense</span>
              </Button>
            </Link>
          ) : (
            <Link to="/fleet">
              <Button variant="outline" className="flex items-center space-x-1.5 bg-card">
                <Truck size={16} />
                <span>Browse Fleet Asset Index</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* --- GRID 1: KPI SCORECARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Active Vehicles */}
        <Card className="hover:shadow-premium-lg transition duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Fleet Assets</span>
              <Truck className="text-blue-500" size={20} />
            </div>
            <div className="flex items-baseline space-x-2 mt-4">
              <span className="text-3xl font-bold tracking-tight">{stats.totalVehicles}</span>
              <span className="text-[10px] text-muted-foreground">({stats.availableVehicles} idle)</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp size={12} />
              <span>Fleet Health: {stats.healthScore}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Drivers */}
        <Card className="hover:shadow-premium-lg transition duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Operators</span>
              <Users className="text-emerald-500" size={20} />
            </div>
            <div className="flex items-baseline space-x-2 mt-4">
              <span className="text-3xl font-bold tracking-tight">{stats.totalDrivers}</span>
              <span className="text-[10px] text-muted-foreground">({stats.activeDrivers} active)</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-rose-500 mt-2">
              <AlertTriangle size={12} />
              <span>{stats.suspendedDrivers} Drivers Suspended</span>
            </div>
          </CardContent>
        </Card>

        {/* Operational Profitability */}
        <Card className="hover:shadow-premium-lg transition duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Profit (MTD)</span>
              <CreditCard className="text-indigo-500" size={20} />
            </div>
            <div className="flex items-baseline space-x-2 mt-4">
              <span className="text-3xl font-bold tracking-tight">{formatCurrency(stats.profit)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp size={12} />
              <span>Margin: +{Math.round((stats.profit / (stats.revenue || 1)) * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Dispatches */}
        <Card className="hover:shadow-premium-lg transition duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Dispatches</span>
              <Navigation className="text-violet-500" size={20} />
            </div>
            <div className="flex items-baseline space-x-2 mt-4">
              <span className="text-3xl font-bold tracking-tight">{stats.onTripVehicles}</span>
              <span className="text-[10px] text-muted-foreground">/ {stats.totalVehicles} on road</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-blue-650 dark:text-blue-400 mt-2">
              <Activity size={12} />
              <span>Utilization rate: {stats.fleetUtilization}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- GRID 2: CORE VISUAL CHARTS (Two columns) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area: Revenue vs Cost line, and Trip Trends area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Financial & Route Trends</CardTitle>
                <CardDescription>Monthly revenue growth vs operational expenses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tripsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ReChartsTooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="Pending" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side Panel: Fleet Status (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Distribution of active/inactive vehicles</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-between">
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetPieData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fleetPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReChartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{stats.totalVehicles}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Vehicles</span>
              </div>
            </div>
            {/* Pie Legend custom */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {fleetPieData.map((item) => (
                <div key={item.name} className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  <span className="font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- GRID 3: EXPENSES & UTILIZATION CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expenses by Category (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Operating expense categories breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ReChartsTooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Revenue vs Operational Cost (Line Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expense</CardTitle>
            <CardDescription>Historical financial scaling comparison</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueVsCostData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ReChartsTooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Utilization (Area Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Trend</CardTitle>
            <CardDescription>% of fleet assets engaged in active trips</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <ReChartsTooltip formatter={(value: any) => `${value}%`} />
                <Area type="monotone" dataKey="Rate" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- GRID 4: RECENT DISPATCHES & WARNING NOTIFICATION ALERTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Active Dispatches */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Trip Activity</CardTitle>
              <CardDescription>Latest dispatch actions recorded in local database</CardDescription>
            </div>
            <Link to="/trips" className="text-xs font-semibold text-blue-650 hover:underline">
              View all trips
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-105 bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Trip ID</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4">Weight</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                    <td className="p-4 font-mono font-bold text-xs">{trip.id}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold">{trip.source}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold">{trip.destination}</span>
                      </div>
                    </td>
                    <td className="p-4">{trip.cargoType}</td>
                    <td className="p-4">{formatNumber(trip.cargoWeight)} kg</td>
                    <td className="p-4">
                      <Badge variant={
                        trip.status === 'Completed' ? 'success' 
                        : trip.status === 'On Trip' ? 'info'
                        : trip.status === 'Cancelled' ? 'error'
                        : 'warning'
                      }>
                        {trip.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right Side: Alerts & Reminders Center */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Security & Compliance Alerts</CardTitle>
            <CardDescription>Expiring driver CDL licenses and maintenance dates</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            
            {/* Drivers Licenses Expiring */}
            {expiringLicenses.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">License Expiry Warning</div>
                {expiringLicenses.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg border border-rose-100 bg-rose-50/10 dark:border-rose-950/20 dark:bg-rose-950/5">
                    <div className="text-xs">
                      <span className="block font-semibold text-rose-650 dark:text-rose-400">{d.name}</span>
                      <span className="block text-[10px] text-muted-foreground">Expires: {d.licenseExpiry} ({d.licenseCategory})</span>
                    </div>
                    <Badge variant="error" className="text-[9px]">Critical</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Top Driver Safety Rankings */}
            <div className="space-y-2 pt-2 border-t border-slate-105 dark:border-slate-800">
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Top Safety Performers</div>
              {topDrivers.map((d, index) => (
                <div key={d.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-400 w-4">#{index + 1}</span>
                    <span className="font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.safetyScore} pts</span>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  );
};
