// Общие данные о вкладах для использования на разных страницах
// Вклад VBank синхронизируется с виртуальной картой из планирования бюджета

export const getDepositsData = (virtualCardBalance = 0) => [
  {
    id: 1,
    name: 'Вклад VBank',
    bank: 'VBank',
    amount: virtualCardBalance, // Используем баланс виртуальной карты из планирования
    rate: 9,
    color: '#0055BC', // blue-600
    bgColor: 'bg-blue-600',
    status: 'active'
  },
  {
    id: 2,
    name: 'Вклад SBank',
    bank: 'SBank',
    amount: 200000,
    rate: 9,
    color: '#1F2937', // gray-800
    bgColor: 'bg-gray-800',
    status: 'active'
  },
  {
    id: 3,
    name: 'Вклад ABank',
    bank: 'ABank',
    amount: 300000,
    rate: 13,
    color: '#EF4444', // red-500
    bgColor: 'bg-red-500',
    status: 'active'
  }
];

// Общая сумма вкладов
export const getTotalDeposits = (virtualCardBalance = 0) => {
  const deposits = getDepositsData(virtualCardBalance);
  return deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
};

// Средняя доходность
export const getAverageRate = (virtualCardBalance = 0) => {
  const deposits = getDepositsData(virtualCardBalance);
  const totalAmount = getTotalDeposits(virtualCardBalance);
  if (totalAmount === 0) return 0;
  const weightedRate = deposits.reduce((sum, deposit) => {
    return sum + (deposit.rate * deposit.amount / totalAmount);
  }, 0);
  return Math.round(weightedRate * 10) / 10; // Округляем до 1 знака после запятой
};

