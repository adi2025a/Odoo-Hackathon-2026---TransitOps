import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateMockData, Vehicle, Driver, Trip, FuelLog, Expense, MaintenanceRecord, Notification } from '../services/mockDb';

interface StateContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
  
  // Vehicles CRUD
  addVehicle: (v: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'photoColor'>) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  // Drivers CRUD
  addDriver: (d: Omit<Driver, 'id' | 'status' | 'currentVehicleId' | 'safetyScore'>) => void;
  updateDriver: (id: string, d: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  
  // Trips CRUD
  addTrip: (t: Omit<Trip, 'id' | 'status' | 'timeline'>) => void;
  updateTripStatus: (id: string, status: Trip['status'], completionData?: Trip['completionData']) => void;
  cancelTrip: (id: string) => void;
  
  // Maintenance CRUD
  addMaintenanceRecord: (r: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceRecord: (id: string, r: Partial<MaintenanceRecord>) => void;
  
  // Fuel Logs CRUD
  addFuelLog: (l: Omit<FuelLog, 'id'>) => void;
  
  // Expenses CRUD
  addExpense: (e: Omit<Expense, 'id'>) => void;
  
  // Notifications CRUD
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'date'>) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load or generate initial seed data
  useEffect(() => {
    const savedData = localStorage.getItem('transitops-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setVehicles(parsed.vehicles || []);
        setDrivers(parsed.drivers || []);
        setTrips(parsed.trips || []);
        setFuelLogs(parsed.fuelLogs || []);
        setExpenses(parsed.expenses || []);
        setMaintenanceRecords(parsed.maintenanceRecords || []);
        setNotifications(parsed.notifications || []);
      } catch (e) {
        console.error("Failed to parse local storage, regenerating data", e);
        const data = generateMockData();
        saveAndSet(data);
      }
    } else {
      const data = generateMockData();
      saveAndSet(data);
    }
  }, []);

  const saveAndSet = (data: {
    vehicles: Vehicle[];
    drivers: Driver[];
    trips: Trip[];
    fuelLogs: FuelLog[];
    expenses: Expense[];
    maintenanceRecords: MaintenanceRecord[];
    notifications: Notification[];
  }) => {
    setVehicles(data.vehicles);
    setDrivers(data.drivers);
    setTrips(data.trips);
    setFuelLogs(data.fuelLogs);
    setExpenses(data.expenses);
    setMaintenanceRecords(data.maintenanceRecords);
    setNotifications(data.notifications);
    localStorage.setItem('transitops-data', JSON.stringify(data));
  };

  // Persist triggers on any state change
  const saveState = (
    vList = vehicles, 
    dList = drivers, 
    tList = trips, 
    fList = fuelLogs, 
    eList = expenses, 
    mList = maintenanceRecords, 
    nList = notifications
  ) => {
    localStorage.setItem('transitops-data', JSON.stringify({
      vehicles: vList,
      drivers: dList,
      trips: tList,
      fuelLogs: fList,
      expenses: eList,
      maintenanceRecords: mList,
      notifications: nList
    }));
  };

  // --- VEHICLES CRUD ---
  const addVehicle = (v: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'photoColor'>) => {
    const newId = `VEH-${1000 + vehicles.length + 1}`;
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-violet-500', 'bg-cyan-500', 'bg-amber-500', 'bg-orange-500'];
    const newVehicle: Vehicle = {
      ...v,
      id: newId,
      status: 'Available',
      assignedDriverId: null,
      photoColor: colors[Math.floor(Math.random() * colors.length)]
    };
    const updated = [newVehicle, ...vehicles];
    setVehicles(updated);
    saveState(updated);
  };

  const updateVehicle = (id: string, updatedFields: Partial<Vehicle>) => {
    const updated = vehicles.map(v => v.id === id ? { ...v, ...updatedFields } : v);
    setVehicles(updated);
    saveState(updated);
  };

  const deleteVehicle = (id: string) => {
    const updated = vehicles.filter(v => v.id !== id);
    setVehicles(updated);
    saveState(updated);
  };

  // --- DRIVERS CRUD ---
  const addDriver = (d: Omit<Driver, 'id' | 'status' | 'currentVehicleId' | 'safetyScore'>) => {
    const newId = `DRV-${1000 + drivers.length + 1}`;
    const newDriver: Driver = {
      ...d,
      id: newId,
      status: 'Available',
      safetyScore: 95, // default starting score
      currentVehicleId: null
    };
    const updated = [newDriver, ...drivers];
    setDrivers(updated);
    saveState(undefined, updated);
  };

  const updateDriver = (id: string, updatedFields: Partial<Driver>) => {
    const updated = drivers.map(d => d.id === id ? { ...d, ...updatedFields } : d);
    setDrivers(updated);
    saveState(undefined, updated);
  };

  const deleteDriver = (id: string) => {
    const updated = drivers.filter(d => d.id !== id);
    setDrivers(updated);
    saveState(undefined, updated);
  };

  // --- TRIPS CRUD ---
  const addTrip = (t: Omit<Trip, 'id' | 'status' | 'timeline'>) => {
    const newId = `TRP-${2000 + trips.length + 1}`;
    const newTrip: Trip = {
      ...t,
      id: newId,
      status: 'Dispatched', // Auto dispatch when wizard submits
      timeline: [
        {
          time: new Date().toISOString(),
          title: 'Trip Dispatched',
          description: `Trip scheduled from ${t.source} to ${t.destination}`
        }
      ]
    };

    // Update vehicle and driver status immediately to 'On Trip'
    const updatedVehicles = vehicles.map(v => v.id === t.vehicleId ? { ...v, status: 'On Trip' as const, assignedDriverId: t.driverId } : v);
    const updatedDrivers = drivers.map(d => d.id === t.driverId ? { ...d, status: 'On Trip' as const, currentVehicleId: t.vehicleId } : d);
    const updatedTrips = [newTrip, ...trips];

    setVehicles(updatedVehicles);
    setDrivers(updatedDrivers);
    setTrips(updatedTrips);
    
    // Add expense record for the cargo dispatcher if any tolls/fees are standard
    saveState(updatedVehicles, updatedDrivers, updatedTrips);
  };

  const updateTripStatus = (id: string, status: Trip['status'], completionData?: Trip['completionData']) => {
    const tripToUpdate = trips.find(t => t.id === id);
    if (!tripToUpdate) return;

    let updatedVehicles = [...vehicles];
    let updatedDrivers = [...drivers];
    let updatedFuelLogs = [...fuelLogs];
    let updatedExpenses = [...expenses];

    const updatedTrips = trips.map(t => {
      if (t.id === id) {
        const events = [...t.timeline];
        events.push({
          time: new Date().toISOString(),
          title: status,
          description: status === 'Completed' 
            ? `Trip completed. final odometer: ${completionData?.finalOdometer}km.`
            : `Trip status changed to ${status}`
        });

        // Reconcile status back to Available
        if (status === 'Completed' || status === 'Cancelled') {
          updatedVehicles = vehicles.map(v => 
            v.id === t.vehicleId 
              ? { 
                  ...v, 
                  status: 'Available' as const, 
                  odometer: completionData?.finalOdometer || v.odometer 
                } 
              : v
          );
          updatedDrivers = drivers.map(d => 
            d.id === t.driverId 
              ? { ...d, status: 'Available' as const } 
              : d
          );

          // Add fuel log if provided
          if (status === 'Completed' && completionData) {
            const fuelLogId = `FUL-${3000 + fuelLogs.length + 1}`;
            const fuelQuantity = completionData.fuelUsed;
            const fuelCost = Math.floor(fuelQuantity * 1.35); // mock fuel price
            
            const newFuelLog: FuelLog = {
              id: fuelLogId,
              vehicleId: t.vehicleId,
              tripId: t.id,
              driverId: t.driverId,
              fuelQuantity,
              fuelCost,
              station: 'Shell Depo #1',
              date: new Date().toISOString(),
              odometer: completionData.finalOdometer
            };
            updatedFuelLogs = [newFuelLog, ...fuelLogs];

            // Add to expenses too
            const expenseId = `EXP-${4000 + expenses.length + 1}`;
            const newExpense: Expense = {
              id: expenseId,
              vehicleId: t.vehicleId,
              category: 'Fuel',
              amount: fuelCost,
              date: new Date().toISOString(),
              description: `Fuel cost for Trip ${t.id}`,
              status: 'Approved'
            };
            
            let extraExpense: Expense | null = null;
            if (completionData.expenses > 0) {
              const extraExpId = `EXP-${4000 + expenses.length + 2}`;
              extraExpense = {
                id: extraExpId,
                vehicleId: t.vehicleId,
                category: 'Toll',
                amount: completionData.expenses,
                date: new Date().toISOString(),
                description: `Tolls/Misc for Trip ${t.id}`,
                status: 'Approved'
              };
            }
            updatedExpenses = extraExpense 
              ? [extraExpense, newExpense, ...expenses]
              : [newExpense, ...expenses];
          }
        }

        return {
          ...t,
          status,
          timeline: events,
          completionData
        };
      }
      return t;
    });

    setVehicles(updatedVehicles);
    setDrivers(updatedDrivers);
    setTrips(updatedTrips);
    setFuelLogs(updatedFuelLogs);
    setExpenses(updatedExpenses);
    
    saveState(updatedVehicles, updatedDrivers, updatedTrips, updatedFuelLogs, updatedExpenses);
  };

  const cancelTrip = (id: string) => {
    updateTripStatus(id, 'Cancelled');
  };

  // --- MAINTENANCE CRUD ---
  const addMaintenanceRecord = (r: Omit<MaintenanceRecord, 'id'>) => {
    const newId = `MNT-${5000 + maintenanceRecords.length + 1}`;
    const newRecord: MaintenanceRecord = {
      ...r,
      id: newId
    };

    // If starting maintenance now, change vehicle status to In Shop / Maintenance
    let updatedVehicles = [...vehicles];
    if (r.status === 'Active') {
      updatedVehicles = vehicles.map(v => v.id === r.vehicleId ? { ...v, status: 'Maintenance' as const } : v);
      setVehicles(updatedVehicles);
    }

    const updatedRecords = [newRecord, ...maintenanceRecords];
    setMaintenanceRecords(updatedRecords);

    // Add maintenance expense
    const expenseId = `EXP-${4000 + expenses.length + 1}`;
    const newExpense: Expense = {
      id: expenseId,
      vehicleId: r.vehicleId,
      category: 'Maintenance',
      amount: r.cost,
      date: r.startDate,
      description: `Service type: ${r.type}. Shop: ${r.mechanicDetails}`,
      status: 'Approved'
    };
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);

    saveState(updatedVehicles, undefined, undefined, undefined, updatedExpenses, updatedRecords);
  };

  const updateMaintenanceRecord = (id: string, updatedFields: Partial<MaintenanceRecord>) => {
    let updatedVehicles = [...vehicles];
    const updatedRecords = maintenanceRecords.map(r => {
      if (r.id === id) {
        const updatedRec = { ...r, ...updatedFields };
        if (updatedFields.status === 'Completed') {
          // Change vehicle back to Available
          updatedVehicles = vehicles.map(v => v.id === r.vehicleId ? { ...v, status: 'Available' as const } : v);
          setVehicles(updatedVehicles);
        }
        return updatedRec;
      }
      return r;
    });

    setMaintenanceRecords(updatedRecords);
    saveState(updatedVehicles, undefined, undefined, undefined, undefined, updatedRecords);
  };

  // --- FUEL LOGS CRUD ---
  const addFuelLog = (l: Omit<FuelLog, 'id'>) => {
    const newId = `FUL-${3000 + fuelLogs.length + 1}`;
    const newLog: FuelLog = {
      ...l,
      id: newId
    };
    const updated = [newLog, ...fuelLogs];
    setFuelLogs(updated);

    // Also add to expenses
    const expenseId = `EXP-${4000 + expenses.length + 1}`;
    const newExpense: Expense = {
      id: expenseId,
      vehicleId: l.vehicleId,
      category: 'Fuel',
      amount: l.fuelCost,
      date: l.date,
      description: `Fuel top-up at ${l.station}`,
      status: 'Approved'
    };
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);

    saveState(undefined, undefined, undefined, updated, updatedExpenses);
  };

  // --- EXPENSES CRUD ---
  const addExpense = (e: Omit<Expense, 'id'>) => {
    const newId = `EXP-${4000 + expenses.length + 1}`;
    const newExpense: Expense = {
      ...e,
      id: newId
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveState(undefined, undefined, undefined, undefined, updated);
  };

  // --- NOTIFICATIONS CRUD ---
  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveState(undefined, undefined, undefined, undefined, undefined, undefined, updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveState(undefined, undefined, undefined, undefined, undefined, undefined, updated);
  };

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'date'>) => {
    const newId = `NTF-${6000 + notifications.length + 1}`;
    const newNotif: Notification = {
      ...n,
      id: newId,
      read: false,
      date: new Date().toISOString()
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveState(undefined, undefined, undefined, undefined, undefined, undefined, updated);
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
