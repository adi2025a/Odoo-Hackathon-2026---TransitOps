import React, { useState, useMemo } from 'react';
import { 
  Wrench, ShieldAlert, Plus, Check, Clock, Play, 
  Settings, DollarSign, Hammer, ShieldCheck 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { MaintenanceRecord } from '../../services/mockDb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Dialog } from '../ui/Primitives';
import { formatCurrency, formatOdometer, formatDate } from '../../utils/format';

export const Maintenance: React.FC = () => {
  const { maintenanceRecords, vehicles, addMaintenanceRecord, updateMaintenanceRecord } = useSystemState();
  const { success, error } = useToast();
  const { user } = useAuth();

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'Oil Change' as MaintenanceRecord['type'],
    status: 'Active' as MaintenanceRecord['status'],
    cost: 150,
    startDate: new Date().toISOString().split('T')[0],
    odometer: 45000,
    mechanicDetails: '',
    remarks: ''
  });

  // Calculate maintenance KPIs
  const kpis = useMemo(() => {
    const activeOrders = maintenanceRecords.filter(r => r.status === 'Active').length;
    const scheduledOrders = maintenanceRecords.filter(r => r.status === 'Scheduled').length;
    const completedOrders = maintenanceRecords.filter(r => r.status === 'Completed').length;
    const totalCost = maintenanceRecords.reduce((sum, r) => sum + r.cost, 0);
    return { activeOrders, scheduledOrders, completedOrders, totalCost };
  }, [maintenanceRecords]);

  // Handle dialog submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.mechanicDetails) {
      error("Please fill in all required work order fields");
      return;
    }

    addMaintenanceRecord({
      vehicleId: formData.vehicleId,
      type: formData.type,
      status: formData.status,
      cost: formData.cost,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.status === 'Completed' ? new Date().toISOString() : null,
      odometer: formData.odometer,
      mechanicDetails: formData.mechanicDetails,
      remarks: formData.remarks
    });

    success(`Maintenance work order created. Status: ${formData.status}`);
    setIsOpen(false);
    
    // reset form
    setFormData({
      vehicleId: '',
      type: 'Oil Change',
      status: 'Active',
      cost: 150,
      startDate: new Date().toISOString().split('T')[0],
      odometer: 45000,
      mechanicDetails: '',
      remarks: ''
    });
  };

  // Start active work order or complete it
  const handleUpdateStatus = (id: string, status: MaintenanceRecord['status']) => {
    updateMaintenanceRecord(id, { 
      status, 
      endDate: status === 'Completed' ? new Date().toISOString() : null 
    });
    success(`Maintenance status updated to ${status}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Fleet Maintenance</h1>
          <p className="text-sm text-muted-foreground">Monitor diagnostics, log inspections, and file PM work orders.</p>
        </div>
        {(user?.role === 'Super Admin' || user?.role === 'Fleet Manager') && (
          <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-1.5 shadow-premium">
            <Plus size={15} />
            <span>Create Work Order</span>
          </Button>
        )}
      </div>

      {/* --- GRID 1: KPIS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active orders */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Active In-Shop</span>
              <span className="text-2xl font-bold block mt-2">{kpis.activeOrders}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-550 flex items-center justify-center border border-orange-100">
              <Wrench size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Scheduled orders */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Scheduled PMs</span>
              <span className="text-2xl font-bold block mt-2">{kpis.scheduledOrders}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-550 flex items-center justify-center border border-blue-100">
              <Clock size={18} />
            </div>
          </CardContent>
        </Card>

        {/* MTD Cost */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Maintenance MTD Cost</span>
              <span className="text-2xl font-bold block mt-2">{formatCurrency(kpis.totalCost)}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-550 flex items-center justify-center border border-emerald-100">
              <DollarSign size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="shadow-premium-subtle">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Completed Service Logs</span>
              <span className="text-2xl font-bold block mt-2">{kpis.completedOrders}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-550 flex items-center justify-center border border-purple-100">
              <ShieldCheck size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- GRID 2: ACTIVE & HISTORY TABS --- */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-premium-subtle">
          <CardHeader>
            <CardTitle>Work Orders & Service History</CardTitle>
            <CardDescription>Comprehensive registry of shop bookings and preventative maintenance logs</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-105 bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">WO ID</th>
                  <th className="p-4">Vehicle Reg</th>
                  <th className="p-4">Service Type</th>
                  <th className="p-4">Odometer</th>
                  <th className="p-4">Workshop / Shop details</th>
                  <th className="p-4">Date Logged</th>
                  <th className="p-4">Service Cost</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {maintenanceRecords.map(record => {
                  const v = vehicles.find(x => x.id === record.vehicleId);
                  
                  return (
                    <tr key={record.id} className="hover:bg-slate-55/40 dark:hover:bg-zinc-900/10">
                      <td className="p-4 font-mono text-xs font-bold">{record.id}</td>
                      <td className="p-4">
                        <div className="text-xs">
                          <span className="font-semibold block">{v ? v.regNumber : 'Unknown'}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{record.vehicleId}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-xs">{record.type}</td>
                      <td className="p-4 font-mono text-xs">{formatOdometer(record.odometer)}</td>
                      <td className="p-4 text-xs font-medium">{record.mechanicDetails}</td>
                      <td className="p-4 text-xs font-medium">{formatDate(record.startDate)}</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{formatCurrency(record.cost)}</td>
                      <td className="p-4">
                        <Badge variant={
                          record.status === 'Completed' ? 'success' 
                          : record.status === 'Active' ? 'warning'
                          : 'default'
                        }>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {record.status === 'Scheduled' && (user?.role === 'Super Admin' || user?.role === 'Fleet Manager') && (
                            <Button 
                              onClick={() => handleUpdateStatus(record.id, 'Active')}
                              size="sm" 
                              className="text-[10px] px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              <Play size={10} className="mr-1" /> Start
                            </Button>
                          )}
                          {record.status === 'Active' && (user?.role === 'Super Admin' || user?.role === 'Fleet Manager') && (
                            <Button 
                              onClick={() => handleUpdateStatus(record.id, 'Completed')}
                              size="sm" 
                              className="text-[10px] px-2 py-1 text-xs"
                            >
                              <Check size={10} className="mr-1" /> Done
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* --- CREATE WORK ORDER DIALOG --- */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Schedule Preventive Maintenance / Repair"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Authorize Work Order</Button>
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
                <option value="">Choose vehicle...</option>
                {vehicles.filter(v => v.status === 'Available').map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.regNumber})</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Service Type</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceRecord['type'] })}
              >
                <option value="Oil Change">Oil Change</option>
                <option value="Tyre">Tyre Rotation / Replace</option>
                <option value="Brake">Brake Pads & Service</option>
                <option value="Engine">Engine Overhaul / Diagnostic</option>
                <option value="Battery">Battery Diagnostics</option>
                <option value="Inspection">Annual Safety Inspection</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Odometer Reading (km)</label>
              <Input
                type="number"
                required
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Estimated Service Cost ($)</label>
              <Input
                type="number"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Service Date</label>
              <Input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Initial status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceRecord['status'] })}
              >
                <option value="Scheduled">Scheduled (Future)</option>
                <option value="Active">Active (In Shop Now)</option>
                <option value="Completed">Completed (Historical)</option>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Workshop / Mechanic Details</label>
            <Input
              required
              placeholder="E.g. MasterTech Logistics Shop #4"
              value={formData.mechanicDetails}
              onChange={(e) => setFormData({ ...formData, mechanicDetails: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Initial Diagnostics / Remarks</label>
            <Input
              placeholder="E.g. Wear indicator triggered. Replace standard pads."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
        </form>
      </Dialog>

    </div>
  );
};
