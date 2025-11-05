import axios from 'axios';

const BANKS = {
  vbank: 'https://vbank.open.bankingapi.ru',
  abank: 'https://abank.open.bankingapi.ru',
  sbank: 'https://sbank.open.bankingapi.ru'
};

class BankingClient {
  constructor() {
    this.teamId = process.env.OPEN_BANKINGAPI_TEAM_ID || 'team096';
    this.teamSecret = process.env.OPEN_BANKINGAPI_PASSWORD || '';
    this.tokens = new Map(); // bank -> { token, expiresAt }
  }

  /**
   * Получить токен для банка
   */
  async getBankToken(bank) {
    const bankUrl = BANKS[bank];
    if (!bankUrl) {
      throw new Error(`Unknown bank: ${bank}`);
    }

    // Проверяем кэш токена
    const cached = this.tokens.get(bank);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    try {
      const response = await axios.post(
        `${bankUrl}/auth/bank-token`,
        null,
        {
          params: {
            client_id: this.teamId,
            client_secret: this.teamSecret
          }
        }
      );

      const { access_token, expires_in } = response.data;
      const expiresAt = Date.now() + (expires_in - 60) * 1000; // -60 секунд для запаса

      this.tokens.set(bank, { token: access_token, expiresAt });
      return access_token;
    } catch (error) {
      console.error(`Error getting token for ${bank}:`, error.response?.data || error.message);
      throw new Error(`Failed to get token for ${bank}: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Сделать запрос к банку
   */
  async request(bank, method, endpoint, options = {}) {
    const bankUrl = BANKS[bank];
    if (!bankUrl) {
      throw new Error(`Unknown bank: ${bank}`);
    }

    const token = await this.getBankToken(bank);
    const url = `${bankUrl}${endpoint}`;

    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    if (options.params) {
      config.params = options.params;
    }
    if (options.data) {
      config.data = options.data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Error ${method} ${url}:`, error.response?.data || error.message);
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.detail || error.message,
        data: error.response?.data
      };
    }
  }

  /**
   * Получить список всех банков
   */
  getBanks() {
    return Object.keys(BANKS);
  }

  /**
   * Получить URL банка
   */
  getBankUrl(bank) {
    return BANKS[bank];
  }
}

export default new BankingClient();

