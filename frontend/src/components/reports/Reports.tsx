import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Filter, FileSpreadsheet, FileDown, 
  HelpCircle, Calendar, RefreshCw, Layers 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Select } from '../ui/Primitives';
import { formatCurrency, formatOdometer, formatDate, formatNumber } from '../../utils/format';

type ReportType = 'Fleet' | 'Driver' | 'Trip' | 'Fuel' | 'Expense' | 'Maintenance' | 'ROI';

export const Reports: React.FC = () => {
  const { vehicles, drivers, trips, expenses, maintenanceRecords, fuelLogs } = useSystemState();
  const { success, info } = useToast();

  const [activeReport, setActiveReport] = useState<ReportType>('Fleet');
  const [dateRange, setDateRange] = useState('30');
  const [region, setRegion] = useState('');
  
  // Loading states
  const [isCompiling, setIsCompiling] = useState(false);

  // Generate dynamic aggregated data preview based on selected report
  const reportData = useMemo(() => {
    if (activeReport === 'Fleet') {
      return vehicles.slice(0, 10).map(v => ({
        'Asset ID': v.id,
        'Name': v.name,
        'Odometer': formatOdometer(v.odometer),
        'Capacity': formatCapacity(v.loadCapacity),
        'Status': v.status,
        'Region': v.region,
      }));
    }
    
    if (activeReport === 'Driver') {
      return drivers.slice(0, 10).map(d => ({
        'Driver ID': d.id,
        'Name': d.name,
        'License': d.licenseCategory,
        'Experience': `${d.experience} Years`,
        'Safety Score': `${d.safetyScore} pts`,
        'Status': d.status
      }));
    }

    if (activeReport === 'Trip') {
      return trips.slice(0, 10).map(t => ({
        'Trip ID': t.id,
        'Route': `${t.source} → ${t.destination}`,
        'Distance': `${t.distance} km`,
        'Cargo': t.cargoType,
        'Priority': t.priority,
        'Status': t.status
      }));
    }

    if (activeReport === 'Fuel') {
      return fuelLogs.slice(0, 10).map(l => ({
        'Fuel ID': l.id,
        'Vehicle ID': l.vehicleId,
        'Quantity': `${l.fuelQuantity} L`,
        'Cost': formatCurrency(l.fuelCost),
        'Station': l.station,
        'Date': formatDate(l.date)
      }));
    }

    if (activeReport === 'Expense') {
      return expenses.slice(0, 10).map(e => ({
        'Expense ID': e.id,
        'Vehicle ID': e.vehicleId,
        'Category': e.category,
        'Description': e.description,
        'Amount': formatCurrency(e.amount),
        'Status': e.status
      }));
    }

    if (activeReport === 'Maintenance') {
      return maintenanceRecords.slice(0, 10).map(m => ({
        'WO ID': m.id,
        'Vehicle ID': m.vehicleId,
        'Type': m.type,
        'Mechanic Details': m.mechanicDetails,
        'Cost': formatCurrency(m.cost),
        'Status': m.status
      }));
    }

    // ROI Report
    // Revenue per vehicle (trips revenue - expenses for that vehicle)
    const roi = vehicles.slice(0, 10).map(v => {
      const vTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
      const vExpenses = expenses.filter(e => e.vehicleId === v.id && e.status === 'Approved');
      
      const revenue = vTrips.reduce((sum, t) => sum + (t.distance * 2.2), 0);
      const expense = vExpenses.reduce((sum, e) => sum + e.amount, 0);
      const profit = revenue - expense;

      return {
        'Vehicle ID': v.id,
        'Model': v.name,
        'Revenue Generated': formatCurrency(revenue),
        'Operational Expense': formatCurrency(expense),
        'Net Profit': formatCurrency(profit),
        'ROI %': expense > 0 ? `${Math.round((profit / expense) * 100)}%` : '100%+'
      };
    });

    return roi;
  }, [activeReport, vehicles, drivers, trips, expenses, maintenanceRecords, fuelLogs]);

  // Handle mock compile & export
  const handleExport = (format: 'CSV' | 'PDF') => {
    setIsCompiling(true);
    
    // Simulate compilation delay
    setTimeout(() => {
      setIsCompiling(false);
      success(`${activeReport} Report successfully exported to ${format}!`);
    }, 1800);
  };

  // Helper helper
  function formatCapacity(v: number) {
    return v.toLocaleString() + ' kg';
  }

  const reportsList: { type: ReportType; desc: string }[] = [
    { type: 'Fleet', desc: 'Asset counts, usage & health indexes' },
    { type: 'Driver', desc: 'Safety scores, license validity & rankings' },
    { type: 'Trip', desc: 'Completed routes, delay timelines & weights' },
    { type: 'Fuel', desc: 'Station audit, quantities MTD & pricing' },
    { type: 'Expense', desc: 'Operational spends breakdown & claims' },
    { type: 'Maintenance', desc: 'Work orders, diagnostic history & shop time' },
    { type: 'ROI', desc: 'Asset profitability, revenues vs operating cost' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Report Exporter</h1>
          <p className="text-sm text-muted-foreground">Compile detailed operational reports and download CSV/PDF logs.</p>
        </div>
      </div>

      {/* --- GRID 1: REPORT SELECTOR PANELS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Report Selectors list */}
        <div className="space-y-2 md:col-span-1">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-2 mb-2">Available Reports</div>
          {reportsList.map(r => (
            <button
              key={r.type}
              onClick={() => setActiveReport(r.type)}
              className={`w-full text-left p-3 rounded-xl border transition ${
                activeReport === r.type
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 font-bold shadow-subtle'
                  : 'bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-zinc-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span className="text-xs font-semibold">{r.type} Audit Report</span>
              </div>
              <span className={`block text-[10px] mt-1 truncate ${activeReport === r.type ? 'text-slate-300 dark:text-slate-655' : 'text-slate-500'}`}>
                {r.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Right Side: Preview & filters container */}
        <div className="md:col-span-3 space-y-4">
          <Card className="shadow-premium-subtle">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle>{activeReport} Report Configuration</CardTitle>
                  <CardDescription>Configure scope variables and download file formats</CardDescription>
                </div>
                
                {/* Export triggers */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('CSV')}
                    disabled={isCompiling}
                    className="bg-card flex items-center space-x-1.5 text-xs"
                  >
                    <FileSpreadsheet size={15} />
                    <span>Download CSV</span>
                  </Button>
                  <Button 
                    onClick={() => handleExport('PDF')}
                    disabled={isCompiling}
                    className="flex items-center space-x-1.5 text-xs shadow-premium"
                  >
                    <FileDown size={15} />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </div>

              {/* Filters subset */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-slate-105/50 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Date Horizon</span>
                  <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="text-xs">
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="all">Full Log</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Scope Region</span>
                  <Select value={region} onChange={(e) => setRegion(e.target.value)} className="text-xs">
                    <option value="">All Regions</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              
              {/* Preview data section */}
              {isCompiling ? (
                // Compiling loader skeleton
                <div className="p-8 space-y-4 animate-pulse">
                  <div className="text-center py-8 text-xs text-muted-foreground flex flex-col items-center">
                    <RefreshCw size={24} className="animate-spin mb-3 text-blue-500" />
                    <span className="font-semibold text-slate-800 dark:text-zinc-300">Compiling ledger datasets...</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Filtering data matching parameters.</span>
                  </div>
                  <div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded-md w-full"></div>
                  <div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded-md w-4/5"></div>
                  <div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded-md w-5/6"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="px-6 py-3 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-50/20">
                    Live Data Preview (Showing top 10 matching records)
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground uppercase font-bold tracking-wider">
                        {Object.keys(reportData[0] || {}).map(key => (
                          <th key={key} className="p-4">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-55/40 dark:hover:bg-zinc-900/10">
                          {Object.values(row).map((val: any, cellIdx) => (
                            <td key={cellIdx} className="p-4 font-medium text-slate-700 dark:text-zinc-300">
                              {typeof val === 'string' && (val === 'Available' || val === 'Completed' || val === 'Approved') ? (
                                <Badge variant="success">{val}</Badge>
                              ) : typeof val === 'string' && (val === 'On Trip' || val === 'Pending') ? (
                                <Badge variant="info">{val}</Badge>
                              ) : typeof val === 'string' && (val === 'Maintenance' || val === 'Suspended') ? (
                                <Badge variant="warning">{val}</Badge>
                              ) : (
                                <span>{val}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
