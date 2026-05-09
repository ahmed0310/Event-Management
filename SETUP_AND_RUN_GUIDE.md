# Event Management System - Complete Setup & Run Guide

## Overview
This is a full-stack Event Management System with:
- **Backend**: Node.js + Express + Oracle Database
- **Frontend**: HTML + JavaScript (Static Files)
- **Database**: Oracle Database with Phase 4 PL/SQL components
- **Features**: User dashboard, admin panel, event booking, analytics

---

## Prerequisites

Before you start, ensure you have installed:

### 1. Node.js
- Download from: https://nodejs.org/ (LTS version recommended)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Oracle Database
- Oracle Database 11g or later
- OR Oracle Instant Client (for client-only connection)
- Download from: https://www.oracle.com/database/technologies/instant-client/downloads.html

### 3. Oracle Node Module (oracledb)
- This requires Oracle Instant Client libraries
- Installation guide: https://github.com/oracle/node-oracledb/blob/main/INSTALL.md

---

## Step-by-Step Setup Instructions

### Step 1: Install Oracle Instant Client (If Not Already Installed)

#### On Windows:
```bash
# Download Oracle Instant Client from:
# https://www.oracle.com/database/technologies/instant-client/winx64-downloads.html

# Extract to a folder, e.g., C:\oracle\instantclient_21_13

# Add to System Path:
# 1. Right-click "This PC" → Properties
# 2. Click "Advanced system settings"
# 3. Click "Environment Variables"
# 4. Add C:\oracle\instantclient_21_13 to PATH
# 5. Restart your computer
```

#### On macOS:
```bash
brew install oracle-instantclient
```

#### On Linux (Ubuntu):
```bash
# Download RPM or ZIP from Oracle
# Then:
sudo apt-get install libaio1
# Extract and add to LD_LIBRARY_PATH
```

### Step 2: Verify Oracle Client Installation

```bash
node -e "const oracledb = require('oracledb'); console.log(oracledb.versionString);"
```

If successful, you'll see the version. If it fails, Oracle Instant Client is not properly installed.

---

### Step 3: Clone/Download the Project

```bash
git clone https://github.com/ahmed0310/Event-Management.git
cd Event-Management
git checkout phase-4-implementation
```

Or if you have a ZIP file:
```bash
unzip Event-Management.zip
cd Event-Management
```

---

### Step 4: Install Node Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-Origin Resource Sharing
- `oracledb` - Oracle database driver
- `dotenv` - Environment variables

---

### Step 5: Create Environment Variables File

Create a `.env` file in the project root directory with your Oracle database credentials:

```env
# Database Connection Details
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=localhost:1521/XE

# Server Port (optional, defaults to 3000)
PORT=3000
```

**Example for Oracle 21c Express Edition:**
```env
DB_USER=system
DB_PASSWORD=your_password
DB_CONNECTION_STRING=localhost:1521/XE
PORT=3000
```

---

### Step 6: Create Database Schema & Tables

Execute the SQL scripts in this order:

#### Option A: Using SQL*Plus
```bash
sqlplus system/password@XE

SQL> @01_CREATE_TABLES.sql
SQL> @02_INSERT_DATA.sql
SQL> @03_CONSTRAINTS.sql
SQL> @04_VIEWS.sql
SQL> @05_INDEXES.sql
SQL> @06_PLSQL.sql
SQL> EXIT;
```

#### Option B: Using SQL Developer
1. Open SQL Developer
2. Create a new connection with your Oracle credentials
3. Open each SQL file and execute them in order

---

### Step 7: Start the Node.js Server

```bash
node server.js
```

You should see:
```
Server listening at http://localhost:3000
```

If you get connection errors, verify:
- Oracle database is running
- `.env` file has correct credentials
- Oracle Instant Client is installed
- Firewall is not blocking port 1521

---

## Accessing the Application

### Public Website (Users)
```
http://localhost:3000
```

Features:
- View all events
- Book event tickets
- Dashboard with live analytics (powered by PL/SQL functions)
- Top events by revenue

### Admin Dashboard
```
http://localhost:3000/admin.html
```

Password: `admin`

Features:
- Create new events
- Register participants (procRegisterParticipant)
- View event analytics (fnCalculateTotalEventRevenue)
- Generate venue occupancy reports (explicit cursor)
- Bulk generate tickets (pkgEventManagement)
- Check participant bookings (fnGetParticipantTicketCount)

---

## Project Structure

```
Event-Management/
├── 01_CREATE_TABLES.sql          # Database schema
├── 02_INSERT_DATA.sql            # Sample data
├── 03_CONSTRAINTS.sql            # Foreign keys
├── 04_VIEWS.sql                  # SQL views
├── 05_INDEXES.sql                # Performance indexes
├── 06_PLSQL.sql                  # Phase 4: PL/SQL
│   ├── Stored Procedures (4)
│   ├── Functions (3)
│   ├── Triggers (3)
│   ├── Cursors (2)
│   ├── Package (1)
│   └── Anonymous Blocks (7+)
├── server.js                     # Express backend (8 new endpoints)
├── db.js                         # Oracle connection pool
├── index.html                    # Public website
├── admin.html                    # Admin dashboard
├── script.js                     # Frontend logic
├── admin.js                      # Admin logic
├── style.css                     # Styling
├── package.json                  # Node dependencies
├── .env                          # Environment variables (create this)
└── docs/                         # Documentation
    ├── PHASE4_DOCUMENTATION.md
    ├── PHASE4_FRONTEND_INTEGRATION.md
    ├── PHASE4_ALL_CHANGES.txt
    └── More...
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module 'oracledb'"
**Solution:**
```bash
npm install oracledb
# If it fails, install Oracle Instant Client first
```

### Issue 2: "ORA-12514: TNS:listener does not currently know of service"
**Solution:**
- Verify Oracle database is running
- Check DB_CONNECTION_STRING in .env (usually localhost:1521/XE for Express Edition)

### Issue 3: "ORA-01017: invalid username/password"
**Solution:**
- Verify DB_USER and DB_PASSWORD in .env
- Check if Oracle user exists and is unlocked

### Issue 4: Port 3000 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Issue 5: CORS errors
**Solution:**
- Server.js already has CORS enabled
- Make sure accessing from http://localhost:3000, not file://

### Issue 6: Database tables not found
**Solution:**
- Run the SQL scripts in correct order:
  ```bash
  @01_CREATE_TABLES.sql
  @02_INSERT_DATA.sql
  @03_CONSTRAINTS.sql
  @04_VIEWS.sql
  @05_INDEXES.sql
  @06_PLSQL.sql
  ```

---

## Testing Phase 4 Features

### Test 1: Dashboard Analytics (Public)
```
1. Go to http://localhost:3000
2. Verify "Dashboard Analytics" section shows live data
3. Check "Top Events by Revenue" table populated
```

### Test 2: Register Participant (Admin - PL/SQL Procedure)
```
1. Go to http://localhost:3000/admin.html
2. Password: admin
3. Fill "Register New Participant" form
4. Click "Register Participant"
5. Verify success message
```

### Test 3: Event Analytics (Admin - PL/SQL Function)
```
1. In admin panel, select event from dropdown
2. Click "Load Analytics"
3. Verify Budget, Revenue, Profit displayed
4. Revenue calculated by fnCalculateTotalEventRevenue
```

### Test 4: Venue Occupancy (Admin - PL/SQL Cursor)
```
1. Select venue from dropdown
2. Click "Generate Report"
3. View all events at that venue
4. Check occupancy percentages
```

### Test 5: Bulk Ticket Generation (Admin - PL/SQL Package)
```
1. Select event, ticket type, price, quantity
2. Click "Generate Bulk Tickets"
3. Verify success message
4. Tickets created in database
```

### Test 6: Participant Lookup (Admin - PL/SQL Function)
```
1. Enter participant ID
2. Click "Check Tickets"
3. View total tickets booked by participant
```

---

## Database Credentials Template

If you're using Oracle 21c Express Edition (XE):

```env
DB_USER=system
DB_PASSWORD=YourPassword123
DB_CONNECTION_STRING=localhost:1521/XE
PORT=3000
```

---

## API Endpoints (Quick Reference)

### Public Endpoints
- `GET /dashboard` - Get dashboard statistics
- `GET /events` - Get all events
- `POST /bookTicket` - Book a ticket
- `GET /plsql/eventRevenue/:eventId` - Get event revenue (fnCalculateTotalEventRevenue)
- `GET /plsql/eventOrganizer/:eventId` - Get organizer name (fnGetEventOrganizerName)

### Admin Endpoints
- `POST /admin/events` - Create new event
- `POST /plsql/registerParticipant` - Register participant (procRegisterParticipant)
- `GET /admin/plsql/eventSummary/:eventId` - Get event summary with analytics
- `GET /admin/plsql/venueOccupancy/:venueId` - Get venue occupancy report
- `POST /admin/plsql/bulkTicketGeneration` - Generate tickets in bulk (pkgEventManagement)
- `GET /plsql/participantTickets/:participantId` - Get participant ticket count (fnGetParticipantTicketCount)

---

## Performance Tips

1. **Database Indexes**: Already created in 05_INDEXES.sql
2. **Connection Pooling**: Node.js oracledb uses connection pooling by default
3. **Caching**: Frontend caches dashboard data on load
4. **Compression**: Add gzip compression in production

---

## Deployment to Production

### Option 1: On-Premises Server
```bash
# Install as service (Windows)
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

### Option 2: Cloud (Vercel, Heroku, AWS)
- Push to GitHub
- Connect repository to hosting platform
- Set environment variables in platform settings
- Deploy automatically

---

## Support & Documentation

For more information, see:
- `PHASE4_DOCUMENTATION.md` - PL/SQL implementation details
- `PHASE4_FRONTEND_INTEGRATION.md` - Frontend integration guide
- `PHASE4_ALL_CHANGES.txt` - Complete change list
- `PHASE4_QUICK_REFERENCE.txt` - Quick testing guide

---

## Next Steps

1. Install dependencies: `npm install`
2. Create `.env` file with database credentials
3. Run SQL scripts in order
4. Start server: `node server.js`
5. Open http://localhost:3000
6. Test features from the guides above

Good luck! Happy coding!
