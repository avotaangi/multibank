import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TransferPage = () => {
  const navigate = useNavigate();
  const [selectedFromBank, setSelectedFromBank] = useState(null);
  const [selectedToBank, setSelectedToBank] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const recentContacts = [
    {
      id: 'between-banks',
      name: 'Между банками',
      icon: 'refresh',
      type: 'action'
    },
    {
      id: 'ksenia',
      name: 'Ксения Шанина',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      type: 'contact'
    },
    {
      id: 'karina',
      name: 'Карина Громенко',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      type: 'contact'
    }
  ];

  const banks = [
    {
      id: 'vtb',
      name: 'ВТБ',
      logo: 'ВТБ',
      color: '#0055BC',
      user: 'София Л.'
    },
    {
      id: 'tbank',
      name: 'T-Банк',
      logo: 'T',
      color: '#2F2F2F',
      user: 'София Л.'
    },
    {
      id: 'alfa',
      name: 'Альфа-Банк',
      logo: 'A',
      color: '#EF3124',
      user: 'София Л.'
    },
    {
      id: 'other',
      name: 'Другой банк',
      logo: '+',
      color: '#F5F5F5',
      user: null
    }
  ];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTransfer = () => {
    if (selectedFromBank && selectedToBank && amount) {
      // Логика перевода
      console.log('Transfer:', { selectedFromBank, selectedToBank, amount, message });
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto lg:max-w-4xl xl:max-w-6xl">
      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-black font-ibm text-lg sm:text-xl md:text-2xl font-bold leading-[110%] text-center">
            Платежи
          </div>
          <div className="w-9 sm:w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Recent Contacts */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        {/* Scroll indicator */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 lg:hidden">
          <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-transparent rounded-full opacity-60"></div>
        </div>
        <div className="flex space-x-3 sm:space-x-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-x-0 overflow-x-auto lg:overflow-visible py-2 scrollbar-hide scroll-smooth">
          {recentContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex-shrink-0 w-[90px] sm:w-[105px] md:w-[120px] h-[110px] sm:h-[123px] md:h-[140px] bg-white border border-gray-200 rounded-[20px] sm:rounded-[27px] cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:border-gray-300 flex flex-col items-center justify-center p-3 sm:p-4"
            >
              {contact.type === 'action' ? (
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-blue-200 mb-2">
                  <img 
                    src={contact.avatar} 
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-black font-ibm text-xs sm:text-sm md:text-base font-medium leading-[110%] text-center">
                {contact.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Transfer Section */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-5 sm:py-7">
        <div className="text-black font-ibm text-base sm:text-lg md:text-xl font-bold leading-[110%] mb-3">
          Новый перевод
        </div>
        <div className="text-black font-ibm text-sm sm:text-base md:text-lg leading-[110%] mb-6">
          Банк, из которого хотите перевести
        </div>
        
        {/* From Bank Cards */}
        <div className="relative">
          {/* Scroll indicator */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 lg:hidden z-10">
            <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-transparent rounded-full opacity-60"></div>
          </div>
          <div className="flex space-x-3 sm:space-x-4 lg:grid lg:grid-cols-4 lg:gap-4 lg:space-x-0 overflow-x-auto lg:overflow-visible mb-6 sm:mb-8 py-2 scrollbar-hide scroll-smooth">
          {banks.map((bank) => (
            <div
              key={`from-${bank.id}`}
              className={`flex-shrink-0 w-[90px] sm:w-[105px] md:w-[120px] h-[110px] sm:h-[123px] md:h-[140px] rounded-[20px] sm:rounded-[27px] cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center p-3 sm:p-4 ${
                selectedFromBank === bank.id ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' : ''
              }`}
              style={{ backgroundColor: bank.color }}
              onClick={() => setSelectedFromBank(bank.id)}
            >
              {bank.id === 'other' ? (
                <div className="text-black font-ibm text-xs sm:text-sm md:text-base font-medium leading-[110%] text-center">
                  {bank.name}
                </div>
              ) : (
                <>
                  <div className="text-white font-ibm text-xl sm:text-2xl md:text-3xl font-bold leading-[110%] mb-2">
                    {bank.logo}
                  </div>
                  <div className="text-white font-ibm text-xs sm:text-sm md:text-base leading-[110%]">
                    {bank.user}
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Recipient Section */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-5 sm:py-7">
        <div className="text-black font-ibm text-base sm:text-lg md:text-xl font-bold leading-[110%] mb-6">
          Получатель
        </div>
        
        {/* To Bank Cards */}
        <div className="relative">
          {/* Scroll indicator */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 lg:hidden z-10">
            <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-transparent rounded-full opacity-60"></div>
          </div>
          <div className="flex space-x-3 sm:space-x-4 lg:grid lg:grid-cols-4 lg:gap-4 lg:space-x-0 overflow-x-auto lg:overflow-visible mb-6 sm:mb-8 py-2 scrollbar-hide scroll-smooth">
          {banks.map((bank) => (
            <div
              key={`to-${bank.id}`}
              className={`flex-shrink-0 w-[90px] sm:w-[105px] md:w-[120px] h-[110px] sm:h-[123px] md:h-[140px] rounded-[20px] sm:rounded-[27px] cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center p-3 sm:p-4 ${
                selectedToBank === bank.id ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' : ''
              }`}
              style={{ backgroundColor: bank.color }}
              onClick={() => setSelectedToBank(bank.id)}
            >
              {bank.id === 'other' ? (
                <div className="text-black font-ibm text-xs sm:text-sm md:text-base font-medium leading-[110%] text-center">
                  {bank.name}
                </div>
              ) : (
                <>
                  <div className="text-white font-ibm text-xl sm:text-2xl md:text-3xl font-bold leading-[110%] mb-2">
                    {bank.logo}
                  </div>
                  <div className="text-white font-ibm text-xs sm:text-sm md:text-base leading-[110%]">
                    {bank.user}
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-5 sm:py-7 space-y-4 sm:space-y-5">
        {/* Amount Input */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Введите сумму"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-10 sm:h-12 md:h-14 bg-gray-100 rounded-[12px] sm:rounded-[14px] px-3 sm:px-4 text-gray-500 font-ibm text-sm sm:text-base md:text-lg leading-[110%]"
          />
          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
            <button className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <input 
          type="text" 
          placeholder="Сообщение получателю"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-10 sm:h-12 md:h-14 bg-gray-100 rounded-[12px] sm:rounded-[14px] px-3 sm:px-4 text-gray-500 font-ibm text-sm sm:text-base md:text-lg leading-[110%]"
        />
      </div>

      {/* Transfer Button */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-5 sm:py-7">
        <button 
          onClick={handleTransfer}
          className="w-full h-10 sm:h-12 md:h-14 bg-red-500 hover:bg-red-600 text-white rounded-[12px] sm:rounded-[14px] font-ibm text-sm sm:text-base md:text-lg font-medium leading-[110%] transition-colors"
        >
          Перевести
        </button>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20 sm:h-24 md:h-28"></div>
    </div>
  );
};

export default TransferPage;