import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BudgetPlanningPage = () => {
  const navigate = useNavigate();
  const [showLifestyleTip, setShowLifestyleTip] = useState(false);
  const [showDreamTip, setShowDreamTip] = useState(false);
  const [showGoalsTip, setShowGoalsTip] = useState(false);

  // Бюджет на планирование - отдельное поле
  const planningBudget = "110 000 ₽";
  
  // Данные для кольцевой диаграммы
  const budgetData = [
    { name: "Дом", amount: 60000, color: "#3C82F6" },
    { name: "Еда", amount: 20000, color: "#EF4444" },
    { name: "Накопления", amount: 15000, color: "#F59E0C" },
    { name: "Жизнь", amount: 15000, color: "#844FD9" }
  ];
  
  const totalAmount = budgetData.reduce((sum, item) => sum + item.amount, 0);
  
  // Создаем conic-gradient на основе процентного соотношения
  const getConicGradient = () => {
    let currentAngle = 0;
    const gradients = budgetData.map(item => {
      const percentage = (item.amount / totalAmount) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;
      
      return `${item.color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');
    
    return `conic-gradient(from 0deg, ${gradients})`;
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ paddingTop: '100px' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Планирование бюджета
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pb-20">
        {/* Budget Overview Section */}
        <div className="flex items-center justify-between mb-8">
          {/* Donut Chart */}
          <div className="relative w-[150px] h-[150px] flex items-center justify-center">
            {/* Chart segments */}
            <div 
              className="absolute inset-0 rounded-full" 
              style={{ 
                background: getConicGradient()
              }}
            ></div>
            <div className="absolute inset-4 bg-white rounded-full"></div>
          </div>

          {/* Text Information */}
          <div className="flex-1 pl-6">
            <div className="text-black font-ibm text-sm font-normal leading-[110%] mb-2">
              Бюджет на планирование
            </div>
            <div className="text-black font-ibm text-2xl font-medium leading-[110%] mb-2">
              {planningBudget}
            </div>
            <div className="text-black font-ibm text-sm font-normal leading-[110%]">
              29 000 ₽ осталось из бюджета
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="space-y-4 mb-8">
          {budgetData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-black font-ibm text-base font-normal leading-[110%]">{item.name}</span>
              </div>
              <span className="text-black font-ibm text-base font-normal leading-[110%]">
                {item.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
              </span>
            </div>
          ))}
        </div>

        {/* Lifestyle Section */}
        <div className="bg-gray-100 rounded-[27px] mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-black font-ibm text-lg font-medium leading-[110%]">Образ жизни</h3>
              <button 
                onClick={() => setShowLifestyleTip(!showLifestyleTip)}
                className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <span className="text-black font-ibm text-sm font-medium">i</span>
              </button>
            </div>
            <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-2">
              0 ₽ / 2 000 ₽
            </div>
            {showLifestyleTip && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-gray-700 font-ibm text-sm leading-[110%]">
                  Ищи скидки на абонементы. Многие залы предлагают скидки до 30% при покупке годового абонемента. Также можно найти промокоды в соцсетях
                </div>
                <div className="text-gray-500 font-ibm text-xs mt-1">
                  Совет от МультиБанка
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border-t border-gray-200 rounded-b-[27px] p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-pink-200 rounded-full"></div>
              <span className="text-black font-ibm text-lg font-medium leading-[110%]">Спортивный зал</span>
            </div>
            <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
              0 ₽ / 2 000 ₽
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gray-200 h-1 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Dream Section */}
        <div className="bg-gray-100 rounded-[27px] mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-black font-ibm text-lg font-medium leading-[110%]">Мечта</h3>
              <button 
                onClick={() => setShowDreamTip(!showDreamTip)}
                className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <span className="text-black font-ibm text-sm font-medium">i</span>
              </button>
            </div>
            <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-2">
              10 000 ₽ / 60 000 ₽
            </div>
            {showDreamTip && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-gray-700 font-ibm text-sm leading-[110%]">
                  Планируй путешествие заранее. Билеты и отели дешевле за 3-6 месяцев. Можно сэкономить до 30% от стоимости поездки
                </div>
                <div className="text-gray-500 font-ibm text-xs mt-1">
                  Совет от МультиБанка
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border-t border-gray-200 rounded-b-[27px] p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <span className="text-black font-ibm text-lg font-medium leading-[110%]">Путешествие</span>
            </div>
            <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-3">
              10 000 ₽ / 60 000 ₽
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: '17%' }}></div>
            </div>
          </div>
        </div>

        {/* Add Plan Button */}
        <div className="flex justify-center mb-6">
          <button className="flex items-center space-x-2 text-black font-ibm text-base font-medium leading-[110%]">
            <span className="text-lg">+</span>
            <span>Добавить план</span>
          </button>
        </div>

        {/* My Goals Section */}
        <div className="bg-gray-100 rounded-[27px] mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-black font-ibm text-lg font-medium leading-[110%]">Мои цели</h3>
              <button 
                onClick={() => setShowGoalsTip(!showGoalsTip)}
                className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <span className="text-black font-ibm text-sm font-medium">i</span>
              </button>
            </div>
            {showGoalsTip && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-gray-700 font-ibm text-sm leading-[110%]">
                  Разбивай большие цели на маленькие. Вместо "накопить 200 000₽" ставь "откладывать 10 000₽ в месяц". Так проще достичь результата
                </div>
                <div className="text-gray-500 font-ibm text-xs mt-1">
                  Совет от МультиБанка
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border-t border-gray-200 rounded-b-[27px] p-4">
            {/* Completed Goal */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 border-2 border-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-black font-ibm text-lg font-medium leading-[110%] mb-1">Покупка ноутбука</div>
                <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-1">
                  60 000 ₽ / 60 000 ₽
                </div>
                <div className="text-gray-600 font-ibm text-sm font-light leading-[110%]">
                  до 01.10.2025
                </div>
              </div>
            </div>

            {/* Incomplete Goals */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border border-black rounded-full"></div>
                <div className="flex-1">
                  <div className="text-black font-ibm text-lg font-medium leading-[110%] mb-1">Покупка собаки</div>
                  <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-1">
                    65 000 ₽ / 100 000 ₽
                  </div>
                  <div className="text-gray-600 font-ibm text-sm font-light leading-[110%]">
                    до 15.11.2025
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border border-black rounded-full"></div>
                <div className="flex-1">
                  <div className="text-black font-ibm text-lg font-medium leading-[110%] mb-1">Путешествие</div>
                  <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-1">
                    20 000 ₽ / 100 000 ₽
                  </div>
                  <div className="text-gray-600 font-ibm text-sm font-light leading-[110%]">
                    до 01.02.2026
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border border-black rounded-full"></div>
                <div className="flex-1">
                  <div className="text-black font-ibm text-lg font-medium leading-[110%] mb-1">Переезд в новую квартиру</div>
                  <div className="text-gray-600 font-ibm text-base font-light leading-[110%] mb-1">
                    5 000 ₽ / 200 000 ₽
                  </div>
                  <div className="text-gray-600 font-ibm text-sm font-light leading-[110%]">
                    до 30.03.2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Goal Button */}
        <div className="flex justify-center">
          <button className="flex items-center space-x-2 text-black font-ibm text-base font-medium leading-[110%]">
            <span className="text-lg">+</span>
            <span>Добавить цель</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanningPage;