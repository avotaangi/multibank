import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BudgetPlanningPage = () => {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState({
    lifestyle: false,
    savings: false
  });

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const budgetData = {
    total: '102 933 РУБ',
    remaining: '29 000 осталось вне бюджета',
    categories: [
      { name: 'Housing', percentage: 47, amount: '71 500 RUB', color: '#14B8A6', spent: 0, budget: 71500 },
      { name: 'Food', percentage: 20, amount: '30 000 RUB', color: '#10B981', spent: 0, budget: 30000 },
      { name: 'Savings', percentage: 10, amount: '15 000 RUB', color: '#34D399', spent: 0, budget: 15000 },
      { name: 'Lifestyle', percentage: 1, amount: '2 000 RUB', color: '#60A5FA', spent: 0, budget: 2000 }
    ]
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
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
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="px-5 py-6">
        <div className="flex items-center space-x-6">
          {/* Circular Progress Chart */}
          <div className="relative w-[114px] h-[114px]">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#3C82F6"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 50 * 0.7} ${2 * Math.PI * 50}`}
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Budget Info */}
          <div className="flex-1">
            <div className="text-gray-600 font-manrope text-sm mb-2">Бюджет на планирование</div>
            <div className="text-black font-manrope text-3xl font-medium mb-2">{budgetData.total}</div>
            <div className="text-black font-manrope text-sm">{budgetData.remaining}</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="px-5 py-4">
        <div className="space-y-3">
          {budgetData.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div className="text-black font-manrope text-sm">{category.name} {category.percentage}%</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-0.5 bg-white border-dashed border-t border-gray-300"></div>
                <div className="text-black font-manrope text-sm">{category.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tip */}
      <div className="px-5 py-4">
        <div className="text-center">
          <div className="text-black font-manrope text-sm font-medium mb-1">AI подсказка!!!!!!!!!!!</div>
          <div className="text-black font-manrope text-sm">+ подписка на жизнь</div>
        </div>
      </div>

      {/* Expandable Categories */}
      <div className="px-5 py-4 space-y-4">
        {/* Lifestyle Category */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button 
            onClick={() => toggleCategory('lifestyle')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
          >
            <div className="text-left">
              <div className="text-black font-manrope text-base font-medium">Lifestyle</div>
              <div className="text-gray-500 font-manrope text-sm">0 RUB / 2 000 RUB</div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.lifestyle ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedCategories.lifestyle && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-black font-manrope text-sm">Gym</div>
                    <div className="text-gray-500 font-manrope text-xs">0 RUB / 2 000 RUB</div>
                  </div>
                </div>
                <button className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Savings Category */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button 
            onClick={() => toggleCategory('savings')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
          >
            <div className="text-left">
              <div className="text-black font-manrope text-base font-medium">Savings</div>
              <div className="text-gray-500 font-manrope text-sm">0 RUB / 15 000 RUB</div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.savings ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedCategories.savings && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-black font-manrope text-sm">Savings</div>
                    <div className="text-gray-500 font-manrope text-xs">0 RUB / 15 000 RUB</div>
                  </div>
                </div>
                <button className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-3">
        <div className="flex justify-center space-x-8">
          <button className="text-black font-manrope text-sm">Цели</button>
          <button className="text-black font-manrope text-sm">Подписки</button>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default BudgetPlanningPage;
