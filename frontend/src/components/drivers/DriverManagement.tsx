import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Plus, Eye, Edit2, Trash2, ShieldAlert, Star, 
  MapPin, Phone, Mail, Award, Download, Upload, FileCheck, X 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Driver } from '../../services/mockDb';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Select, Dialog } from '../ui/Primitives';
import { formatDate } from '../../utils/format';

export const DriverManagement: React.FC = () => {
  const { drivers, addDriver, updateDriver, deleteDriver, vehicles } = useSystemState();
  const { success, warning, info } = useToast();
  const { user } = useAuth();
  
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [safetyFilter, setSafetyFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dob: '1985-06-15',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    licenseNumber: '',
    licenseCategory: 'Class A CDL' as Driver['licenseCategory'],
    licenseExpiry: '2027-06-30',
    medicalCertExpiry: '2027-06-30',
    policeVerification: 'Verified' as Driver['policeVerification'],
    joiningDate: '2025-01-01',
    experience: 5
  });

  // Deep linking logic for profile view
  const activeDriverId = searchParams.get('id');
  const activeDriver = useMemo(() => {
    return drivers.find(d => d.id === activeDriverId) || null;
  }, [activeDriverId, drivers]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  useEffect(() => {
    if (activeDriverId) {
      setIsDrawerOpen(true);
    }
  }, [activeDriverId]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('id');
    setSearchParams(newParams);
  };

  // Filter & Query logic
  const filteredDrivers = useMemo(() => {
    let result = [...drivers];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.id.toLowerCase().includes(q) || 
        d.name.toLowerCase().includes(q) || 
        d.licenseNumber.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(d => d.status === statusFilter);
    }

    if (categoryFilter) {
      result = result.filter(d => d.licenseCategory === categoryFilter);
    }

    if (safetyFilter) {
      if (safetyFilter === 'high') result = result.filter(d => d.safetyScore >= 90);
      else if (safetyFilter === 'medium') result = result.filter(d => d.safetyScore >= 80 && d.safetyScore < 90);
      else if (safetyFilter === 'low') result = result.filter(d => d.safetyScore < 80);
    }

    return result;
  }, [drivers, search, statusFilter, categoryFilter, safetyFilter]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(start, start + itemsPerPage);
  }, [filteredDrivers, currentPage]);

  // Sync edit form fields
  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d);
    setFormData({
      name: d.name,
      dob: d.dob,
      phone: d.phone,
      email: d.email,
      address: d.address,
      emergencyContact: d.emergencyContact,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiry: d.licenseExpiry,
      medicalCertExpiry: d.medicalCertExpiry,
      policeVerification: d.policeVerification,
      joiningDate: d.joiningDate,
      experience: d.experience
    });
    setIsEditOpen(true);
  };

  // CRUD submits
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDriver(formData);
    success("New vehicle operator registered in database");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    updateDriver(editingDriver.id, formData);
    success(`Operator ${editingDriver.id} profile updated`);
    setIsEditOpen(false);
  };

  const handleDeleteTrigger = (id: string) => {
    setDriverToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!driverToDelete) return;
    const dInfo = drivers.find(d => d.id === driverToDelete);
    deleteDriver(driverToDelete);

    success(`Operator record ${driverToDelete} deleted`, () => {
      if (dInfo) {
        addDriver(dInfo);
        success(`Reinstated driver record ${driverToDelete}`);
      }
    });

    setIsConfirmDeleteOpen(false);
    setDriverToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dob: '1985-06-15',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      licenseNumber: '',
      licenseCategory: 'Class A CDL',
      licenseExpiry: '2027-06-30',
      medicalCertExpiry: '2027-06-30',
      policeVerification: 'Verified',
      joiningDate: '2025-01-01',
      experience: 5
    });
  };

  // Simulated Document actions
  const handleDocDownload = (docName: string) => {
    info(`Downloading ${docName} verification PDF...`);
  };

  const handleDocUpload = (docName: string) => {
    info(`Select verification file to upload for ${docName}...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Driver Management</h1>
          <p className="text-sm text-muted-foreground">Monitor safety scores, licensing validity, and verification protocols.</p>
        </div>
        <div className="flex items-center space-x-2">
          {(user?.role === 'Super Admin' || user?.role === 'Dispatcher' || user?.role === 'Fleet Manager') && (
            <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="flex items-center space-x-1.5">
              <Plus size={15} />
              <span>Register Operator</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-4 shadow-premium-subtle">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              placeholder="Search by name, ID, or license number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-32 text-xs">
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </Select>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-32 text-xs">
              <option value="">All Licenses</option>
              <option value="Class A CDL">Class A CDL</option>
              <option value="Class B CDL">Class B CDL</option>
              <option value="Class C">Class C</option>
            </Select>
            <Select value={safetyFilter} onChange={(e) => setSafetyFilter(e.target.value)} className="w-full sm:w-36 text-xs">
              <option value="">Safety Score Rank</option>
              <option value="high">Elite Safety (&ge;90)</option>
              <option value="medium">Standard (80-89)</option>
              <option value="low">Warning (&lt;80)</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Main operator directory list */}
      {paginatedDrivers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <ShieldAlert size={36} className="text-slate-350 dark:text-zinc-700 mb-2" />
          <h3 className="font-semibold text-sm">No Operators Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">Refine filters or check spelling to find matching driver records.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedDrivers.map(d => {
            const currentVehicle = vehicles.find(v => v.id === d.currentVehicleId);
            return (
              <Card key={d.id} className="hover:shadow-premium-lg transition duration-200 group">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${d.name}`}
                      alt={d.name}
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900"
                    />
                    <div className="truncate flex-1">
                      <span className="block text-[9px] font-mono font-bold text-muted-foreground">{d.id}</span>
                      <h3 className="font-bold text-sm tracking-tight truncate group-hover:text-blue-650 transition">{d.name}</h3>
                      <span className="text-[10px] text-muted-foreground">{d.licenseCategory} • Exp: {d.experience}y</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-b border-slate-105/50 dark:border-slate-800/40 py-2.5">
                    <Badge variant={
                      d.status === 'Available' ? 'success' 
                      : d.status === 'On Trip' ? 'info'
                      : d.status === 'Suspended' ? 'error'
                      : 'default'
                    }>
                      {d.status}
                    </Badge>
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <Star size={12} className="fill-current mr-1 text-amber-500" />
                      <span>{d.safetyScore} Safety</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1.5">
                      <Phone size={12} />
                      <span>{d.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail size={12} />
                      <span className="truncate">{d.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-105/50 dark:border-slate-800/40 pt-3 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block max-w-[120px] truncate">
                      {currentVehicle ? currentVehicle.regNumber : 'No vehicle'}
                    </span>
                    
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={() => setSearchParams({ id: d.id })}
                        className="p-1 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Profile Drawer"
                      >
                        <Eye size={12} />
                      </button>
                      {(user?.role === 'Super Admin' || user?.role === 'Dispatcher' || user?.role === 'Fleet Manager') && (
                        <>
                          <button 
                            onClick={() => handleOpenEdit(d)}
                            className="p-1 rounded-md border text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >
                            <Edit2 size={12} />
                          </button>
                          {user?.role === 'Super Admin' && (
                            <button 
                              onClick={() => handleDeleteTrigger(d.id)}
                              className="p-1 rounded-md border text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs mt-4">
          <span className="text-muted-foreground">Showing page {currentPage} of {totalPages} ({filteredDrivers.length} records)</span>
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

      {/* --- ADD OPERATOR DIALOG --- */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Driver Operator"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit}>Submit Registration</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleAddSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Full Name</label>
            <Input 
              required 
              placeholder="E.g. Richard Hammond"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">License Number</label>
              <Input 
                required 
                placeholder="DL-82910398"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">License Category</label>
              <Select 
                value={formData.licenseCategory}
                onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value as Driver['licenseCategory'] })}
              >
                <option value="Class A CDL">Class A CDL (Heavy)</option>
                <option value="Class B CDL">Class B CDL (Medium)</option>
                <option value="Class C">Class C (Light/Car)</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Phone Contact</label>
              <Input 
                required 
                placeholder="+1 555-0129"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email Address</label>
              <Input 
                type="email"
                required 
                placeholder="richard@transitops.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Residential Address</label>
            <Input 
              required 
              placeholder="123 Logistics Ave, Chicago IL"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">License Expiry</label>
              <Input 
                type="date"
                required
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Medical Cert Expiry</label>
              <Input 
                type="date"
                required
                value={formData.medicalCertExpiry}
                onChange={(e) => setFormData({ ...formData, medicalCertExpiry: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Dialog>

      {/* --- EDIT OPERATOR DIALOG --- */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Operator ${editingDriver?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Profile</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Full Name</label>
            <Input 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Phone Contact</label>
              <Input 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email Address</label>
              <Input 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Dialog>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <Dialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Confirm Driver Record Deletion"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>Remove Operator</Button>
          </>
        }
      >
        <p className="text-sm">Are you sure you want to remove and erase driver <span className="font-bold">{driverToDelete}</span> from the fleet database?</p>
        <p className="text-xs text-rose-500 font-semibold mt-2">This updates local mock state. An undo toast is provided after completion.</p>
      </Dialog>

      {/* ==================== PROFILE DRAWER OVERLAY ==================== */}
      {isDrawerOpen && activeDriver && (
        <div className="fixed inset-0 z-40 overflow-hidden flex justify-end">
          <div onClick={closeDrawer} className="absolute inset-0 bg-slate-950/20 dark:bg-black/55 backdrop-blur-[1px] transition-opacity duration-300"></div>
          
          <div className="relative w-full max-w-xl bg-card border-l shadow-premium-lg flex flex-col h-full animate-[slideLeft_0.2s_ease-out]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${activeDriver.name}`}
                  alt={activeDriver.name}
                  className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900"
                />
                <div>
                  <span className="text-xs font-mono text-muted-foreground">{activeDriver.id}</span>
                  <h2 className="text-lg font-bold">{activeDriver.name}</h2>
                </div>
              </div>
              <button onClick={closeDrawer} className="p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <X size={15} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto premium-scroll p-6 space-y-6">
              
              {/* Score indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10 text-center">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Safety Score</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{activeDriver.safetyScore} / 100</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10 text-center">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Experience</span>
                  <span className="text-lg font-bold">{activeDriver.experience} years</span>
                </div>
                <div className="border rounded-xl p-3 bg-slate-50/50 dark:bg-zinc-900/10 text-center">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Duty Status</span>
                  <span className="block mt-1">
                    <Badge variant={activeDriver.status === 'Available' ? 'success' : activeDriver.status === 'On Trip' ? 'info' : 'default'} className="text-[9px]">
                      {activeDriver.status}
                    </Badge>
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <Card>
                <CardHeader className="pb-3 border-b-0">
                  <CardTitle className="text-sm font-bold">Driver Coordinates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-semibold">{formatDate(activeDriver.dob)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emergency Contact:</span>
                    <span className="font-semibold">{activeDriver.emergencyContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Residential Address:</span>
                    <span className="font-semibold text-right max-w-xs">{activeDriver.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Joined:</span>
                    <span className="font-semibold">{formatDate(activeDriver.joiningDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assigned Truck ID:</span>
                    <span className="font-semibold font-mono text-xs">{activeDriver.currentVehicleId || 'None'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Documents Hub */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Operator Certifications</h3>
                <div className="space-y-2">
                  
                  {/* CDL License */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="text-blue-500" size={16} />
                      <div className="text-xs">
                        <span className="block font-semibold">Commercial CDL License</span>
                        <span className="block text-[10px] text-muted-foreground">No: {activeDriver.licenseNumber} • Exp: {formatDate(activeDriver.licenseExpiry)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => handleDocDownload('CDL License')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <Download size={13} className="text-slate-500" />
                      </button>
                      <button onClick={() => handleDocUpload('CDL License')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <Upload size={13} className="text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Medical Cert */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="text-emerald-500" size={16} />
                      <div className="text-xs">
                        <span className="block font-semibold">Medical Certification File</span>
                        <span className="block text-[10px] text-muted-foreground">Exp: {formatDate(activeDriver.medicalCertExpiry)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => handleDocDownload('Medical Cert')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <Download size={13} className="text-slate-500" />
                      </button>
                      <button onClick={() => handleDocUpload('Medical Cert')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <Upload size={13} className="text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Police Verification */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="text-violet-500" size={16} />
                      <div className="text-xs">
                        <span className="block font-semibold">Police Clearance Certificate</span>
                        <span className="block text-[10px] text-muted-foreground">Status: Verified</span>
                      </div>
                    </div>
                    <Badge variant={activeDriver.policeVerification === 'Verified' ? 'success' : 'warning'}>
                      {activeDriver.policeVerification}
                    </Badge>
                  </div>

                </div>
              </div>

              {/* Operator Timeline events */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Operator Log Timeline</h3>
                <div className="border-l border-slate-205 dark:border-slate-800 pl-4 ml-2 space-y-4 text-xs">
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white border-2 border-card"></div>
                    <span className="block font-semibold">Shift Activated</span>
                    <span className="block text-[10px] text-muted-foreground">Today, 08:30 AM • System Terminal</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-zinc-700 border-2 border-card"></div>
                    <span className="block font-semibold">Pre-Trip Inspection Verified</span>
                    <span className="block text-[10px] text-muted-foreground">Today, 08:45 AM • Mobile App</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-zinc-700 border-2 border-card"></div>
                    <span className="block font-semibold">Assigned trip dispatch TRP-2022</span>
                    <span className="block text-[10px] text-muted-foreground">Yesterday, 11:20 AM • Elena Rostova</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
