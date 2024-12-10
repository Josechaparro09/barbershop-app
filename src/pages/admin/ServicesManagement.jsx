import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';
import { FiEdit2, FiTrash2, FiClock, FiPlus, FiDollarSign } from 'react-icons/fi';
import { CurrencyInput } from '../../components/common/MoneyInput';

const ServicesManagement = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });

  useEffect(() => {
    fetchServices();
  }, [user?.shopId]);

  const fetchServices = async () => {
    if (!user?.shopId) return;

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
      console.error("Error fetching services:", error);
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.shopId) {
      toast.error("Error: No se encontró la información de la barbería");
      return;
    }

    try {
      if (!formData.name || !formData.price || !formData.duration) {
        toast.error("Por favor completa todos los campos requeridos");
        return;
      }

      const serviceData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        duration: Number(formData.duration),
        description: formData.description.trim(),
        shopId: user.shopId,
        shopName: user.shopName,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingService) {
        const serviceRef = doc(db, "services", editingService.id);
        await updateDoc(serviceRef, {
          ...serviceData,
          updatedAt: new Date().toISOString()
        });
        toast.success("Servicio actualizado exitosamente");
      } else {
        await addDoc(collection(db, "services"), serviceData);
        toast.success("Servicio creado exitosamente");
      }

      setFormData({ name: '', price: '', duration: '', description: '' });
      setEditingService(null);
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Error al guardar el servicio");
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration.toString(),
      description: service.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId, serviceName) => {
    if (window.confirm(`¿Estás seguro de eliminar el servicio "${serviceName}"?`)) {
      try {
        await deleteDoc(doc(db, "services", serviceId));
        toast.success("Servicio eliminado exitosamente");
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Error al eliminar el servicio");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h1>
          <p className="text-[#2c1810]">{user?.shopName}</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', price: '', duration: '', description: '' });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <FiPlus /> Nuevo Servicio
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiPlus className="text-indigo-600" />
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c1810]">
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4c3b5] rounded focus:ring-1 focus:ring-[#6b4423] bg-[#f8f5f0]0"
                  required
                  placeholder="Ej: Corte de cabello"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c1810]">
                  Precio *
                </label>
                <div className="mt-1 relative">
                  <CurrencyInput
                    value={formData.price}
                    onValueChange={(value) => setFormData({...formData, price: value})}
                    className="w-full px-3 py-2 border border-[#d4c3b5] rounded focus:ring-1 focus:ring-[#6b4423] bg-[#f8f5f0]0 pl-8"
                    required
                  />
                  <FiDollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c1810]">
                  Duración (minutos) *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-[#d4c3b5] rounded focus:ring-1 focus:ring-[#6b4423] bg-[#f8f5f0]0 pl-8"
                    required
                    min="1"
                    placeholder="Ej: 30"
                  />
                  <FiClock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c1810]">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4c3b5] rounded focus:ring-1 focus:ring-[#6b4423] bg-[#f8f5f0]0"
                  rows="3"
                  placeholder="Descripción detallada del servicio..."
                  
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingService ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8 bg-white rounded-lg shadow">
            <FiPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay servicios</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo servicio.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setFormData({ name: '', price: '', duration: '', description: '' });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                Nuevo Servicio
              </button>
            </div>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2c1810]">{service.name}</h3>
                  <p className="text-lg font-bold text-indigo-600">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(service.price)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FiClock className="mr-1" />
                <span>{service.duration} minutos</span>
              </div>
              {service.description && (
                <p className="text-sm text-gray-600 mt-2">{service.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServicesManagement;