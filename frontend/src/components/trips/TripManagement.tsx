import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Navigation, MapPin, Truck, Users, Send, CheckCircle2, 
  AlertTriangle, AlertCircle, Clock, Plus, ChevronRight, ChevronLeft, 
  X, HelpCircle, Eye, Check, RefreshCw, Search 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trip, Vehicle, Driver } from '../../services/mockDb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Dialog } from '../ui/Primitives';
import { formatCurrency, formatOdometer, formatCapacity, formatDate } from '../../utils/format';

const US_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'San Francisco', 'Indianapolis', 'Columbus', 'Seattle', 'Denver', 'Boston'
];

export const TripManagement: React.FC = () => {
  const { 
    trips, vehicles, drivers, addTrip, updateTripStatus, cancelTrip 
  } = useSystemState();
  
  const { success, error, warning } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view toggle: 'list' or 'wizard'
  const [viewMode, setViewMode] = useState<'list' | 'wizard'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    source: '',
    destination: '',
    stops: [] as string[],
    distance: 450,
    cargoType: 'Electronics' as Trip['cargoType'],
    cargoWeight: 8000,
    priority: 'Medium' as Trip['priority'],
    vehicleId: '',
    driverId: '',
    remarks: ''
  });

  // Completion Form states
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [completionForm, setCompletionForm] = useState({
    finalOdometer: 0,
    fuelUsed: 120,
    expenses: 45,
    deliveryProof: '',
    remarks: ''
  });

  // Detailed Drawer Deep link
  const activeTripId = searchParams.get('id');
  const activeTrip = useMemo(() => {
    return trips.find(t => t.id === activeTripId) || null;
  }, [activeTripId, trips]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  useEffect(() => {
    if (activeTripId) {
      setIsDrawerOpen(true);
    }
  }, [activeTripId]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('id');
    setSearchParams(newParams);
  };

  // --- FILTERS & QUERY ---
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(q) || 
        t.source.toLowerCase().includes(q) || 
        t.destination.toLowerCase().includes(q) ||
        t.cargoType.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }

    return result;
  }, [trips, search, statusFilter]);

  // Selected vehicle & driver for wizard review validation
  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === wizardData.vehicleId) || null;
  }, [wizardData.vehicleId, vehicles]);

  const selectedDriver = useMemo(() => {
    return drivers.find(d => d.id === wizardData.driverId) || null;
  }, [wizardData.driverId, drivers]);

  // --- WIZARD LIVE VALIDATIONS ENGINE ---
  const validations = useMemo(() => {
    const v = selectedVehicle;
    const d = selectedDriver;

    const checks = {
      vehicleAvailable: v ? v.status === 'Available' : false,
      vehicleNotMaintenance: v ? v.status !== 'Maintenance' : false,
      vehicleNotRetired: v ? v.status !== 'Retired' : false,
      driverAvailable: d ? d.status === 'Available' : false,
      driverNotSuspended: d ? d.status !== 'Suspended' : false,
      licenseValid: d ? new Date(d.licenseExpiry) > new Date() : false,
      cargoCapacityFit: (v && wizardData.cargoWeight) ? wizardData.cargoWeight <= v.loadCapacity : false,
      noDuplicateAssignment: d ? !trips.some(t => t.driverId === d.id && t.status === 'On Trip') : true
    };

    const allPassed = Object.values(checks).every(Boolean);

    return { checks, allPassed };
  }, [selectedVehicle, selectedDriver, wizardData.cargoWeight, trips]);

  // Start trip completion trigger
  const handleOpenCompletion = (trip: Trip) => {
    const v = vehicles.find(x => x.id === trip.vehicleId);
    setCompletingTrip(trip);
    setCompletionForm({
      finalOdometer: v ? v.odometer + trip.distance : trip.distance,
      fuelUsed: Math.round(trip.distance / 7), // estimation
      expenses: 85,
      deliveryProof: `POD-${trip.id}-SIG`,
      remarks: 'Delivered successfully. Customer signed manifest.'
    });
    setIsCompleteOpen(true);
  };

  const handleCompletionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTrip) return;
    
    updateTripStatus(completingTrip.id, 'Completed', {
      finalOdometer: completionForm.finalOdometer,
      fuelUsed: completionForm.fuelUsed,
      expenses: completionForm.expenses,
      deliveryProof: completionForm.deliveryProof,
      remarks: completionForm.remarks,
      completedAt: new Date().toISOString()
    });

    success(`Trip ${completingTrip.id} completed. Driver/Vehicle released.`);
    setIsCompleteOpen(false);
    setCompletingTrip(null);
  };

  const handleNextStep = () => {
    if (wizardStep === 1 && !wizardData.source) {
      error("Source city is required");
      return;
    }
    if (wizardStep === 2 && (!wizardData.destination || wizardData.destination === wizardData.source)) {
      error("A unique destination city is required");
      return;
    }
    if (wizardStep === 3 && wizardData.cargoWeight <= 0) {
      error("Cargo weight must be greater than zero");
      return;
    }
    if (wizardStep === 4 && !wizardData.vehicleId) {
      error("Please select a transport vehicle");
      return;
    }
    if (wizardStep === 5 && !wizardData.driverId) {
      error("Please select a driver operator");
      return;
    }

    setWizardStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setWizardStep(prev => Math.max(prev - 1, 1));
  };

  // Dispatch submission
  const handleDispatchTrip = () => {
    if (!validations.allPassed) {
      error("Dispatch validations failed. Please rectify issues before dispatching.");
      return;
    }

    addTrip({
      source: wizardData.source,
      destination: wizardData.destination,
      stops: wizardData.stops,
      distance: wizardData.distance,
      eta: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days MOCK ETA
      cargoType: wizardData.cargoType,
      cargoWeight: wizardData.cargoWeight,
      priority: wizardData.priority,
      vehicleId: wizardData.vehicleId,
      driverId: wizardData.driverId,
      remarks: wizardData.remarks
    });

    setWizardStep(7); // success page step!
  };

  const resetWizard = () => {
    setWizardData({
      source: '',
      destination: '',
      stops: [],
      distance: 450,
      cargoType: 'Electronics',
      cargoWeight: 8000,
      priority: 'Medium',
      vehicleId: '',
      driverId: '',
      remarks: ''
    });
    setWizardStep(1);
    setViewMode('list');
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Trip Management</h1>
          <p className="text-sm text-muted-foreground">Monitor real-time dispatches, review wizard workflows, and log POD proof.</p>
        </div>
        <div className="flex items-center space-x-2">
          {viewMode === 'list' && (user?.role === 'Super Admin' || user?.role === 'Dispatcher') && (
            <Button onClick={() => { setWizardStep(1); setViewMode('wizard'); }} className="flex items-center space-x-1.5">
              <Plus size={15} />
              <span>Create Dispatch Wizard</span>
            </Button>
          )}
          {viewMode === 'wizard' && (
            <Button variant="ghost" onClick={resetWizard} className="text-xs">
              Cancel Dispatch
            </Button>
          )}
        </div>
      </div>

      {/* ==================== LIST VIEW RENDER ==================== */}
      {viewMode === 'list' && (
        <>
          {/* Filters index */}
          <Card className="p-4 shadow-premium-subtle">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <Input
                  placeholder="Search by ID, source, destination..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-44 text-xs bg-card">
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Dispatched">Dispatched</option>
                <option value="On Trip">On Trip</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </div>
          </Card>

          {/* Trips table */}
          {filteredTrips.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <AlertCircle size={36} className="text-slate-300 dark:text-zinc-700 mb-2" />
              <h3 className="font-semibold text-sm">No Dispatches Found</h3>
              <p className="text-xs text-muted-foreground mt-1">Create a new dispatch using the wizard to populate records.</p>
            </Card>
          ) : (
            <Card className="overflow-x-auto shadow-premium-subtle">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-105 bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                    <th className="p-4">Trip ID</th>
                    <th className="p-4">Route Path</th>
                    <th className="p-4">Cargo / Capacity</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Assigned Driver</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTrips.map(trip => {
                    const v = vehicles.find(x => x.id === trip.vehicleId);
                    const d = drivers.find(x => x.id === trip.driverId);
                    
                    return (
                      <tr key={trip.id} className="hover:bg-slate-55/40 dark:hover:bg-zinc-900/10">
                        <td className="p-4 font-mono text-xs font-bold">{trip.id}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1.5 text-xs">
                            <span className="font-bold">{trip.source}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-bold">{trip.destination}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">{trip.distance} km • ETA: {formatDate(trip.eta)}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-xs">
                            <span className="font-semibold">{trip.cargoType}</span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{formatCapacity(trip.cargoWeight)}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-xs font-mono">{v ? v.regNumber : 'Unassigned'}</td>
                        <td className="p-4 text-xs font-semibold">{d ? d.name : 'Unassigned'}</td>
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
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button 
                              onClick={() => setSearchParams({ id: trip.id })}
                              className="p-1 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                              title="Details"
                            >
                              <Eye size={12} />
                            </button>
                            {trip.status === 'On Trip' && (user?.role === 'Super Admin' || user?.role === 'Dispatcher' || user?.role === 'Driver') && (
                              <Button 
                                onClick={() => handleOpenCompletion(trip)}
                                size="sm" 
                                className="text-[10px] px-2.5 py-1 text-xs"
                              >
                                Complete Trip
                              </Button>
                            )}
                            {trip.status === 'Pending' && (user?.role === 'Super Admin' || user?.role === 'Dispatcher') && (
                              <Button 
                                onClick={() => cancelTrip(trip.id)}
                                variant="outline"
                                size="sm" 
                                className="text-[10px] px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 border-rose-205"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {/* ==================== MULTI-STEP TRIP WIZARD ==================== */}
      {viewMode === 'wizard' && (
        <Card className="max-w-2xl mx-auto shadow-premium-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-blue-600">New Dispatch Wizard</span>
              <span className="text-muted-foreground">Step {wizardStep} of 6</span>
            </div>
            
            {/* Step circles visualization */}
            {wizardStep < 7 && (
              <div className="flex items-center space-x-1.5 mt-3">
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <div 
                    key={s} 
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      wizardStep >= s ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* STEP 1: Source */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-bold text-sm">Step 1: Dispatch Source</h3>
                  <p className="text-xs text-muted-foreground">Select the origin terminal depot for cargo pickup.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Origin City</label>
                  <Select 
                    value={wizardData.source} 
                    onChange={(e) => setWizardData({ ...wizardData, source: e.target.value })}
                  >
                    <option value="">Select origin depot...</option>
                    {US_CITIES.map(c => <option key={c} value={c}>{c} Depot</option>)}
                  </Select>
                </div>
              </div>
            )}

            {/* STEP 2: Destination */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-bold text-sm">Step 2: Dispatch Destination</h3>
                  <p className="text-xs text-muted-foreground">Specify the terminal or client delivery destination.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Destination City</label>
                  <Select 
                    value={wizardData.destination} 
                    onChange={(e) => setWizardData({ ...wizardData, destination: e.target.value })}
                  >
                    <option value="">Select destination depot...</option>
                    {US_CITIES.filter(c => c !== wizardData.source).map(c => (
                      <option key={c} value={c}>{c} Terminal</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Route Distance (km)</label>
                  <Input 
                    type="number" 
                    value={wizardData.distance} 
                    onChange={(e) => setWizardData({ ...wizardData, distance: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Cargo Details */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-bold text-sm">Step 3: Manifest Cargo Specifications</h3>
                  <p className="text-xs text-muted-foreground">Log cargo types, weights, and transport priority.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Cargo Category</label>
                    <Select 
                      value={wizardData.cargoType} 
                      onChange={(e) => setWizardData({ ...wizardData, cargoType: e.target.value as Trip['cargoType'] })}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Perishable Foods">Perishable Foods</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Chemicals">Chemicals</option>
                      <option value="General Freight">General Freight</option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Manifest Weight (kg)</label>
                    <Input 
                      type="number" 
                      value={wizardData.cargoWeight}
                      onChange={(e) => setWizardData({ ...wizardData, cargoWeight: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Priority Level</label>
                  <Select 
                    value={wizardData.priority} 
                    onChange={(e) => setWizardData({ ...wizardData, priority: e.target.value as Trip['priority'] })}
                  >
                    <option value="Low">Low (Eco)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Express)</option>
                    <option value="Critical">Critical (ASAP)</option>
                  </Select>
                </div>
              </div>
            )}

            {/* STEP 4: Vehicle selection */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-bold text-sm">Step 4: Select Transport Vehicle</h3>
                  <p className="text-xs text-muted-foreground">Choose an active vehicle. Red flags signify busy or maintenance status.</p>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto premium-scroll p-1 divide-y divide-slate-105/50 dark:divide-slate-800">
                  {vehicles.filter(v => v.status === 'Available').map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => setWizardData({ ...wizardData, vehicleId: v.id })}
                      className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition ${
                        wizardData.vehicleId === v.id 
                          ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-zinc-800' 
                          : 'hover:bg-slate-50/50 dark:hover:bg-zinc-900/10'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{v.name} ({v.regNumber})</span>
                        <span className="text-[10px] text-muted-foreground block">{v.type} • Capacity: {formatCapacity(v.loadCapacity)}</span>
                      </div>
                      <Badge variant="success">Available</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Driver selection */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-bold text-sm">Step 5: Select Driver Operator</h3>
                  <p className="text-xs text-muted-foreground">Select an operator holding a valid commercial license.</p>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto premium-scroll p-1 divide-y divide-slate-105/50 dark:divide-slate-800">
                  {drivers.filter(d => d.status === 'Available').map(d => (
                    <div 
                      key={d.id} 
                      onClick={() => setWizardData({ ...wizardData, driverId: d.id })}
                      className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition ${
                        wizardData.driverId === d.id 
                          ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-zinc-800' 
                          : 'hover:bg-slate-50/50 dark:hover:bg-zinc-900/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${d.name}`}
                          alt={d.name}
                          className="w-8 h-8 rounded-full border bg-slate-50 dark:bg-zinc-900"
                        />
                        <div>
                          <span className="text-xs font-bold block">{d.name}</span>
                          <span className="text-[10px] text-muted-foreground block">{d.licenseCategory} • Safety: {d.safetyScore} pts</span>
                        </div>
                      </div>
                      <Badge variant="success">Available</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Review & Live validations */}
            {wizardStep === 6 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="font-bold text-sm">Step 6: Compliance Validation</h3>
                  <p className="text-xs text-muted-foreground">Automatic safety check of parameters before dispatching.</p>
                </div>
                
                {/* Validations checklist */}
                <div className="space-y-2 border rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-900/10">
                  
                  {/* Vehicle Available */}
                  <div className="flex items-center justify-between text-xs py-1 border-b">
                    <span className="text-slate-600 dark:text-zinc-400">Vehicle Available & Not In Shop:</span>
                    <div className="flex items-center space-x-1.5 font-bold">
                      {validations.checks.vehicleAvailable && validations.checks.vehicleNotMaintenance ? (
                        <span className="text-emerald-500 flex items-center"><Check size={14} className="mr-1" /> Passed</span>
                      ) : (
                        <span className="text-rose-500 flex items-center"><X size={14} className="mr-1" /> Failed</span>
                      )}
                    </div>
                  </div>

                  {/* Driver Available */}
                  <div className="flex items-center justify-between text-xs py-1 border-b">
                    <span className="text-slate-600 dark:text-zinc-400">Driver Operator Available & Not Suspended:</span>
                    <div className="flex items-center space-x-1.5 font-bold">
                      {validations.checks.driverAvailable && validations.checks.driverNotSuspended ? (
                        <span className="text-emerald-500 flex items-center"><Check size={14} className="mr-1" /> Passed</span>
                      ) : (
                        <span className="text-rose-500 flex items-center"><X size={14} className="mr-1" /> Failed</span>
                      )}
                    </div>
                  </div>

                  {/* License Expiry check */}
                  <div className="flex items-center justify-between text-xs py-1 border-b">
                    <span className="text-slate-600 dark:text-zinc-400">Driver License Validity:</span>
                    <div className="flex items-center space-x-1.5 font-bold">
                      {validations.checks.licenseValid ? (
                        <span className="text-emerald-500 flex items-center"><Check size={14} className="mr-1" /> Passed</span>
                      ) : (
                        <span className="text-rose-500 flex items-center"><X size={14} className="mr-1" /> Expired</span>
                      )}
                    </div>
                  </div>

                  {/* Weight Capacity check */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-600 dark:text-zinc-400">Cargo Weight Capacity Check:</span>
                    <div className="flex items-center space-x-1.5 font-bold">
                      {validations.checks.cargoCapacityFit ? (
                        <span className="text-emerald-500 flex items-center"><Check size={14} className="mr-1" /> Fit</span>
                      ) : (
                        <span className="text-rose-500 flex items-center"><X size={14} className="mr-1" /> Overload</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Dispatch summary preview */}
                <div className="grid grid-cols-2 gap-4 text-xs border rounded-xl p-4 bg-card">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Route</span>
                    <span className="font-semibold block">{wizardData.source} to {wizardData.destination}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Cargo Manifest</span>
                    <span className="font-semibold block">{wizardData.cargoType} ({formatCapacity(wizardData.cargoWeight)})</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle Assigned</span>
                    <span className="font-semibold block">{selectedVehicle?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Operator Assigned</span>
                    <span className="font-semibold block">{selectedDriver?.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Dispatch Success Confirmation */}
            {wizardStep === 7 && (
              <div className="text-center py-10 space-y-6 animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center border-4 border-emerald-200/50">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Trip Dispatched Successfully</h2>
                  <p className="text-xs text-muted-foreground mt-1">Vehicle and operator status have automatically updated to 'On Trip' in our local database.</p>
                </div>
                <Button onClick={resetWizard}>Return to Trips Index</Button>
              </div>
            )}

            {/* Back / Next actions */}
            {wizardStep < 7 && (
              <div className="flex items-center justify-between border-t border-slate-105/50 dark:border-slate-800 pt-5 mt-6">
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                  disabled={wizardStep === 1}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </Button>

                {wizardStep === 6 ? (
                  <Button 
                    onClick={handleDispatchTrip}
                    disabled={!validations.allPassed}
                    className="flex items-center space-x-1.5"
                  >
                    <Send size={15} />
                    <span>Authorize Dispatch</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextStep}
                    className="flex items-center space-x-1"
                  >
                    <span>Continue</span>
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* ==================== TRIP COMPLETION DIALOG MODAL ==================== */}
      <Dialog
        isOpen={isCompleteOpen}
        onClose={() => { setIsCompleteOpen(false); setCompletingTrip(null); }}
        title={`Complete Dispatch: ${completingTrip?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsCompleteOpen(false); setCompletingTrip(null); }}>Cancel</Button>
            <Button onClick={handleCompletionSubmit}>File Completion Manifest</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCompletionSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Final Odometer (km)</label>
              <Input 
                type="number" 
                required
                value={completionForm.finalOdometer}
                onChange={(e) => setCompletionForm({ ...completionForm, finalOdometer: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Fuel Used (Liters)</label>
              <Input 
                type="number" 
                required
                value={completionForm.fuelUsed}
                onChange={(e) => setCompletionForm({ ...completionForm, fuelUsed: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Trip Expenses (Tolls, Parking)</label>
              <Input 
                type="number" 
                required
                value={completionForm.expenses}
                onChange={(e) => setCompletionForm({ ...completionForm, expenses: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">POD Proof ID</label>
              <Input 
                type="text" 
                required
                placeholder="POD-SIGNATURE-ID"
                value={completionForm.deliveryProof}
                onChange={(e) => setCompletionForm({ ...completionForm, deliveryProof: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Remarks / Exceptions</label>
            <Input 
              type="text" 
              placeholder="E.g. Cargo delivered safely, no delays."
              value={completionForm.remarks}
              onChange={(e) => setCompletionForm({ ...completionForm, remarks: e.target.value })}
            />
          </div>
        </form>
      </Dialog>

      {/* ==================== OVERLAY DETAIL DRAWER ==================== */}
      {isDrawerOpen && activeTrip && (
        <div className="fixed inset-0 z-40 overflow-hidden flex justify-end">
          <div onClick={closeDrawer} className="absolute inset-0 bg-slate-950/20 dark:bg-black/55 backdrop-blur-[1px] transition-opacity duration-300"></div>
          
          <div className="relative w-full max-w-xl bg-card border-l shadow-premium-lg flex flex-col h-full animate-[slideLeft_0.2s_ease-out]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{activeTrip.id}</span>
                <h2 className="text-lg font-bold">Route: {activeTrip.source} to {activeTrip.destination}</h2>
              </div>
              <button onClick={closeDrawer} className="p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto premium-scroll p-6 space-y-6">
              
              {/* Properties */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Route Distance</span>
                  <span className="text-sm font-semibold">{activeTrip.distance} km</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Priority</span>
                  <span className="text-sm font-semibold block">{activeTrip.priority}</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Cargo Type</span>
                  <span className="text-sm font-semibold block">{activeTrip.cargoType}</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Manifest Weight</span>
                  <span className="text-sm font-semibold block">{formatCapacity(activeTrip.cargoWeight)}</span>
                </div>
              </div>

              {/* Status Box */}
              <Card>
                <CardHeader className="pb-3 border-b-0">
                  <CardTitle className="text-sm font-bold">Manifest Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trip Status:</span>
                    <Badge variant={activeTrip.status === 'Completed' ? 'success' : activeTrip.status === 'On Trip' ? 'info' : 'warning'}>
                      {activeTrip.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle Reg:</span>
                    <span className="font-semibold font-mono">{vehicles.find(v => v.id === activeTrip.vehicleId)?.regNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver Name:</span>
                    <span className="font-semibold">{drivers.find(d => d.id === activeTrip.driverId)?.name}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Live timeline checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Live Dispatch Timeline</h3>
                <div className="border-l border-slate-205 dark:border-slate-800 pl-4 ml-2 space-y-4 text-xs">
                  {activeTrip.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white border-2 border-card"></div>
                      <span className="block font-semibold">{event.title}</span>
                      <span className="block text-[10px] text-muted-foreground">{formatDate(event.time, true)} • {event.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* POD completion data */}
              {activeTrip.status === 'Completed' && activeTrip.completionData && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Proof of Delivery (POD)</h3>
                  <div className="border rounded-xl p-4 bg-emerald-50/10 border-emerald-100 dark:border-emerald-950/20 dark:bg-emerald-950/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-700 dark:text-emerald-400">Final Odometer:</span>
                      <span className="font-bold">{formatOdometer(activeTrip.completionData.finalOdometer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700 dark:text-emerald-400">Fuel Used (Liters):</span>
                      <span className="font-bold">{activeTrip.completionData.fuelUsed} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700 dark:text-emerald-400">Trip Cost tolls/misc:</span>
                      <span className="font-bold">{formatCurrency(activeTrip.completionData.expenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700 dark:text-emerald-400">Delivery Proof ID:</span>
                      <span className="font-mono font-bold">{activeTrip.completionData.deliveryProof}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 border-t pt-2 mt-2 italic">
                      "{activeTrip.completionData.remarks}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
