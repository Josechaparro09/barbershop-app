// src/pages/admin/AppointmentsManagement.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, Phone, Mail, Scissors, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusTranslations = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada'
};

const AppointmentsManagement = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterBarber, setFilterBarber] = useState('all');
  const [barbers, setBarbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.shopId) {
      fetchAppointments();
      fetchBarbers();
    }
  }, [user?.shopId]);

  const fetchBarbers = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("shopId", "==", user.shopId),
        where("role", "==", "barber")
      );
      
      const querySnapshot = await getDocs(q);
      const barbersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBarbers(barbersData);
    } catch (error) {
      console.error("Error fetching barbers:", error);
      toast.error("Error al cargar los barberos");
    }
  };

  const fetchAppointments = async () => {
    try {
      const q = query(
        collection(db, "appointments"),
        where("shopId", "==", user.shopId)
      );
      
      const querySnapshot = await getDocs(q);
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      
      setAppointments(appointmentsData.sort((a, b) => b.date - a.date));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: user.uid
      });

      setAppointments(appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus }
          : appointment
      ));

      toast.success(`Cita ${statusTranslations[newStatus].toLowerCase()} exitosamente`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Error al actualizar la cita");
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Filtro por estado
    if (filterStatus !== 'all' && appointment.status !== filterStatus) return false;

    // Filtro por barbero
    if (filterBarber !== 'all' && appointment.barberId !== filterBarber) return false;

    // Filtro por fecha
    if (filterDate === 'today' && !isToday(appointment.date)) return false;
    if (filterDate === 'week' && !isThisWeek(appointment.date)) return false;
    if (filterDate === 'month' && !isThisMonth(appointment.date)) return false;

    // Filtro por búsqueda
    const searchTermLower = searchTerm.toLowerCase();
    return (
      appointment.clientName.toLowerCase().includes(searchTermLower) ||
      appointment.clientPhone.includes(searchTerm) ||
      appointment.clientEmail.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Citas</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, teléfono o email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="all">Todas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barbero
            </label>
            <select
              value={filterBarber}
              onChange={(e) => setFilterBarber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="all">Todos</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterDate('all');
                setFilterBarber('all');
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barbero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.clientName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.clientPhone}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.clientEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(appointment.date, 'dd/MM/yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.serviceName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${appointment.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.barberName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status]}`}>
                      {statusTranslations[appointment.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {appointment.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    {appointment.status === 'confirmed' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Completar
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron citas que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsManagement;