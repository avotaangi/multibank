import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Heart, Shield, FileText, ChevronRight } from 'lucide-react';

const InsuranceCard = ({ policy, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'OSAGO':
      case 'CASCO':
        return <Car className="w-5 h-5" />;
      case 'DMS':
        return <Shield className="w-5 h-5" />;
      case 'LIFE':
        return <Heart className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`${getIconColor(policy.type)} rounded-xl p-2.5 flex-shrink-0`}>
            {getIcon(policy.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-black font-ibm text-sm font-medium">
                {policy.type === 'OSAGO' ? 'ОСАГО' : 
                 policy.type === 'CASCO' ? 'КАСКО' : 
                 policy.type === 'DMS' ? 'ДМС' : 
                 policy.type === 'LIFE' ? 'Страхование жизни' : policy.type}
              </span>
            </div>
            <div className="text-gray-600 font-ibm text-xs">
              {policy.company}
            </div>
            {policy.type === 'DMS' && policy.remainingVisits !== undefined ? (
              <div className="text-gray-700 font-ibm text-xs mt-1">
                {policy.remainingVisits} визит{policy.remainingVisits === 1 ? '' : policy.remainingVisits < 5 ? 'а' : 'ов'} осталось
              </div>
            ) : (
              <div className="text-gray-700 font-ibm text-xs mt-1">
                до {formatExpiryDate(policy.expiryDate)}
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );
};

export default InsuranceCard;
