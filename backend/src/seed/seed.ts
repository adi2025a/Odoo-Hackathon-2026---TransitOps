import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { env } from '../config/env';
import { connectDB } from '../config/db';
import User from '../models/User';
import Driver from '../models/Driver';
import Vehicle from '../models/Vehicle';
import Trip from '../models/Trip';
import FuelLog from '../models/FuelLog';
import Expense from '../models/Expense';
import MaintenanceRecord from '../models/MaintenanceRecord';
import Notification from '../models/Notification';
import { hashPassword } from '../utils/bcrypt';

dotenv.config();

// Seeded random helper
function createRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
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

const runSeed = async () => {
  try {
    console.log('🌱 Starting DB Seeding...');
    await connectDB();

    // Clean existing database records
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Vehicle.deleteMany({});
    await Trip.deleteMany({});
    await FuelLog.deleteMany({});
    await Expense.deleteMany({});
    await MaintenanceRecord.deleteMany({});
    await Notification.deleteMany({});

    const rand = createRandom(888);

    // 1. Generate User accounts for roles
    console.log('👥 Creating user accounts with roles...');
    const hashedAdminPassword = await hashPassword('Admin@1234');
    const hashedRolePassword = await hashPassword('Test@1234');

    const seedUsers = [
      {
        name: 'Alex Rivera',
        email: 'admin@transitops.com',
        password: hashedAdminPassword,
        role: 'Super Admin',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexRivera',
        isActive: true,
      },
      {
        name: 'Marcus Vance',
        email: 'fleetmanager@transitops.com',
        password: hashedRolePassword,
        role: 'Fleet Manager',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MarcusVance',
        isActive: true,
      },
      {
        name: 'Elena Rostova',
        email: 'dispatcher@transitops.com',
        password: hashedRolePassword,
        role: 'Dispatcher',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ElenaRostova',
        isActive: true,
      },
      {
        name: 'John Miller',
        email: 'driver@transitops.com',
        password: hashedRolePassword,
        role: 'Driver',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=JohnMiller',
        driverId: 'DRV-1001',
        isActive: true,
      },
      {
        name: 'CSO Davis',
        email: 'safetyofficer@transitops.com',
        password: hashedRolePassword,
        role: 'Safety Officer',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CSODavis',
        isActive: true,
      },
      {
        name: 'Sarah Jenkins',
        email: 'analyst@transitops.com',
        password: hashedRolePassword,
        role: 'Financial Analyst',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SarahJenkins',
        isActive: true,
      },
    ];

    await User.insertMany(seedUsers);

    // 2. Generate Drivers (300)
    console.log('🚗 Generating 300 drivers...');
    const driversData: any[] = [];
    const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

    for (let i = 1; i <= 300; i++) {
      // Keep DRV-1001 matching the logged-in demo driver
      const fName = i === 1 ? 'John' : firstNames[Math.floor(rand() * firstNames.length)];
      const lName = i === 1 ? 'Miller' : lastNames[Math.floor(rand() * lastNames.length)];
      const fullName = `${fName} ${lName}`;
      const id = `DRV-${1000 + i}`;
      
      const roll = rand();
      let status = 'Available';
      if (roll < 0.15) status = 'Off Duty';
      else if (roll < 0.20) status = 'Suspended';

      const exp = Math.floor(rand() * 20) + 1;
      const safety = Math.floor(rand() * 30) + 70;

      const yearJoined = 2026 - Math.floor(rand() * 6);
      const monthJoined = String(Math.floor(rand() * 12) + 1).padStart(2, '0');
      const dayJoined = String(Math.floor(rand() * 28) + 1).padStart(2, '0');
      const joiningDate = `${yearJoined}-${monthJoined}-${dayJoined}`;

      const licenseExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-15`;
      const medicalExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-01`;

      const category = rand() < 0.7 ? 'Class A CDL' : rand() < 0.9 ? 'Class B CDL' : 'Class C';
      const police = rand() < 0.95 ? 'Verified' : rand() < 0.98 ? 'Pending' : 'Expired';

      driversData.push({
        _id: id,
        name: fullName,
        dob: `198${Math.floor(rand() * 9)}-05-12`,
        phone: `+1 (${300 + Math.floor(rand() * 600)}) 555-${String(Math.floor(rand() * 9000) + 1000)}`,
        email: i === 1 ? 'driver@transitops.com' : `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@transitops.com`,
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

    // 3. Generate Vehicles (150)
    console.log('🚛 Generating 150 vehicles...');
    const vehiclesData: any[] = [];
    const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];

    for (let i = 1; i <= 150; i++) {
      const modelInfo = VEHICLE_MODELS[Math.floor(rand() * VEHICLE_MODELS.length)];
      const id = `VEH-${1000 + i}`;
      const state = states[Math.floor(rand() * states.length)];
      const regNumber = `${state}-${String(Math.floor(rand() * 900) + 100)}-${String(Math.floor(rand() * 9000) + 1000)}`;
      const vin = `1FVACWDB${Math.floor(rand() * 9)}H${Math.floor(rand() * 9)}H${Math.floor(rand() * 900000) + 100000}`;
      
      const roll = rand();
      let status = 'Available';
      if (roll < 0.10) status = 'Maintenance';
      else if (roll < 0.05) status = 'Retired';

      const region = regions[Math.floor(rand() * regions.length)];
      const odometer = Math.floor(rand() * 300000) + 15000;
      const purchaseCost = modelInfo.type === 'Heavy Duty Truck' ? 140000 + Math.floor(rand() * 40000) : 45000 + Math.floor(rand() * 30000);
      const year = 2026 - Math.floor(rand() * 8);

      const insExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-28`;
      const fitExpiry = `2027-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-15`;
      const pucExpiry = `2026-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-01`;

      vehiclesData.push({
        _id: id,
        regNumber,
        name: `${modelInfo.mfr} ${modelInfo.model}`,
        model: modelInfo.model,
        type: modelInfo.type,
        manufacturer: modelInfo.mfr,
        year,
        vin,
        fuelType: modelInfo.fuel,
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

    // 1-to-1 matching drivers and vehicles
    let assignedCount = 0;
    for (let i = 0; i < vehiclesData.length; i++) {
      const v = vehiclesData[i];
      if (v.status === 'Available') {
        const driver = driversData.find(d => d.status === 'Available' && d.currentVehicleId === null);
        if (driver && assignedCount < 100) {
          v.assignedDriverId = driver._id;
          driver.currentVehicleId = v._id;
          assignedCount++;
        }
      }
    }

    // 4. Generate Trips (1200)
    console.log('📍 Generating 1200 trips...');
    const tripsData: any[] = [];
    const cargoTypes = ['Electronics', 'Perishable Foods', 'Automotive', 'Chemicals', 'General Freight', 'Pharmaceuticals'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    const totalTrips = 1200;
    const activeTripsCount = 22;
    const pendingTripsCount = 15;
    const cancelledTripsCount = 35;
    const baseDate = new Date();

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
      
      let status = 'Completed';
      if (i <= activeTripsCount) {
        status = 'On Trip';
      } else if (i <= activeTripsCount + pendingTripsCount) {
        status = 'Pending';
      } else if (i <= activeTripsCount + pendingTripsCount + cancelledTripsCount) {
        status = 'Cancelled';
      }

      const vIndex = Math.floor(rand() * vehiclesData.length);
      const dIndex = Math.floor(rand() * driversData.length);
      const v = vehiclesData[vIndex];
      const d = driversData[dIndex];

      if (status === 'On Trip') {
        v.status = 'On Trip';
        d.status = 'On Trip';
        v.assignedDriverId = d._id;
        d.currentVehicleId = v._id;
      }

      const tripDaysAgo = Math.floor(rand() * 90);
      const tripDate = new Date(baseDate);
      tripDate.setDate(tripDate.getDate() - tripDaysAgo);
      tripDate.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60));

      const etaDate = new Date(tripDate);
      const travelHours = Math.ceil(distance / 70);
      etaDate.setHours(etaDate.getHours() + travelHours);

      const timeline = [
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

      let completionData: any;
      if (status === 'Completed') {
        const completedTime = etaDate;
        timeline.push({ time: completedTime.toISOString(), title: 'Delivered', description: `Cargo delivered and signed off at ${dest}` });
        
        const finalOdo = v.odometer - Math.floor(rand() * 1000) + distance;
        const fuelUsed = Math.floor((distance / 8) * (1 + rand() * 0.4));
        const tripExp = Math.floor(rand() * 150) + 50;

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

      tripsData.push({
        _id: id,
        source: src,
        destination: dest,
        stops: distance > 600 ? [CITIES[Math.floor(rand() * CITIES.length)]] : [],
        distance,
        eta: etaDate.toISOString(),
        cargoType,
        cargoWeight,
        priority,
        vehicleId: v._id,
        driverId: d._id,
        status,
        remarks: status === 'Cancelled' ? 'Route cancelled by operational admin.' : 'Standard transport log.',
        timeline,
        completionData,
      });
    }

    // 5. Generate Fuel Logs (600)
    console.log('⛽ Generating 600 fuel logs...');
    const fuelLogsData: any[] = [];
    const stations = ['Shell Station #492', 'Chevron Express', 'ExxonMobil Hub', 'Speedway Travel Plaza', 'Love’s Travel Stop', 'Pilot Flying J'];
    
    for (let i = 1; i <= 600; i++) {
      const id = `FUL-${3000 + i}`;
      const vehicle = vehiclesData[Math.floor(rand() * vehiclesData.length)];
      const driver = driversData.find(d => d._id === vehicle.assignedDriverId) || driversData[Math.floor(rand() * driversData.length)];
      
      const associatedTrips = tripsData.filter(t => t.vehicleId === vehicle._id && t.status === 'Completed');
      const trip = associatedTrips.length > 0 ? associatedTrips[Math.floor(rand() * associatedTrips.length)] : null;
      
      const qty = Math.floor(rand() * 250) + 60;
      const cost = Math.floor(qty * (1.2 + rand() * 0.3) * 100) / 100;

      const logDaysAgo = Math.floor(rand() * 90);
      const logDate = new Date(baseDate);
      logDate.setDate(logDate.getDate() - logDaysAgo);

      fuelLogsData.push({
        _id: id,
        vehicleId: vehicle._id,
        tripId: trip ? trip._id : null,
        driverId: driver._id,
        fuelQuantity: qty,
        fuelCost: cost,
        station: stations[Math.floor(rand() * stations.length)],
        date: logDate.toISOString(),
        odometer: vehicle.odometer - Math.floor(rand() * 10000),
      });
    }

    // 6. Generate Expenses (500)
    console.log('💵 Generating 500 expenses...');
    const expensesData: any[] = [];
    const expenseCats = ['Fuel', 'Repair', 'Maintenance', 'Insurance', 'Parking', 'Toll', 'Tax', 'Miscellaneous'];
    const expDescriptions: any = {
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
      const vehicle = vehiclesData[Math.floor(rand() * vehiclesData.length)];
      const cat = expenseCats[Math.floor(rand() * expenseCats.length)];
      const amount = cat === 'Fuel' ? Math.floor(rand() * 400) + 100
                   : cat === 'Repair' ? Math.floor(rand() * 1500) + 150
                   : cat === 'Maintenance' ? Math.floor(rand() * 600) + 80
                   : cat === 'Insurance' ? Math.floor(rand() * 1200) + 400
                   : Math.floor(rand() * 150) + 10;

      const expDaysAgo = Math.floor(rand() * 90);
      const expDate = new Date(baseDate);
      expDate.setDate(expDate.getDate() - expDaysAgo);

      expensesData.push({
        _id: id,
        vehicleId: vehicle._id,
        category: cat,
        amount,
        date: expDate.toISOString(),
        description: expDescriptions[cat] || 'Operational Expense',
        status: rand() < 0.85 ? 'Approved' : rand() < 0.95 ? 'Pending' : 'Rejected',
      });
    }

    // 7. Generate Maintenance Records (200)
    console.log('🔧 Generating 200 maintenance records...');
    const maintenanceRecordsData: any[] = [];
    const maintTypes = ['Oil Change', 'Tyre', 'Brake', 'Engine', 'Battery', 'Inspection'];
    const mechanics = ['FleetCare Depot A', 'MasterTech Logistics Shop', 'Speedy Service Center', 'VNL Authorized Workshop'];
    
    for (let i = 1; i <= 200; i++) {
      const id = `MNT-${5000 + i}`;
      const vehicle = vehiclesData[Math.floor(rand() * vehiclesData.length)];
      const type = maintTypes[Math.floor(rand() * maintTypes.length)];
      
      let status = 'Completed';
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
        vehicle.status = 'Maintenance';
      }

      maintenanceRecordsData.push({
        _id: id,
        vehicleId: vehicle._id,
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
    console.log('🔔 Generating 50 alerts/notifications...');
    const notificationsData: any[] = [];
    const notifTypes = ['Maintenance Due', 'License Expiry', 'Trip Assigned', 'Trip Completed', 'High Fuel Usage', 'Alert'];
    const notifTitles: any = {
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
      
      const messageIndex = notifTypes.indexOf(type);
      const message = notifMessages[messageIndex !== -1 ? messageIndex : 0];

      const notifDaysAgo = Math.floor(rand() * 10);
      const notifDate = new Date(baseDate);
      notifDate.setDate(notifDate.getDate() - notifDaysAgo);

      notificationsData.push({
        _id: id,
        type,
        title,
        message,
        date: notifDate.toISOString(),
        read: rand() < 0.6,
        severity: type === 'Alert' ? 'critical' : type === 'Maintenance Due' || type === 'License Expiry' ? 'warning' : 'info'
      });
    }

    // Save generated collections in batch
    await Driver.insertMany(driversData);
    await Vehicle.insertMany(vehiclesData);
    await Trip.insertMany(tripsData);
    await FuelLog.insertMany(fuelLogsData);
    await Expense.insertMany(expensesData);
    await MaintenanceRecord.insertMany(maintenanceRecordsData);
    await Notification.insertMany(notificationsData);

    console.log('✅ Seeding complete successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
