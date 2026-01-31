// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
function Layout({ children }) {
  const location = useLocation();
  // page has no nav
  const noNavbarRoutes = ['/home', '/login', '/register'];
  const sidebarRoutes = ['/dashboard', '/tasks'];
  // check if current page hides navbar
  const hideNavbar = noNavbarRoutes.includes(location.pathname);
  const useSidebar = sidebarRoutes.includes(location.pathname);

  if (useSidebar) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar/>}
      {children}
    </div>
  );
}
function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>          
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <Tasks />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;