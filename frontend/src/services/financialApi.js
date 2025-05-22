import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = '5JK8VI5VUB0S6O19'; 
const NEWS_API_KEY = '9ca4e2c4f294406585bf3816272ac2b7'; 

const financialApi = {
  // Get stock market data
  async getStockData(symbol) {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data && response.data['Global Quote']) {
        const quote = response.data['Global Quote'];
        return {
          price: quote['05. price'],
          change: quote['10. change percent'],
          volume: quote['06. volume']
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  },

  // Get sector performance
  async getSectorPerformance() {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SECTOR&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data && response.data['Rank A: Real-Time Performance']) {
        return response.data;
      } else {
        console.error('Invalid sector performance data:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching sector performance:', error);
      return null;
    }
  },

  // Get financial news
  async getFinancialNews(query = 'finance') {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`
      );
      
      if (response.data && response.data.articles) {
        return response.data.articles.map(article => ({
          title: article.title,
          source: { name: article.source.name },
          url: article.url
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching financial news:', error);
      return [];
    }
  },

  // Get cryptocurrency data
  getCryptoData: async (symbol) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return null;
    }
  },

  // Get market sentiment
  getMarketSentiment: async (symbol) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
      return null;
    }
  }
};

export default financialApi; 