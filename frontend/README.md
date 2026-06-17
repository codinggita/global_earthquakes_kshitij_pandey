# 🌐 SeismicHub Analytics Dashboard — Frontend

A production-grade, highly responsive React Single Page Application (SPA) designed for global earthquake data visualization, search, analysis, and admin CRUD operations.  
Consumes the **Global Earthquake Analytics API** backend.

---

## 🚀 Features

- **Seismic Overview (Dashboard)**: Real-time cards (counts, max magnitude, averages, max depth) and interactive Recharts visualizations (Monthly Trends & Category breakdown).
- **Interactive Ledger**: Full data table with server-side pagination, sorting, text search, and multi-range filters (Magnitude, Depth, Status).
- **Admin CRUD Control**: Authenticated administrators can record new earthquake incidents, edit parameters, and delete records via dynamic forms.
- **Advanced Analytics**: Visual insights containing country frequency bar charts, magnitude area charts, and average focal depth line graphs.
- **Profile Center**: Allows users to manage personal profile data and update password credentials.
- **Admin control panel**: View user lists, toggle administrative permissions, and deactivate user accounts.
- **Auto-Refresh Auth**: Automatic JWT refresh token rotation on 401 response codes via Axios interceptors.

---

## 🛠 Tech Stack

- **Framework**: React.js (Vite compiler)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: React Icons (Feather Pack)

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── assets/         # Project images & SVG files
│   ├── components/     # Reusable UI elements
│   ├── context/        # AuthContext for global JWT state
│   ├── layouts/        # DashboardLayout (Sidebar + Navbar)
│   ├── pages/          # Dashboard, Earthquakes, Stats, Analytics, Profile, Admin, Login, Register
│   ├── routes/         # Router declarations & Navigation guards
│   ├── services/       # Centralized api.js Axios configuration
│   ├── App.jsx         # App router wrapper
│   ├── index.css       # Tailwind base styles
│   └── main.jsx        # Mount point
├── .env                # Local development variables
├── vite.config.js      # Compiler plugins & config
└── package.json        # Dependencies
```

---

## 🔧 Installation & Setup

### 1. Clone & Install
```bash
cd global_earthquakes_kshitij_pandey/frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173`. Make sure the backend server is running on `http://localhost:5000`.

---

## 📦 Build & Production Compilation

To generate a static build suitable for web deployment:
```bash
npm run build
```
This produces a compiled, optimized, and minified production build in the `/dist` directory.

---

## 🚀 Deployment Instructions

### Deploy to Render
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > Static Site**.
2. Connect your GitHub repository.
3. Select your repository branch.
4. Set the following configuration settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Go to **Environment** tab and add:
   - `VITE_API_URL` = *Your deployed Render backend URL (e.g. `https://global-earthquake-analytics-api.onrender.com/api/v1`)*
6. Click **Create Static Site**.

---

## 📝 Git Commit & Push Guidelines

To commit the new frontend and push it to the GitHub repository:

```bash
# Stage all new frontend files
git add .

# Commit changes
git commit -m "feat: complete React-Vite frontend for Earthquake Analytics Dashboard (PR-18)"

# Push to origin remote branch
git push origin pr-17-final
```
