// hooks/useProductForm.js  
import { useState, useEffect } from 'react';  
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';  
import { db } from '../firebase/config';  

export const useProductForm = (initialProduct = null) => {  
  const [formData, setFormData] = useState({  
    name: '',  
    category: '',  
    cost: '',  
    price: '',  
    stock: '',  
    minStock: '',  
    barcode: '',  
    provider: '',  
    description: '',  
    createdAt: new Date(),  
    updatedAt: new Date()  
  });  

  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null);  
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);  

  useEffect(() => {  
    if (initialProduct) {  
      setFormData(initialProduct);  
    }  
  }, [initialProduct]);  

  // Función para buscar producto por código de barras  
  const searchProductByBarcode = async (barcode) => {  
    try {  
      setLoading(true);  
      const productsRef = collection(db, 'products');  
      const q = query(productsRef, where('barcode', '==', barcode));  
      const querySnapshot = await getDocs(q);  

      if (!querySnapshot.empty) {  
        const productData = querySnapshot.docs[0].data();  
        return productData;  
      }  
      return null;  
    } catch (error) {  
      console.error('Error buscando producto:', error);  
      setError(error.message);  
      return null;  
    } finally {  
      setLoading(false);  
    }  
  };  

  // Función para manejar el escaneo del código de barras  
  const handleBarcodeScanned = async (barcode) => {  
    try {  
      setLoading(true);  
      const existingProduct = await searchProductByBarcode(barcode);  

      if (existingProduct) {  
        // Si el producto existe, actualizar el formulario con sus datos  
        setFormData(existingProduct);  
        alert('Producto encontrado! Los datos han sido cargados.');  
      } else {  
        // Si el producto no existe, solo actualizar el código de barras  
        setFormData(prev => ({  
          ...prev,  
          barcode: barcode  
        }));  
      }  
    } catch (error) {  
      console.error('Error al procesar el código de barras:', error);  
      setError(error.message);  
    } finally {  
      setLoading(false);  
      setBarcodeModalOpen(false);  
    }  
  };  

  // Función para guardar o actualizar el producto  
  const saveProduct = async () => {  
    try {  
      setLoading(true);  
      setError(null);  

      const productData = {  
        ...formData,  
        updatedAt: new Date()  
      };  

      if (initialProduct) {  
        // Actualizar producto existente  
        await updateDoc(doc(db, 'products', initialProduct.id), productData);  
      } else {  
        // Crear nuevo producto  
        const newProductRef = doc(collection(db, 'products'));  
        await setDoc(newProductRef, {  
          ...productData,  
          id: newProductRef.id,  
          createdAt: new Date()  
        });  
      }  

      return true;  
    } catch (error) {  
      console.error('Error guardando producto:', error);  
      setError(error.message);  
      return false;  
    } finally {  
      setLoading(false);  
    }  
  };  

  return {  
    formData,  
    setFormData,  
    loading,  
    error,  
    barcodeModalOpen,  
    setBarcodeModalOpen,  
    handleBarcodeScanned,  
    saveProduct  
  };  
};  