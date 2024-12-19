// src/pages/AppointmentBooking.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db }from '../../src/firebase/config';
import { useAuth } from '../../src/context/AuthContext';
import { toast } from 'react-hot-toast';
import { format, addDays, setHours, setMinutes, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, Scissors, Info } from 'lucide-react';

const AppointmentBooking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [takenSlots, setTakenSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    barberId: '',
    serviceId: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Horarios disponibles (9 AM a 8 PM)
  const timeSlots = Array.from({ length: 22 }, (_, i) => {
    const hour = Math.floor((i + 18) / 2);
    const minutes = (i + 18) % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  }).filter(time => {
    const [hour] = time.split(':');
    return parseInt(hour) >= 9 && parseInt(hour) < 20;
  });

  useEffect(() => {
    fetchBarbers();
    fetchServices();
  }, [user?.shopId]);

  useEffect(() => {
    if (selectedDate && formData.barberId) {
      fetchTakenSlots();
    }
  }, [selectedDate, formData.barberId]);

  const fetchBarbers = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("shopId", "==", user?.shopId),
        where("role", "==", "barber"),
        where("status", "==", "active")
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

  const fetchServices = async () => {
    try {
      const q = query(
        collection(db, "services"),
        where("shopId", "==", user?.shopId),
        where("active", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const fetchTakenSlots = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "appointments"),
        where("barberId", "==", formData.barberId),
        where("date", ">=", startOfDay),
        where("date", "<=", endOfDay),
        where("status", "in", ["confirmed", "pending"])
      );

      const querySnapshot = await getDocs(q);
      const slots = querySnapshot.docs.map(doc => doc.data().time);
      setTakenSlots(slots);
    } catch (error) {
      console.error("Error fetching taken slots:", error);
      toast.error("Error al verificar disponibilidad");
    }
  };

  const handleSubmit = async (e, time) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const selectedService = services.find(s => s.id === formData.serviceId);
      const selectedBarber = barbers.find(b => b.id === formData.barberId);

      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData = {
        barberId: formData.barberId,
        barberName: selectedBarber.name,
        serviceId: formData.serviceId,
        serviceName: selectedService.name,
        price: selectedService.price,
        clientName: formData.name,
        clientPhone: formData.phone,
        clientEmail: formData.email,
        notes: formData.notes,
        date: appointmentDate,
        time: time,
        status: 'pending',
        shopId: user.shopId,
        shopName: user.shopName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, "appointments"), appointmentData);
      toast.success("Cita agendada exitosamente");
      
      // Resetear formulario
      setFormData({
        barberId: '',
        serviceId: '',
        name: '',
        phone: '',
        email: '',
        notes: ''
      });
      setSelectedDate(new Date());
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Error al agendar la cita");
    } finally {
      setSaving(false);
    }
  };

  const validateForm = () => {
    if (!formData.barberId) {
      toast.error("Selecciona un barbero");
      return false;
    }
    if (!formData.serviceId) {
      toast.error("Selecciona un servicio");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("Ingresa el nombre del cliente");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Ingresa el teléfono del cliente");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Ingresa el email del cliente");
      return false;
    }
    return true;
  };

  const isTimeSlotAvailable = (time) => {
    return !takenSlots.includes(time);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Agenda tu Cita
      </h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          {/* Selección de Barbero y Servicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Barbero *
              </label>
              <select
                value={formData.barberId}
                onChange={(e) => setFormData({...formData, barberId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                required
              >
                <option value="">Selecciona un barbero</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Servicio *
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                required
              >
                <option value="">Selecciona un servicio</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                rows="3"
                placeholder="Instrucciones especiales o preferencias..."
              />
            </div>
          </div>

          {/* Selección de Fecha */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Fecha *
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              required
            />
          </div>

          {/* Horarios Disponibles */}
          {formData.barberId && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Horarios Disponibles
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {timeSlots.map((time) => {
                  const isAvailable = isTimeSlotAvailable(time);
                  return (
                    <button
                      key={time}
                      onClick={(e) => isAvailable && handleSubmit(e, time)}
                      disabled={!isAvailable || saving}
                      className={`px-3 py-2 rounded-md text-sm font-medium
                        ${isAvailable
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        } transition-colors`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;