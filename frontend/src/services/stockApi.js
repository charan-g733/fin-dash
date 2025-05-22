import axios from 'axios';

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo'; // Use demo key as fallback
const BASE_URL = 'https://www.alphavantage.co/query';

const stockApi = {
  getStockQuote: async (symbol) => {
    try {
      if (!symbol) {
        throw new Error('Stock symbol is required');
      }

      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: API_KEY
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (!response.data['Global Quote']) {
        throw new Error('No data available for this symbol');
      }

      return response.data['Global Quote'];
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw new Error(error.response?.data?.['Error Message'] || error.message || 'Failed to fetch stock quote');
    }
  },

  getStockTimeSeries: async (symbol) => {
    try {
      if (!symbol) {
        throw new Error('Stock symbol is required');
      }

      const response = await axios.get(BASE_URL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: 'compact',
          apikey: API_KEY
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (!response.data['Time Series (Daily)']) {
        throw new Error('No historical data available for this symbol');
      }

      return response.data['Time Series (Daily)'];
    } catch (error) {
      console.error('Error fetching time series:', error);
      throw new Error(error.response?.data?.['Error Message'] || error.message || 'Failed to fetch historical data');
    }
  },

  getTopGainersLosers: async () => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'TOP_GAINERS_LOSERS',
          apikey: API_KEY
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      return {
        gainers: response.data.top_gainers || [],
        losers: response.data.top_losers || []
      };
    } catch (error) {
      console.error('Error fetching top gainers/losers:', error);
      // Return mock data if API fails
      return {
        gainers: [
          { ticker: 'AAPL', company_name: 'Apple Inc.', price: '185.42', change_amount: '5.23', change_percentage: '2.89' },
          { ticker: 'MSFT', company_name: 'Microsoft Corp.', price: '420.72', change_amount: '8.15', change_percentage: '1.98' },
          { ticker: 'GOOGL', company_name: 'Alphabet Inc.', price: '152.34', change_amount: '3.45', change_percentage: '2.32' }
        ],
        losers: [
          { ticker: 'TSLA', company_name: 'Tesla Inc.', price: '175.22', change_amount: '-8.45', change_percentage: '-4.60' },
          { ticker: 'NVDA', company_name: 'NVIDIA Corp.', price: '875.32', change_amount: '-25.67', change_percentage: '-2.85' },
          { ticker: 'AMD', company_name: 'Advanced Micro Devices', price: '178.54', change_amount: '-4.32', change_percentage: '-2.36' }
        ]
      };
    }
  }
};

export default stockApi; 