import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Scissors, 
  CreditCard, 
  FileText, 
  Loader,
  Search,
  Users,
  DollarSign,
  X,
  Clock,
  Wallet,
  CreditCard as CardIcon,
  SendHorizontal
} from 'lucide-react';

const AdminNewHaircut = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState(1); // 1: Select Service, 2: Client Details
  const [formData, setFormData] = useState({
    serviceId: '',
    clientName: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    if (user?.shopId) {
      fetchServices();
    }
  }, [user?.shopId]);

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
      toast.error("Error al cargar los servicios");
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
        status: 'completed',
        approvalStatus: 'approved',
        approvedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "haircuts"), haircutData);
      toast.success("Servicio registrado exitosamente");
      navigate('/admin');
    } catch (error) {
      toast.error("Error al registrar el servicio");
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nuevo Servicio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 1 ? 'Selecciona el servicio' : 'Detalles del cliente'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm">
            <div className={`w-4 h-4 rounded-full ${step >= 1 ? 'bg-yellow-500' : 'bg-gray-300'} mr-2`} />
            <div className={`w-4 h-4 rounded-full ${step >= 2 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>

      {step === 1 ? (
        <>
          {/* Búsqueda de servicios */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          {/* Grid de servicios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  setFormData(prev => ({ ...prev, serviceId: service.id }));
                  setStep(2);
                }}
                className={`cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                  formData.serviceId === service.id
                    ? 'ring-2 ring-yellow-500'
                    : ''
                }`}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <Scissors className="h-6 w-6 text-yellow-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-medium">
                        ${service.price}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {service.description || 'Sin descripción'}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.duration || 30} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Servicio seleccionado
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Scissors className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-gray-900 dark:text-white">
                      {services.find(s => s.id === formData.serviceId)?.name}
                    </span>
                  </div>
                  <span className="font-medium text-yellow-500">
                    ${services.find(s => s.id === formData.serviceId)?.price}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Cliente *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-yellow-500 focus:border-yellow-500"
                    required
                    placeholder="Nombre completo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'cash', name: 'Efectivo', icon: Wallet },
                    { id: 'card', name: 'Tarjeta', icon: CardIcon },
                    { id: 'transfer', name: 'Transferencia', icon: SendHorizontal }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: method.id})}
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors
                        ${formData.paymentMethod === method.id
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                      <method.icon className={`h-6 w-6 mb-2 ${
                        formData.paymentMethod === method.id
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                      }`} />
                      <span className={`text-sm ${
                        formData.paymentMethod === method.id
                          ? 'text-yellow-700 dark:text-yellow-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-yellow-500 focus:border-yellow-500"
                    rows="3"
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Guardando...
                    </div>
                  ) : 'Registrar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewHaircut;