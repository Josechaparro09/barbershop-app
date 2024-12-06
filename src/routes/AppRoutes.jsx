// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Páginas públicas
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

// Páginas de administrador
import AdminDashboard from '../pages/admin/Dashboard';
import BarbersManagement from '../pages/admin/BarbersManagement';
import ServicesManagement from '../pages/admin/ServicesManagement';
import HaircutApprovals from '../pages/admin/HaircutApprovals';
import Inventory from '../pages/admin/Inventory';

// Páginas de barbero
import BarberDashboard from '../pages/barber/Dashboard';
import NewHaircut from '../pages/barber/NewHaircut';
import Profile from '../pages/barber/Profile';
import Services from '../pages/barber/Services';

// Componente de layout
import Layout from '../components/layout/Layout';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Rutas públicas si no hay usuario autenticado
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Rutas protegidas para usuarios autenticados
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          <Navigate to={user.role === 'admin' ? '/admin' : '/barber'} />
        } />
        
        {/* Rutas de Administrador */}
        {user.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/barbers" element={<BarbersManagement />} />
            <Route path="/admin/services" element={<ServicesManagement />} />
            <Route path="/admin/approvals" element={<HaircutApprovals />} />
            <Route path="/admin/inventory" element={<Inventory />} />
          </>
        )}

        {/* Rutas de Barbero */}
        {user.role === 'barber' && (
          <>
            <Route path="/barber" element={<BarberDashboard />} />
            <Route path="/barber/new-haircut" element={<NewHaircut />} />
            <Route path="/barber/profile" element={<Profile />} />
            <Route path="/barber/services" element={<Services />} />
          </>
        )}

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;