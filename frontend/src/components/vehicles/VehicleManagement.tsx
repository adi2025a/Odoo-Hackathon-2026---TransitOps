import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Grid, List, Plus, Filter, MoreVertical, Edit2, Trash2, 
  QrCode, Eye, Check, X, ShieldAlert, Download, Upload, HelpCircle, FileText
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Vehicle } from '../../services/mockDb';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Select, Dialog } from '../ui/Primitives';
import { formatCurrency, formatOdometer, formatCapacity, formatDate } from '../../utils/format';

export const VehicleManagement: React.FC = () => {
  const { 
    vehicles, addVehicle, updateVehicle, deleteVehicle, 
    maintenanceRecords, drivers 
  } = useSystemState();
  
  const { success, warning, info } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    regNumber: '',
    name: '',
    model: '',
    type: 'Heavy Duty Truck',
    manufacturer: '',
    year: new Date().getFullYear(),
    vin: '',
    fuelType: 'Diesel' as Vehicle['fuelType'],
    loadCapacity: 24000,
    odometer: 15000,
    purchaseCost: 120000,
    insuranceExpiry: '2027-01-01',
    fitnessExpiry: '2027-01-01',
    pucExpiry: '2026-12-01',
    region: 'North' as Vehicle['region']
  });

  // URL deep-linking selector
  const activeVehicleId = searchParams.get('id');
  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === activeVehicleId) || null;
  }, [activeVehicleId, vehicles]);

  // Open drawer if deep link is present
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  useEffect(() => {
    if (activeVehicleId) {
      setIsDrawerOpen(true);
    }
  }, [activeVehicleId]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // remove URL parameter without full reload
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('id');
    setSearchParams(newParams);
  };

  // --- FILTERS & QUERY LOGIC ---
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v => 
        v.id.toLowerCase().includes(q) || 
        v.regNumber.toLowerCase().includes(q) || 
        v.name.toLowerCase().includes(q) || 
        v.manufacturer.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(v => v.status === statusFilter);
    }

    // Region filter
    if (regionFilter) {
      result = result.filter(v => v.region === regionFilter);
    }

    // Type filter
    if (typeFilter) {
      result = result.filter(v => v.type === typeFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'odometer') return b.odometer - a.odometer;
      if (sortBy === 'capacity') return b.loadCapacity - a.loadCapacity;
      if (sortBy === 'cost') return b.purchaseCost - a.purchaseCost;
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [vehicles, search, statusFilter, regionFilter, typeFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  // Sync edit form fields
  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      regNumber: v.regNumber,
      name: v.name,
      model: v.model,
      type: v.type,
      manufacturer: v.manufacturer,
      year: v.year,
      vin: v.vin,
      fuelType: v.fuelType,
      loadCapacity: v.loadCapacity,
      odometer: v.odometer,
      purchaseCost: v.purchaseCost,
      insuranceExpiry: v.insuranceExpiry,
      fitnessExpiry: v.fitnessExpiry,
      pucExpiry: v.pucExpiry,
      region: v.region
    });
    setIsEditOpen(true);
  };

  // --- CRUD ACTIONS ---
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle(formData);
    success("New vehicle added to fleet inventory");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    updateVehicle(editingVehicle.id, formData);
    success(`Vehicle ${editingVehicle.id} records updated`);
    setIsEditOpen(false);
  };

  const handleDeleteTrigger = (id: string) => {
    setVehicleToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!vehicleToDelete) return;
    const vInfo = vehicles.find(v => v.id === vehicleToDelete);
    deleteVehicle(vehicleToDelete);
    
    // Undo Toast implementation
    success(`Vehicle ${vehicleToDelete} deleted successfully`, () => {
      // Undo Callback
      if (vInfo) {
        addVehicle(vInfo);
        success(`Reinstated vehicle ${vehicleToDelete}`);
      }
    });

    setIsConfirmDeleteOpen(false);
    setVehicleToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      regNumber: '',
      name: '',
      model: '',
      type: 'Heavy Duty Truck',
      manufacturer: '',
      year: new Date().getFullYear(),
      vin: '',
      fuelType: 'Diesel',
      loadCapacity: 24000,
      odometer: 15000,
      purchaseCost: 120000,
      insuranceExpiry: '2027-01-01',
      fitnessExpiry: '2027-01-01',
      pucExpiry: '2026-12-01',
      region: 'North'
    });
  };

  // Bulk status update
  const handleBulkStatusChange = (status: Vehicle['status']) => {
    selectedIds.forEach(id => {
      updateVehicle(id, { status });
    });
    success(`Updated status of ${selectedIds.length} assets to ${status}`);
    setSelectedIds([]);
  };

  // Service history filtered by selected vehicle
  const vehicleMaintenance = useMemo(() => {
    if (!activeVehicle) return [];
    return maintenanceRecords.filter(m => m.vehicleId === activeVehicle.id);
  }, [activeVehicle, maintenanceRecords]);

  // Export report CSV simulation
  const handleExportCSV = () => {
    info("Compiling and downloading Fleet spreadsheet CSV...", () => {
      success("Spreadsheet download cancelled");
    });
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Header index */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Vehicle Management</h1>
          <p className="text-sm text-muted-foreground">Monitor, configure, and dispatch fleet assets in real-time.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportCSV} className="bg-card flex items-center space-x-1.5">
            <Download size={15} />
            <span className="hidden sm:inline">Export List</span>
          </Button>
          {(user?.role === 'Super Admin' || user?.role === 'Fleet Manager') && (
            <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="flex items-center space-x-1.5">
              <Plus size={15} />
              <span>Add Vehicle</span>
            </Button>
          )}
        </div>
      </div>

      {/* --- INDEX FILTER BAR --- */}
      <Card className="p-4 shadow-premium-subtle">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <Input
                placeholder="Search by ID, Reg No, or Model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs">
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </Select>
              <Select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="text-xs">
                <option value="">All Regions</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </Select>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-xs">
                <option value="">All Types</option>
                <option value="Heavy Duty Truck">Heavy Truck</option>
                <option value="Medium Duty Box">Medium Box</option>
                <option value="Light Utility Van">Light Van</option>
                <option value="Electric Hauler">Electric</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-t lg:border-t-0 pt-4 lg:pt-0">
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-36 text-xs">
              <option value="id">Sort by ID</option>
              <option value="odometer">Odometer (High)</option>
              <option value="capacity">Load Capacity</option>
              <option value="cost">Purchase Cost</option>
            </Select>
            <div className="flex items-center border rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-2 transition ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-white' : 'text-slate-400'}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 transition ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-white' : 'text-slate-400'}`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center justify-between bg-slate-100 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800 animate-fade-in">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-400">{selectedIds.length} vehicles selected</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Bulk Actions:</span>
              <Button onClick={() => handleBulkStatusChange('Maintenance')} size="sm" variant="secondary" className="text-xs py-1">
                Set Maintenance
              </Button>
              <Button onClick={() => handleBulkStatusChange('Available')} size="sm" variant="secondary" className="text-xs py-1">
                Set Available
              </Button>
              <Button onClick={() => setSelectedIds([])} size="sm" variant="ghost" className="text-xs py-1 text-slate-500 hover:text-slate-950">
                Clear
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* --- GRID OR TABLE RENDERS --- */}
      {paginatedVehicles.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <ShieldAlert size={36} className="text-slate-300 dark:text-zinc-700 mb-2" />
          <h3 className="font-semibold text-sm">No Vehicles Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">Try adjusting your filters or query to find matches in our sandbox inventory database.</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedVehicles.map(v => (
            <Card key={v.id} className="hover:shadow-premium-lg transition duration-200 group relative">
              
              {/* Photo Representation Indicator bar */}
              <div className={`h-2.5 w-full rounded-t-xl ${v.photoColor || 'bg-slate-500'}`}></div>
              
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{v.id}</span>
                    <h3 className="font-bold text-sm tracking-tight truncate group-hover:text-blue-650 transition">{v.name}</h3>
                    <span className="text-xs text-muted-foreground">{v.type}</span>
                  </div>
                  <Badge variant={
                    v.status === 'Available' ? 'success' 
                    : v.status === 'On Trip' ? 'info'
                    : v.status === 'Maintenance' ? 'warning'
                    : 'default'
                  }>
                    {v.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-105/50 dark:border-slate-800/40 pt-3">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Reg No</span>
                    <span className="font-semibold">{v.regNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Odometer</span>
                    <span className="font-semibold">{formatOdometer(v.odometer)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-105/50 dark:border-slate-800/40 pt-3 text-xs">
                  <div className="truncate">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Driver</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {v.assignedDriverId ? drivers.find(d => d.id === v.assignedDriverId)?.name : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => {
                        setSearchParams({ id: v.id });
                      }}
                      className="p-1.5 rounded-lg border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="View Details"
                    >
                      <Eye size={13} />
                    </button>
                    {(user?.role === 'Super Admin' || user?.role === 'Fleet Manager') && (
                      <>
                        <button 
                          onClick={() => handleOpenEdit(v)} 
                          className="p-1.5 rounded-lg border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 transition text-blue-600 dark:text-blue-400"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTrigger(v.id)} 
                          className="p-1.5 rounded-lg border bg-card hover:bg-slate-105 dark:hover:bg-slate-800 transition text-rose-600 dark:text-rose-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto shadow-premium-subtle">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-105 bg-slate-50/50 dark:bg-zinc-900/10 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedVehicles.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(paginatedVehicles.map(v => v.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded bg-zinc-900 border-slate-800"
                  />
                </th>
                <th className="p-4">ID</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Asset Detail</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Region</th>
                <th className="p-4">Assigned Operator</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedVehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-55/40 dark:hover:bg-zinc-900/10">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(v.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, v.id]);
                        } else {
                          setSelectedIds(prev => prev.filter(x => x !== v.id));
                        }
                      }}
                      className="rounded bg-zinc-900 border-slate-800"
                    />
                  </td>
                  <td className="p-4 font-mono text-xs font-bold">{v.id}</td>
                  <td className="p-4 font-semibold">{v.regNumber}</td>
                  <td className="p-4">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">{v.name}</span>
                      <span className="text-[10px] text-muted-foreground block">{v.type} • {v.year}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{formatOdometer(v.odometer)}</td>
                  <td className="p-4 text-xs font-semibold">{formatCapacity(v.loadCapacity)}</td>
                  <td className="p-4">
                    <Badge variant="outline">{v.region}</Badge>
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-zinc-300">
                    {v.assignedDriverId ? drivers.find(d => d.id === v.assignedDriverId)?.name : <span className="text-slate-400 italic text-xs">Unassigned</span>}
                  </td>
                  <td className="p-4">
                    <Badge variant={
                      v.status === 'Available' ? 'success' 
                      : v.status === 'On Trip' ? 'info'
                      : v.status === 'Maintenance' ? 'warning'
                      : 'default'
                    }>
                      {v.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button 
                        onClick={() => setSearchParams({ id: v.id })}
                        className="p-1 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <Eye size={12} />
                      </button>
                      {(user?.role === 'Super Admin' || user?.role === 'Fleet Manager') && (
                        <>
                          <button 
                            onClick={() => handleOpenEdit(v)}
                            className="p-1 rounded-md border text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTrigger(v.id)}
                            className="p-1 rounded-md border text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* --- INDEX PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs mt-4">
          <span className="text-muted-foreground">Showing page {currentPage} of {totalPages} ({filteredVehicles.length} total vehicles)</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* --- ADD VEHICLE DIALOG --- */}
      <Dialog 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        title="Add New Fleet Asset"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit}>Register Asset</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleAddSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Reg Number</label>
              <Input 
                required 
                placeholder="DL-01-AB-1234" 
                value={formData.regNumber}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Vehicle Name</label>
              <Input 
                required 
                placeholder="Volvo VNL 860" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Model Name</label>
              <Input 
                required 
                placeholder="VNL 860" 
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Manufacturer</label>
              <Input 
                required 
                placeholder="Volvo" 
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Asset Type</label>
              <Select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Heavy Duty Truck">Heavy Duty Truck</option>
                <option value="Medium Duty Box">Medium Duty Box</option>
                <option value="Light Utility Van">Light Utility Van</option>
                <option value="Electric Hauler">Electric Hauler</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Fuel Type</label>
              <Select 
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as Vehicle['fuelType'] })}
              >
                <option value="Diesel">Diesel</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Region</label>
              <Select 
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value as Vehicle['region'] })}
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Load Capacity (kg)</label>
              <Input 
                type="number" 
                required 
                value={formData.loadCapacity}
                onChange={(e) => setFormData({ ...formData, loadCapacity: Number(e.target.value) })}
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
          </div>
        </form>
      </Dialog>

      {/* --- EDIT VEHICLE DIALOG --- */}
      <Dialog 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title={`Edit Vehicle ${editingVehicle?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Reg Number</label>
              <Input 
                required 
                value={formData.regNumber}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Vehicle Name</label>
              <Input 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="text-xs font-semibold">Region</label>
              <Select 
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value as Vehicle['region'] })}
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </Select>
            </div>
          </div>
        </form>
      </Dialog>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <Dialog 
        isOpen={isConfirmDeleteOpen} 
        onClose={() => setIsConfirmDeleteOpen(false)} 
        title="Confirm Asset Decommission"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>Confirm Deletion</Button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm">Are you sure you want to decommission and delete vehicle <span className="font-bold">{vehicleToDelete}</span> from the TransitOps system?</p>
          <p className="text-xs text-rose-500 font-semibold">This action updates the local mock state. An undo toast prompt will be provided immediately after completion.</p>
        </div>
      </Dialog>

      {/* --- QR CODE DIALOG SIMULATOR --- */}
      <Dialog 
        isOpen={isQrOpen} 
        onClose={() => setIsQrOpen(false)} 
        title={`Scan QR Code: ${qrCodeData}`}
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-48 h-48 border rounded-xl bg-white flex items-center justify-center p-4">
            {/* Draw a nice visual SVG looking like a real code */}
            <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
              {/* Fake blocks */}
              <rect x="5" y="5" width="20" height="20" fill="currentColor" />
              <rect x="5" y="75" width="20" height="20" fill="currentColor" />
              <rect x="75" y="5" width="20" height="20" fill="currentColor" />
              <rect x="10" y="10" width="10" height="10" fill="white" />
              <rect x="10" y="80" width="10" height="10" fill="white" />
              <rect x="80" y="10" width="10" height="10" fill="white" />
              {/* noise */}
              <rect x="35" y="10" width="5" height="15" />
              <rect x="45" y="5" width="15" height="5" />
              <rect x="35" y="35" width="15" height="15" />
              <rect x="55" y="35" width="20" height="5" />
              <rect x="35" y="55" width="5" height="25" />
              <rect x="55" y="55" width="20" height="20" />
              <rect x="15" y="45" width="5" height="10" />
              <rect x="75" y="35" width="15" height="15" />
            </svg>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{`transitops://fleet/verify/${qrCodeData}`}</span>
          <p className="text-xs text-center text-slate-500">Scan code with TransitOps driver terminal to verify PUC/Fitness documents instantly.</p>
        </div>
      </Dialog>

      {/* ==================== OVERLAY DETAIL DRAWER ==================== */}
      {isDrawerOpen && activeVehicle && (
        <div className="fixed inset-0 z-40 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div onClick={closeDrawer} className="absolute inset-0 bg-slate-950/20 dark:bg-black/55 backdrop-blur-[1px] transition-opacity duration-300"></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-xl bg-card border-l shadow-premium-lg flex flex-col h-full animate-[slideLeft_0.2s_ease-out]">
            <style>{`
              @keyframes slideLeft {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{activeVehicle.id}</span>
                <h2 className="text-lg font-bold">{activeVehicle.name}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => { setQrCodeData(activeVehicle.id); setIsQrOpen(true); }}
                  className="p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  title="Generate QR code"
                >
                  <QrCode size={15} />
                </button>
                <button onClick={closeDrawer} className="p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto premium-scroll p-6 space-y-6">
              
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Registration Number</span>
                  <span className="text-sm font-semibold">{activeVehicle.regNumber}</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">VIN Code</span>
                  <span className="text-sm font-mono truncate block">{activeVehicle.vin}</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Odometer</span>
                  <span className="text-sm font-semibold">{formatOdometer(activeVehicle.odometer)}</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Load Capacity</span>
                  <span className="text-sm font-semibold">{formatCapacity(activeVehicle.loadCapacity)}</span>
                </div>
              </div>

              {/* Status & Assignment Box */}
              <Card>
                <CardHeader className="pb-3 border-b-0">
                  <CardTitle className="text-sm font-bold">Operational Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Asset Status:</span>
                    <Badge variant={
                      activeVehicle.status === 'Available' ? 'success' 
                      : activeVehicle.status === 'On Trip' ? 'info'
                      : activeVehicle.status === 'Maintenance' ? 'warning'
                      : 'default'
                    }>
                      {activeVehicle.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Operating Region:</span>
                    <span className="font-semibold">{activeVehicle.region}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Assigned Operator:</span>
                    <span className="font-semibold text-blue-650">
                      {activeVehicle.assignedDriverId ? drivers.find(d => d.id === activeVehicle.assignedDriverId)?.name : 'Unassigned'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Documents & Expiries */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Regulatory Documents</h3>
                <div className="space-y-2">
                  
                  {/* Insurance */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-blue-500" size={16} />
                      <div className="text-xs">
                        <span className="block font-semibold">Insurance Policy</span>
                        <span className="block text-[10px] text-muted-foreground">Expiry: {formatDate(activeVehicle.insuranceExpiry)}</span>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  {/* Fitness */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-emerald-500" size={16} />
                      <div className="text-xs">
                        <span className="block font-semibold">Fitness Certificate</span>
                        <span className="block text-[10px] text-muted-foreground">Expiry: {formatDate(activeVehicle.fitnessExpiry)}</span>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  {/* PUC */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-violet-500" size={16} />
                      <div className="text-xs">
                        <span className="block font-semibold">PUC Emission Certificate</span>
                        <span className="block text-[10px] text-muted-foreground">Expiry: {formatDate(activeVehicle.pucExpiry)}</span>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                </div>
              </div>

              {/* Service History Logs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Service History ({vehicleMaintenance.length})</h3>
                {vehicleMaintenance.length === 0 ? (
                  <div className="text-center py-6 border rounded-xl text-xs text-muted-foreground bg-slate-50/20">
                    No service records logged for this vehicle.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicleMaintenance.map(record => (
                      <div key={record.id} className="p-3 border rounded-xl bg-card space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold">{record.type}</span>
                          <Badge variant={record.status === 'Completed' ? 'success' : 'warning'}>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                          <span>{record.mechanicDetails}</span>
                          <span>{formatDate(record.startDate)}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-indigo-650 flex justify-between border-t border-slate-105/50 pt-1.5 mt-1.5">
                          <span>Cost incurred:</span>
                          <span>{formatCurrency(record.cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
