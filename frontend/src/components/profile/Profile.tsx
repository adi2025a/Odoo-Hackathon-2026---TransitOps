import React, { useMemo } from 'react';
import { 
  User, Shield, Award, Calendar, Phone, Mail, 
  MapPin, Truck, AlertCircle, FileCheck, Star 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemState } from '../../contexts/StateContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '../ui/Primitives';
import { formatDate } from '../../utils/format';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { drivers, vehicles } = useSystemState();

  // If driver user, fetch their linked profile record
  const driverProfile = useMemo(() => {
    if (!user || user.role !== 'Driver') return null;
    return drivers.find(d => d.id === user.driverId) || null;
  }, [user, drivers]);

  const assignedVehicle = useMemo(() => {
    if (!driverProfile) return null;
    return vehicles.find(v => v.id === driverProfile.currentVehicleId) || null;
  }, [driverProfile, vehicles]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">User Profile</h1>
        <p className="text-sm text-muted-foreground">Manage personal contact coordinates and check security roles.</p>
      </div>

      {/* --- GRID 1: CORE PROFILE INFORMATION --- */}
      <Card className="shadow-premium-subtle">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <img 
              src={user?.avatar}
              alt={user?.name}
              className="w-20 h-20 rounded-full border-2 border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900"
            />
            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-905 dark:text-slate-50">{user?.name}</h2>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <div>
                  <Badge variant="info" className="text-xs font-semibold px-3 py-1">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center"><Shield size={13} className="mr-1.5" /> Security Clearance: L3</span>
                <span className="flex items-center"><Calendar size={13} className="mr-1.5" /> Session Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- DYNAMIC RENDER: DRIVER LOGS PROFILE --- */}
      {driverProfile && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Driver Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center shadow-premium-subtle">
              <CardContent className="p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety Score</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1.5 flex items-center justify-center">
                  <Star size={16} className="fill-current text-amber-500 mr-1" />
                  {driverProfile.safetyScore}
                </span>
              </CardContent>
            </Card>
            <Card className="text-center shadow-premium-subtle">
              <CardContent className="p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience CDL</span>
                <span className="text-2xl font-bold block mt-1.5">{driverProfile.experience} years</span>
              </CardContent>
            </Card>
            <Card className="text-center shadow-premium-subtle">
              <CardContent className="p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Duty Status</span>
                <span className="block mt-2">
                  <Badge variant="success">{driverProfile.status}</Badge>
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Assigned truck Details */}
          <Card className="shadow-premium-subtle">
            <CardHeader>
              <CardTitle>Assigned Fleet Asset</CardTitle>
              <CardDescription>Details of the heavy vehicle registered to your daily operational log</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedVehicle ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-zinc-800 border flex items-center justify-center text-blue-500">
                      <Truck size={18} />
                    </div>
                    <div>
                      <span className="font-bold block">{assignedVehicle.name}</span>
                      <span className="text-xs text-muted-foreground">{assignedVehicle.regNumber} • {assignedVehicle.type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Odometer</span>
                    <span className="font-semibold font-mono">{assignedVehicle.odometer.toLocaleString()} km</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-500 italic">
                  No active vehicle assigned. Inspect dispatch logs.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Licenses checklist compliance */}
          <Card className="shadow-premium-subtle">
            <CardHeader>
              <CardTitle>Operator Certifications & Compliance</CardTitle>
              <CardDescription>Regulatory expiry trackers for license and medical examinations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                <div className="flex items-center space-x-3">
                  <FileCheck className="text-blue-500" size={16} />
                  <div>
                    <span className="font-bold block text-xs">CDL Operator License</span>
                    <span className="text-[10px] text-muted-foreground block">No: {driverProfile.licenseNumber}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold block">Expires</span>
                  <span className="text-[10px] text-muted-foreground block">{formatDate(driverProfile.licenseExpiry)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                <div className="flex items-center space-x-3">
                  <FileCheck className="text-emerald-500" size={16} />
                  <div>
                    <span className="font-bold block text-xs">DOT Medical Certificate</span>
                    <span className="text-[10px] text-muted-foreground block">Active status</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold block">Expires</span>
                  <span className="text-[10px] text-muted-foreground block">{formatDate(driverProfile.medicalCertExpiry)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Admin detail box */}
      {!driverProfile && (
        <Card className="shadow-premium-subtle">
          <CardHeader>
            <CardTitle>Security Console Credentials</CardTitle>
            <CardDescription>System access permissions associated with your administrator login</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Authentication Authority:</span>
              <span className="font-semibold">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Ledger Actions Mapped:</span>
              <span className="font-semibold text-emerald-650">Create, Read, Edit records</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Local Session Seed:</span>
              <span className="font-mono text-xs">transitops-auth-cookie-L3</span>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
