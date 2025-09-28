import { useState } from 'react'
import { useQuery } from 'react-query'
import { transactionAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { Filter, Search, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react'

const TransactionsPage = () => {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    limit: 20
  })

  const { data: transactionsData, isLoading, refetch } = useQuery(
    ['transactions', filters],
    () => transactionAPI.getTransactions(filters),
    {
      refetchInterval: 30000,
    }
  )

  const transactions = transactionsData?.data?.transactions || []
  const pagination = transactionsData?.data?.pagination || {}

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="h-5 w-5 text-blue-600" />
      case 'deposit':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'transfer':
        return 'bg-blue-100'
      case 'deposit':
        return 'bg-green-100'
      case 'withdrawal':
        return 'bg-red-100'
      default:
        return 'bg-white'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-white'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Завершено'
      case 'pending':
        return 'В обработке'
      case 'failed':
        return 'Ошибка'
      default:
        return status
    }
  }

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
        <h1 className="text-2xl font-bold text-gray-900">История транзакций</h1>
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск транзакций..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все типы</option>
            <option value="transfer">Переводы</option>
            <option value="deposit">Пополнения</option>
            <option value="withdrawal">Снятия</option>
            <option value="payment">Платежи</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: transaction.currency,
                    }).format(transaction.amount / 100)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>

              {/* Transaction Details */}
              {transaction.fromAccount && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Счет отправителя</p>
                      <p className="font-medium text-gray-900">
                        ****{transaction.fromAccount.accountNumber?.slice(-4) || 'N/A'}
                      </p>
                    </div>
                    {transaction.toAccount && (
                      <div>
                        <p className="text-gray-500">Счет получателя</p>
                        <p className="font-medium text-gray-900">
                          ****{transaction.toAccount.accountNumber?.slice(-4) || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reference */}
              {transaction.reference && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Ссылка: {transaction.reference}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет транзакций</h3>
          <p className="text-gray-500">Ваши транзакции появятся здесь</p>
        </div>
      )}

      {/* Load More */}
      {pagination.pages > pagination.current && (
        <div className="text-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Загрузить еще
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Статистика</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              <p className="text-sm text-gray-500">Всего</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-500">Завершено</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {transactions.filter(t => t.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-500">В обработке</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsPage
