import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { rewardsAPI } from '../services/api';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';
import { Gift, ArrowLeft, History, CheckCircle, XCircle, Info } from 'lucide-react';

// Helper function to generate UUID
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers that don't support crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const RewardsPage = () => {
  const navigate = useNavigate();
  const telegramUser = useTelegramUser();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  // Для тестирования - нужен externalAccountID
  // В реальности его нужно получать из API или хранить в профиле пользователя
  const externalAccountID = '0dbcb7ee-6c59-483b-966a-44d11557665b'; // TODO: получить из API
  
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [redemptionAmount, setRedemptionAmount] = useState('');
  const [showRedemptionForm, setShowRedemptionForm] = useState(false);
  
  // Загрузка баланса бонусов
  const { data: balanceData, isLoading, error, refetch } = useQuery(
    ['rewardsBalance', externalAccountID],
    () => {
      console.log('[RewardsPage] Fetching balance for account:', externalAccountID);
      console.log('[RewardsPage] Authorization header:', api.defaults.headers.common['Authorization'] ? 'Present' : 'Missing');
      return rewardsAPI.getBalance(externalAccountID);
    },
    {
      enabled: !!externalAccountID,
      refetchInterval: 30000, // Обновляем каждые 30 секунд
      onError: (error) => {
        console.error('[RewardsPage] Error fetching rewards balance:', error);
        console.error('[RewardsPage] Error response:', error.response?.data);
        console.error('[RewardsPage] Error status:', error.response?.status);
      },
    }
  );
  
  // Мутация для использования бонусов
  const redemptionMutation = useMutation(
    (data) => rewardsAPI.redeem(externalAccountID, data),
    {
      onSuccess: () => {
        refetch(); // Обновляем баланс после успешного использования
        setShowRedemptionForm(false);
        setRedemptionAmount('');
        setSelectedCatalog(null);
      },
    }
  );
  
  const balance = balanceData?.data;
  const rewardSummary = balance?.rewardSummary;
  const programDetail = balance?.programDetail;
  const redemptionEligibility = balance?.redemptionEligibility;
  
  const handleRedeem = () => {
    if (!selectedCatalog || !redemptionAmount) {
      return;
    }
    
    const amount = parseFloat(redemptionAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    // Генерируем UUID для redemptionReferenceNumber
    const redemptionReferenceNumber = generateUUID();
    
    const redemptionData = {
      data: {
        redemptionReferenceNumber,
        redemptionAmount: amount,
        programId: programDetail?.programId,
        catalogId: selectedCatalog.catalogId,
        // Добавляем valuePerPoint если есть conversionRate
        ...(selectedCatalog.conversionRate && {
          valuePerPoint: selectedCatalog.conversionRate
        })
      }
    };
    
    redemptionMutation.mutate(redemptionData);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="bg-white px-5 pt-6 pb-4 ">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
              Бонусы
            </div>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (error) {
    const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.title || error.message || 'Ошибка загрузки данных о бонусах';
    const errorStatus = error.response?.status;
    const errorDetails = error.response?.data?.errors?.[0];
    
    // Определяем конкретное сообщение об ошибке
    let userMessage = 'Ошибка загрузки данных о бонусах';
    if (errorStatus === 401) {
      userMessage = 'Требуется авторизация. Пожалуйста, войдите в систему.';
    } else if (errorStatus === 400) {
      userMessage = errorDetails?.title || 'Неверный запрос. Проверьте данные.';
    } else if (errorStatus === 404) {
      userMessage = 'Счет не найден. Проверьте externalAccountID.';
    } else if (errorStatus === 500) {
      userMessage = 'Ошибка сервера. Попробуйте позже.';
    } else if (errorMessage) {
      userMessage = errorMessage;
    }
    
    return (
      <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="bg-white px-5 pt-6 pb-4 ">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
              Бонусы
            </div>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="px-4 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-[27px] p-4 space-y-2">
            <p className="text-red-800 font-semibold font-ibm">{userMessage}</p>
            {errorStatus && (
              <p className="text-red-600 text-sm font-ibm">Код ошибки: {errorStatus}</p>
            )}
            {errorDetails?.code && (
              <p className="text-red-600 text-sm font-ibm">Код: {errorDetails.code}</p>
            )}
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-[27px] hover:bg-red-700 transition-colors font-ibm"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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
            Бонусы
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
      <div className="px-4 space-y-4">
        {/* Balance Card */}
        <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#3C82F6', animationDelay: '0.1s' }}>
          <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                Доступно бонусов
              </div>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              {rewardSummary?.rewardType === 'POINTS' ? 'Баллы' : 
               rewardSummary?.rewardType === 'CASH' ? 'Деньги' : 
               rewardSummary?.rewardType === 'MILES' ? 'Мили' : 
               rewardSummary?.rewardType || 'Бонусы'}
              {rewardSummary?.currencyCode && ` • ${rewardSummary.currencyCode}`}
            </div>
            <div className="text-white font-ibm text-3xl font-medium leading-[110%] text-center">
              {rewardSummary?.availableBalance?.toLocaleString('ru-RU') || 0}
            </div>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>
          <div className="px-4 pb-4 pt-4 bg-white">
            {redemptionEligibility === false && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-[27px] p-3">
                <p className="text-yellow-800 text-sm font-ibm">
                  Использование бонусов временно недоступно для вашего счета
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Program Details */}
        {programDetail && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.2s' }}>
            <div className="p-4" style={{ backgroundColor: '#10B981' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                  Программа наград
                </div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                {programDetail.description || 'Программа лояльности'}
              </div>
              <div className="text-white text-opacity-60 font-ibm text-xs font-normal leading-[110%]">
                ID: {programDetail.programId}
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4 bg-white">
              {/* Catalogs */}
              {programDetail.catalogs && programDetail.catalogs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 font-ibm mb-3">Доступные варианты использования:</h4>
                  {programDetail.catalogs.map((catalog) => (
                    <div
                      key={catalog.catalogId}
                      className={`p-4 border-2 rounded-[27px] cursor-pointer transition-all font-ibm ${
                        selectedCatalog?.catalogId === catalog.catalogId
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => {
                        setSelectedCatalog(catalog);
                        setShowRedemptionForm(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{catalog.description}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Тип: {catalog.catalogType}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {catalog.minRedeemPoints && `Мин: ${catalog.minRedeemPoints} `}
                            {catalog.maxRedeemPoints && `Макс: ${catalog.maxRedeemPoints}`}
                          </p>
                          {catalog.conversionRate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Курс: 1 балл = {catalog.conversionRate} {rewardSummary?.currencyCode || 'RUB'}
                            </p>
                          )}
                        </div>
                        <div className="text-green-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Redemption Form */}
        {showRedemptionForm && selectedCatalog && redemptionEligibility && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#F59E0C', animationDelay: '0.3s' }}>
            <div className="p-4" style={{ backgroundColor: '#F59E0C' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                    Использовать бонусы
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRedemptionForm(false);
                    setRedemptionAmount('');
                  }}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Выбранный вариант: {selectedCatalog.description}
              </div>
              <div className="text-white text-opacity-60 font-ibm text-xs font-normal leading-[110%]">
                {selectedCatalog.minRedeemPoints && `Минимум: ${selectedCatalog.minRedeemPoints} баллов`}
                {selectedCatalog.maxRedeemPoints && ` • Максимум: ${selectedCatalog.maxRedeemPoints} баллов`}
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Сумма ({rewardSummary?.currencyCode || 'RUB'})
                  </label>
                  <input
                    type="number"
                    value={redemptionAmount}
                    onChange={(e) => setRedemptionAmount(e.target.value)}
                    placeholder="Введите сумму"
                    min={selectedCatalog.minRedeemPoints ? selectedCatalog.minRedeemPoints * (selectedCatalog.conversionRate || 1) : 0}
                    max={selectedCatalog.maxRedeemPoints ? selectedCatalog.maxRedeemPoints * (selectedCatalog.conversionRate || 1) : undefined}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>
                
                <button
                  onClick={handleRedeem}
                  disabled={!redemptionAmount || redemptionMutation.isLoading}
                  className="w-full bg-orange-600 text-white py-3 rounded-[27px] font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                >
                  {redemptionMutation.isLoading ? 'Обработка...' : 'Использовать бонусы'}
                </button>
                
                {redemptionMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-[27px] p-3">
                    <p className="text-red-800 text-sm font-ibm">
                      {redemptionMutation.error?.response?.data?.errors?.[0]?.title || 'Ошибка при использовании бонусов'}
                    </p>
                  </div>
                )}
                
                {redemptionMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-[27px] p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 text-sm font-ibm">Бонусы успешно использованы!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* History Section */}
        <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.4s' }}>
          <div className="p-4" style={{ backgroundColor: '#10B981' }}>
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                <History className="w-5 h-5 text-white" />
              </div>
              <div className="text-white font-ibm text-lg font-medium leading-[110%]">
                История операций
              </div>
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
              История операций с бонусами
            </div>
            <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
          </div>
          <div className="px-4 pb-4 pt-4 bg-white">
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm font-ibm">История операций с бонусами будет отображаться здесь</p>
            </div>
          </div>
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

export default RewardsPage;

