import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import { FiX, FiCamera } from 'react-icons/fi';

const QuickSaleScanner = ({ onScan, onClose }) => {
  const [isStarted, setIsStarted] = useState(true);

  const { ref } = useZxing({
    paused: !isStarted,
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError(error) {
      console.error("Error del escáner:", error);
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#f8f5f0] rounded-lg p-4 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="mb-4 text-center">
          <h3 className="text-lg font-medium text-[#2c1810]">Escanear Producto</h3>
          <p className="text-sm text-gray-500">Apunta al código de barras del producto</p>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden">
          <video ref={ref} className="w-full h-64 object-cover" />
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-[20%] top-[30%] bottom-[30%] border-2 border-yellow-500 border-opacity-50">
              <div className="absolute inset-0 border-2 border-yellow-500 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-[#8b7355]">
          El producto se agregará automáticamente al escanear
        </div>
      </div>
    </div>
  );
};

export default QuickSaleScanner;