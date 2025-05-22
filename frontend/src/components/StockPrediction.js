import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, CircularProgress, Tabs, Tab } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import stockApi from '../services/stockApi';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import Sidebar from './Sidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StockPrediction = () => {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [trendingStocks, setTrendingStocks] = useState({
    gainers: [],
    losers: []
  });
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchTrendingStocks = async () => {
      try {
        const data = await stockApi.getTopGainersLosers();
        setTrendingStocks(data);
      } catch (err) {
        console.error('Error fetching trending stocks:', err);
        // Error is handled in the API service with fallback data
      }
    };

    fetchTrendingStocks();
    const interval = setInterval(fetchTrendingStocks, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);
    
    try {
      const [quote, timeSeries] = await Promise.all([
        stockApi.getStockQuote(symbol),
        stockApi.getStockTimeSeries(symbol)
      ]);

      const historicalData = Object.entries(timeSeries)
        .slice(0, 30)
        .map(([date, data]) => ({
          date,
          price: parseFloat(data['4. close'])
        }))
        .reverse();

      const currentPrice = parseFloat(quote['05. price']);
      const changePercent = parseFloat(quote['10. change percent']);
      
      const recentPrices = historicalData.slice(-5).map(d => d.price);
      const avgChange = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices.length;
      const predictedPrice = currentPrice + (avgChange * 5);
      const confidence = Math.min(100, Math.max(0, 100 - Math.abs(changePercent)));

      setPrediction({
        symbol: symbol.toUpperCase(),
        currentPrice,
        predictedPrice,
        confidence,
        historicalData
      });
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to fetch stock data. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: prediction?.historicalData.map(data => data.date) || [],
    datasets: [
      {
        label: 'Stock Price',
        data: prediction?.historicalData.map(data => data.price) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const trendingChartData = {
    labels: trendingStocks.gainers.map(stock => stock.ticker),
    datasets: [
      {
        label: 'Top Gainers',
        data: trendingStocks.gainers.map(stock => parseFloat(stock.change_percentage)),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  const losersChartData = {
    labels: trendingStocks.losers.map(stock => stock.ticker),
    datasets: [
      {
        label: 'Top Losers',
        data: trendingStocks.losers.map(stock => parseFloat(stock.change_percentage)),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar user={user} transactions={transactions} />
      <Box sx={{ 
        flexGrow: 1, 
        p: 3,
        marginLeft: '280px',
        width: 'calc(100% - 280px)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Stock Market Analysis</Typography>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Home
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Stock Price Prediction
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Enter Stock Symbol (e.g., AAPL, MSFT)"
                    variant="outlined"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    error={!!error}
                    helperText={error || "Enter a valid stock symbol"}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Predict'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {error && !loading && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {prediction && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {prediction.symbol} Stock Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    Current Price: ${prediction.currentPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    Predicted Price: ${prediction.predictedPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    Confidence: {prediction.confidence.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: false
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Trending Stocks
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Top Gainers" />
              <Tab label="Top Losers" />
            </Tabs>

            {activeTab === 0 && (
              <>
                <Box sx={{ height: 300, mb: 2 }}>
                  <Bar
                    data={trendingChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Change (%)'
                          }
                        }
                      }
                    }}
                  />
                </Box>
                <Grid container spacing={2}>
                  {trendingStocks.gainers.map((stock, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{stock.ticker}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stock.company_name}
                          </Typography>
                          <Typography variant="body1" color="success.main">
                            ${parseFloat(stock.price).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            +{parseFloat(stock.change_amount).toFixed(2)} ({parseFloat(stock.change_percentage).toFixed(2)}%)
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {activeTab === 1 && (
              <>
                <Box sx={{ height: 300, mb: 2 }}>
                  <Bar
                    data={losersChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Change (%)'
                          }
                        }
                      }
                    }}
                  />
                </Box>
                <Grid container spacing={2}>
                  {trendingStocks.losers.map((stock, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{stock.ticker}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stock.company_name}
                          </Typography>
                          <Typography variant="body1" color="error.main">
                            ${parseFloat(stock.price).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            {parseFloat(stock.change_amount).toFixed(2)} ({parseFloat(stock.change_percentage).toFixed(2)}%)
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default StockPrediction; 