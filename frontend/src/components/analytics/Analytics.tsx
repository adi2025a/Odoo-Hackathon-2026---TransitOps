import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as ReChartsTooltip, 
  Legend, LineChart, Line 
} from 'recharts';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, 
  Percent, DollarSign, Activity, AlertTriangle 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Select } from '../ui/Primitives';
import { formatCurrency, formatNumber } from '../../utils/format';

export const Analytics: React.FC = () => {
  const { vehicles, trips, expenses, maintenanceRecords } = useSystemState();
  const [timeframe, setTimeframe] = useState('30');

  // --- ANALYTICS PARAMETERS ---
  const stats = useMemo(() => {
    // 1. Cost Per KM: total expenses / total km traveled
    const totalKm = trips
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.distance, 0);

    const approvedExpenses = expenses
      .filter(e => e.status === 'Approved')
      .reduce((sum, e) => sum + e.amount, 0);

    const costPerKm = totalKm > 0 ? (approvedExpenses / totalKm) : 0.65;

    // 2. Revenue Per Trip average
    const totalRevenue = trips
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + (t.distance * 2.2), 0);

    const completedTripsCount = trips.filter(t => t.status === 'Completed').length;
    const revPerTrip = completedTripsCount > 0 ? (totalRevenue / completedTripsCount) : 0;

    // 3. Downtime: sum of maintenance active + completed shop hours (approx 24h per service)
    const downtimeHours = maintenanceRecords.length * 24;

    return { costPerKm, revPerTrip, downtimeHours, totalRevenue };
  }, [trips, expenses, maintenanceRecords]);

  // --- CHARTS MOCK DATA ---
  const efficiencyData = useMemo(() => [
    { name: 'Cascadia', efficiency: 6.8, target: 7.2 },
    { name: 'VNL 860', efficiency: 6.4, target: 7.0 },
    { name: 'Semi (EV)', efficiency: 14.5, target: 15.0 }, // mock EV Wh/km equivalent scaling
    { name: 'T680', efficiency: 6.2, target: 7.0 },
    { name: 'Sprinter', efficiency: 9.8, target: 10.5 },
    { name: 'Transit', efficiency: 11.2, target: 12.0 }
  ], []);

  const costPerKmTrend = useMemo(() => [
    { week: 'W1', cost: 0.72, avg: 0.68 },
    { week: 'W2', cost: 0.68, avg: 0.68 },
    { week: 'W3', cost: 0.65, avg: 0.68 },
    { week: 'W4', cost: 0.69, avg: 0.68 },
    { week: 'W5', cost: 0.64, avg: 0.68 }
  ], []);

  const roiData = useMemo(() => [
    { name: 'VEH-1001', revenue: 14200, costs: 6200, roi: 129 },
    { name: 'VEH-1002', revenue: 12800, costs: 5405, roi: 136 },
    { name: 'VEH-1003', revenue: 15100, costs: 8200, roi: 84 },
    { name: 'VEH-1004', revenue: 9200, costs: 3100, roi: 196 },
    { name: 'VEH-1005', revenue: 11500, costs: 4900, roi: 134 }
  ], []);

  const downtimeTrend = useMemo(() => [
    { month: 'Jan', ActiveHours: 120, ScheduledHours: 80 },
    { month: 'Feb', ActiveHours: 150, ScheduledHours: 95 },
    { month: 'Mar', ActiveHours: 90, ScheduledHours: 60 },
    { month: 'Apr', ActiveHours: 140, ScheduledHours: 110 },
    { month: 'May', ActiveHours: 160, ScheduledHours: 120 },
    { month: 'Jun', ActiveHours: 110, ScheduledHours: 75 }
  ], []);

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Operations Analytics</h1>
          <p className="text-sm text-muted-foreground">Detailed telemetry, asset utilization rates, and financial cost-distance margins.</p>
        </div>
        <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full sm:w-36 text-xs bg-card">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </Select>
      </div>

      {/* --- GRID 1: KPIS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cost per km */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fleet Cost / KM</span>
              <Activity className="text-blue-500" size={18} />
            </div>
            <div className="flex items-baseline space-x-1.5 mt-4">
              <span className="text-2xl font-extrabold tracking-tight">${stats.costPerKm.toFixed(2)}</span>
              <span className="text-[10px] text-muted-foreground">USD / km</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingDown size={12} />
              <span>Reduced 6% from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Rev per trip */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Rev / Dispatch</span>
              <DollarSign className="text-emerald-500" size={18} />
            </div>
            <div className="flex items-baseline space-x-1.5 mt-4">
              <span className="text-2xl font-extrabold tracking-tight">{formatCurrency(stats.revPerTrip)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp size={12} />
              <span>Avg distance: 580 km</span>
            </div>
          </CardContent>
        </Card>

        {/* Downtime Hours */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fleet Downtime</span>
              <Clock className="text-amber-500" size={18} />
            </div>
            <div className="flex items-baseline space-x-1.5 mt-4">
              <span className="text-2xl font-extrabold tracking-tight">{stats.downtimeHours}</span>
              <span className="text-[10px] text-muted-foreground">Hours MTD</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-rose-500 mt-2">
              <AlertTriangle size={12} />
              <span>Loss factor: 2.8%</span>
            </div>
          </CardContent>
        </Card>

        {/* ROI average */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset Return Ratio</span>
              <Percent className="text-indigo-500" size={18} />
            </div>
            <div className="flex items-baseline space-x-1.5 mt-4">
              <span className="text-2xl font-extrabold tracking-tight">136.2%</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp size={12} />
              <span>Target met (120%)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- GRID 2: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost per KM trends */}
        <Card className="shadow-premium-subtle">
          <CardHeader>
            <CardTitle>Cost Per KM Trend</CardTitle>
            <CardDescription>Variable running cost compared to global target line ($0.68)</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costPerKmTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0.5, 0.9]} />
                <ReChartsTooltip formatter={(value: any) => `$${value}`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Weekly running" />
                <Line type="monotone" dataKey="avg" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Budget Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel efficiency by model */}
        <Card className="shadow-premium-subtle">
          <CardHeader>
            <CardTitle>Fuel Efficiency by Model</CardTitle>
            <CardDescription>Average mileage (km/L) vs engineering baseline specs</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ReChartsTooltip formatter={(value: any) => `${value} km/L`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="efficiency" fill="#10b981" name="Actual mileage" radius={[3, 3, 0, 0]} />
                <Bar dataKey="target" fill="#cbd5e1" name="Target limit" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Asset ROI */}
        <Card className="shadow-premium-subtle">
          <CardHeader>
            <CardTitle>Asset ROI Comparison</CardTitle>
            <CardDescription>MTD Net Profit generated per vehicle vs running costs</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ReChartsTooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="revenue" fill="#6366f1" name="Trip Revenues" radius={[3, 3, 0, 0]} />
                <Bar dataKey="costs" fill="#f43f5e" name="Operating Costs" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Downtime Hours trend */}
        <Card className="shadow-premium-subtle">
          <CardHeader>
            <CardTitle>Maintenance Downtime Hours</CardTitle>
            <CardDescription>Active repair shop hours vs scheduled check intervals</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downtimeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDowntime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ReChartsTooltip formatter={(value: any) => `${value} Hrs`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="ActiveHours" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorDowntime)" name="Downtime Hours" />
                <Area type="monotone" dataKey="ScheduledHours" stroke="#cbd5e1" strokeWidth={1} fillOpacity={0} name="Scheduled Hours" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
