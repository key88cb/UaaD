import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';
import ActivitiesPage from './pages/Activities';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes Wrapper */}
            <Route path="/app" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Nested Application Routes */}
              <Route path="overview" element={<DashboardPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="" element={<Navigate to="/app/overview" replace />} />
            </Route>

            {/* Legacy Fallbacks */}
            <Route path="/dashboard" element={<Navigate to="/app/overview" replace />} />
            <Route path="/" element={<Navigate to="/app/overview" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
