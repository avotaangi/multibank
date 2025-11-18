import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, Shield, Heart, FileText, Calendar, DollarSign, CreditCard, ChevronRight, X, Info } from 'lucide-react';
import useBalanceStore from '../stores/balanceStore';
import useTestCardsStore from '../stores/testCardsStore';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';

const InsuranceDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const policy = location.state?.policy;
  const { bankBalances } = useBalanceStore();
  const { getAllCards } = useTestCardsStore();
  const [selectedCardId, setSelectedCardId] = useState(policy?.linkedCardId || 'vbank'); // Карта по умолчанию
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [isAutopayEnabled, setIsAutopayEnabled] = useState(policy?.autopayEnabled !== false); // По умолчанию включен

  if (!policy) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Полис не найден</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'OSAGO':
      case 'CASCO':
        return <Car className="w-6 h-6" />;
      case 'DMS':
        return <Shield className="w-6 h-6" />;
      case 'LIFE':
        return <Heart className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'OSAGO':
        return 'text-blue-600 bg-blue-100';
      case 'CASCO':
        return 'text-orange-600 bg-orange-100';
      case 'DMS':
        return 'text-green-600 bg-green-100';
      case 'LIFE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'OSAGO':
        return 'ОСАГО';
      case 'CASCO':
        return 'КАСКО';
      case 'DMS':
        return 'ДМС';
      case 'LIFE':
        return 'Страхование жизни';
      default:
        return type;
    }
  };

  // Расчет ПДН с учетом страховок
  const allInsurancePolicies = useMemo(() => [
    {
      id: 'osago-1',
      type: 'OSAGO',
      company: 'Ингосстрах',
      monthlyPayment: 4500
    },
    {
      id: 'dms-1',
      type: 'DMS',
      company: 'ВСК',
      monthlyPayment: 3500
    }
  ], []);

  const totalInsurancePayments = allInsurancePolicies.reduce((sum, p) => sum + (p.monthlyPayment || 0), 0);
  const monthlyIncome = 120473; // Доходы
  const monthlyExpenses = 54986; // Расходы
  const pdn = monthlyIncome - monthlyExpenses - totalInsurancePayments;

  // AI рекомендации для конкретного полиса
  const getRecommendations = (policyType) => {
    const recommendations = [];
    
    if (policyType === 'OSAGO') {
      recommendations.push({
        type: 'optimization',
        message: 'КАСКО продлён автоматически — сэкономьте 3 200 ₽, выбрав тариф "Город"'
      });
      recommendations.push({
        type: 'suggestion',
        message: 'Вы ездите 15 000 км/год — КАСКО дешевле на 18%'
      });
    } else if (policyType === 'DMS') {
      recommendations.push({
        type: 'optimization',
        message: 'Сократите ДМС до базового — сэкономите 1 800 ₽/мес'
      });
      recommendations.push({
        type: 'suggestion',
        message: 'У вас осталось 3 визита — рассмотрите продление полиса заранее'
      });
    } else if (policyType === 'CASCO') {
      recommendations.push({
        type: 'optimization',
        message: 'Выберите тариф "Город" вместо "Полный" — сэкономьте 3 200 ₽/год'
      });
    } else if (policyType === 'LIFE') {
      recommendations.push({
        type: 'suggestion',
        message: 'У вас ипотека в Сбере — оформите страхование жизни в Ингосстрахе со скидкой 20%'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations(policy.type);

  // Получаем все карты пользователя
  const userCards = useMemo(() => {
    // Базовые карты (всегда присутствуют) - гарантируем, что все три карты будут в списке
    const baseCards = [
      {
        id: 'vbank',
        name: 'VBank',
        bankName: 'VBank',
        balance: (bankBalances && bankBalances.vbank !== undefined) ? bankBalances.vbank : 10000,
        cardNumber: '5294',
        color: '#0055BC'
      },
      {
        id: 'abank',
        name: 'ABank',
        bankName: 'ABank',
        balance: (bankBalances && bankBalances.abank !== undefined) ? bankBalances.abank : 30000,
        cardNumber: '3568',
        color: '#EF3124'
      },
      {
        id: 'sbank',
        name: 'SBank',
        bankName: 'SBank',
        balance: (bankBalances && bankBalances.sbank !== undefined) ? bankBalances.sbank : 20000,
        cardNumber: '6352',
        color: '#00A859'
      }
    ];
    
    // Тестовые карты из стора
    const testCards = getAllCards() || [];
    const baseCardIds = new Set(['vbank', 'abank', 'sbank']);
    
    // Фильтруем тестовые карты, исключая дубликаты базовых карт по ID
    const testCardsWithBalance = testCards
      .filter(card => {
        // Пропускаем тестовые карты, которые дублируют базовые по ID
        if (card.id && ['vbank', 'abank', 'sbank'].includes(card.id)) {
          return false;
        }
        // Пропускаем тестовые карты, которые дублируют базовые по bankId (если ID не указан)
        if (!card.id && card.bankId && baseCardIds.has(card.bankId)) {
          return false;
        }
        return true;
      })
      .map(card => ({
        id: card.id || `test-${card.bankId}`,
        name: card.name || card.bankId,
        bankName: card.bankId === 'sberbank' ? 'Сбербанк' : 
                  card.bankId === 'vbank' ? 'VBank' : 
                  card.bankId === 'abank' ? 'ABank' : 
                  card.bankId === 'sbank' ? 'SBank' : card.bankId,
        balance: (bankBalances && bankBalances[card.bankId] !== undefined) ? bankBalances[card.bankId] : (card.balance || 0),
        cardNumber: card.cardNumber?.replace(/\s/g, '').slice(-4) || '0000',
        color: card.bankId === 'sberbank' ? '#21A038' : 
               card.bankId === 'vbank' ? '#0055BC' : 
               card.bankId === 'abank' ? '#EF3124' : 
               card.bankId === 'sbank' ? '#00A859' : '#6366F1'
      }));
    
    // Объединяем: сначала базовые карты (VBank, ABank, SBank), затем тестовые
    const allCards = [...baseCards, ...testCardsWithBalance];
    
    // Отладочный вывод
    console.log('InsuranceDetailsPage - userCards count:', allCards.length);
    console.log('InsuranceDetailsPage - userCards:', allCards);
    console.log('InsuranceDetailsPage - bankBalances:', bankBalances);
    console.log('InsuranceDetailsPage - baseCards:', baseCards);
    
    return allCards;
  }, [bankBalances, getAllCards]);

  const selectedCard = userCards.find(card => card.id === selectedCardId) || userCards[0];

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
    setShowCardSelection(false);
    // Здесь можно добавить сохранение выбранной карты в API
  };

  const handleToggleAutopay = () => {
    setIsAutopayEnabled(!isAutopayEnabled);
    // Здесь можно добавить вызов API для отмены/включения автоплатежа
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Детали страховки
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
      <div className="px-5 pt-4">
        {/* Policy Header */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`${getIconColor(policy.type)} rounded-xl p-3`}>
              {getIcon(policy.type)}
            </div>
            <div>
              <div className="text-black font-ibm text-xl font-semibold mb-1">
                {getTypeName(policy.type)}
              </div>
              <div className="text-gray-600 font-ibm text-sm">
                {policy.company}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-500 font-ibm text-xs mb-1">Номер полиса</div>
                <div className="text-black font-ibm text-sm font-medium">{policy.policyNumber}</div>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-500 font-ibm text-xs mb-1">Срок действия</div>
                <div className="text-black font-ibm text-sm font-medium">
                  до {formatDate(policy.expiryDate)}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-500 font-ibm text-xs mb-1">Страховая сумма</div>
                <div className="text-black font-ibm text-sm font-medium">
                  {policy.insuredAmount?.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>

            {policy.type === 'DMS' && policy.remainingVisits !== undefined ? (
              <>
                <div className="h-px bg-gray-200"></div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-gray-500 font-ibm text-xs mb-1">Остаток визитов</div>
                    <div className="text-black font-ibm text-sm font-medium">
                      {policy.remainingVisits} визит{policy.remainingVisits === 1 ? '' : policy.remainingVisits < 5 ? 'а' : 'ов'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-px bg-gray-200"></div>
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-gray-500 font-ibm text-xs mb-1">Дата следующего платежа</div>
                    <div className="text-black font-ibm text-sm font-medium">
                      {formatDate(policy.nextPaymentDate)}
                    </div>
                  </div>
                </div>
                {policy.monthlyPayment && (
                  <>
                    <div className="h-px bg-gray-200"></div>
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-gray-500 font-ibm text-xs mb-1">Ежемесячный платеж</div>
                        <div className="text-black font-ibm text-sm font-medium">
                          {policy.monthlyPayment.toLocaleString('ru-RU')} ₽/мес
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Payment Card Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-black font-ibm text-base font-semibold leading-[110%]">
              Карта для оплаты
            </div>
            {isAutopayEnabled && (
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-ibm text-xs font-medium">Автоплатеж активен</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Current Card */}
          {isAutopayEnabled ? (
            <div className="space-y-3">
              <div 
                className="p-4 rounded-xl border-2 border-gray-200 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => setShowCardSelection(true)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-12 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: selectedCard?.color || '#0055BC' }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-black font-ibm text-sm font-medium">
                      {selectedCard?.bankName || 'VBank'} ••••{selectedCard?.cardNumber || '5294'}
                    </div>
                    <div className="text-gray-500 font-ibm text-xs">
                      {selectedCard?.balance?.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} ₽
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCardSelection(true)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 rounded-xl text-gray-700 font-ibm text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Изменить карту
                </button>
                <button
                  onClick={handleToggleAutopay}
                  className="flex-1 py-2.5 px-4 bg-red-50 rounded-xl text-red-600 font-ibm text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Отменить автоплатеж
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 text-center">
                <div className="text-gray-500 font-ibm text-sm mb-2">
                  Автоплатеж отключен
                </div>
                <button
                  onClick={handleToggleAutopay}
                  className="py-2.5 px-6 bg-blue-500 rounded-xl text-white font-ibm text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Включить автоплатеж
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Selection Modal */}
        {showCardSelection && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCardSelection(false)}
            ></div>
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[27px] max-h-[80vh] overflow-y-auto z-50">
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-black font-ibm text-xl font-semibold">
                    Выберите карту
                  </div>
                  <button
                    onClick={() => setShowCardSelection(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="px-5 py-4 space-y-3">
                {userCards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 font-ibm text-sm">
                    Нет доступных карт
                  </div>
                ) : (
                  userCards.map((card, index) => {
                    // Отладочный вывод для каждой карты
                    console.log(`InsuranceDetailsPage - Rendering card ${index}:`, {
                      id: card.id,
                      bankName: card.bankName,
                      name: card.name,
                      cardNumber: card.cardNumber,
                      balance: card.balance,
                      color: card.color
                    });
                    
                    return (
                      <div
                        key={card.id || `card-${index}`}
                        onClick={() => handleCardSelect(card.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCardId === card.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-12 h-8 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: card.color || '#6366F1' }}
                          ></div>
                          <div className="flex-1">
                            <div className="text-black font-ibm text-sm font-medium">
                              {card.bankName || card.name || 'Неизвестный банк'} ••••{card.cardNumber || '0000'}
                            </div>
                            <div className="text-gray-500 font-ibm text-xs">
                              {(card.balance || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                            </div>
                          </div>
                          {selectedCardId === card.id && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* AI Analytics Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-200 mb-4">
          <div className="text-black font-ibm text-lg font-semibold leading-[110%] mb-4">
            AI-аналитика
          </div>

          {/* PDN Calculation with Insurance */}
          <div className="mb-4 pb-4 border-b border-blue-200">
            <div className="text-gray-700 font-ibm text-sm font-medium leading-[110%] mb-2">
              ПДН (с учетом страховок)
            </div>
            <div className="text-black font-ibm text-2xl font-bold leading-[110%] mb-2">
              {pdn.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-gray-600 font-ibm text-xs mt-1 leading-relaxed">
              Доходы: {monthlyIncome.toLocaleString('ru-RU')} ₽ − Расходы: {monthlyExpenses.toLocaleString('ru-RU')} ₽ − Страховки: {totalInsurancePayments.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Recommendations for this policy */}
          {recommendations.length > 0 && (
            <div>
              <div className="text-gray-700 font-ibm text-sm font-medium leading-[110%] mb-3">
                Рекомендации
              </div>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      rec.type === 'optimization'
                        ? 'bg-white border-2 border-blue-300 shadow-sm'
                        : 'bg-white/80 border border-gray-200'
                    }`}
                  >
                    <div className="text-black font-ibm text-sm leading-relaxed">
                      {rec.message}
                    </div>
                  </div>
                ))}
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

export default InsuranceDetailsPage;
