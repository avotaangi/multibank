import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TransferPage = () => {
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState(null);

  const contacts = [
    {
      id: 'empty',
      name: '',
      avatar: null,
      isAddContact: true,
      cardColor: '#EF3124' // Красный для пустой карточки
    },
    {
      id: 'contact1',
      name: 'Анна',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      phone: '+7 (999) 123-45-67',
      cardColor: '#0055BC' // Синий ВТБ
    },
    {
      id: 'contact2', 
      name: 'Мария',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      phone: '+7 (999) 234-56-78',
      cardColor: '#2F2F2F' // Темный T-Банк
    }
  ];

  const handleContactClick = (contact) => {
    if (contact.isAddContact) {
      // Логика добавления нового контакта
      console.log('Add new contact');
    } else {
      setSelectedContact(contact);
    }
  };

  const closeContactModal = () => {
    setSelectedContact(null);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-black font-ibm text-lg font-normal leading-[110%] text-center">
            Переводы
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="relative z-10 px-6 py-4">
        <div className="flex justify-center space-x-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="w-[105px] h-[123px] border border-white rounded-[27px] cursor-pointer transition-transform duration-200 hover:scale-105"
              style={{ 
                boxShadow: `0px 0px 4px 0.5px ${contact.cardColor}`
              }}
              onClick={() => handleContactClick(contact)}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                {contact.isAddContact ? (
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: contact.cardColor }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                ) : (
                  <div 
                    className="w-14 h-14 rounded-full overflow-hidden border-2"
                    style={{ borderColor: contact.cardColor }}
                  >
                    <img 
                      src={contact.avatar} 
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show Cards Button */}
      <div className="relative z-10 px-6 py-8">
        <button className="w-full h-7 border border-black rounded-[14px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
          <div className="text-black font-manrope font-light text-xs leading-[110%] text-center">
            Показать карты
          </div>
        </button>
      </div>

      {/* Contact Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full h-[50vh] rounded-t-3xl p-6 animate-slide-up-modal">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full overflow-hidden border-2"
                  style={{ borderColor: selectedContact.cardColor }}
                >
                  <img 
                    src={selectedContact.avatar} 
                    alt={selectedContact.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-lg font-semibold font-ibm">{selectedContact.name}</div>
                  <div className="text-sm text-gray-500 font-ibm">{selectedContact.phone}</div>
                </div>
              </div>
              <button 
                onClick={closeContactModal}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Transfer Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма перевода
                </label>
                <input 
                  type="number" 
                  placeholder="0 ₽"
                  className="w-full h-12 border border-gray-300 rounded-lg px-4 text-lg font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  С карты
                </label>
                <select className="w-full h-12 border border-gray-300 rounded-lg px-4">
                  <option>ВТБ •••• 1234</option>
                  <option>T-Банк •••• 5678</option>
                  <option>Альфа-Банк •••• 2498</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий (необязательно)
                </label>
                <input 
                  type="text" 
                  placeholder="Назначение платежа"
                  className="w-full h-12 border border-gray-300 rounded-lg px-4"
                />
              </div>

              <button className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Перевести
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default TransferPage;