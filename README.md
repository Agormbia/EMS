# Equipment Management System

A comprehensive full-stack equipment management system with CRUD operations, built with Node.js/Express backend and React frontend.

## 🚀 Features

### Backend

- **RESTful API** with full CRUD operations for equipment
- **SQLite Database** with automatic migrations
- **Swagger Documentation** for API testing and exploration
- **Equipment History Tracking** for audit trails
- **Dashboard Analytics** with comprehensive reporting
- **Data Validation** and error handling

### Frontend

- **Modern React UI** built with Vite
- **Responsive Design** using Tailwind CSS
- **Real-time Dashboard** with charts and statistics
- **Equipment Management** with filtering and search
- **Reports & Analytics** with export functionality
- **Settings Management** for system configuration

## 🏗️ Project Structure

```
equipment-management-system/
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── routes/             # API routes
│   ├── migrations/         # Database migration scripts
│   ├── data/               # SQLite database files
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **Swagger** - API documentation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Chart components
- **Lucide React** - Icon library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Beekeeper Studio** (optional, for database management) - [Download here](https://www.beekeeperstudio.io/)

## 🚀 Getting Started (Step-by-Step)

### Step 1: Clone the Repository

```bash
# Clone the repository to your local machine
git clone <repository-url>
cd equipment-management-system
```

### Step 2: Install Dependencies

```bash
# Install all dependencies for root, backend, and frontend
npm run install:all
```

**What this does:**

- Installs root-level dependencies
- Installs backend dependencies (`backend/package.json`)
- Installs frontend dependencies (`frontend/package.json`)

**Alternative manual installation:**

```bash
# If the above doesn't work, install manually:
npm install                    # Root dependencies
cd backend && npm install     # Backend dependencies
cd ../frontend && npm install # Frontend dependencies
cd ..                         # Back to root
```

### Step 3: Set Up the Database

```bash
# Initialize database with tables and sample data
npm run migrate
```

**What this does:**

- Creates SQLite database at `backend/data/equipment.db`
- Creates all necessary tables (equipment, categories, locations, equipment_history)
- Seeds the database with sample data
- Sets up default categories and locations

**If you need to reset the database:**

```bash
npm run migrate:reset
```

### Step 4: Start the Development Servers

```bash
# Start both backend and frontend in development mode
npm run dev
```

**What this starts:**

- **Backend Server**: http://localhost:5000
- **Frontend App**: http://localhost:3000
- **API Documentation**: http://localhost:5000/api-docs

**Alternative manual startup:**

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

### Step 5: Access the Application

1. **Open your browser** and go to: http://localhost:3000
2. **You should see the Dashboard** with equipment statistics
3. **Test the API** by visiting: http://localhost:5000/api-docs

## 🔧 Troubleshooting Common Issues

### Port Already in Use

If you get "port already in use" errors:

```bash
# Windows - Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Windows - Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux - Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Mac/Linux - Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Issues

If the database isn't working:

```bash
# Reset the database completely
npm run migrate:reset

# Check if database file exists
ls backend/data/
# Should show: equipment.db
```

### Dependencies Issues

If packages aren't installing correctly:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 Database Setup Details

The system automatically creates a SQLite database at `backend/data/equipment.db` with the following tables:

- **equipment** - Main equipment records
- **equipment_history** - Change tracking and audit logs
- **categories** - Equipment categories
- **locations** - Equipment locations

### Sample Data Included

The system comes with pre-loaded sample data:

**Categories:**

- Electronics, Tools, Medical Equipment, Safety & Security, Appliances, IT & Networking, Miscellaneous

**Locations:**

- Main Office, Warehouse A, Lab 1, Conference Room, Storage Room

**Sample Equipment:**

- Various equipment items across different categories and locations

### Database Management with Beekeeper Studio

1. Open Beekeeper Studio
2. Create a new SQLite connection
3. Navigate to: `backend/data/equipment.db`
4. Connect to explore tables and data

## 🔧 Available Scripts

### Root Level Commands

```bash
npm run dev              # Start both backend and frontend
npm run install:all      # Install all dependencies
npm run migrate          # Run database migrations
npm run migrate:reset    # Reset and recreate database
```

### Backend Commands

```bash
cd backend
npm run dev              # Start backend with nodemon (auto-restart on changes)
npm run start            # Start backend in production mode
npm run migrate          # Run migrations
npm run migrate:reset    # Reset database
```

### Frontend Commands

```bash
cd frontend
npm run dev              # Start Vite dev server (fast refresh)
npm run build            # Build for production
npm run preview          # Preview production build locally
```

## 🌐 API Endpoints

### Equipment Management

- `GET /api/equipment` - List all equipment
- `GET /api/equipment/:id` - Get equipment by ID
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment
- `GET /api/equipment/categories` - Get categories
- `GET /api/equipment/locations` - Get locations
- `GET /api/equipment/:id/history` - Get equipment history

### Dashboard & Analytics

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/equipment-by-category` - Equipment count by category
- `GET /api/dashboard/equipment-by-status` - Equipment count by status
- `GET /api/dashboard/equipment-by-location` - Equipment count by location
- `GET /api/dashboard/recent-activity` - Recent system activity
- `GET /api/dashboard/maintenance-due` - Equipment due for maintenance
- `GET /api/dashboard/equipment-value` - Equipment value summary

## 🎨 Frontend Pages

1. **Dashboard** - Overview with statistics and charts
2. **Equipment Management** - List, filter, and manage equipment
3. **Equipment Detail** - View equipment information and history
4. **Reports** - Analytics and exportable reports
5. **Settings** - System configuration

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Input validation** and sanitization
- **SQL injection protection** with parameterized queries
- **Audit logging** for all changes

## 📱 Responsive Design

The frontend is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices
- All modern browsers

## 🚀 Deployment

### Backend Deployment

1. Set environment variables
2. Run `npm run build` (if applicable)
3. Start with `npm start`

### Frontend Deployment

1. Run `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure API proxy if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the API documentation at `/api-docs`
- Review the code comments
- Open an issue on GitHub

## 🔮 Future Enhancements

- User authentication and authorization
- Advanced reporting with PDF export
- Equipment maintenance scheduling
- Barcode/QR code integration
- Mobile app
- Multi-tenant support
- Advanced analytics and AI insights

---

**Happy Equipment Managing! 🎉**
