import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Services = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Servicios</h1>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Mis Servicios del Día</h2>
        <div className="space-y-4">
          {/* Aquí irá la lista de servicios */}
          <p className="text-gray-600">No hay servicios registrados para hoy</p>
        </div>
      </div>
    </div>
  );
};

export default Services;