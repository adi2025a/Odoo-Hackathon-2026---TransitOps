import React, { useState, useMemo } from 'react';
import { 
  FolderClosed, Upload, Search, Download, Eye, Plus, 
  FileCheck, FileText, AlertTriangle, ShieldCheck, X, ShieldAlert 
} from 'lucide-react';
import { useSystemState } from '../../contexts/StateContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Dialog } from '../ui/Primitives';
import { formatDate } from '../../utils/format';

interface DocumentItem {
  id: string;
  name: string;
  category: 'Vehicle' | 'Driver';
  mappedEntity: string; // e.g. VEH-1022, DRV-1008
  expiryDate: string;
  status: 'Active' | 'Renewal Due' | 'Expired';
}

export const Documents: React.FC = () => {
  const { vehicles, drivers } = useSystemState();
  const { success, info, error } = useToast();
  const { user } = useAuth();

  // Local state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Form upload state
  const [formData, setFormData] = useState({
    name: 'PUC Certificate',
    category: 'Vehicle' as 'Vehicle' | 'Driver',
    mappedEntity: '',
    expiryDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]
  });

  // Reconcile dynamic document list from vehicles and drivers expiries
  const documentList = useMemo(() => {
    const list: DocumentItem[] = [];

    // Gather from vehicles
    vehicles.slice(0, 30).forEach(v => {
      // Insurance
      list.push({
        id: `DOC-V-INS-${v.id}`,
        name: 'Commercial Liability Insurance',
        category: 'Vehicle',
        mappedEntity: v.id,
        expiryDate: v.insuranceExpiry,
        status: new Date(v.insuranceExpiry) < new Date() ? 'Expired' : 'Active'
      });
      // Fitness
      list.push({
        id: `DOC-V-FIT-${v.id}`,
        name: 'State Vehicle Fitness Certificate',
        category: 'Vehicle',
        mappedEntity: v.id,
        expiryDate: v.fitnessExpiry,
        status: new Date(v.fitnessExpiry) < new Date() ? 'Expired' : 'Active'
      });
      // PUC
      list.push({
        id: `DOC-V-PUC-${v.id}`,
        name: 'PUC Emission Compliance Card',
        category: 'Vehicle',
        mappedEntity: v.id,
        expiryDate: v.pucExpiry,
        status: new Date(v.pucExpiry) < new Date() ? 'Expired' : 'Active'
      });
    });

    // Gather from drivers
    drivers.slice(0, 30).forEach(d => {
      // CDL
      list.push({
        id: `DOC-D-CDL-${d.id}`,
        name: 'Commercial CDL Operator License',
        category: 'Driver',
        mappedEntity: d.id,
        expiryDate: d.licenseExpiry,
        status: new Date(d.licenseExpiry) < new Date() ? 'Expired' : 'Active'
      });
      // Medical
      list.push({
        id: `DOC-D-MED-${d.id}`,
        name: 'DOT Medical Examination Cert',
        category: 'Driver',
        mappedEntity: d.id,
        expiryDate: d.medicalCertExpiry,
        status: new Date(d.medicalCertExpiry) < new Date() ? 'Expired' : 'Active'
      });
    });

    return list;
  }, [vehicles, drivers]);

  // Filters
  const filteredDocs = useMemo(() => {
    let result = [...documentList];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.mappedEntity.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter(d => d.category === categoryFilter);
    }

    if (statusFilter) {
      result = result.filter(d => d.status === statusFilter);
    }

    return result;
  }, [documentList, search, categoryFilter, statusFilter]);

  // Upload handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mappedEntity) {
      error("Entity mapping is required");
      return;
    }
    success(`Document '${formData.name}' uploaded and mapped to ${formData.mappedEntity}`);
    setIsUploadOpen(false);
  };

  const triggerDownload = (id: string) => {
    info(`Initiating secure download of ${id}.pdf...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Regulatory Vault</h1>
          <p className="text-sm text-muted-foreground">Monitor compliance credentials, PUC emission checks, and CDL validity.</p>
        </div>
        <div className="flex items-center space-x-2">
          {(user?.role === 'Super Admin' || user?.role === 'Fleet Manager' || user?.role === 'Safety Officer') && (
            <Button onClick={() => setIsUploadOpen(true)} className="flex items-center space-x-1.5 shadow-premium">
              <Upload size={15} />
              <span>Upload Document</span>
            </Button>
          )}
        </div>
      </div>

      {/* --- INDEX FILTER BAR --- */}
      <Card className="p-4 shadow-premium-subtle">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              placeholder="Search by Document Name, Vehicle ID, Operator ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs bg-card">
              <option value="">All Categories</option>
              <option value="Vehicle">Vehicle Docs</option>
              <option value="Driver">Operator Docs</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs bg-card">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Renewal Due">Renewal Due</option>
              <option value="Expired">Expired</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- GRID: DOCUMENTS VAULT INDEX --- */}
      {filteredDocs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <ShieldAlert size={36} className="text-slate-350 dark:text-zinc-700 mb-2" />
          <h3 className="font-semibold text-sm">Vault Clear</h3>
          <p className="text-xs text-muted-foreground mt-1">No documents matched search criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.slice(0, 36).map(doc => (
            <Card key={doc.id} className="hover:shadow-premium-lg transition duration-200 group">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-zinc-900 border flex items-center justify-center text-slate-500">
                    <FileText size={18} />
                  </div>
                  <Badge variant={doc.status === 'Expired' ? 'error' : doc.status === 'Renewal Due' ? 'warning' : 'success'}>
                    {doc.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-sm leading-snug group-hover:text-blue-650 transition truncate">{doc.name}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-1">
                    <span className="font-semibold font-mono">{doc.mappedEntity}</span>
                    <span>•</span>
                    <span>{doc.category} Document</span>
                  </div>
                </div>

                <div className="border-t border-slate-105/50 dark:border-slate-800/40 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Expiry Date</span>
                    <span className={`font-semibold ${doc.status === 'Expired' ? 'text-rose-500' : 'text-slate-700 dark:text-zinc-350'}`}>
                      {formatDate(doc.expiryDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    <button 
                      onClick={() => { setPreviewDoc(doc); setIsPreviewOpen(true); }}
                      className="p-1.5 rounded-lg border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title="Preview Document"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      onClick={() => triggerDownload(doc.id)}
                      className="p-1.5 rounded-lg border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title="Download PDF"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- UPLOAD CERTIFICATE DIALOG --- */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Compliance Certificate"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadSubmit}>Secure Upload</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleUploadSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Document Title</label>
            <Input 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Associated Asset ID</label>
              <Input 
                required
                placeholder="E.g. VEH-1022 or DRV-1008"
                value={formData.mappedEntity}
                onChange={(e) => setFormData({ ...formData, mappedEntity: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Asset Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Vehicle' | 'Driver' })}
              >
                <option value="Vehicle">Vehicle Asset</option>
                <option value="Driver">Operator Profile</option>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Document Expiry Date</label>
            <Input 
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>
          
          {/* Simulated File Drag area */}
          <div className="border border-dashed rounded-xl p-6 text-center text-xs text-slate-500 bg-slate-50/50 dark:bg-zinc-900/10">
            <Upload className="mx-auto text-slate-400 mb-2" size={24} />
            <p className="font-semibold text-slate-700 dark:text-zinc-300">Drag & Drop certificate files</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, PNG, JPG up to 10MB</p>
          </div>
        </form>
      </Dialog>

      {/* --- PREVIEW DOCUMENT DIALOG --- */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => { setIsPreviewOpen(false); setPreviewDoc(null); }}
        title={`Preview: ${previewDoc?.id}`}
      >
        {previewDoc && (
          <div className="space-y-6">
            <div className="border-4 border-slate-900 dark:border-white p-6 bg-white text-slate-900 font-sans min-h-[300px] flex flex-col justify-between shadow-premium-lg">
              
              {/* Header Certificate */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h2 className="text-sm font-extrabold tracking-widest uppercase">TransitOps Regulatory Vault</h2>
                <h1 className="text-base font-black uppercase mt-1">Certificate of Compliance Verification</h1>
              </div>

              {/* Body credentials */}
              <div className="py-6 space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-450">Document Name</span>
                  <span className="font-semibold">{previewDoc.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-450">Associated ID</span>
                    <span className="font-semibold">{previewDoc.mappedEntity}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-450">Expiration Horizon</span>
                    <span className="font-semibold">{formatDate(previewDoc.expiryDate)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-normal italic">
                  This document serves as an audited compliance validation matching the state regulations. Digital stamp is verified by the TransitOps secure validator.
                </p>
              </div>

              {/* Stamp & Signatures footer */}
              <div className="flex items-center justify-between border-t-2 border-slate-900 pt-4 text-[10px] uppercase font-bold text-slate-700">
                <div className="flex items-center text-emerald-700">
                  <ShieldCheck size={14} className="mr-1" />
                  <span>Verified Authenticity</span>
                </div>
                <span>Secured Sandbox Authority</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => { setIsPreviewOpen(false); setPreviewDoc(null); }}>
                Close Preview
              </Button>
              <Button onClick={() => triggerDownload(previewDoc.id)}>
                <Download size={14} className="mr-1.5" /> Download copy
              </Button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
};
