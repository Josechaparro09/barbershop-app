// src/pages/barber/NewHaircut.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Scissors, CreditCard, FileText, Loader } from 'lucide-react';

const NewHaircut = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    clientName: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    if (!user) return;
    if (user.status !== 'active') {
      toast.error('Tu cuenta no está activa. Contacta al administrador.');
      navigate('/barber');
      return;
    }
    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      const q = query(
        collection(db, "services"),
        where("shopId", "==", user.shopId)
      );
      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    } catch (error) {
      toast.error("Error al cargar los servicios disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceId || !formData.clientName.trim()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const selectedService = services.find(s => s.id === formData.serviceId);
      if (!selectedService) {
        toast.error("Servicio no válido");
        return;
      }

      const haircutData = {
        serviceId: formData.serviceId,
        serviceName: selectedService.name,
        price: selectedService.price,
        clientName: formData.clientName.trim(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
        barberId: user.uid,
        barberName: user.name,
        shopId: user.shopId,
        shopName: user.shopName,
        createdAt: new Date().toISOString(),
        approvalStatus: 'pending',
        status: 'pending'
      };

      await addDoc(collection(db, "haircuts"), haircutData);
      toast.success("Servicio registrado y pendiente de aprobación");
      navigate('/barber');
    } catch (error) {
      toast.error("Error al registrar el servicio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className={`animate-spin h-8 w-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
      </div>
    );
  }

  const inputBaseClasses = `w-full px-3 py-2 rounded-md shadow-sm transition-colors duration-200
    ${theme === 'dark' 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    } focus:ring-yellow-500 focus:border-yellow-500`;

  return (
    <div className={`container mx-auto px-4 py-8 max-w-2xl ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Scissors className="h-6 w-6" />
        Registrar Nuevo Servicio
      </h1>
      
      <div className={`rounded-lg shadow-lg p-6 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Seleccionar Servicio *
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              className={inputBaseClasses}
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

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Nombre del Cliente *
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className={inputBaseClasses}
              placeholder="Nombre del cliente"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Método de Pago
            </label>
            <div className="relative">
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className={inputBaseClasses}
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
              </select>
              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Notas
            </label>
            <div className="relative">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className={`${inputBaseClasses} pl-10`}
                rows="3"
                placeholder="Agregar notas adicionales..."
              />
              <FileText className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/barber')}
              className={`px-4 py-2 rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center px-4 py-2 rounded-md bg-yellow-500 
                text-black transition-colors duration-200 
                ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
            >
              {saving ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Guardando...
                </>
              ) : 'Registrar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewHaircut;