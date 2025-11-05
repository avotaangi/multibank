import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Search, CheckCircle, XCircle, Clock, AlertCircle, FileText, Info } from 'lucide-react';
import { leadsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoPanel from '../components/InfoPanel';
import { usePageInfo } from '../hooks/usePageInfo';
import { useTelegramUser } from '../hooks/useTelegramUser';

const LeadsPage = () => {
  const navigate = useNavigate();
  const telegramUser = useTelegramUser();
  const queryClient = useQueryClient();
  const pageInfo = usePageInfo();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'add', 'check'
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  
  // Форма добавления лида
  const [leadForm, setLeadForm] = useState({
    phone: '',
    inn: '',
    companyName: '',
    city: '',
    sourceLeadId: '',
    productCode: '',
    productCodes: [],
    consentOnPersonalDataProcessing: false,
    creationComment: '',
    attractionChannelId: '',
    salesCampaignId: '',
  });
  
  // Форма проверки лида
  const [checkForm, setCheckForm] = useState({
    inn: '',
    productCode: '',
    city: '',
    region: '',
  });

  // Получение списка лидов
  const { data: leadsData, isLoading: isLoadingLeads, refetch: refetchLeads } = useQuery(
    ['leads', selectedLeadIds],
    () => {
      if (selectedLeadIds.length === 0) {
        return Promise.resolve({ data: { leads: [] } });
      }
      return leadsAPI.getLeadsStatus({ leadId: selectedLeadIds });
    },
    {
      enabled: selectedLeadIds.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  // Мутация для добавления лидов
  const addLeadMutation = useMutation(
    (leads) => leadsAPI.addLeads(leads),
    {
      onSuccess: (data) => {
        console.log('Leads added successfully:', data);
        // Обновляем список лидов
        if (data?.data?.leads) {
          const newLeadIds = data.data.leads
            .filter(lead => lead.leadId)
            .map(lead => lead.leadId);
          setSelectedLeadIds(prev => [...prev, ...newLeadIds]);
        }
        // Сбрасываем форму
        setLeadForm({
          phone: '',
          inn: '',
          companyName: '',
          city: '',
          sourceLeadId: '',
          productCode: '',
          productCodes: [],
          consentOnPersonalDataProcessing: false,
          creationComment: '',
          attractionChannelId: '',
          salesCampaignId: '',
        });
        setActiveTab('list');
      },
      onError: (error) => {
        console.error('Error adding leads:', error);
      },
    }
  );

  // Мутация для проверки лидов
  const checkLeadMutation = useMutation(
    (leads) => leadsAPI.checkLeads(leads),
    {
      onSuccess: (data) => {
        console.log('Leads checked successfully:', data);
      },
      onError: (error) => {
        console.error('Error checking leads:', error);
      },
    }
  );

  const handleAddLead = (e) => {
    e.preventDefault();
    
    const lead = {
      phone: leadForm.phone,
      ...(leadForm.inn && { inn: leadForm.inn }),
      ...(leadForm.companyName && { companyName: leadForm.companyName }),
      ...(leadForm.city && { city: leadForm.city }),
      ...(leadForm.sourceLeadId && { sourceLeadId: leadForm.sourceLeadId }),
      ...(leadForm.productCode && { productCode: leadForm.productCode }),
      ...(leadForm.productCodes.length > 0 && { productCodes: leadForm.productCodes }),
      ...(leadForm.consentOnPersonalDataProcessing && { consentOnPersonalDataProcessing: true }),
      ...(leadForm.creationComment && { creationComment: leadForm.creationComment }),
      ...(leadForm.attractionChannelId && { attractionChannelId: parseInt(leadForm.attractionChannelId) }),
      ...(leadForm.salesCampaignId && { salesCampaignId: parseInt(leadForm.salesCampaignId) }),
    };

    addLeadMutation.mutate({ leads: [lead] });
  };

  const handleCheckLead = (e) => {
    e.preventDefault();
    
    const checkData = {
      inn: checkForm.inn,
      productCode: checkForm.productCode,
      ...(checkForm.city && { city: checkForm.city }),
      ...(checkForm.region && { region: checkForm.region }),
    };

    checkLeadMutation.mutate({ leads: [checkData] });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Processing':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'ProductOpened':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected':
      case 'CallFailed':
      case 'VerificationFailed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'New': 'Новый',
      'Processing': 'В работе',
      'ProductOpened': 'Продукт оформлен',
      'Rejected': 'Отклонен',
      'CallFailed': 'Недозвон',
      'VerificationFailed': 'Не пройдена проверка',
      'Duple': 'Дубль',
      'TimeOut': 'Истек срок',
    };
    return statusMap[status] || status;
  };

  const leads = leadsData?.data?.leads || [];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 ">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-black font-ibm text-2xl font-medium leading-[110%] text-center">
            Лиды
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
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Список
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Добавить
            </button>
            <button
              onClick={() => setActiveTab('check')}
              className={`px-4 py-2 rounded-xl font-medium font-ibm transition-colors whitespace-nowrap ${
                activeTab === 'check'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-4 h-4 inline mr-1" />
              Проверить
            </button>
          </div>
        </div>

        <div className="px-4 space-y-4">
        {/* Список лидов */}
        {activeTab === 'list' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#3C82F6', animationDelay: '0.1s' }}>
            <div className="p-4" style={{ backgroundColor: '#3C82F6' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-ibm text-lg font-medium leading-[110%]">Список лидов</div>
                </div>
                <button
                  onClick={() => refetchLeads()}
                  className="bg-white text-[#3C82F6] font-ibm text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Обновить
                </button>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Управляйте вашими лидами и отслеживайте их статус
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4">

            {isLoadingLeads ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="font-ibm">Нет лидов для отображения</p>
                <p className="text-sm mt-2 font-ibm">Добавьте лиды, чтобы увидеть их здесь</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.leadId}
                    className="bg-gray-100 rounded-[27px] p-4 hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(lead.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900 font-ibm">
                              Лид #{lead.leadId}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium font-ibm ${
                              lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                              lead.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                              lead.status === 'ProductOpened' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {getStatusLabel(lead.status)}
                            </span>
                          </div>
                          {lead.sourceLeadId && (
                            <p className="text-sm text-gray-600 font-ibm">
                              ID источника: {lead.sourceLeadId}
                            </p>
                          )}
                          {lead.statusChanged && (
                            <p className="text-xs text-gray-500 mt-1 font-ibm">
                              Изменено: {new Date(lead.statusChanged).toLocaleString('ru-RU')}
                            </p>
                          )}
                          {lead.responseCodeDescription && (
                            <p className="text-sm text-gray-600 mt-1 font-ibm">
                              {lead.responseCodeDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Форма добавления лида */}
        {activeTab === 'add' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#10B981', animationDelay: '0.2s' }}>
            <div className="p-4" style={{ backgroundColor: '#10B981' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">Добавить новый лид</div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Заполните информацию о новом лиде для дальнейшей обработки
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4">
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="7123456789"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    ИНН
                  </label>
                  <input
                    type="text"
                    value={leadForm.inn}
                    onChange={(e) => setLeadForm({ ...leadForm, inn: e.target.value })}
                    placeholder="547779835982"
                    maxLength={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Название компании
                  </label>
                  <input
                    type="text"
                    value={leadForm.companyName}
                    onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                    placeholder="ИП Иванов Иван Иванович"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Город
                  </label>
                  <input
                    type="text"
                    value={leadForm.city}
                    onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                    placeholder="Москва"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    ID лида в источнике
                  </label>
                  <input
                    type="text"
                    value={leadForm.sourceLeadId}
                    onChange={(e) => setLeadForm({ ...leadForm, sourceLeadId: e.target.value })}
                    placeholder="ap123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Код продукта
                  </label>
                  <input
                    type="text"
                    value={leadForm.productCode}
                    onChange={(e) => setLeadForm({ ...leadForm, productCode: e.target.value })}
                    placeholder="Payments"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                  Комментарий
                </label>
                <textarea
                  value={leadForm.creationComment}
                  onChange={(e) => setLeadForm({ ...leadForm, creationComment: e.target.value })}
                  placeholder="Перспективный клиент"
                  rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="consent"
                  checked={leadForm.consentOnPersonalDataProcessing}
                  onChange={(e) => setLeadForm({ ...leadForm, consentOnPersonalDataProcessing: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="consent" className="ml-2 text-sm text-gray-700 font-ibm">
                  Согласие на обработку персональных данных
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={addLeadMutation.isLoading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-[27px] font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                >
                  {addLeadMutation.isLoading ? 'Добавление...' : 'Добавить лид'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-[27px] font-semibold hover:bg-gray-200 transition-colors font-ibm"
                >
                  Отмена
                </button>
              </div>

              {addLeadMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-ibm">
                    {addLeadMutation.error?.response?.data?.message || 'Ошибка при добавлении лида'}
                  </p>
                </div>
              )}

              {addLeadMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-ibm">Лид успешно добавлен!</p>
                </div>
              )}
            </form>
            </div>
          </div>
        )}

        {/* Форма проверки лида */}
        {activeTab === 'check' && (
          <div className="rounded-[27px] border border-gray-200 mb-4 overflow-hidden " style={{ backgroundColor: '#F59E0C', animationDelay: '0.3s' }}>
            <div className="p-4" style={{ backgroundColor: '#F59E0C' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-ibm text-lg font-medium leading-[110%]">Проверить лид</div>
              </div>
              <div className="text-white text-opacity-80 font-ibm text-sm font-normal leading-[110%] mb-4">
                Введите данные для проверки статуса лида
              </div>
              <div className="mt-4 mb-0 h-px w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="px-4 pb-4 pt-4">
            
            <form onSubmit={handleCheckLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    ИНН <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkForm.inn}
                    onChange={(e) => setCheckForm({ ...checkForm, inn: e.target.value })}
                    placeholder="547779835982"
                    required
                    maxLength={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Код продукта <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkForm.productCode}
                    onChange={(e) => setCheckForm({ ...checkForm, productCode: e.target.value })}
                    placeholder="Payments"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Город
                  </label>
                  <input
                    type="text"
                    value={checkForm.city}
                    onChange={(e) => setCheckForm({ ...checkForm, city: e.target.value })}
                    placeholder="Москва"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-ibm">
                    Регион
                  </label>
                  <input
                    type="text"
                    value={checkForm.region}
                    onChange={(e) => setCheckForm({ ...checkForm, region: e.target.value })}
                    placeholder="Московская область"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[27px] focus:ring-2 focus:ring-orange-500 focus:border-transparent font-ibm bg-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={checkLeadMutation.isLoading}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-[27px] font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm"
                >
                  {checkLeadMutation.isLoading ? 'Проверка...' : 'Проверить лид'}
                </button>
              </div>

              {checkLeadMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-ibm">
                    {checkLeadMutation.error?.response?.data?.message || 'Ошибка при проверке лида'}
                  </p>
                </div>
              )}

              {checkLeadMutation.isSuccess && checkLeadMutation.data?.data?.leads?.[0] && (
                <div className={`rounded-lg p-4 ${
                  checkLeadMutation.data.data.leads[0].responseCode === 'POSITIVE'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {checkLeadMutation.data.data.leads[0].responseCode === 'POSITIVE' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold font-ibm ${
                        checkLeadMutation.data.data.leads[0].responseCode === 'POSITIVE'
                          ? 'text-green-800'
                          : 'text-yellow-800'
                      }`}>
                        {checkLeadMutation.data.data.leads[0].responseCode === 'POSITIVE'
                          ? 'Лид может быть взят в работу'
                          : 'Лид не будет взят в работу'}
                      </p>
                      {checkLeadMutation.data.data.leads[0].responseCodeDescription && (
                        <p className={`text-sm mt-1 font-ibm ${
                          checkLeadMutation.data.data.leads[0].responseCode === 'POSITIVE'
                            ? 'text-green-700'
                            : 'text-yellow-700'
                        }`}>
                          {checkLeadMutation.data.data.leads[0].responseCodeDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
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

export default LeadsPage;

