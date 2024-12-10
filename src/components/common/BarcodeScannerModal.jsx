import React from 'react';
import BarcodeScanner from './BarcodeScanner';

const BarcodeScannerModal = ({ isOpen, onClose, onScan, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <BarcodeScanner 
          onResult={(result) => {
            onScan(result);
            onClose();
          }}
          onError={(error) => {
            console.error("Error al escanear:", error);
          }}
        />

        <div className="mt-4 text-sm text-gray-500 text-center">
          Apunta la cámara al código de barras para escanearlo
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;