import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Nombre</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Correo</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Teléfono</p>
            <p className="font-medium">{user?.phone}</p>
          </div>
          <div>
            <p className="text-gray-600">Rol</p>
            <p className="font-medium capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;