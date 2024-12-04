import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const categories = [
  { id: 'drinks', name: 'Bebidas' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'products', name: 'Productos de Barbería' },
  { id: 'accessories', name: 'Accesorios' }
];

const Inventory = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'drinks',
    price: '',
    stock: '',
    minStock: '',
    description: ''
  });

  useEffect(() => {
    console.log("Estado actual del usuario:", user);
    if (user) {
      fetchProducts();
    }
  }, [user?.shopId]);

  const fetchProducts = async () => {
    if (!user?.shopId) {
      console.log("No hay shopId disponible");
      setLoading(false);
      return;
    }

    try {
      console.log("Intentando obtener productos para shopId:", user.shopId);
      const q = query(
        collection(db, "inventory"),
        where("shopId", "==", user.shopId)
      );
      
      const querySnapshot = await getDocs(q);
      console.log("Documentos encontrados:", querySnapshot.size);
      
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Productos procesados:", productsData);
      
      setProducts(productsData);
      
      if (productsData.length === 0) {
        toast.info("No hay productos en el inventario. ¡Agrega algunos!");
      }
    } catch (error) {
      console.error("Error detallado al obtener productos:", error);
      toast.error("Error al cargar los productos: " + error.message);
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
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        description: formData.description.trim(),
        shopId: user.shopId,
        shopName: user.shopName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (selectedProduct) {
        // Actualizar producto existente
        await updateDoc(doc(db, "inventory", selectedProduct.id), {
          ...productData,
          updatedAt: new Date().toISOString()
        });
        toast.success("Producto actualizado exitosamente");
      } else {
        // Crear nuevo producto
        await addDoc(collection(db, "inventory"), productData);
        toast.success("Producto agregado exitosamente");
      }

      setFormData({
        name: '',
        category: 'drinks',
        price: '',
        stock: '',
        minStock: '',
        description: ''
      });
      setSelectedProduct(null);
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error al guardar el producto");
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, "inventory", productId));
        toast.success("Producto eliminado exitosamente");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Error al eliminar el producto");
      }
    }
  };

  const handleSellClick = (product) => {
    setSelectedProduct(product);
    setSellQuantity(1);
    setIsSellModalOpen(true);
  };

  const handleSell = async () => {
    try {
      if (!selectedProduct || sellQuantity < 1 || sellQuantity > selectedProduct.stock) {
        toast.error("Cantidad inválida");
        return;
      }

      // Actualizar stock
      const productRef = doc(db, "inventory", selectedProduct.id);
      await updateDoc(productRef, {
        stock: selectedProduct.stock - sellQuantity,
        updatedAt: new Date().toISOString()
      });

      // Registrar venta
      await addDoc(collection(db, "sales"), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: sellQuantity,
        price: selectedProduct.price,
        total: selectedProduct.price * sellQuantity,
        shopId: user.shopId,
        shopName: user.shopName,
        soldBy: user.uid,
        soldByName: user.name,
        createdAt: new Date().toISOString()
      });

      toast.success("Venta registrada exitosamente");
      setIsSellModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error registering sale:", error);
      toast.error("Error al registrar la venta");
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || product.category === selectedCategory)
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600">{user?.shopName}</p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setFormData({
              name: '',
              category: 'drinks',
              price: '',
              stock: '',
              minStock: '',
              description: ''
            });
            setIsModalOpen(true);
          }}
          className="mt-4 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" /> Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Buscar producto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No hay productos que coincidan con tu búsqueda.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {categories.find(c => c.id === product.category)?.name}
                  </p>
                </div>
                <p className="text-lg font-bold text-indigo-600">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-2">Stock: {product.stock}</p>
              {product.stock <= product.minStock && (
                <p className="text-sm text-red-500 mb-2">
                  ¡Stock bajo! Mínimo: {product.minStock}
                </p>
              )}
              {product.description && (
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              )}
              <div className="flex justify-between">
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <button
                  onClick={() => handleSellClick(product)}
                  disabled={product.stock < 1}
                  className={`flex items-center text-sm px-3 py-1 rounded ${
                    product.stock < 1
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <FiDollarSign className="mr-1" /> Vender
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {selectedProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Venta */}
      {isSellModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrar Venta</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-gray-600">Precio: ${selectedProduct.price.toFixed(2)}</p>
                <p className="text-gray-600">Stock disponible: {selectedProduct.stock}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="1"
                  max={selectedProduct.stock}
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-lg font-bold">
                  Total: ${(selectedProduct.price * sellQuantity).toFixed(2)}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsSellModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSell}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Confirmar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;