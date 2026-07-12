import cron from 'node-cron';
import Driver from '../models/Driver';
import Vehicle from '../models/Vehicle';
import Notification from '../models/Notification';
import MaintenanceRecord from '../models/MaintenanceRecord';

// Helper to calculate days diff
const getDaysDifference = (expiryStr: string): number => {
  const expiry = new Date(expiryStr);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const startCronJobs = (): void => {
  console.log('⏰ Scheduled Jobs (Cron) initialized.');

  // Run every day at 08:00
  // Pattern: "0 8 * * *" (minute hour day-of-month month day-of-week)
  // For development testing/demo purposes, we also support running it instantly on start, and scheduling
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily checks at 08:00...');
    const nowStr = new Date().toISOString();

    try {
      // 1. License Expiry Check (Drivers)
      const drivers = await Driver.find({ status: { $ne: 'Suspended' } });
      for (const driver of drivers) {
        const days = getDaysDifference(driver.licenseExpiry);
        if (days >= 0 && days <= 30) {
          const ntfId = `NTF-LIC-${driver._id}-${Date.now()}`;
          await Notification.updateOne(
            { _id: ntfId },
            {
              userId: driver._id,
              type: 'License Expiry',
              title: 'Driver License Expiring Soon',
              message: `Driver ${driver.name}'s license (${driver.licenseNumber}) expires in ${days} days on ${driver.licenseExpiry}.`,
              date: nowStr,
              severity: 'warning',
              read: false,
            },
            { upsert: true }
          );
        }
      }

      // 2. Insurance/Fitness Expiry Check (Vehicles)
      const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
      for (const vehicle of vehicles) {
        const insDays = getDaysDifference(vehicle.insuranceExpiry);
        const fitDays = getDaysDifference(vehicle.fitnessExpiry);

        if (insDays >= 0 && insDays <= 30) {
          const ntfId = `NTF-INS-${vehicle._id}-${Date.now()}`;
          await Notification.updateOne(
            { _id: ntfId },
            {
              userId: null, // broadcast to managers
              type: 'Maintenance Due',
              title: 'Vehicle Insurance Expiring Soon',
              message: `Vehicle ${vehicle.name} (${vehicle.regNumber}) insurance expires in ${insDays} days.`,
              date: nowStr,
              severity: 'warning',
              read: false,
            },
            { upsert: true }
          );
        }

        if (fitDays >= 0 && fitDays <= 30) {
          const ntfId = `NTF-FIT-${vehicle._id}-${Date.now()}`;
          await Notification.updateOne(
            { _id: ntfId },
            {
              userId: null,
              type: 'Maintenance Due',
              title: 'Vehicle Fitness Expiring Soon',
              message: `Vehicle ${vehicle.name} (${vehicle.regNumber}) fitness certificate expires in ${fitDays} days.`,
              date: nowStr,
              severity: 'warning',
              read: false,
            },
            { upsert: true }
          );
        }
      }

      // 3. Service Odometer Interval Checks (> 10,000 km since last completed maintenance)
      for (const vehicle of vehicles) {
        const lastRecord = await MaintenanceRecord.findOne({
          vehicleId: vehicle._id,
          status: 'Completed',
        }).sort({ endDate: -1 });

        const odometerSinceService = lastRecord 
          ? (vehicle.odometer - lastRecord.odometer)
          : vehicle.odometer;

        if (odometerSinceService > 10000) {
          const ntfId = `NTF-SRV-${vehicle._id}-${Date.now()}`;
          await Notification.updateOne(
            { _id: ntfId },
            {
              userId: null,
              type: 'Maintenance Due',
              title: 'Routine Service Required',
              message: `Vehicle ${vehicle.name} (${vehicle.regNumber}) has travelled ${odometerSinceService} km since last service. Scheduled maintenance is due.`,
              date: nowStr,
              severity: 'critical',
              read: false,
            },
            { upsert: true }
          );
        }
      }
    } catch (err) {
      console.error('❌ Error executing daily check cron job:', err);
    }
  });
};
