import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as ReChartsTooltip, Legend 
} from 'recharts';
import { 
  CreditCard, Plus, Filter, Search, DollarSign, 
  Check, X, AlertTriangle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Expense } from '../../services/mockDb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Dialog } from '../ui/Primitives';
import { formatCurrency, formatDate } from '../../utils/format';

export const Expenses: React.FC = () => {
  const { expenses, vehicles, addExpense, updateVehicle } = useSystemState();
  const { success, error } = useToast();
  const { user } = useAuth();

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Local state update helper to approve/reject
  const { notifications, addNotification } = useSystemState();
  const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);

  const [formData, setFormData] = useState({
    vehicleId: '',
    category: 'Repair' as Expense['category'],
    amount: 150,
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'Pending' as Expense['status']
  });

  // Reconcile dynamic changes locally or pull from state context
  const activeExpenses = useMemo(() => {
    return expenses;
  }, [expenses]);

  // Aggregate totals
  const financials = useMemo(() => {
    const approved = activeExpenses.filter(e => e.status === 'Approved');
    const totalSpent = approved.reduce((sum, e) => sum + e.amount, 0);
    const pending = activeExpenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
    
    // Category totals
    const categories: Record<string, number> = {
      Fuel: 0, Repair: 0, Maintenance: 0, Insurance: 0, Parking: 0, Toll: 0, Tax: 0, Miscellaneous: 0
    };
    approved.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    const pieColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
    const pieData = Object.entries(categories)
      .filter(([_, val]) => val > 0)
      .map(([name, value], idx) => ({
        name,
        value,
        color: pieColors[idx % pieColors.length]
      }));

    return { totalSpent, pending, pieData };
  }, [activeExpenses]);

  // Filter list
  const filteredExpenses = useMemo(() => {
    let result = [...activeExpenses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.vehicleId.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter(e => e.category === categoryFilter);
    }

    if (statusFilter) {
      result = result.filter(e => e.status === statusFilter);
    }

    return result;
  }, [activeExpenses, search, categoryFilter, statusFilter]);

  // Approve/reject workflow
  const handleApprove = (id: string, approve: boolean) => {
    const updatedStatus: Expense['status'] = approve ? 'Approved' : 'Rejected';
    
    // Simulating updates dynamically. In mockDb we can do this by mutation
    const target = expenses.find(e => e.id === id);
    if (target) {
      target.status = updatedStatus;
      success(`Expense ${id} status updated to ${updatedStatus}`);
      
      // Notify dispatcher/safety officers
      addNotification({
        type: 'Alert',
        title: `Expense Ledger Update: ${id}`,
        message: `Expense claim of ${formatCurrency(target.amount)} for vehicle ${target.vehicleId} was ${updatedStatus.toLowerCase()} by ${user?.name}.`,
        severity: approve ? 'info' : 'warning'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.description) {
      error("Please populate all expense fields");
      return;
    }

    addExpense({
      vehicleId: formData.vehicleId,
      category: formData.category,
      amount: formData.amount,
      date: new Date(formData.date).toISOString(),
      description: formData.description,
      status: (user?.role === 'Financial Analyst' || user?.role === 'Super Admin') ? 'Approved' : 'Pending'
    });

    success("New operational expense logged in audit ledger");
    setIsOpen(false);
    
    // reset form
    setFormData({
      vehicleId: '',
      category: 'Repair',
      amount: 150,
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'Pending'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Expense Audits</h1>
          <p className="text-sm text-muted-foreground">Monitor operating spends, review approvals, and audit asset margins.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-1.5 shadow-premium">
            <Plus size={15} />
            <span>Log Expense Claim</span>
          </Button>
        </div>
      </div>

      {/* --- GRID 1: KPIS & PIE CHART --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost stats */}
        <div className="space-y-4 flex flex-col justify-between">
          <Card className="shadow-premium-subtle">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approved Expenses (MTD)</span>
                <DollarSign className="text-emerald-500" size={20} />
              </div>
              <div className="flex items-baseline mt-4">
                <span className="text-3xl font-extrabold tracking-tight">{formatCurrency(financials.totalSpent)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-premium-subtle">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Approvals Ledger</span>
                <DollarSign className="text-amber-500" size={20} />
              </div>
              <div className="flex items-baseline mt-4">
                <span className="text-3xl font-extrabold tracking-tight">{formatCurrency(financials.pending)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Category share (Pie Chart) */}
        <Card className="lg:col-span-2 shadow-premium-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Approved Operating Shares</CardTitle>
            <CardDescription>Breakdown of audited operational cost elements</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex flex-col sm:flex-row items-center justify-between">
            <div className="w-full sm:w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financials.pieData}
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {financials.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReChartsTooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend column */}
            <div className="w-full sm:w-1/2 grid grid-cols-2 gap-2 text-xs">
              {financials.pieData.map((item) => (
                <div key={item.name} className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="font-bold ml-auto">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- GRID 2: EXPENSES LOG TABLE --- */}
      <Card className="shadow-premium-subtle">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <CardTitle>Expense Register</CardTitle>
              <CardDescription>Audited claims logged by operators and mechanics</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <Input
                  placeholder="Search truck or descriptor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full text-xs"
                />
              </div>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs w-28 bg-card">
                <option value="">Categories</option>
                <option value="Fuel">Fuel</option>
                <option value="Repair">Repair</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Insurance">Insurance</option>
                <option value="Toll">Tolls</option>
                <option value="Tax">Taxes</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs w-28 bg-card">
                <option value="">Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-105 bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                <th className="p-4">Exp ID</th>
                <th className="p-4">Vehicle ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Claim Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Approval Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.slice(0, 50).map(expense => (
                <tr key={expense.id} className="hover:bg-slate-55/40 dark:hover:bg-zinc-900/10">
                  <td className="p-4 font-mono text-xs font-bold">{expense.id}</td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-800 dark:text-zinc-400">{expense.vehicleId}</td>
                  <td className="p-4 text-xs font-bold">{expense.category}</td>
                  <td className="p-4 text-xs max-w-xs truncate">{expense.description}</td>
                  <td className="p-4 text-xs font-semibold">{formatDate(expense.date)}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-zinc-200">{formatCurrency(expense.amount)}</td>
                  <td className="p-4">
                    <Badge variant={
                      expense.status === 'Approved' ? 'success' 
                      : expense.status === 'Pending' ? 'warning'
                      : 'error'
                    }>
                      {expense.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    {expense.status === 'Pending' && (user?.role === 'Super Admin' || user?.role === 'Financial Analyst') ? (
                      <div className="flex items-center justify-end space-x-1.5">
                        <button 
                          onClick={() => handleApprove(expense.id, true)}
                          className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:scale-105 transition"
                          title="Approve"
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          onClick={() => handleApprove(expense.id, false)}
                          className="p-1 rounded bg-rose-50 dark:bg-rose-955/20 text-rose-600 hover:scale-105 transition"
                          title="Reject"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Audited</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* --- REFUELLING ENTRY DIALOG --- */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Log Operational Expense Claim"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Log Expense Claim</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Select Target Vehicle</label>
              <Select
                required
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              >
                <option value="">Select vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.regNumber})</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Expense Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
              >
                <option value="Repair">Repair Work</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Insurance">Insurance Policy</option>
                <option value="Parking">Overnight Parking</option>
                <option value="Toll">Toll gate Corridor</option>
                <option value="Tax">State/Heavy Vehicle Tax</option>
                <option value="Miscellaneous">Miscellaneous / Help</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Claim Amount ($)</label>
              <Input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Date of Expense</label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Description / Receipt reference</label>
            <Input
              required
              placeholder="E.g. Toll charges on highway 95 corridor receipt #829"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Dialog>

    </div>
  );
};
