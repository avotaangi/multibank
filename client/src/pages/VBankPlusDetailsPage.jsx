import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Shield, Zap, TrendingUp, CreditCard, Lock, 
  Star, CheckCircle, ArrowRight, Infinity, Globe, 
  Bell, Wallet, PieChart, Target, Users
} from 'lucide-react';

const VBankPlusDetailsPage = () => {
  const navigate = useNavigate();

  const handleMultibankClick = () => {
    navigate('/password');
  };

  const vbankPlusFeatures = [
    {
      icon: TrendingUp,
      title: 'Расширенная аналитика',
      description: 'Детальные отчеты по всем вашим тратам и доходам',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: 'Повышенная безопасность',
      description: 'Дополнительная защита ваших средств и данных',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Zap,
      title: 'Приоритетная поддержка',
      description: 'Быстрое решение любых вопросов 24/7',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: CreditCard,
      title: 'Неограниченные переводы',
      description: 'Переводите деньги без ограничений и комиссий',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Star,
      title: 'Эксклюзивные предложения',
      description: 'Специальные условия и бонусы от партнеров',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: Bell,
      title: 'Умные уведомления',
      description: 'Персонализированные напоминания и советы',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const multibankFeatures = [
    {
      icon: Wallet,
      title: 'Объединение всех карт',
      description: 'Управляйте картами всех банков в одном приложении',
      highlight: true
    },
    {
      icon: PieChart,
      title: 'Умное планирование бюджета',
      description: 'Автоматическое распределение средств по категориям и целям',
      highlight: true
    },
    {
      icon: Target,
      title: 'Финансовые цели',
      description: 'Ставьте цели и отслеживайте прогресс накоплений',
      highlight: true
    },
    {
      icon: Users,
      title: 'Совместные цели',
      description: 'Создавайте общие цели с друзьями и семьей',
      highlight: true
    },
    {
      icon: Globe,
      title: 'Межбанковские переводы',
      description: 'Быстрые переводы между любыми банками без комиссий',
      highlight: true
    },
    {
      icon: Infinity,
      title: 'Автоплатежи',
      description: 'Настройте автоматические платежи для регулярных трат',
      highlight: true
    },
    {
      icon: TrendingUp,
      title: 'Инвестиционная аналитика',
      description: 'Отслеживайте доходность и оптимизируйте портфель',
      highlight: true
    },
    {
      icon: Shield,
      title: 'Страхование онлайн',
      description: 'Оформите полисы ОСАГО, КАСКО, ДМС прямо в приложении',
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900 font-ibm">VBank Plus</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 pt-6 pb-8">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-6 shadow-2xl mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2 font-ibm">
            VBank Plus
          </h2>
          <p className="text-white text-opacity-90 text-center font-ibm text-sm mb-4">
            Премиум подписка с эксклюзивными возможностями
          </p>
          <div className="bg-white bg-opacity-10 rounded-2xl p-4">
            <div className="text-white font-ibm text-3xl font-bold text-center mb-1">
              999 ₽
            </div>
            <div className="text-white text-opacity-80 font-ibm text-sm text-center">
              в месяц
            </div>
          </div>
        </div>
      </div>

      {/* VBank Plus Features */}
      <div className="px-4 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 font-ibm">
          Возможности VBank Plus
        </h3>
        <div className="space-y-3">
          {vbankPlusFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-ibm font-semibold mb-1">
                    {feature.title}
                  </div>
                  <div className="text-gray-500 font-ibm text-sm">
                    {feature.description}
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multibank Section */}
      <div className="px-4 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl p-6 shadow-xl mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white text-center mb-2 font-ibm">
            Мультибанк
          </h3>
          <p className="text-white text-opacity-90 text-center font-ibm text-sm mb-4">
            Новая революционная платформа для управления всеми вашими финансами
          </p>
          <div className="bg-white bg-opacity-10 rounded-2xl p-3 mb-4">
            <div className="text-white font-ibm text-center text-sm">
              <span className="font-bold">Включено</span> в подписку VBank Plus
            </div>
          </div>
        </div>

        <h4 className="text-lg font-bold text-gray-900 mb-4 font-ibm">
          Эксклюзивные возможности Мультибанк:
        </h4>
        <div className="space-y-3">
          {multibankFeatures.map((feature, index) => (
            <div 
              key={index} 
              className={`rounded-2xl p-4 shadow-sm border-2 ${
                feature.highlight 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : 'bg-gray-100'
                }`}>
                  <feature.icon className={`w-6 h-6 ${feature.highlight ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`font-ibm font-semibold ${
                      feature.highlight ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {feature.title}
                    </div>
                    {feature.highlight && (
                      <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full font-ibm">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className={`font-ibm text-sm ${
                    feature.highlight ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {feature.description}
                  </div>
                </div>
                {feature.highlight && (
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-4 fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4">
        <button
          onClick={handleMultibankClick}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-ibm font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transform transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <span>Мультибанк</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Spacer for fixed button */}
      <div className="h-24"></div>
    </div>
  );
};

export default VBankPlusDetailsPage;

