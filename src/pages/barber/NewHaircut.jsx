import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NewHaircut = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    if (!user) {
      console.log('No hay usuario autenticado');
      return;
    }

    console.log('Estado del usuario:', {
      status: user.status,
      role: user.role,
      name: user.name
    });

    // Solo verificar si el status es diferente de 'active'
    if (user.status !== 'active') {
      console.log('Usuario no activo:', user.status);
      toast.error('Tu cuenta no está activa. Contacta al administrador.');
      navigate('/barber');
      return;
    }

    console.log('Usuario activo, procediendo a cargar servicios');
    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    if (!user?.shopId) {
      console.log('No se encontró shopId');
      toast.error("Error al cargar los servicios");
      return;
    }

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
      console.log('Servicios cargados:', servicesData.length);
      setServices(servicesData);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      toast.error("Error al cargar los servicios disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.status === 'active') {
      toast.error('No tienes autorización para registrar servicios');
      return;
    }

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
        approvalStatus: 'pending', // Estado pendiente de aprobación
        status: 'pending'         // Estado del servicio
      };

      await addDoc(collection(db, "haircuts"), haircutData);
      toast.success("Servicio registrado y pendiente de aprobación");
      navigate('/barber');
    } catch (error) {
      console.error("Error al registrar el servicio:", error);
      toast.error("Error al registrar el servicio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || user.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso No Autorizado
          </h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta no está activa. Contacta al administrador.
          </p>
          <button
            onClick={() => navigate('/barber')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrar Nuevo Servicio</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Servicio *
          </label>
          <select
            value={formData.serviceId}
            onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Cliente *
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="3"
            placeholder="Agregar notas adicionales..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/barber')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {saving ? 'Guardando...' : 'Registrar Servicio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewHaircut;  