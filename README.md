# TransitOps Fleet Management System

TransitOps is a full-featured real-time fleet, trip, and analytics management system built using Node.js, Express, TypeScript, MongoDB, and React with Vite.

---

## 👥 Role-Based Test Accounts

Below are the pre-configured user credentials for testing role-based access control (RBAC):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@transitops.com` | `Admin@1234` | Full access to all modules, settings, and user provisioning. |
| **Fleet Manager** | `fleetmanager@transitops.com` | `Test@1234` | Complete access to Vehicles, Drivers, Maintenance, and Analytics. |
| **Dispatcher** | `dispatcher@transitops.com` | `Test@1234` | Can schedule, dispatch, and track Trips, and assign drivers. |
| **Driver** | `driver@transitops.com` | `Test@1234` | Assigned driver dashboard (matches driver ID `DRV-1001`). Can view logs & trips. |
| **Safety Officer** | `safetyofficer@transitops.com` | `Test@1234` | Access to safety scores, police verifications, and compliance monitoring. |
| **Financial Analyst** | `analyst@transitops.com` | `Test@1234` | Access to Expense logs, fuel efficiency analytics, and financial reporting. |

---

## 🚀 Setup & Launch Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas (provided in the backend configuration)

### Running the Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run compilation and start server:
   ```bash
   npx tsc
   node dist/index.js
   ```
   *The backend will boot on `http://localhost:5000`.*

### Running the Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will boot on `http://localhost:5173` (or the next available port).*