import React, { useState, useMemo } from 'react';
import { 
  Droplet, Plus, Filter, Search, BarChart3, 
  HelpCircle, DollarSign, Activity, Compass, AlertCircle 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { FuelLog } from '../../services/mockDb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Dialog } from '../ui/Primitives';
import { formatCurrency, formatOdometer, formatDate } from '../../utils/format';

export const FuelLogs: React.FC = () => {
  const { fuelLogs, vehicles, drivers, addFuelLog } = useSystemState();
  const { success, error } = useToast();
  const { user } = useAuth();

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    fuelQuantity: 150,
    fuelCost: 220,
    station: '',
    date: new Date().toISOString().split('T')[0],
    odometer: 45000
  });

  // Calculate dynamic mileage (km/L) for each log
  const fuelLogsWithMileage = useMemo(() => {
    // Sort logs chronologically to compute distance delta
    const sorted = [...fuelLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const mileageMap: Record<string, number> = {};
    const vehicleLastOdo: Record<string, number> = {};

    const computed = sorted.map(log => {
      const prevOdo = vehicleLastOdo[log.vehicleId];
      let mileage = 0; // Default standard fallback
      let distance = 0;

      if (prevOdo && log.odometer > prevOdo) {
        distance = log.odometer - prevOdo;
        mileage = Math.round((distance / log.fuelQuantity) * 10) / 10;
      } else {
        // Fallback estimated standard mileage by type
        const v = vehicles.find(x => x.id === log.vehicleId);
        if (v?.type === 'Heavy Duty Truck') mileage = 6.2;
        else if (v?.type === 'Medium Duty Box') mileage = 8.5;
        else if (v?.type === 'Light Utility Van') mileage = 12.4;
        else mileage = 7.5;
      }

      vehicleLastOdo[log.vehicleId] = log.odometer;

      return {
        ...log,
        mileage,
        distance
      };
    });

    // Re-sort to desc date for display list
    return computed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuelLogs, vehicles]);

  // Aggregate MTD stats
  const mtdStats = useMemo(() => {
    const totalCost = fuelLogs.reduce((sum, l) => sum + l.fuelCost, 0);
    const totalQty = fuelLogs.reduce((sum, l) => sum + l.fuelQuantity, 0);
    const avgPrice = totalQty > 0 ? (totalCost / totalQty) : 0;
    
    // Average efficiency
    const activeLogs = fuelLogsWithMileage.filter(l => l.mileage > 0);
    const avgEfficiency = activeLogs.length > 0
      ? Math.round((activeLogs.reduce((sum, l) => sum + l.mileage, 0) / activeLogs.length) * 10) / 10
      : 7.2;

    return { totalCost, totalQty, avgPrice, avgEfficiency };
  }, [fuelLogs, fuelLogsWithMileage]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!search.trim()) return fuelLogsWithMileage;
    const q = search.toLowerCase();
    return fuelLogsWithMileage.filter(l => 
      l.vehicleId.toLowerCase().includes(q) || 
      l.station.toLowerCase().includes(q)
    );
  }, [fuelLogsWithMileage, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.station) {
      error("Please populate all fuel log fields");
      return;
    }

    const assignedDriver = vehicles.find(v => v.id === formData.vehicleId)?.assignedDriverId || 'DRV-1001';

    addFuelLog({
      vehicleId: formData.vehicleId,
      tripId: null,
      driverId: assignedDriver,
      fuelQuantity: formData.fuelQuantity,
      fuelCost: formData.fuelCost,
      station: formData.station,
      date: new Date(formData.date).toISOString(),
      odometer: formData.odometer
    });

    success("Refuelling record logged. Expense entry added automatically.");
    setIsOpen(false);
    
    // reset form
    setFormData({
      vehicleId: '',
      fuelQuantity: 150,
      fuelCost: 220,
      station: '',
      date: new Date().toISOString().split('T')[0],
      odometer: 45000
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header index */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Fuel Log Auditing</h1>
          <p className="text-sm text-muted-foreground">Log fill-ups, calculate mileage trends, and flag fuel anomalies.</p>
        </div>
        {(user?.role === 'Super Admin' || user?.role === 'Fleet Manager' || user?.role === 'Financial Analyst') && (
          <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-1.5 shadow-premium">
            <Plus size={15} />
            <span>Log Fuel Entry</span>
          </Button>
        )}
      </div>

      {/* --- GRID 1: KPIS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Cost */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Refuelling MTD Spend</span>
              <span className="text-2xl font-bold block mt-2">{formatCurrency(mtdStats.totalCost)}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-550 flex items-center justify-center border border-emerald-100">
              <DollarSign size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Total Liters */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Liters Dispensed</span>
              <span className="text-2xl font-bold block mt-2">{mtdStats.totalQty.toLocaleString()} L</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-550 flex items-center justify-center border border-blue-100">
              <Droplet size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Avg Price */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Average Price / L</span>
              <span className="text-2xl font-bold block mt-2">${mtdStats.avgPrice.toFixed(2)}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 flex items-center justify-center border">
              <Compass size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Avg Efficiency */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Fleet Avg Mileage</span>
              <span className="text-2xl font-bold block mt-2 text-emerald-600 dark:text-emerald-400">{mtdStats.avgEfficiency} km/L</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-550 flex items-center justify-center border border-emerald-100">
              <Activity size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- GRID 2: MAIN LOGS --- */}
      <Card className="shadow-premium-subtle">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <CardTitle>Fuel Log Book</CardTitle>
              <CardDescription>Odometer refuelling logs matched with active operators</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <Input
                placeholder="Search by Vehicle or Station..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <AlertCircle size={36} className="mb-2" />
              <p className="text-xs">No matching refuelling entries found</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-105 bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Ref ID</th>
                  <th className="p-4">Vehicle ID</th>
                  <th className="p-4">Operator Name</th>
                  <th className="p-4">Refuel Station</th>
                  <th className="p-4">Odometer</th>
                  <th className="p-4">Quantity (L)</th>
                  <th className="p-4">Total Cost</th>
                  <th className="p-4">Log Date</th>
                  <th className="p-4">Mileage (km/L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.slice(0, 50).map(log => {
                  const dName = drivers.find(x => x.id === log.driverId)?.name || 'Unknown operator';
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-55/40 dark:hover:bg-zinc-900/10">
                      <td className="p-4 font-mono text-xs font-bold">{log.id}</td>
                      <td className="p-4 font-mono text-xs font-bold text-slate-900 dark:text-zinc-300">{log.vehicleId}</td>
                      <td className="p-4 font-semibold text-xs">{dName}</td>
                      <td className="p-4 text-xs font-semibold">{log.station}</td>
                      <td className="p-4 font-mono text-xs">{formatOdometer(log.odometer)}</td>
                      <td className="p-4 font-mono text-xs font-bold text-slate-700 dark:text-zinc-400">{log.fuelQuantity} L</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-zinc-205">{formatCurrency(log.fuelCost)}</td>
                      <td className="p-4 text-xs font-medium">{formatDate(log.date)}</td>
                      <td className="p-4 font-bold">
                        {log.mileage > 0 ? (
                          <Badge variant={log.mileage < 6 ? 'warning' : 'success'}>
                            {log.mileage} km/L
                          </Badge>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Calibrating</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* --- REFUELLING ENTRY DIALOG --- */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Log Refuelling Transaction"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Log Transaction</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Select Vehicle</label>
              <Select
                required
                value={formData.vehicleId}
                onChange={(e) => {
                  const v = vehicles.find(x => x.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    vehicleId: e.target.value,
                    odometer: v ? v.odometer : 45000
                  });
                }}
              >
                <option value="">Select vehicle...</option>
                {vehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.regNumber})</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Station Name</label>
              <Input
                required
                placeholder="E.g. Shell Station #49"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Quantity (Liters)</label>
              <Input
                type="number"
                required
                value={formData.fuelQuantity}
                onChange={(e) => setFormData({ ...formData, fuelQuantity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Odometer (km)</label>
              <Input
                type="number"
                required
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Fuel Cost ($)</label>
              <Input
                type="number"
                required
                value={formData.fuelCost}
                onChange={(e) => setFormData({ ...formData, fuelCost: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Refuelling Date</label>
            <Input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </form>
      </Dialog>

    </div>
  );
};
