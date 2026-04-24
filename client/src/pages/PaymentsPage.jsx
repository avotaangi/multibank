import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { CreditCard, CheckCircle, XCircle, Clock, Download, Search, Phone, Info } from 'lucide-react';
import { universalPaymentsAPI, mobilePaymentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';
import useAuthStore from '../stores/authStore';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  // Активная вкладка: 'universal' или 'mobile'
  const [activeTab, setActiveTab] = useState('universal');
  
  // Популярные услуги
  const popularServices = [
    { id: '2', name: 'МТС', description: 'Пополнение счета МТС', icon: '📱' },
    { id: '3', name: 'Билайн', description: 'Пополнение счета Билайн', icon: '📱' },
    { id: '4', name: 'МегаФон', description: 'Пополнение счета МегаФон', icon: '📱' },
    { id: '5', name: 'Теле2', description: 'Пополнение счета Теле2', icon: '📱' },
    { id: '6', name: 'Yota', description: 'Пополнение счета Yota', icon: '📱' },
  ];

  // Состояние для универсальных платежей
  const [step, setStep] = useState('start'); // 'start', 'fill', 'confirm', 'success'
  const [providerServiceId, setProviderServiceId] = useState('');
  const [customServiceId, setCustomServiceId] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [paymentFields, setPaymentFields] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [currentPayment, setCurrentPayment] = useState(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [paymentId, setPaymentId] = useState('');

  // Состояние для мобильных платежей
  const [mobileStep, setMobileStep] = useState('phone'); // 'phone', 'amount', 'confirm', 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneInfo, setPhoneInfo] = useState(null);
  const [mobilePaymentAmount, setMobilePaymentAmount] = useState('');
  const [selectedMobileProduct, setSelectedMobileProduct] = useState(null);
  const [mobileCurrentPayment, setMobileCurrentPayment] = useState(null);
  const [mobileConfirmCode, setMobileConfirmCode] = useState('');
  const [mobilePaymentId, setMobilePaymentId] = useState('');

  // Получение списка продуктов клиента (для универсальных платежей)
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery(
    ['clientProducts', activeTab],
    () => {
      if (activeTab === 'mobile') {
        return mobilePaymentsAPI.getProducts({});
      }
      return universalPaymentsAPI.getProducts({ minBalance: 0 });
    },
    {
      enabled: activeTab === 'universal' || activeTab === 'mobile',
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Получение информации о номере телефона
  const getPhoneInfoMutation = useMutation(
    (data) => mobilePaymentsAPI.getPhoneInfo(data),
    {
      onSuccess: (data) => {
        console.log('Phone info received:', data);
        const responseData = data?.data || data;
        setPhoneInfo(responseData);
        setMobileStep('amount');
      },
      onError: (error) => {
        console.error('Error getting phone info:', error);
      },
    }
  );

  // Начало мобильного платежа
  const startMobilePaymentMutation = useMutation(
    (data) => mobilePaymentsAPI.startPayment(data),
    {
      onSuccess: (data) => {
        console.log('Mobile payment started:', data);
        setMobileStep('amount');
      },
      onError: (error) => {
        console.error('Error starting mobile payment:', error);
      },
    }
  );

  // Создание мобильного платежа
  const requestMobilePaymentMutation = useMutation(
    (data) => mobilePaymentsAPI.requestPayment(data),
    {
      onSuccess: (data) => {
        console.log('Mobile payment created:', data);
        const payment = data?.payment || data?.data?.payment;
        setMobileCurrentPayment(payment);
        if (payment?.id) {
          setMobilePaymentId(payment.id);
        }
        // Проверяем статус платежа
        if (payment?.status === 'RSA_REVIEW' || payment?.status === 'PROCESSING') {
          setMobileStep('confirm');
        } else if (payment?.status === 'EXECUTED') {
          setMobileStep('success');
        } else {
          setMobileStep('success');
        }
      },
      onError: (error) => {
        console.error('Error creating mobile payment:', error);
      },
    }
  );

  // Подтверждение мобильного платежа
  const confirmMobilePaymentMutation = useMutation(
    (data) => mobilePaymentsAPI.confirmPayment(data),
    {
      onSuccess: (data) => {
        console.log('Mobile payment confirmed:', data);
        const payment = data?.payment || data?.data?.payment;
        setMobileCurrentPayment(payment);
        setMobileStep('success');
      },
      onError: (error) => {
        console.error('Error confirming mobile payment:', error);
      },
    }
  );

  // Получение чека мобильного платежа
  const getMobileCheckMutation = useMutation(
    (id) => mobilePaymentsAPI.getPaymentCheck(id),
    {
      onSuccess: (data) => {
        if (data?.pdf || data?.data?.pdf) {
          const pdfBase64 = data?.pdf || data?.data?.pdf;
          const byteCharacters = atob(pdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `mobile-payment-check-${mobilePaymentId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      onError: (error) => {
        console.error('Error getting mobile check:', error);
      },
    }
  );

  // Начало оплаты (получение формы)
  const startPaymentMutation = useMutation(
    (data) => universalPaymentsAPI.startPayment(data),
    {
      onSuccess: (data) => {
        console.log('Payment form received:', data);
        const responseData = data?.data || data;
        const fields = responseData?.fields || [];
        
        // Инициализируем поля формы значениями по умолчанию из ответа
        const initialFields = {};
        fields.forEach(field => {
          if (field.value) {
            initialFields[field.key] = field.value;
          }
        });
        setPaymentFields(initialFields);
        
        // Устанавливаем рекомендованную сумму, если есть
        const recommendedSum = responseData?.paySum?.recommendedSums?.[0];
        if (recommendedSum && !paymentAmount) {
          setPaymentAmount(recommendedSum.amount?.toString() || '');
        }
        
        setStep('fill');
      },
      onError: (error) => {
        console.error('Error starting payment:', error);
      },
    }
  );

  // Создание платежа
  const requestPaymentMutation = useMutation(
    (data) => universalPaymentsAPI.requestPayment(data),
    {
      onSuccess: (data) => {
        console.log('Payment created:', data);
        setCurrentPayment(data?.payment || data?.data?.payment);
        const paymentIdFromResponse = data?.payment?.id || data?.data?.payment?.id;
        if (paymentIdFromResponse) {
          setPaymentId(paymentIdFromResponse);
        }
        // Проверяем статус платежа
        if (data?.payment?.status?.code === 'NEED_CONFIRM') {
          setStep('confirm');
        } else if (data?.payment?.status?.code === 'EXECUTED') {
          setStep('success');
        } else {
          setStep('success');
        }
      },
      onError: (error) => {
        console.error('Error creating payment:', error);
      },
    }
  );

  // Подтверждение платежа
  const confirmPaymentMutation = useMutation(
    (data) => universalPaymentsAPI.confirmPayment(data),
    {
      onSuccess: (data) => {
        console.log('Payment confirmed:', data);
        setCurrentPayment(data?.payment || data?.data?.payment);
        setStep('success');
      },
      onError: (error) => {
        console.error('Error confirming payment:', error);
      },
    }
  );

  // Получение информации о платеже
  const { data: paymentInfo, refetch: refetchPayment } = useQuery(
    ['payment', paymentId],
    () => universalPaymentsAPI.getPayment(paymentId),
    {
      enabled: !!paymentId,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Получение чека
  const getCheckMutation = useMutation(
    (id) => universalPaymentsAPI.getPaymentCheck(id),
    {
      onSuccess: (data) => {
        // Скачиваем PDF чек
        if (data?.pdf || data?.data?.pdf) {
          const pdfBase64 = data?.pdf || data?.data?.pdf;
          const byteCharacters = atob(pdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `payment-check-${paymentId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      onError: (error) => {
        console.error('Error getting check:', error);
      },
    }
  );

  // Обработка продуктов для универсальных платежей
  const universalProducts = activeTab === 'universal' ? [
    ...(productsData?.accounts || []).map(p => ({ ...p.account, type: 'ACCOUNT' })),
    ...(productsData?.cards || []).map(p => ({ ...p.card, type: 'CARD' }))
  ] : [];

  // Обработка продуктов для мобильных платежей
  const mobileProducts = activeTab === 'mobile' ? [
    ...(productsData?.accounts || []).map(p => ({ 
      ...p, 
      type: 'ACCOUNT', 
      id: p.publicId,
      balance: p.balance 
    })),
    ...(productsData?.cards || []).map(p => ({ 
      ...p, 
      type: 'CARD', 
      id: p.publicId,
      balance: p.balance 
    }))
  ] : [];

  const allProducts = universalProducts; // Для обратной совместимости

  const handleStartPayment = () => {
    const serviceId = showCustomInput ? customServiceId : providerServiceId;
    if (!serviceId) {
      alert('Пожалуйста, выберите или введите ID услуги');
      return;
    }
    setProviderServiceId(serviceId);
    startPaymentMutation.mutate({
      providerService: {
        id: serviceId
      }
    });
  };

  const handleSubmitPayment = () => {
    if (!selectedProduct) {
      alert('Пожалуйста, выберите карту или счет');
      return;
    }
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Пожалуйста, введите корректную сумму платежа');
      return;
    }

    // Проверяем обязательные поля
    const responseData = startPaymentMutation.data?.data || startPaymentMutation.data;
    const requiredFields = (responseData?.fields || []).filter(f => f.required);
    const missingFields = requiredFields.filter(f => !paymentFields[f.key] || paymentFields[f.key].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Пожалуйста, заполните обязательные поля: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    const fields = Object.keys(paymentFields)
      .filter(key => paymentFields[key] !== undefined && paymentFields[key] !== null && paymentFields[key] !== '')
      .map(key => ({
        key,
        value: paymentFields[key].toString()
      }));

    requestPaymentMutation.mutate({
      providerService: {
        id: providerServiceId
      },
      clientProduct: {
        productType: selectedProduct.type,
        publicId: selectedProduct.publicId
      },
      paySum: {
        amount: parseFloat(paymentAmount),
        currency: {
          code: 'RUB'
        }
      },
      fields
    });
  };

  const handleConfirmPayment = () => {
    if (!confirmCode || confirmCode.trim().length < 4) {
      alert('Пожалуйста, введите корректный код подтверждения');
      return;
    }
    if (!currentPayment?.id && !paymentId) {
      alert('Ошибка: не найден ID платежа');
      return;
    }

    const paymentIdToUse = currentPayment?.id || paymentId;

    confirmPaymentMutation.mutate({
      paymentId: paymentIdToUse,
      clientConfirm: {
        confirmPurpose: 'CHECK_CODE',
        confirmCode: {
          code: confirmCode.trim()
        }
      }
    });
  };

  // Функция для запроса кода подтверждения
  const handleRequestConfirmCode = () => {
    if (!currentPayment?.id && !paymentId) {
      alert('Ошибка: не найден ID платежа');
      return;
    }

    const paymentIdToUse = currentPayment?.id || paymentId;

    confirmPaymentMutation.mutate({
      paymentId: paymentIdToUse,
      clientConfirm: {
        confirmPurpose: 'REQUEST_CODE'
      }
    });
  };

  // Обработчики для мобильных платежей
  const handlePhoneCheck = () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      alert('Пожалуйста, введите корректный номер телефона');
      return;
    }
    // Убираем все символы кроме цифр
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    // Если номер начинается с 8, заменяем на 7
    const formattedPhone = cleanPhone.startsWith('8') ? '7' + cleanPhone.slice(1) : cleanPhone;
    // Если номер не начинается с 7, добавляем 7
    const finalPhone = formattedPhone.startsWith('7') ? formattedPhone : '7' + formattedPhone;
    
    getPhoneInfoMutation.mutate({
      number: finalPhone
    });
  };

  const handleMobilePaymentRequest = () => {
    if (!selectedMobileProduct) {
      alert('Пожалуйста, выберите карту или счет');
      return;
    }
    if (!mobilePaymentAmount || parseFloat(mobilePaymentAmount) <= 0) {
      alert('Пожалуйста, введите корректную сумму платежа');
      return;
    }
    if (!phoneInfo?.serviceProvider?.id) {
      alert('Ошибка: не определен оператор');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('8') ? '7' + cleanPhone.slice(1) : cleanPhone;
    const finalPhone = formattedPhone.startsWith('7') ? formattedPhone : '7' + formattedPhone;

    requestMobilePaymentMutation.mutate({
      serviceProviderId: phoneInfo.serviceProvider.id,
      mobileNumber: {
        number: finalPhone
      },
      clientProduct: {
        id: selectedMobileProduct.id,
        type: selectedMobileProduct.type
      },
      paySum: {
        amount: parseFloat(mobilePaymentAmount),
        currency: {
          code: 'RUB'
        }
      }
    });
  };

  const handleMobileConfirm = () => {
    if (!mobileConfirmCode || mobileConfirmCode.trim().length < 4) {
      alert('Пожалуйста, введите корректный код подтверждения');
      return;
    }
    if (!mobileCurrentPayment?.id && !mobilePaymentId) {
      alert('Ошибка: не найден ID платежа');
      return;
    }

    const paymentIdToUse = mobileCurrentPayment?.id || mobilePaymentId;

    confirmMobilePaymentMutation.mutate({
      id: paymentIdToUse,
      clientApprove: {
        purpose: 'CHECK_CODE',
        code: mobileConfirmCode.trim()
      }
    });
  };

  const handleRequestMobileCode = () => {
    if (!mobileCurrentPayment?.id && !mobilePaymentId) {
      alert('Ошибка: не найден ID платежа');
      return;
    }

    const paymentIdToUse = mobileCurrentPayment?.id || mobilePaymentId;

    confirmMobilePaymentMutation.mutate({
      id: paymentIdToUse,
      clientApprove: {
        purpose: 'REQUEST_CODE'
      }
    });
  };

  const getStatusIcon = (statusCode) => {
    switch (statusCode) {
      case 'EXECUTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'REFUSED':
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      'PROCESSING': 'В обработке',
      'EXECUTED': 'Исполнен',
      'REVIEW': 'На проверке',
      'REFUSED': 'Отклонен',
      'NEED_CONFIRM': 'Требуется подтверждение',
      'ERROR': 'Ошибка',
    };
    return statusMap[statusCode] || statusCode;
  };

  const startPaymentResponse = startPaymentMutation.data?.data || startPaymentMutation.data;
  const paymentFormFields = startPaymentResponse?.fields || [];
  const paySumInfo = startPaymentResponse?.paySum || {};
  const minAmount = paySumInfo?.payLimit?.min?.amount || 0;
  const maxAmount = paySumInfo?.payLimit?.max?.amount || Infinity;
  const recommendedSums = paySumInfo?.recommendedSums || [];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 ">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-black font-ibm text-2xl font-medium leading-[110%] text-left">
            Платежи
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
      <div className="px-0">
        {/* Tabs Section */}
        <div className="px-4 mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setActiveTab('universal');
                setStep('start');
                setMobileStep('phone');
              }}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'universal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Универсальные
            </button>
            <button
              onClick={() => {
                setActiveTab('mobile');
                setStep('start');
                setMobileStep('phone');
              }}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-1" />
              Мобильная связь
            </button>
          </div>
        </div>

        <div className="px-4 space-y-4">
        {/* Универсальные платежи */}
        {activeTab === 'universal' && (
          <>
        {/* Step 1: Start Payment */}
        {step === 'start' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#3C82F6', animationDelay: '0.1s' }}>
            <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">Выберите услугу</div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Выберите услугу для оплаты или введите ID услуги вручную
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4">
            
            <div className="space-y-4">
              {/* Популярные услуги */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 font-ibm">
                  Популярные услуги
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {popularServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setProviderServiceId(service.id);
                        setShowCustomInput(false);
                        setCustomServiceId('');
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-left font-ibm ${
                        providerServiceId === service.id && !showCustomInput
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xl">{service.icon}</span>
                        <span className="font-semibold text-gray-900 text-sm">{service.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-tight">{service.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Другая услуга */}
              <div>
                <button
                  onClick={() => {
                    setShowCustomInput(!showCustomInput);
                    if (!showCustomInput) {
                      setProviderServiceId('');
                    } else {
                      setCustomServiceId('');
                    }
                  }}
                  className="w-full p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors text-gray-600 font-ibm text-sm"
                >
                  {showCustomInput ? '← Выбрать из списка' : '+ Другая услуга'}
                </button>
              </div>

              {/* Поле для ввода другой услуги */}
              {showCustomInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    ID услуги поставщика <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customServiceId}
                    onChange={(e) => setCustomServiceId(e.target.value)}
                    placeholder="Введите ID услуги"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm"
                  />
                </div>
              )}

              <button
                onClick={handleStartPayment}
                disabled={startPaymentMutation.isLoading || (!providerServiceId && !customServiceId)}
                className="w-full bg-blue-600 text-white py-3 rounded-[27px] font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
              >
                {startPaymentMutation.isLoading ? 'Загрузка...' : 'Начать оплату'}
              </button>

              {startPaymentMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-ibm">
                    {startPaymentMutation.error?.response?.data?.message || 'Ошибка при начале оплаты'}
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Fill Form */}
        {step === 'fill' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.2s' }}>
            <div className="p-4" style={{ backgroundColor: '#10B981' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">Заполните форму оплаты</div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Выберите карту и введите данные для оплаты
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4">
              <div className="space-y-4">
              {/* Выбор продукта */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                  Выберите карту или счет <span className="text-red-500">*</span>
                </label>
                {isLoadingProducts ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : allProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 font-ibm">Нет доступных продуктов</p>
                ) : (
                  <div className="space-y-2">
                    {universalProducts.map((product) => (
                      <button
                        key={product.publicId}
                        onClick={() => setSelectedProduct(product)}
                        className={`w-full p-3 rounded-[27px] border transition-all text-left font-ibm ${
                          selectedProduct?.publicId === product.publicId
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.type === 'CARD' ? 'Карта' : 'Счет'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.publicId}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Сумма платежа */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                  Сумма платежа (₽) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  min={minAmount}
                  max={maxAmount === Infinity ? undefined : maxAmount}
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm"
                />
                {minAmount > 0 || maxAmount < Infinity ? (
                  <p className="text-xs text-gray-500 mt-1 font-ibm">
                    {minAmount > 0 && maxAmount < Infinity 
                      ? `Диапазон: ${minAmount} - ${maxAmount} ₽`
                      : minAmount > 0 
                        ? `Минимум: ${minAmount} ₽`
                        : `Максимум: ${maxAmount} ₽`}
                  </p>
                ) : null}
                {recommendedSums.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recommendedSums.map((sum, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setPaymentAmount(sum.amount?.toString() || '')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-ibm"
                      >
                        {sum.amount} {sum.currency?.code || 'RUB'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Динамические поля формы */}
              {paymentFormFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'DICTIONARY' && field.dictionaryField ? (
                    <select
                      value={paymentFields[field.key] || ''}
                      onChange={(e) => setPaymentFields({ ...paymentFields, [field.key]: e.target.value })}
                      required={field.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 focus:border-transparent font-ibm bg-white"
                    >
                      <option value="">Выберите...</option>
                      {field.dictionaryField.items?.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'MOBILE_PHONE' ? 'tel' : field.type === 'NUMBER' || field.type === 'DECIMAL' ? 'number' : 'text'}
                      value={paymentFields[field.key] || ''}
                      onChange={(e) => setPaymentFields({ ...paymentFields, [field.key]: e.target.value })}
                      placeholder={field.description || field.name}
                      required={field.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 focus:border-transparent font-ibm bg-white"
                    />
                  )}
                  {field.description && (
                    <p className="text-xs text-gray-500 mt-1 font-ibm">{field.description}</p>
                  )}
                </div>
              ))}

              <div className="flex space-x-3">
              <button
                onClick={() => {
                  setStep('start');
                  setPaymentFields({});
                  setSelectedProduct(null);
                  setPaymentAmount('');
                  setShowCustomInput(false);
                  setCustomServiceId('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-[27px] font-semibold hover:bg-gray-200 transition-colors font-ibm"
              >
                Назад
              </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={requestPaymentMutation.isLoading || !selectedProduct || !paymentAmount}
                  className="flex-1 bg-green-600 text-white py-3 rounded-[27px] font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                >
                  {requestPaymentMutation.isLoading ? 'Отправка...' : 'Оплатить'}
                </button>
              </div>

              {requestPaymentMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-ibm">
                    {requestPaymentMutation.error?.response?.data?.message || 'Ошибка при создании платежа'}
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Payment */}
        {step === 'confirm' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#F59E0C', animationDelay: '0.3s' }}>
            <div className="p-4" style={{ backgroundColor: '#F59E0C' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">Подтверждение платежа</div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Введите код подтверждения для завершения платежа
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4">
            
            <div className="space-y-4">
              {currentPayment && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 font-ibm">Сумма:</span>
                    <span className="font-semibold text-gray-900 font-ibm">
                      {currentPayment.paySum?.amount || 0} {currentPayment.paySum?.currency?.code || 'RUB'}
                    </span>
                  </div>
                  {currentPayment.commissionSum && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 font-ibm">Комиссия:</span>
                      <span className="text-sm font-medium text-gray-700 font-ibm">
                        {currentPayment.commissionSum.amount} {currentPayment.commissionSum.currency?.code || 'RUB'}
                      </span>
                    </div>
                  )}
                  {currentPayment.totalSum && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900 font-ibm">Итого:</span>
                      <span className="font-bold text-lg text-gray-900 font-ibm">
                        {currentPayment.totalSum.amount} {currentPayment.totalSum.currency?.code || 'RUB'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                  Код подтверждения <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Введите код из СМС"
                  maxLength="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm text-center text-2xl tracking-widest bg-white"
                />
                <p className="text-xs text-gray-500 mt-2 font-ibm text-center">
                  Код отправлен на ваш номер телефона
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setStep('fill');
                    setConfirmCode('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-[27px] font-semibold hover:bg-gray-200 transition-colors font-ibm"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirmPaymentMutation.isLoading || !confirmCode || confirmCode.length < 4}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                >
                  {confirmPaymentMutation.isLoading ? 'Подтверждение...' : 'Подтвердить'}
                </button>
              </div>

              <button
                onClick={handleRequestConfirmCode}
                disabled={confirmPaymentMutation.isLoading}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-ibm disabled:opacity-50"
              >
                Отправить код повторно
              </button>

              {confirmPaymentMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-ibm">
                    {confirmPaymentMutation.error?.response?.data?.message || 'Ошибка при подтверждении платежа'}
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && currentPayment && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.4s' }}>
            <div className="p-4" style={{ backgroundColor: '#10B981' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  {getStatusIcon(currentPayment.status?.code)}
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  {getStatusLabel(currentPayment.status?.code)}
                </div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Платеж успешно обработан
                {currentPayment.documentId && (
                  <div className="mt-1 text-xs">
                    Номер: {currentPayment.documentId}
                  </div>
                )}
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-ibm">Сумма:</span>
                    <span className="font-medium text-gray-900 font-ibm">
                      {currentPayment.paySum?.amount || 0} {currentPayment.paySum?.currency?.code || 'RUB'}
                    </span>
                  </div>
                  {currentPayment.commissionSum && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-ibm">Комиссия:</span>
                      <span className="text-sm font-medium text-gray-700 font-ibm">
                        {currentPayment.commissionSum.amount} {currentPayment.commissionSum.currency?.code || 'RUB'}
                      </span>
                    </div>
                  )}
                  {currentPayment.totalSum && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900 font-ibm">Итого:</span>
                      <span className="font-bold text-lg text-gray-900 font-ibm">
                        {currentPayment.totalSum.amount} {currentPayment.totalSum.currency?.code || 'RUB'}
                      </span>
                    </div>
                  )}
                  {currentPayment.description && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600 font-ibm">{currentPayment.description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {currentPayment.id && (
                  <button
                    onClick={() => getCheckMutation.mutate(currentPayment.id)}
                    disabled={getCheckMutation.isLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-[27px] font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors font-ibm"
                  >
                    <Download className="w-5 h-5" />
                    <span>{getCheckMutation.isLoading ? 'Загрузка...' : 'Скачать чек'}</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setStep('start');
                    setProviderServiceId('');
                    setCustomServiceId('');
                    setShowCustomInput(false);
                    setPaymentFields({});
                    setSelectedProduct(null);
                    setPaymentAmount('');
                    setCurrentPayment(null);
                    setConfirmCode('');
                    setPaymentId('');
                    // Сбрасываем состояние мутаций
                    startPaymentMutation.reset();
                    requestPaymentMutation.reset();
                    confirmPaymentMutation.reset();
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-[27px] font-semibold hover:bg-gray-200 transition-colors font-ibm"
                >
                  Новый платеж
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Мобильные платежи */}
        {activeTab === 'mobile' && (
          <>
            {/* Step 1: Ввод номера телефона */}
            {mobileStep === 'phone' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 font-ibm">Пополнить мобильный</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                      Номер телефона <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 11) {
                          setPhoneNumber(value);
                        }
                      }}
                      placeholder="79001234567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-ibm">
                      Введите номер в формате 7XXXXXXXXXX или 8XXXXXXXXXX
                    </p>
                  </div>

                  <button
                    onClick={handlePhoneCheck}
                    disabled={getPhoneInfoMutation.isLoading || !phoneNumber || phoneNumber.replace(/\D/g, '').length < 10}
                    className="w-full bg-blue-600 text-white py-3 rounded-[27px] font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                  >
                    {getPhoneInfoMutation.isLoading ? 'Проверка...' : 'Продолжить'}
                  </button>

                  {getPhoneInfoMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm font-ibm">
                        {getPhoneInfoMutation.error?.response?.data?.message || 'Ошибка при определении оператора'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Выбор суммы и карты */}
            {mobileStep === 'amount' && phoneInfo && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 font-ibm">Оплата {phoneInfo.serviceProvider?.name}</h2>
                
                <div className="space-y-4">
                  {/* Информация об операторе */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900 font-ibm">
                          {phoneInfo.number}
                        </div>
                        <div className="text-sm text-gray-600 font-ibm">
                          {phoneInfo.serviceProvider?.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Выбор продукта */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                      Выберите карту или счет <span className="text-red-500">*</span>
                    </label>
                    {isLoadingProducts ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner size="md" />
                      </div>
                    ) : mobileProducts.length === 0 ? (
                      <p className="text-sm text-gray-500 font-ibm">Нет доступных продуктов</p>
                    ) : (
                      <div className="space-y-2">
                        {mobileProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => setSelectedMobileProduct(product)}
                            className={`w-full p-3 rounded-[27px] border transition-all text-left font-ibm ${
                              selectedMobileProduct?.id === product.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {product.type === 'CARD' ? 'Карта' : 'Счет'}
                                  </div>
                                  {product.balance && (
                                    <div className="text-xs text-gray-500">
                                      Баланс: {product.balance.amount} {product.balance.currency?.code || 'RUB'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Сумма платежа */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                      Сумма платежа (₽) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={mobilePaymentAmount}
                      onChange={(e) => setMobilePaymentAmount(e.target.value)}
                      placeholder="0.00"
                      min={phoneInfo.paymentOptions?.paySumLimit?.minSum?.amount || 0}
                      max={phoneInfo.paymentOptions?.paySumLimit?.maxSum?.amount}
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 focus:border-transparent font-ibm bg-white"
                    />
                    {phoneInfo.paymentOptions?.paySumLimit && (
                      <p className="text-xs text-gray-500 mt-1 font-ibm">
                        Диапазон: {phoneInfo.paymentOptions.paySumLimit.minSum.amount} - {phoneInfo.paymentOptions.paySumLimit.maxSum.amount} ₽
                      </p>
                    )}
                    {phoneInfo.paymentOptions?.recommendedSums && phoneInfo.paymentOptions.recommendedSums.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {phoneInfo.paymentOptions.recommendedSums.map((sum, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setMobilePaymentAmount(sum.amount?.toString() || '')}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-ibm"
                          >
                            {sum.amount} {sum.currency?.code || 'RUB'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setMobileStep('phone');
                        setPhoneInfo(null);
                        setSelectedMobileProduct(null);
                        setMobilePaymentAmount('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-[27px] font-semibold hover:bg-gray-200 transition-colors font-ibm"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleMobilePaymentRequest}
                      disabled={requestMobilePaymentMutation.isLoading || !selectedMobileProduct || !mobilePaymentAmount}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                    >
                      {requestMobilePaymentMutation.isLoading ? 'Отправка...' : 'Оплатить'}
                    </button>
                  </div>

                  {requestMobilePaymentMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm font-ibm">
                        {requestMobilePaymentMutation.error?.response?.data?.message || 'Ошибка при создании платежа'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Подтверждение мобильного платежа */}
            {mobileStep === 'confirm' && mobileCurrentPayment && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 font-ibm">Подтверждение платежа</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 font-ibm">Сумма:</span>
                      <span className="font-semibold text-gray-900 font-ibm">
                        {mobileCurrentPayment.paySum?.amount || 0} {mobileCurrentPayment.paySum?.currency?.code || 'RUB'}
                      </span>
                    </div>
                    {mobileCurrentPayment.commission && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 font-ibm">Комиссия:</span>
                        <span className="text-sm font-medium text-gray-700 font-ibm">
                          {mobileCurrentPayment.commission.amount} {mobileCurrentPayment.commission.currency?.code || 'RUB'}
                        </span>
                      </div>
                    )}
                    {mobileCurrentPayment.totalSum && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900 font-ibm">Итого:</span>
                        <span className="font-bold text-lg text-gray-900 font-ibm">
                          {mobileCurrentPayment.totalSum.amount} {mobileCurrentPayment.totalSum.currency?.code || 'RUB'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                      Код подтверждения <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mobileConfirmCode}
                      onChange={(e) => setMobileConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Введите код из СМС"
                      maxLength="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm text-center text-2xl tracking-widest bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-ibm text-center">
                      Код отправлен на ваш номер телефона
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setMobileStep('amount');
                        setMobileConfirmCode('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-[27px] font-semibold hover:bg-gray-200 transition-colors font-ibm"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleMobileConfirm}
                      disabled={confirmMobilePaymentMutation.isLoading || !mobileConfirmCode || mobileConfirmCode.length < 4}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                    >
                      {confirmMobilePaymentMutation.isLoading ? 'Подтверждение...' : 'Подтвердить'}
                    </button>
                  </div>

                  <button
                    onClick={handleRequestMobileCode}
                    disabled={confirmMobilePaymentMutation.isLoading}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-ibm disabled:opacity-50"
                  >
                    Отправить код повторно
                  </button>

                  {confirmMobilePaymentMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm font-ibm">
                        {confirmMobilePaymentMutation.error?.response?.data?.message || 'Ошибка при подтверждении платежа'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Успешный мобильный платеж */}
            {mobileStep === 'success' && mobileCurrentPayment && (
              <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.4s' }}>
                <div className="p-4" style={{ backgroundColor: '#10B981' }}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                      {getStatusIcon(mobileCurrentPayment.status)}
                    </div>
                    <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                      {getStatusLabel(mobileCurrentPayment.status)}
                    </div>
                  </div>
                  <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                    Платеж успешно обработан
                    {mobileCurrentPayment.documentId && (
                      <div className="mt-1 text-xs">
                        Номер: {mobileCurrentPayment.documentId}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
                </div>
                <div className="px-4 pb-4 pt-4">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-ibm">Номер:</span>
                        <span className="font-medium text-gray-900 font-ibm">
                          {mobileCurrentPayment.mobileNumber?.number || phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-ibm">Сумма:</span>
                        <span className="font-medium text-gray-900 font-ibm">
                          {mobileCurrentPayment.paySum?.amount || 0} {mobileCurrentPayment.paySum?.currency?.code || 'RUB'}
                        </span>
                      </div>
                    {mobileCurrentPayment.commission && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-ibm">Комиссия:</span>
                        <span className="text-sm font-medium text-gray-700 font-ibm">
                          {mobileCurrentPayment.commission.amount} {mobileCurrentPayment.commission.currency?.code || 'RUB'}
                        </span>
                      </div>
                    )}
                    {mobileCurrentPayment.totalSum && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900 font-ibm">Итого:</span>
                        <span className="font-bold text-lg text-gray-900 font-ibm">
                          {mobileCurrentPayment.totalSum.amount} {mobileCurrentPayment.totalSum.currency?.code || 'RUB'}
                        </span>
                      </div>
                    )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {mobileCurrentPayment.id && (
                      <button
                        onClick={() => getMobileCheckMutation.mutate(mobileCurrentPayment.id)}
                        disabled={getMobileCheckMutation.isLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-[27px] font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors font-ibm"
                      >
                        <Download className="w-5 h-5" />
                        <span>{getMobileCheckMutation.isLoading ? 'Загрузка...' : 'Скачать чек'}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setMobileStep('phone');
                        setPhoneNumber('');
                        setPhoneInfo(null);
                        setSelectedMobileProduct(null);
                        setMobilePaymentAmount('');
                        setMobileCurrentPayment(null);
                        setMobileConfirmCode('');
                        setMobilePaymentId('');
                        getPhoneInfoMutation.reset();
                        requestMobilePaymentMutation.reset();
                        confirmMobilePaymentMutation.reset();
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-[27px] font-semibold hover:bg-gray-200 transition-colors font-ibm"
                    >
                      Новый платеж
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
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

export default PaymentsPage;
