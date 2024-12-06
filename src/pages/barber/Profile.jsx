// src/pages/barber/Profile.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Mail, Phone, UserCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="space-y-1">
      <p className={`flex items-center gap-2 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <Icon size={18} />
        {label}
      </p>
      <p className={`font-medium ml-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {value}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-2xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Mi Perfil
      </h1>
      
      <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-lg font-semibold mb-6 pb-2 border-b ${
          theme === 'dark' ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'
        }`}>
          Información Personal
        </h2>

        <div className="space-y-6">
          <InfoItem 
            icon={User}
            label="Nombre"
            value={user?.name}
          />
          
          <InfoItem 
            icon={Mail}
            label="Correo"
            value={user?.email}
          />
          
          <InfoItem 
            icon={Phone}
            label="Teléfono"
            value={user?.phone}
          />
          
          <InfoItem 
            icon={UserCheck}
            label="Rol"
            value={user?.role === 'admin' ? 'Administrador' : 'Barbero'}
          />
        </div>

        {/* Status badge */}
        <div className="mt-8">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm
            ${user?.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            }`}>
            {user?.status === 'active' ? 'Activo' : 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;