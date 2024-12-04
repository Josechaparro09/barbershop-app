import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/admin/Dashboard';
import BarbersManagement from '../pages/admin/BarbersManagement';
import ServicesManagement from '../pages/admin/ServicesManagement';
import BarberDashboard from '../pages/barber/Dashboard';
import NewHaircut from '../pages/barber/NewHaircut';
import Layout from '../components/layout/Layout';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          <Navigate to={user.role === 'admin' ? '/admin' : '/barber'} />
        } />
        
        {/* Rutas de Admin */}
        {user.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/barbers" element={<BarbersManagement />} />
            <Route path="/admin/services" element={<ServicesManagement />} />
          </>
        )}
        
        {/* Rutas de Barbero */}
        {user.role === 'barber' && (
          <>
            <Route path="/barber" element={<BarberDashboard />} />
            <Route path="/barber/new-haircut" element={<NewHaircut />} />
          </>
        )}
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;