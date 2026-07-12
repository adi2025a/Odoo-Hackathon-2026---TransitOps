// Seeded random helper to generate deterministic mock data
function createRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface Vehicle {
  id: string;
  regNumber: string;
  name: string;
  model: string;
  type: string;
  manufacturer: string;
  year: number;
  vin: string;
  fuelType: 'Diesel' | 'Electric' | 'Gasoline' | 'CNG';
  loadCapacity: number; // kg
  odometer: number; // km
  purchaseCost: number;
  insuranceExpiry: string;
  fitnessExpiry: string;
  pucExpiry: string;
  status: 'Available' | 'On Trip' | 'Maintenance' | 'Retired';
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  assignedDriverId: string | null;
  photoColor: string; // Tailwind color name for visual cards
}

export interface Driver {
  id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  licenseNumber: string;
  licenseCategory: 'Class A CDL' | 'Class B CDL' | 'Class C';
  licenseExpiry: string;
  medicalCertExpiry: string;
  policeVerification: 'Verified' | 'Pending' | 'Expired';
  joiningDate: string;
  experience: number; // years
  safetyScore: number; // 0-100
  currentVehicleId: string | null;
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
}

export interface TripEvent {
  time: string;
  title: string;
  description: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  stops: string[];
  distance: number; // km
  eta: string;
  cargoType: 'Electronics' | 'Perishable Foods' | 'Automotive' | 'Chemicals' | 'General Freight' | 'Pharmaceuticals';
  cargoWeight: number; // kg
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  vehicleId: string;
  driverId: string;
  status: 'Draft' | 'Pending' | 'Dispatched' | 'On Trip' | 'Completed' | 'Cancelled';
  remarks: string;
  timeline: TripEvent[];
  completionData?: {
    finalOdometer: number;
    fuelUsed: number;
    expenses: number;
    deliveryProof: string; // Base64 signature or description
    remarks: string;
    completedAt: string;
  };
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  driverId: string;
  fuelQuantity: number; // liters
  fuelCost: number;
  station: string;
  date: string;
  odometer: number;
}

export interface Expense {
  id: string;
  vehicleId: string;
  category: 'Fuel' | 'Repair' | 'Maintenance' | 'Insurance' | 'Parking' | 'Toll' | 'Tax' | 'Miscellaneous';
  amount: number;
  date: string;
  description: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'Oil Change' | 'Tyre' | 'Brake' | 'Engine' | 'Battery' | 'Inspection';
  status: 'Scheduled' | 'Active' | 'Completed';
  cost: number;
  startDate: string;
  endDate: string | null;
  odometer: number;
  mechanicDetails: string;
  remarks: string;
}

export interface Notification {
  id: string;
  type: 'Maintenance Due' | 'License Expiry' | 'Trip Assigned' | 'Trip Completed' | 'High Fuel Usage' | 'Alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface SystemData {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
}

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'San Francisco', 'Indianapolis', 'Columbus', 'Seattle', 'Denver', 'Boston',
  'Nashville', 'Las Vegas', 'Portland', 'Detroit', 'Miami', 'Atlanta'
];

const VEHICLE_MODELS = [
  { mfr: 'Volvo', model: 'VNL 860', type: 'Heavy Duty Truck', fuel: 'Diesel', cap: 24000, color: 'bg-blue-500' },
  { mfr: 'Freightliner', model: 'Cascadia', type: 'Heavy Duty Truck', fuel: 'Diesel', cap: 25000, color: 'bg-emerald-500' },
  { mfr: 'Kenworth', model: 'T680', type: 'Heavy Duty Truck', fuel: 'Diesel', cap: 23000, color: 'bg-red-500' },
  { mfr: 'Ford', model: 'Transit', type: 'Light Utility Van', fuel: 'Gasoline', cap: 3500, color: 'bg-indigo-500' },
  { mfr: 'Mercedes-Benz', model: 'Sprinter', type: 'Medium Duty Box', fuel: 'Diesel', cap: 5000, color: 'bg-violet-500' },
  { mfr: 'Tesla', model: 'Semi', type: 'Heavy Duty Truck', fuel: 'Electric', cap: 22000, color: 'bg-cyan-500' },
  { mfr: 'Peterbilt', model: '579', type: 'Heavy Duty Truck', fuel: 'CNG', cap: 24000, color: 'bg-amber-500' },
  { mfr: 'Hino', model: '268', type: 'Medium Duty Box', fuel: 'Diesel', cap: 8000, color: 'bg-orange-500' },
];

const DRIVER_NAMES = [
  'Liam Oliver', 'Noah Elijah', 'Oliver James', 'William Benjamin', 'Lucas Henry', 'Alexander Mason',
  'Michael Ethan', 'Daniel Jacob', 'Logan Jackson', 'Sebastian Jack', 'Jack Aiden', 'Owen Wyatt',
  'David John', 'Wyatt Luke', 'Carter Matthew', 'Julian Jayden', 'Grayson Dylan', 'Jaxon Samuel',
  'Gabriel Josh', 'Mateo Ryan', 'Anthony Caden', 'Leo Nathan', 'Emma Sophia', 'Olivia Isabella',
  'Ava Mia', 'Isabella Charlotte', 'Sophia Amelia', 'Charlotte Harper', 'Amelia Evelyn', 'Evelyn Abigail'
];

export function generateMockData(): SystemData {
  const rand = createRandom(888); // Static seed

  // 1. Generate Drivers (300)
  const drivers: Driver[] = [];
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  for (let i = 1; i <= 300; i++) {
    const fName = firstNames[Math.floor(rand() * firstNames.length)];
    const lName = lastNames[Math.floor(rand() * lastNames.length)];
    const fullName = `${fName} ${lName}`;
    const id = `DRV-${1000 + i}`;
    
    // Status distribution
    const roll = rand();
    let status: Driver['status'] = 'Available';
    if (roll < 0.15) status = 'Off Duty';
    else if (roll < 0.20) status = 'Suspended';
    // On Trip status will be reconciled with trips

    const exp = Math.floor(rand() * 20) + 1;
    const safety = Math.floor(rand() * 30) + 70; // 70 to 100

    // Dates
    const yearJoined = 2026 - Math.floor(rand() * 6);
    const monthJoined = String(Math.floor(rand() * 12) + 1).padStart(2, '0');
    const dayJoined = String(Math.floor(rand() * 28) + 1).padStart(2, '0');
    const joiningDate = `${yearJoined}-${monthJoined}-${dayJoined}`;

    const expYears = Math.floor(rand() * 5);
    const licenseExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-15`;
    const medicalExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-01`;

    const category: Driver['licenseCategory'] = rand() < 0.7 ? 'Class A CDL' : rand() < 0.9 ? 'Class B CDL' : 'Class C';
    const police: Driver['policeVerification'] = rand() < 0.95 ? 'Verified' : rand() < 0.98 ? 'Pending' : 'Expired';

    drivers.push({
      id,
      name: fullName,
      dob: `198${Math.floor(rand() * 9)}-05-12`,
      phone: `+1 (${300 + Math.floor(rand() * 600)}) 555-${String(Math.floor(rand() * 9000) + 1000)}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@transitops.com`,
      address: `${Math.floor(rand() * 900) + 100} Logistics Way, ${CITIES[Math.floor(rand() * CITIES.length)]}`,
      emergencyContact: `Sarah ${lName} (+1 555-0199)`,
      licenseNumber: `DL-${String(Math.floor(rand() * 90000000) + 10000000)}`,
      licenseCategory: category,
      licenseExpiry,
      medicalCertExpiry: medicalExpiry,
      policeVerification: police,
      joiningDate,
      experience: exp,
      safetyScore: safety,
      currentVehicleId: null,
      status,
    });
  }

  // 2. Generate Vehicles (150)
  const vehicles: Vehicle[] = [];
  const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const regions: Vehicle['region'][] = ['North', 'South', 'East', 'West', 'Central'];

  for (let i = 1; i <= 150; i++) {
    const modelInfo = VEHICLE_MODELS[Math.floor(rand() * VEHICLE_MODELS.length)];
    const id = `VEH-${1000 + i}`;
    const state = states[Math.floor(rand() * states.length)];
    const regNumber = `${state}-${String(Math.floor(rand() * 900) + 100)}-${String(Math.floor(rand() * 9000) + 1000)}`;
    const vin = `1FVACWDB${Math.floor(rand() * 9)}H${Math.floor(rand() * 9)}H${Math.floor(rand() * 900000) + 100000}`;
    
    // Status distribution
    const roll = rand();
    let status: Vehicle['status'] = 'Available';
    if (roll < 0.10) status = 'Maintenance';
    else if (roll < 0.05) status = 'Retired';
    // On Trip status will be reconciled with trips

    const region = regions[Math.floor(rand() * regions.length)];
    const odometer = Math.floor(rand() * 300000) + 15000;
    const purchaseCost = modelInfo.type === 'Heavy Duty Truck' ? 140000 + Math.floor(rand() * 40000) : 45000 + Math.floor(rand() * 30000);
    
    const year = 2026 - Math.floor(rand() * 8);

    const insExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-28`;
    const fitExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-15`;
    const pucExpiry = `2026-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-01`;

    vehicles.push({
      id,
      regNumber,
      name: `${modelInfo.mfr} ${modelInfo.model}`,
      model: modelInfo.model,
      type: modelInfo.type,
      manufacturer: modelInfo.mfr,
      year,
      vin,
      fuelType: modelInfo.fuel as Vehicle['fuelType'],
      loadCapacity: modelInfo.cap,
      odometer,
      purchaseCost,
      insuranceExpiry: insExpiry,
      fitnessExpiry: fitExpiry,
      pucExpiry: pucExpiry,
      status,
      region,
      assignedDriverId: null,
      photoColor: modelInfo.color,
    });
  }

  // 3. Assign available drivers to available vehicles (1-to-1 matching up to some count)
  let assignedCount = 0;
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.status === 'Available') {
      // Find an available driver who is not yet assigned
      const driver = drivers.find(d => d.status === 'Available' && d.currentVehicleId === null);
      if (driver && assignedCount < 100) { // assign up to 100 drivers
        v.assignedDriverId = driver.id;
        driver.currentVehicleId = v.id;
        assignedCount++;
      }
    }
  }

  // 4. Generate Trips (1200)
  const trips: Trip[] = [];
  const cargoTypes: Trip['cargoType'][] = ['Electronics', 'Perishable Foods', 'Automotive', 'Chemicals', 'General Freight', 'Pharmaceuticals'];
  const priorities: Trip['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const tripStatuses: Trip['status'][] = ['Completed', 'Completed', 'Completed', 'Completed', 'On Trip', 'Pending', 'Cancelled'];

  const totalTrips = 1200;
  const activeTripsCount = 22; // Let's keep about 20-30 on trip
  const pendingTripsCount = 15;
  const cancelledTripsCount = 35;
  const completedTripsCount = totalTrips - activeTripsCount - pendingTripsCount - cancelledTripsCount;

  // Let's create trips. Backdate completed trips over the last 90 days
  const baseDate = new Date('2026-07-12T09:00:00'); // current time

  for (let i = 1; i <= totalTrips; i++) {
    const id = `TRP-${2000 + i}`;
    const src = CITIES[Math.floor(rand() * CITIES.length)];
    let dest = CITIES[Math.floor(rand() * CITIES.length)];
    while (dest === src) {
      dest = CITIES[Math.floor(rand() * CITIES.length)];
    }

    const distance = Math.floor(rand() * 1200) + 150;
    const cargoType = cargoTypes[Math.floor(rand() * cargoTypes.length)];
    const cargoWeight = Math.floor(rand() * 15000) + 500;
    const priority = priorities[Math.floor(rand() * priorities.length)];
    
    // Choose status based on index
    let status: Trip['status'] = 'Completed';
    if (i <= activeTripsCount) {
      status = 'On Trip';
    } else if (i <= activeTripsCount + pendingTripsCount) {
      status = 'Pending';
    } else if (i <= activeTripsCount + pendingTripsCount + cancelledTripsCount) {
      status = 'Cancelled';
    }

    // Vehicle and driver assignment
    // For Completed, Cancelled, and Pending, we can just assign random vehicles and drivers (history).
    // For On Trip, we should assign active vehicles and drivers, setting their status to 'On Trip'.
    const vIndex = Math.floor(rand() * vehicles.length);
    const dIndex = Math.floor(rand() * drivers.length);
    const v = vehicles[vIndex];
    const d = drivers[dIndex];
    const vehicleId = v.id;
    const driverId = d.id;

    if (status === 'On Trip') {
      v.status = 'On Trip';
      d.status = 'On Trip';
      v.assignedDriverId = d.id;
      d.currentVehicleId = v.id;
    }

    // Timeline and Dates
    const tripDaysAgo = Math.floor(rand() * 90);
    const tripDate = new Date(baseDate);
    tripDate.setDate(tripDate.getDate() - tripDaysAgo);
    tripDate.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60));

    const etaDate = new Date(tripDate);
    const travelHours = Math.ceil(distance / 70); // average speed 70km/h
    etaDate.setHours(etaDate.getHours() + travelHours);

    const timeline: TripEvent[] = [
      { time: tripDate.toISOString(), title: 'Trip Booked', description: `Trip registered from ${src} to ${dest}` }
    ];

    if (status !== 'Pending') {
      const dispatchedTime = new Date(tripDate);
      dispatchedTime.setMinutes(dispatchedTime.getMinutes() + 15);
      timeline.push({ time: dispatchedTime.toISOString(), title: 'Dispatched', description: `Vehicle ${v.regNumber} departed source depot` });
    }

    if (status === 'On Trip') {
      const midwayTime = new Date(tripDate);
      midwayTime.setHours(midwayTime.getHours() + Math.floor(travelHours / 2));
      timeline.push({ time: midwayTime.toISOString(), title: 'In Transit', description: `Vehicle passed waypoint check station` });
    }

    let completionData: Trip['completionData'] | undefined;
    if (status === 'Completed') {
      const completedTime = etaDate;
      timeline.push({ time: completedTime.toISOString(), title: 'Delivered', description: `Cargo delivered and signed off at ${dest}` });
      
      const finalOdo = v.odometer - Math.floor(rand() * 1000) + distance; // reconcile historical odometers roughly
      const fuelUsed = Math.floor((distance / 8) * (1 + rand() * 0.4)); // ~5-8 km per liter
      const tripExp = Math.floor(rand() * 150) + 50; // tolls, parking, etc.

      completionData = {
        finalOdometer: finalOdo,
        fuelUsed,
        expenses: tripExp,
        deliveryProof: `POD-${id}-SIGNED`,
        remarks: 'Delivered on time. Cargo intact.',
        completedAt: completedTime.toISOString()
      };
    } else if (status === 'Cancelled') {
      timeline.push({ time: etaDate.toISOString(), title: 'Cancelled', description: 'Cancelled due to route issues or client request' });
    }

    trips.push({
      id,
      source: src,
      destination: dest,
      stops: distance > 600 ? [CITIES[Math.floor(rand() * CITIES.length)]] : [],
      distance,
      eta: etaDate.toISOString(),
      cargoType,
      cargoWeight,
      priority,
      vehicleId,
      driverId,
      status,
      remarks: status === 'Cancelled' ? 'Route cancelled by operational admin.' : 'Standard transport log.',
      timeline,
      completionData
    });
  }

  // 5. Generate Fuel Logs (600)
  const fuelLogs: FuelLog[] = [];
  const stations = ['Shell Station #492', 'Chevron Express', 'ExxonMobil Hub', 'Speedway Travel Plaza', 'Love’s Travel Stop', 'Pilot Flying J'];
  
  for (let i = 1; i <= 600; i++) {
    const id = `FUL-${3000 + i}`;
    const vehicle = vehicles[Math.floor(rand() * vehicles.length)];
    const driver = drivers.find(d => d.id === vehicle.assignedDriverId) || drivers[Math.floor(rand() * drivers.length)];
    
    // Associate with a completed trip if possible
    const associatedTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'Completed');
    const trip = associatedTrips.length > 0 ? associatedTrips[Math.floor(rand() * associatedTrips.length)] : null;
    
    const qty = Math.floor(rand() * 250) + 60; // 60 - 310 Liters
    const cost = Math.floor(qty * (1.2 + rand() * 0.3) * 100) / 100; // ~$1.20 - $1.50 per Liter

    const logDaysAgo = Math.floor(rand() * 90);
    const logDate = new Date(baseDate);
    logDate.setDate(logDate.getDate() - logDaysAgo);
    logDate.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60));

    fuelLogs.push({
      id,
      vehicleId: vehicle.id,
      tripId: trip ? trip.id : null,
      driverId: driver.id,
      fuelQuantity: qty,
      fuelCost: cost,
      station: stations[Math.floor(rand() * stations.length)],
      date: logDate.toISOString(),
      odometer: vehicle.odometer - Math.floor(rand() * 10000), // historical odometer
    });
  }

  // 6. Generate Expenses (500)
  const expenses: Expense[] = [];
  const expenseCats: Expense['category'][] = ['Fuel', 'Repair', 'Maintenance', 'Insurance', 'Parking', 'Toll', 'Tax', 'Miscellaneous'];
  const expDescriptions = {
    Fuel: 'Fuel top-up at station',
    Repair: 'Brake pad replacements and disc grinding',
    Maintenance: 'Routine oil & filter service',
    Insurance: 'Monthly liability premium installment',
    Parking: 'Overnight freight parking depot',
    Toll: 'Expressway corridor toll charges',
    Tax: 'Quarterly state heavy vehicle tax',
    Miscellaneous: 'Driver helper charges & route minor exp'
  };

  for (let i = 1; i <= 500; i++) {
    const id = `EXP-${4000 + i}`;
    const vehicle = vehicles[Math.floor(rand() * vehicles.length)];
    const cat = expenseCats[Math.floor(rand() * expenseCats.length)];
    const amount = cat === 'Fuel' ? Math.floor(rand() * 400) + 100
                 : cat === 'Repair' ? Math.floor(rand() * 1500) + 150
                 : cat === 'Maintenance' ? Math.floor(rand() * 600) + 80
                 : cat === 'Insurance' ? Math.floor(rand() * 1200) + 400
                 : Math.floor(rand() * 150) + 10; // other expenses

    const expDaysAgo = Math.floor(rand() * 90);
    const expDate = new Date(baseDate);
    expDate.setDate(expDate.getDate() - expDaysAgo);

    expenses.push({
      id,
      vehicleId: vehicle.id,
      category: cat,
      amount,
      date: expDate.toISOString(),
      description: expDescriptions[cat] || 'Operational Expense',
      status: rand() < 0.85 ? 'Approved' : rand() < 0.95 ? 'Pending' : 'Rejected',
    });
  }

  // 7. Generate Maintenance Records (200)
  const maintenanceRecords: MaintenanceRecord[] = [];
  const maintTypes: MaintenanceRecord['type'][] = ['Oil Change', 'Tyre', 'Brake', 'Engine', 'Battery', 'Inspection'];
  const mechanics = ['FleetCare Depot A', 'MasterTech Logistics Shop', 'Speedy Service Center', 'VNL Authorized Workshop'];
  
  for (let i = 1; i <= 200; i++) {
    const id = `MNT-${5000 + i}`;
    const vehicle = vehicles[Math.floor(rand() * vehicles.length)];
    const type = maintTypes[Math.floor(rand() * maintTypes.length)];
    
    // Status distribution
    let status: MaintenanceRecord['status'] = 'Completed';
    // Let a few be Active or Scheduled
    if (i <= 5) status = 'Active';
    else if (i <= 10) status = 'Scheduled';

    const cost = type === 'Engine' ? Math.floor(rand() * 3000) + 800
               : type === 'Tyre' ? Math.floor(rand() * 1200) + 300
               : type === 'Brake' ? Math.floor(rand() * 600) + 200
               : Math.floor(rand() * 150) + 50;

    const maintDaysAgo = Math.floor(rand() * 120);
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() - maintDaysAgo);

    let endDate: string | null = null;
    if (status === 'Completed') {
      const end = new Date(startDate);
      end.setHours(end.getHours() + Math.floor(rand() * 48) + 4);
      endDate = end.toISOString();
    }

    if (status === 'Active') {
      vehicle.status = 'Maintenance'; // reconcile vehicle state
    }

    maintenanceRecords.push({
      id,
      vehicleId: vehicle.id,
      type,
      status,
      cost,
      startDate: startDate.toISOString(),
      endDate,
      odometer: vehicle.odometer - Math.floor(rand() * 15000),
      mechanicDetails: mechanics[Math.floor(rand() * mechanics.length)],
      remarks: `${type} performed as per scheduled PM schedule.`
    });
  }

  // 8. Generate Notifications (50)
  const notifications: Notification[] = [];
  const notifTypes: Notification['type'][] = ['Maintenance Due', 'License Expiry', 'Trip Assigned', 'Trip Completed', 'High Fuel Usage', 'Alert'];
  const notifTitles = {
    'Maintenance Due': 'Scheduled Preventive Maintenance',
    'License Expiry': 'Driver License Renewal Required',
    'Trip Assigned': 'New Dispatch Assignment',
    'Trip Completed': 'Trip Delivered and Finalized',
    'High Fuel Usage': 'Fuel Anomaly Detected',
    'Alert': 'Critical Safety Incident Alert'
  };

  const notifMessages = [
    'Vehicle VEH-1022 odometer has exceeded service interval by 500 km.',
    'Driver DRV-1008 commercial driver license expires in 15 days.',
    'Trip TRP-2023 dispatched from Austin to Chicago.',
    'Trip TRP-2005 successfully completed at Boston depot. Cargo verified.',
    'Vehicle VEH-1045 has recorded 35% higher fuel consumption than average.',
    'Hard braking event triggered by VEH-1011 on Interstate 90. Safety Score recalculated.'
  ];

  for (let i = 1; i <= 50; i++) {
    const id = `NTF-${6000 + i}`;
    const type = notifTypes[Math.floor(rand() * notifTypes.length)];
    const title = notifTitles[type] || 'System Alert';
    
    // Choose matching message or random default
    const messageIndex = notifTypes.indexOf(type);
    const message = notifMessages[messageIndex !== -1 ? messageIndex : 0];

    const notifDaysAgo = Math.floor(rand() * 10);
    const notifDate = new Date(baseDate);
    notifDate.setDate(notifDate.getDate() - notifDaysAgo);

    notifications.push({
      id,
      type,
      title,
      message,
      date: notifDate.toISOString(),
      read: rand() < 0.6,
      severity: type === 'Alert' ? 'critical' : type === 'Maintenance Due' || type === 'License Expiry' ? 'warning' : 'info'
    });
  }

  // Final Reconciliations: Sort notifications by date desc
  notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Sort trips by date desc
  trips.sort((a, b) => new Date(b.eta).getTime() - new Date(a.eta).getTime());

  // Sort logs
  fuelLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  maintenanceRecords.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return {
    vehicles,
    drivers,
    trips,
    fuelLogs,
    expenses,
    maintenanceRecords,
    notifications
  };
}
