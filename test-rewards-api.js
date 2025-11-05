/**
 * Тестовый скрипт для проверки подключения к Rewards API
 * Запуск: node test-rewards-api.js
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE = 'http://localhost:3001/api';
const TEST_ACCOUNT_ID = '0dbcb7ee-6c59-483b-966a-44d11557665b';
const TEST_TOKEN = 'Bearer test-token-123'; // Замените на реальный токен

async function testRewardsAPI() {
  console.log('🧪 Тестирование Rewards API...\n');
  
  // Тест 1: Получение баланса
  console.log('1️⃣ Тест получения баланса бонусов');
  try {
    const response = await axios.get(`${API_BASE}/rewards/balance/${TEST_ACCOUNT_ID}`, {
      headers: {
        'Authorization': TEST_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Успешно! Статус:', response.status);
    console.log('📦 Данные:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Ошибка:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📦 Ответ:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  console.log('\n---\n');
  
  // Тест 2: Валидация UUID
  console.log('2️⃣ Тест валидации UUID (неправильный формат)');
  try {
    const response = await axios.get(`${API_BASE}/rewards/balance/invalid-uuid`, {
      headers: {
        'Authorization': TEST_TOKEN
      }
    });
    console.log('❌ Неожиданный успех!');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Валидация работает! Статус:', error.response.status);
      console.log('📦 Ошибка:', error.response.data.message);
    } else {
      console.log('❌ Неожиданная ошибка:', error.response?.status || error.message);
    }
  }
  
  console.log('\n---\n');
  
  // Тест 3: Проверка без Authorization
  console.log('3️⃣ Тест без Authorization заголовка');
  try {
    const response = await axios.get(`${API_BASE}/rewards/balance/${TEST_ACCOUNT_ID}`);
    console.log('❌ Неожиданный успех!');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Проверка авторизации работает! Статус:', error.response.status);
      console.log('📦 Ошибка:', error.response.data.message);
    } else {
      console.log('❌ Неожиданная ошибка:', error.response?.status || error.message);
    }
  }
  
  console.log('\n✅ Тестирование завершено!');
}

testRewardsAPI().catch(console.error);

