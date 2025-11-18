import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Info, CheckCircle } from 'lucide-react';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';

const InsuranceCascoPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [formData, setFormData] = useState({
    carBrand: '',
    carModel: '',
    year: '',
    vin: '',
    mileage: '',
    registrationNumber: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    driverExperience: '',
    previousInsurance: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Симуляция отправки данных
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="bg-white px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="w-10"></div>
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
              Заявка принята
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="px-5 pt-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-black font-ibm text-2xl font-semibold mb-3">
              Заявка на КАСКО принята!
            </h2>
            <p className="text-gray-600 font-ibm text-sm mb-6">
              Наш специалист свяжется с вами в течение 24 часов для уточнения деталей и оформления полиса.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-500 text-white font-ibm text-base font-medium py-4 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Оформление КАСКО
          </div>
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Car Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-black font-ibm text-lg font-semibold mb-4">
              Информация об автомобиле
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Марка автомобиля
                </label>
                <input
                  type="text"
                  name="carBrand"
                  value={formData.carBrand}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  placeholder="Например: Toyota"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Модель
                </label>
                <input
                  type="text"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  placeholder="Например: Camry"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Год выпуска
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  VIN номер
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  required
                  maxLength={17}
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  placeholder="Введите VIN номер"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Пробег (км)
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Гос. номер
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                  placeholder="А123БВ777"
                />
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-black font-ibm text-lg font-semibold mb-4">
              Информация о владельце
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  ФИО
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  placeholder="example@mail.ru"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-ibm text-sm font-medium mb-2">
                  Стаж вождения (лет)
                </label>
                <input
                  type="number"
                  name="driverExperience"
                  value={formData.driverExperience}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  className="w-full bg-white rounded-[27px] px-4 py-3 text-gray-900 font-ibm text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  placeholder="5"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="previousInsurance"
                  id="previousInsurance"
                  checked={formData.previousInsurance}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="previousInsurance" className="text-gray-700 font-ibm text-sm">
                  Был застрахован ранее
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white font-ibm text-base font-medium py-4 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>

      {/* Info Panel */}
      <InfoPanel
        isOpen={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
        title={pageInfo.title}
        content={pageInfo.content}
        color={pageInfo.color}
      />
    </div>
  );
};

export default InsuranceCascoPage;

