import { useState } from 'react'
import { useQuery } from 'react-query'
import { accountAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import InfoPanel from '../components/InfoPanel'
import { usePageInfo } from '../hooks/usePageInfo'
import { CreditCard, Plus, Star, Info } from 'lucide-react'

const AccountsPage = () => {
  const pageInfo = usePageInfo()
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const { data: accountsData, isLoading, refetch } = useQuery(
    'accounts',
    () => accountAPI.getAccounts(),
    {
      refetchInterval: 30000,
    }
  )

  const accounts = accountsData?.data?.accounts || []

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSpinner size="lg" className="mx-auto" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Мои счета</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInfoPanel(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info size={20} />
          </button>
          <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Total Balance */}
      {accounts.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 mb-2">Общий баланс</p>
          <div className="text-3xl font-bold">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'USD',
            }).format(
              accounts.reduce((sum, account) => sum + account.balance, 0) / 100
            )}
          </div>
        </div>
      )}

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {account.accountType}
                      </h3>
                      {account.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      ****{account.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: account.currency,
                    }).format(account.balance / 100)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Доступно: {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: account.currency,
                    }).format(account.availableBalance / 100)}
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Статус</p>
                  <p className={`text-sm font-medium capitalize ${
                    account.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {account.status === 'active' ? 'Активен' : account.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Процентная ставка</p>
                  <p className="text-sm font-medium text-gray-900">
                    {account.interestRate}% годовых
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4">
                <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Детали
                </button>
                <button className="flex-1 bg-gray-200 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  История
                </button>
                {!account.isDefault && (
                  <button className="bg-yellow-50 text-yellow-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors">
                    По умолчанию
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">У вас пока нет счетов</h3>
          <p className="text-gray-500 mb-6">Создайте свой первый счет для начала работы</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Создать счет
          </button>
        </div>
      )}

      {/* Account Types Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Типы счетов</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Текущий счет</p>
              <p className="text-sm text-gray-500">Для ежедневных операций</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">0% годовых</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Сберегательный</p>
              <p className="text-sm text-gray-500">Накопления с процентами</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">2.5% годовых</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Кредитный</p>
              <p className="text-sm text-gray-500">Заемные средства</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">15% годовых</p>
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
  )
}

export default AccountsPage
