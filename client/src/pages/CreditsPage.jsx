import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { ArrowLeft, CreditCard, FileText, CheckCircle, Clock, XCircle, Plus, Search, Info } from 'lucide-react';
import { creditProductsAPI, cashLoanApplicationsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';

const CreditsPage = () => {
  const navigate = useNavigate();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'offers', 'applications', 'cash-loan'
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Cash Loan Application state
  const [applicationForm, setApplicationForm] = useState({
    partnerName: 'multibank',
    partnerApplicationId: '',
    creditAmount: 50000,
    creditPeriod: 12,
    // Personal Info
    lastName: '',
    firstName: '',
    patronymic: '',
    birthDate: '',
    birthPlace: '',
    genderType: 'MALE',
    // Passport
    passportSeries: '',
    passportNumber: '',
    passportIssueDate: '',
    passportIssueCode: '',
    passportIssueName: '',
    // Contact
    phoneNumber: '',
    emailAddress: '',
    // Address
    registrationZip: '',
    registrationRegion: 'MOSCOW',
    registrationCity: '',
    registrationStreet: '',
    registrationHouse: '',
    // Work
    companyName: '',
    companyInn: '',
    employmentType: 'DERIVATIVE',
    incomeAmount: 200000,
    // Family
    maritalStatusType: 'SINGLE',
    underageChildrenNumber: 0,
    // Education
    educationType: 'HIGHER_EDUCATION',
    // Consents
    consentPers: true,
    consentBki: true,
    consentMobile: true,
  });
  const [statusApplicationId, setStatusApplicationId] = useState('');
  const [createdApplicationId, setCreatedApplicationId] = useState(null);

  // Получение списка кредитных продуктов
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery(
    ['creditProducts'],
    () => creditProductsAPI.getProducts({ page: 1 }),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Получение деталей продукта
  const { data: productDetails, isLoading: isLoadingDetails } = useQuery(
    ['creditProduct', selectedProductId],
    () => creditProductsAPI.getProduct(selectedProductId),
    {
      enabled: !!selectedProductId,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Получение предложений
  const { data: offersData, isLoading: isLoadingOffers, refetch: refetchOffers } = useQuery(
    ['creditProductOffers'],
    () => creditProductsAPI.getProductOffers(),
    {
      enabled: activeTab === 'offers',
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Получение заявлений
  const { data: applicationsData, isLoading: isLoadingApplications, refetch: refetchApplications } = useQuery(
    ['creditProductApplications'],
    () => creditProductsAPI.getProductApplications(),
    {
      enabled: activeTab === 'applications',
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Обработка структуры ответов API
  const products = productsData?.data?.Data?.Product || productsData?.Data?.Product || [];
  const offers = offersData?.data?.Data?.ProductOffers || offersData?.Data?.ProductOffers || [];
  const applications = applicationsData?.data?.Data?.ProductApplication || applicationsData?.Data?.ProductApplication || [];

  // Получение списка кредитных продуктов (только кредитные типы)
  const creditProducts = products.filter(product => 
    ['loanCar', 'loanIndividual', 'loanLegalEntity', 'mortgage', 'creditCard'].includes(product.productType)
  );

  const getProductTypeLabel = (type) => {
    const typeMap = {
      'loanCar': 'Автокредит',
      'loanIndividual': 'Кредит физическому лицу',
      'loanLegalEntity': 'Кредит юридическому лицу',
      'mortgage': 'Ипотека',
      'creditCard': 'Кредитная карта',
      'Other': 'Другой продукт'
    };
    return typeMap[type] || type;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'AwaitingAuthorisation': 'Ожидает авторизации',
      'Authorised': 'Авторизовано',
      'Rejected': 'Отклонено',
      'Revoked': 'Отозвано'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'AwaitingAuthorisation': 'bg-yellow-100 text-yellow-700',
      'Authorised': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Revoked': 'bg-gray-100 text-gray-700'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Authorised':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'AwaitingAuthorisation':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Rejected':
      case 'Revoked':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  // Подсчет общей суммы кредитов из заявлений
  const totalCreditAmount = applications.reduce((sum, app) => {
    // Проверяем разные возможные структуры данных
    const amount = app?.CustomProduct?.Amount?.amount || 
                   app?.Amount?.amount || 
                   app?.amount || 0;
    return sum + parseFloat(amount || 0);
  }, 0);

  // Cash Loan Application mutations
  const createApplicationMutation = useMutation(
    (data) => cashLoanApplicationsAPI.createApplication(data),
    {
      onSuccess: (data) => {
        console.log('Application created:', data);
        setCreatedApplicationId(data?.data?.applicationId || data?.applicationId);
        setStatusApplicationId(data?.data?.applicationId || data?.applicationId);
      },
      onError: (error) => {
        console.error('Error creating application:', error);
      },
    }
  );

  const { data: applicationStatus, refetch: refetchStatus } = useQuery(
    ['cashLoanApplicationStatus', statusApplicationId],
    () => cashLoanApplicationsAPI.getApplicationStatus(statusApplicationId),
    {
      enabled: !!statusApplicationId && statusApplicationId.length === 36,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const confirmApplicationMutation = useMutation(
    (applicationId) => cashLoanApplicationsAPI.confirmApplication(applicationId),
    {
      onSuccess: () => {
        console.log('Application confirmed');
        if (statusApplicationId) {
          refetchStatus();
        }
      },
      onError: (error) => {
        console.error('Error confirming application:', error);
      },
    }
  );

  const handleCreateApplication = (e) => {
    e.preventDefault();
    
    const today = new Date().toISOString().split('T')[0];
    const consentDate = today;
    const consentEndDate = new Date();
    consentEndDate.setFullYear(consentEndDate.getFullYear() + 10);
    const consentEndDateStr = consentEndDate.toISOString().split('T')[0];

    const applicationData = {
      partnerName: applicationForm.partnerName,
      partnerApplicationId: applicationForm.partnerApplicationId || `app-${Date.now()}`,
      cashLoanProduct: {
        productType: 'KN',
        creditAmount: parseInt(applicationForm.creditAmount),
        creditPeriod: parseInt(applicationForm.creditPeriod),
      },
      personalInfo: {
        fio: {
          lastName: applicationForm.lastName,
          firstName: applicationForm.firstName,
          ...(applicationForm.patronymic && { patronymic: applicationForm.patronymic }),
        },
        genderType: applicationForm.genderType,
        birthDate: applicationForm.birthDate,
        birthPlace: applicationForm.birthPlace,
      },
      passportInfo: {
        series: applicationForm.passportSeries,
        number: applicationForm.passportNumber,
        issueDate: applicationForm.passportIssueDate,
        issueCode: applicationForm.passportIssueCode,
        issueName: applicationForm.passportIssueName,
      },
      registrationAddressInfo: {
        zip: applicationForm.registrationZip,
        region: applicationForm.registrationRegion,
        city: applicationForm.registrationCity,
        street: applicationForm.registrationStreet,
        house: applicationForm.registrationHouse,
      },
      residentialAddressInfo: {
        zip: applicationForm.registrationZip,
        region: applicationForm.registrationRegion,
        city: applicationForm.registrationCity,
        street: applicationForm.registrationStreet,
        house: applicationForm.registrationHouse,
      },
      contactInfo: {
        phoneNumber: applicationForm.phoneNumber,
        emailAddress: applicationForm.emailAddress,
      },
      mainIncomeInfo: {
        incomeType: 'BASIC',
        amount: parseInt(applicationForm.incomeAmount),
      },
      educationType: applicationForm.educationType,
      familyInfo: {
        maritalStatusType: applicationForm.maritalStatusType,
        underageChildrenNumber: parseInt(applicationForm.underageChildrenNumber),
      },
      mainWork: {
        employmentType: applicationForm.employmentType,
        companyName: applicationForm.companyName,
        companyInn: applicationForm.companyInn,
        phoneNumber: applicationForm.phoneNumber,
        workingExperienceType: 'FROM_1_TO_3_YEARS',
        workingExperienceCurrentType: 'FROM_3_TO_6_MONTHS',
        jobPositionCategoryType: 'SPECIALIST',
        addressInfo: {
          region: applicationForm.registrationRegion,
          city: applicationForm.registrationCity,
          street: applicationForm.registrationStreet,
          house: applicationForm.registrationHouse,
        },
      },
      consents: [
        {
          consentType: 'AGREEMENT_PERS',
          isObtained: applicationForm.consentPers,
          obtainedDate: consentDate,
          endDate: consentEndDateStr,
        },
        {
          consentType: 'AGREEMENT_BKI',
          isObtained: applicationForm.consentBki,
          obtainedDate: consentDate,
          endDate: consentEndDateStr,
        },
        {
          consentType: 'AGREEMENT_MOBILE',
          isObtained: applicationForm.consentMobile,
          obtainedDate: consentDate,
          endDate: consentEndDateStr,
        },
      ],
      additionalData: {
        creditTarget: 'Потребительские нужды',
      },
    };

    createApplicationMutation.mutate(applicationData);
  };

  const getCashLoanStatusLabel = (status) => {
    const statusMap = {
      'PROCESSING': 'В обработке',
      'PRE_APPROVED': 'Предварительно одобрено',
      'REJECTED': 'Отказано',
    };
    return statusMap[status] || status;
  };

  const getCashLoanStatusColor = (status) => {
    const colorMap = {
      'PROCESSING': 'bg-yellow-100 text-yellow-700',
      'PRE_APPROVED': 'bg-green-100 text-green-700',
      'REJECTED': 'bg-red-100 text-red-700',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 ">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Кредиты
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
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Продукты
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'offers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Предложения
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Заявления
            </button>
            <button
              onClick={() => setActiveTab('cash-loan')}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'cash-loan'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Кредит наличными
            </button>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Список продуктов */}
        {activeTab === 'products' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#3C82F6', animationDelay: '0.1s' }}>
            <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Доступные кредитные продукты
                </div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Выберите кредитный продукт для просмотра деталей
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4 bg-white">
              <div className="space-y-4">

                {isLoadingProducts ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : creditProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-ibm">Нет доступных продуктов</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creditProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="bg-gray-100 rounded-[27px] p-4 h-[91px] flex flex-col justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => setSelectedProductId(product.productId)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-black font-ibm text-sm font-normal leading-[110%]">
                            {getProductTypeLabel(product.productType)}
                          </div>
                          <div className="text-black font-ibm text-sm font-normal leading-[110%]">
                            {product.productName}
                          </div>
                        </div>
                        <div className="text-black font-ibm text-2xl font-normal leading-[110%] text-center">
                          {product.productName}
                        </div>
                        {product.productVersion && (
                          <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
                            Версия: {product.productVersion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Детали продукта */}
                {selectedProductId && (
                  <div className="mt-6 bg-gray-50 rounded-[27px] p-4 border border-gray-200 ">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-ibm">Детали продукта</h3>
                  <button
                    onClick={() => setSelectedProductId(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                {isLoadingDetails ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (productDetails?.data?.Data?.Product || productDetails?.Data?.Product) ? (
                  <div className="space-y-3 font-ibm text-sm">
                    {(() => {
                      const product = productDetails?.data?.Data?.Product || productDetails?.Data?.Product;
                      return (
                        <>
                          <div>
                            <span className="font-semibold text-gray-700">Название: </span>
                            <span className="text-gray-900">{product.productName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Тип: </span>
                            <span className="text-gray-900">{getProductTypeLabel(product.productType)}</span>
                          </div>
                          {product.ProductDetails && (
                            <div>
                              <span className="font-semibold text-gray-700">Активен: </span>
                              <span className="text-gray-900">
                                {product.ProductDetails.active ? 'Да' : 'Нет'}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                    <p className="text-gray-500 text-sm font-ibm">Не удалось загрузить детали</p>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Список предложений */}
        {activeTab === 'offers' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.2s' }}>
            <div className="p-4" style={{ backgroundColor: '#10B981' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Предложения по продуктам
                </div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Доступные предложения по кредитным продуктам
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4 bg-white">
              <div className="space-y-4">

                {isLoadingOffers ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-ibm">Нет доступных предложений</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div
                        key={offer.offerId}
                        className="bg-gray-100 rounded-[27px] p-4 h-[120px] flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-black font-ibm text-sm font-normal leading-[110%]">
                            Предложение
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium font-ibm ${getStatusColor(offer.offerStatus)}`}>
                            {getStatusLabel(offer.offerStatus)}
                          </span>
                        </div>
                        {offer.Amount && (
                          <div className="text-black font-ibm text-2xl font-normal leading-[110%] text-center">
                            {parseFloat(offer.Amount.amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {offer.Amount.currency}
                          </div>
                        )}
                        {offer.description && (
                          <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
                            {offer.description}
                          </div>
                        )}
                        {offer.rate && (
                          <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
                            Ставка: {offer.rate}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Список заявлений */}
        {activeTab === 'applications' && (
          <>
            {/* Header Section with Total */}
            {applications.length > 0 && (
              <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#F59E0C', animationDelay: '0.1s' }}>
                <div className="p-4" style={{ backgroundColor: '#F59E0C' }}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                      Осталось до погашения кредитов
                    </div>
                  </div>
                  <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                    Статус: балансируй кредиты — живи спокойно
                  </div>
                  <div className="text-white font-ibm text-3xl font-medium leading-[110%] text-center">
                    {totalCreditAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                  </div>
                  <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
                </div>
              </div>
            )}

            <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#3C82F6', animationDelay: '0.2s' }}>
              <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                    {applications.length > 0 ? 'Активные заявления' : 'Заявления'}
                  </div>
                </div>
                <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                  {applications.length > 0 ? 'Список ваших активных кредитных заявлений' : 'Нет активных заявлений'}
                </div>
                <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
              </div>
              <div className="px-4 pb-4 pt-4 bg-white">
                <div className="space-y-4">

                  {isLoadingApplications ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="font-ibm">Нет активных заявлений</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app, index) => {
                        const amount = app?.CustomProduct?.Amount?.amount || 
                                       app?.Amount?.amount || 
                                       app?.amount || 0;
                        const currency = app?.CustomProduct?.Amount?.currency || 
                                        app?.Amount?.currency || 
                                        'RUB';
                        const productName = app?.CustomProduct?.productName || 
                                           app?.productName || 
                                           'Не указан';
                        
                        return (
                          <div
                            key={app.productApplicationId}
                            className="bg-gray-100 rounded-[27px] p-4 h-[120px] flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-black font-ibm text-sm font-normal leading-[110%]">
                                Сумма кредита
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium font-ibm ${getStatusColor(app.productApplicationStatus)}`}>
                                  {getStatusLabel(app.productApplicationStatus)}
                                </span>
                              </div>
                            </div>
                            <div className="text-black font-ibm text-2xl font-normal leading-[110%] text-center">
                              {parseFloat(amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                            </div>
                            <div className="text-black font-ibm text-xs font-normal leading-[110%] text-center">
                              {productName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cash Loan Application Tab */}
        {activeTab === 'cash-loan' && (
          <div className="space-y-4">
            {/* Status Check Section */}
            <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#F59E0C', animationDelay: '0.1s' }}>
              <div className="p-4" style={{ backgroundColor: '#F59E0C' }}>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                    Проверить статус заявки
                  </div>
                </div>
                <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                  Введите ID заявки для проверки статуса
                </div>
                <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
              </div>
              <div className="px-4 pb-4 pt-4 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={statusApplicationId}
                    onChange={(e) => setStatusApplicationId(e.target.value)}
                    placeholder="Введите ID заявки (UUID)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                  <button
                    onClick={() => refetchStatus()}
                    disabled={!statusApplicationId || statusApplicationId.length !== 36}
                    className="px-4 py-3 bg-orange-600 text-white rounded-[27px] hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                  >
                    Проверить
                  </button>
                </div>
                
                {applicationStatus?.status && (
                  <div className={`mt-4 p-4 rounded-[27px] ${getCashLoanStatusColor(applicationStatus.status)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-ibm">
                        {getCashLoanStatusLabel(applicationStatus.status)}
                      </span>
                      {applicationStatus.status === 'PRE_APPROVED' && (
                        <button
                          onClick={() => confirmApplicationMutation.mutate(statusApplicationId)}
                          disabled={confirmApplicationMutation.isLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-[27px] hover:bg-green-700 disabled:opacity-50 transition-colors font-ibm text-sm"
                        >
                          {confirmApplicationMutation.isLoading ? 'Принятие...' : 'Принять предложение'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Application Form */}
            <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.2s' }}>
              <div className="p-4" style={{ backgroundColor: '#10B981' }}>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                    Новая заявка на кредит наличными
                  </div>
                </div>
                <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                  Заполните форму для подачи заявки на кредит
                </div>
                <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
              </div>
              <div className="px-4 pb-4 pt-4 bg-white">
              
              <form onSubmit={handleCreateApplication} className="space-y-4">
                {/* Product Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                      Сумма кредита (₽)
                    </label>
                    <input
                      type="number"
                      value={applicationForm.creditAmount}
                      onChange={(e) => setApplicationForm({ ...applicationForm, creditAmount: e.target.value })}
                      min="40000"
                      max="2000000000"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 focus:border-transparent font-ibm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                      Срок (мес.)
                    </label>
                    <input
                      type="number"
                      value={applicationForm.creditPeriod}
                      onChange={(e) => setApplicationForm({ ...applicationForm, creditPeriod: e.target.value })}
                      min="6"
                      max="60"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 focus:border-transparent font-ibm bg-white"
                    />
                  </div>
                </div>

                {/* Personal Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 font-ibm">Персональные данные</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Фамилия *</label>
                      <input
                        type="text"
                        value={applicationForm.lastName}
                        onChange={(e) => setApplicationForm({ ...applicationForm, lastName: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Имя *</label>
                      <input
                        type="text"
                        value={applicationForm.firstName}
                        onChange={(e) => setApplicationForm({ ...applicationForm, firstName: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Дата рождения *</label>
                      <input
                        type="date"
                        value={applicationForm.birthDate}
                        onChange={(e) => setApplicationForm({ ...applicationForm, birthDate: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Место рождения *</label>
                      <input
                        type="text"
                        value={applicationForm.birthPlace}
                        onChange={(e) => setApplicationForm({ ...applicationForm, birthPlace: e.target.value })}
                        placeholder="г. Москва"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Телефон *</label>
                      <input
                        type="tel"
                        value={applicationForm.phoneNumber}
                        onChange={(e) => setApplicationForm({ ...applicationForm, phoneNumber: e.target.value })}
                        placeholder="+71234567890"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Email *</label>
                      <input
                        type="email"
                        value={applicationForm.emailAddress}
                        onChange={(e) => setApplicationForm({ ...applicationForm, emailAddress: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Passport Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 font-ibm">Паспортные данные</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Серия *</label>
                      <input
                        type="text"
                        value={applicationForm.passportSeries}
                        onChange={(e) => setApplicationForm({ ...applicationForm, passportSeries: e.target.value })}
                        maxLength="4"
                        pattern="\d{4}"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Номер *</label>
                      <input
                        type="text"
                        value={applicationForm.passportNumber}
                        onChange={(e) => setApplicationForm({ ...applicationForm, passportNumber: e.target.value })}
                        maxLength="6"
                        pattern="\d{6}"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Дата выдачи *</label>
                      <input
                        type="date"
                        value={applicationForm.passportIssueDate}
                        onChange={(e) => setApplicationForm({ ...applicationForm, passportIssueDate: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Код подразделения *</label>
                      <input
                        type="text"
                        value={applicationForm.passportIssueCode}
                        onChange={(e) => setApplicationForm({ ...applicationForm, passportIssueCode: e.target.value })}
                        placeholder="123-456"
                        pattern="^\d{3}-\d{3}$"
                        maxLength="7"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Кем выдан *</label>
                      <input
                        type="text"
                        value={applicationForm.passportIssueName}
                        onChange={(e) => setApplicationForm({ ...applicationForm, passportIssueName: e.target.value })}
                        placeholder="Отделом милиции-1 УВД гор. Москвы"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 font-ibm">Адрес регистрации</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Индекс</label>
                      <input
                        type="text"
                        value={applicationForm.registrationZip}
                        onChange={(e) => setApplicationForm({ ...applicationForm, registrationZip: e.target.value })}
                        maxLength="6"
                        pattern="\d{6}"
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Регион *</label>
                      <select
                        value={applicationForm.registrationRegion}
                        onChange={(e) => setApplicationForm({ ...applicationForm, registrationRegion: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      >
                        <option value="MOSCOW">г. Москва</option>
                        <option value="MOSCOWREGION">Московская область</option>
                        <option value="STPETERSBURG">г. Санкт-Петербург</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Город</label>
                      <input
                        type="text"
                        value={applicationForm.registrationCity}
                        onChange={(e) => setApplicationForm({ ...applicationForm, registrationCity: e.target.value })}
                        placeholder="Москва"
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Улица *</label>
                      <input
                        type="text"
                        value={applicationForm.registrationStreet}
                        onChange={(e) => setApplicationForm({ ...applicationForm, registrationStreet: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Дом *</label>
                      <input
                        type="text"
                        value={applicationForm.registrationHouse}
                        onChange={(e) => setApplicationForm({ ...applicationForm, registrationHouse: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 font-ibm">Работа</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Компания *</label>
                      <input
                        type="text"
                        value={applicationForm.companyName}
                        onChange={(e) => setApplicationForm({ ...applicationForm, companyName: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">ИНН компании *</label>
                      <input
                        type="text"
                        value={applicationForm.companyInn}
                        onChange={(e) => setApplicationForm({ ...applicationForm, companyInn: e.target.value })}
                        maxLength="12"
                        pattern="\d{12}"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">Доход (₽/мес.) *</label>
                      <input
                        type="number"
                        value={applicationForm.incomeAmount}
                        onChange={(e) => setApplicationForm({ ...applicationForm, incomeAmount: e.target.value })}
                        min="15000"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-green-500 font-ibm bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Consents */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 font-ibm">Согласия</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applicationForm.consentPers}
                        onChange={(e) => setApplicationForm({ ...applicationForm, consentPers: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-ibm">Согласие на обработку персональных данных *</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applicationForm.consentBki}
                        onChange={(e) => setApplicationForm({ ...applicationForm, consentBki: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-ibm">Согласие на предоставление данных в БКИ *</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applicationForm.consentMobile}
                        onChange={(e) => setApplicationForm({ ...applicationForm, consentMobile: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-ibm">Согласие на проверку мобильного оператора *</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createApplicationMutation.isLoading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-[27px] font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                  >
                    {createApplicationMutation.isLoading ? 'Отправка...' : 'Подать заявку'}
                  </button>
                </div>

                {/* Success/Error Messages */}
                {createApplicationMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-[27px] p-3 mt-4">
                    <p className="text-red-800 text-sm font-ibm">
                      {createApplicationMutation.error?.response?.data?.message || 'Ошибка при создании заявки'}
                    </p>
                  </div>
                )}

                {createdApplicationId && (
                  <div className="bg-green-50 border border-green-200 rounded-[27px] p-3 mt-4">
                    <p className="text-green-800 text-sm font-ibm">
                      Заявка создана! ID: {createdApplicationId}
                    </p>
                  </div>
                )}
              </form>
              </div>
            </div>
          </div>
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

export default CreditsPage;
