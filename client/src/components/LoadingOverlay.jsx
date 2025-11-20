import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ message = 'Загрузка данных...' }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-6 text-gray-600 font-ibm text-lg font-medium">{message}</p>
        <p className="mt-2 text-gray-400 font-ibm text-sm">Пожалуйста, подождите</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;

