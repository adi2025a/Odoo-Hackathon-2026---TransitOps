import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Vehicle, Driver, Trip, FuelLog, Expense, MaintenanceRecord, Notification } from '../services/mockDb';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StateContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
  loading: boolean;
  
  // Vehicles CRUD
  addVehicle: (v: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'photoColor'>) => Promise<void>;
  updateVehicle: (id: string, v: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // Drivers CRUD
  addDriver: (d: Omit<Driver, 'id' | 'status' | 'currentVehicleId' | 'safetyScore'>) => Promise<void>;
  updateDriver: (id: string, d: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  
  // Trips CRUD
  addTrip: (t: Omit<Trip, 'id' | 'status' | 'timeline'>) => Promise<void>;
  updateTripStatus: (id: string, status: Trip['status'], completionData?: Trip['completionData']) => Promise<void>;
  cancelTrip: (id: string) => Promise<void>;
  
  // Maintenance CRUD
  addMaintenanceRecord: (r: Omit<MaintenanceRecord, 'id'>) => Promise<void>;
  updateMaintenanceRecord: (id: string, r: Partial<MaintenanceRecord>) => Promise<void>;
  
  // Fuel Logs CRUD
  addFuelLog: (l: Omit<FuelLog, 'id'>) => Promise<void>;
  
  // Expenses CRUD
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>;
  
  // Notifications CRUD
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'date'>) => Promise<void>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

// Helper mapper to convert MongoDB _id to frontend component expected id
const mapItem = <T extends { _id?: string; id?: string }>(item: T): T & { id: string } => {
  return {
    ...item,
    id: item._id || item.id || '',
  } as T & { id: string };
};

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // General wrapper for authenticated API requests
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    if (!token) throw new Error("Not authenticated");
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'API Request failed');
    }
    return data.data;
  };

  // Load all dashboard collections from the Node.js backend
  const loadBackendData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [vData, dData, tData, fData, eData, mData, nData] = await Promise.all([
        apiRequest('/vehicles?limit=1000'),
        apiRequest('/drivers?limit=1000'),
        apiRequest('/trips?limit=1000'),
        apiRequest('/fuel?limit=1000'),
        apiRequest('/expenses?limit=1000'),
        apiRequest('/maintenance?limit=1000'),
        apiRequest('/notifications?limit=1000')
      ]);

      setVehicles((vData || []).map(mapItem));
      setDrivers((dData || []).map(mapItem));
      setTrips((tData || []).map(mapItem));
      setFuelLogs((fData || []).map(mapItem));
      setExpenses((eData || []).map(mapItem));
      setMaintenanceRecords((mData || []).map(mapItem));
      setNotifications((nData || []).map(mapItem));
    } catch (e) {
      console.error("Failed to fetch dashboard data from server:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadBackendData();
    } else {
      // Clear data on logout
      setVehicles([]);
      setDrivers([]);
      setTrips([]);
      setFuelLogs([]);
      setExpenses([]);
      setMaintenanceRecords([]);
      setNotifications([]);
    }
  }, [isAuthenticated, token]);

  // --- VEHICLES CRUD ---
  const addVehicle = async (v: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'photoColor'>) => {
    const nextNum = vehicles.length + 1;
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-violet-500', 'bg-cyan-500', 'bg-amber-500', 'bg-orange-500'];
    const payload = {
      id: `VEH-${1000 + nextNum}`,
      ...v,
      photoColor: colors[nextNum % colors.length]
    };
    const created = await apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setVehicles(prev => [mapItem(created), ...prev]);
  };

  const updateVehicle = async (id: string, updatedFields: Partial<Vehicle>) => {
    const updated = await apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    setVehicles(prev => prev.map(v => v.id === id ? mapItem(updated) : v));
  };

  const deleteVehicle = async (id: string) => {
    await apiRequest(`/vehicles/${id}`, {
      method: 'DELETE',
    });
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'Retired' } : v));
  };

  // --- DRIVERS CRUD ---
  const addDriver = async (d: Omit<Driver, 'id' | 'status' | 'currentVehicleId' | 'safetyScore'>) => {
    const nextNum = drivers.length + 1;
    const payload = {
      id: `DRV-${1000 + nextNum}`,
      ...d,
      safetyScore: 90
    };
    const created = await apiRequest('/drivers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setDrivers(prev => [mapItem(created), ...prev]);
  };

  const updateDriver = async (id: string, updatedFields: Partial<Driver>) => {
    const updated = await apiRequest(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    setDrivers(prev => prev.map(d => d.id === id ? mapItem(updated) : d));
  };

  const deleteDriver = async (id: string) => {
    await apiRequest(`/drivers/${id}`, {
      method: 'DELETE',
    });
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  // --- TRIPS CRUD ---
  const addTrip = async (t: Omit<Trip, 'id' | 'status' | 'timeline'>) => {
    const nextNum = trips.length + 1;
    const payload = {
      id: `TRP-${2000 + nextNum}`,
      ...t,
      status: 'Dispatched',
    };
    const created = await apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Refresh all state to accurately reflect vehicle status and driver status changes
    await loadBackendData();
  };

  const updateTripStatus = async (id: string, status: Trip['status'], completionData?: Trip['completionData']) => {
    await apiRequest(`/trips/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, completionData }),
    });
    
    // Refresh state to reflect trip, vehicle, driver, and expense log updates
    await loadBackendData();
  };

  const cancelTrip = async (id: string) => {
    await updateTripStatus(id, 'Cancelled');
  };

  // --- MAINTENANCE CRUD ---
  const addMaintenanceRecord = async (r: Omit<MaintenanceRecord, 'id'>) => {
    const nextNum = maintenanceRecords.length + 1;
    const payload = {
      id: `MNT-${5000 + nextNum}`,
      ...r,
    };
    await apiRequest('/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    await loadBackendData();
  };

  const updateMaintenanceRecord = async (id: string, updatedFields: Partial<MaintenanceRecord>) => {
    await apiRequest(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    
    await loadBackendData();
  };

  // --- FUEL LOGS CRUD ---
  const addFuelLog = async (l: Omit<FuelLog, 'id'>) => {
    const nextNum = fuelLogs.length + 1;
    const payload = {
      id: `FUL-${3000 + nextNum}`,
      ...l,
    };
    await apiRequest('/fuel', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    await loadBackendData();
  };

  // --- EXPENSES CRUD ---
  const addExpense = async (e: Omit<Expense, 'id'>) => {
    const nextNum = expenses.length + 1;
    const payload = {
      id: `EXP-${4000 + nextNum}`,
      ...e,
    };
    await apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    await loadBackendData();
  };

  // --- NOTIFICATIONS CRUD ---
  const markNotificationRead = async (id: string) => {
    await apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    await apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'read' | 'date'>) => {
    const nextNum = notifications.length + 1;
    const payload = {
      id: `NTF-${6000 + nextNum}`,
      ...n,
    };
    const created = await apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setNotifications(prev => [mapItem(created), ...prev]);
  };

  return (
    <StateContext.Provider 
      value={{
        vehicles,
        drivers,
        trips,
        fuelLogs,
        expenses,
        maintenanceRecords,
        notifications,
        loading,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addTrip,
        updateTripStatus,
        cancelTrip,
        addMaintenanceRecord,
        updateMaintenanceRecord,
        addFuelLog,
        addExpense,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useSystemState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useSystemState must be used within a StateProvider');
  }
  return context;
};
