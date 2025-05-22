import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Paper, TextField, Typography, Avatar, Button, Chip, Link } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import financialApi from '../services/financialApi';

const ChatBot = ({ transactions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const calculateFinancialMetrics = () => {
    const totalIncome = transactions
      .filter(t => t.transactionType === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
    
    return { totalIncome, totalExpense, balance, savingsRate };
  };

  const getInvestmentRecommendations = async (balance) => {
    setIsLoading(true);
    try {
      console.log('Fetching sector performance data...');
      const sectorData = await financialApi.getSectorPerformance();
      console.log('Sector data received:', sectorData);

      if (!sectorData) {
        console.log('No sector data available, using fallback recommendations');
        return [
          {
            name: 'Technology',
            marketPerformance: '+2.5%',
            recommendations: [{
              name: 'Tech Growth Fund',
              description: 'Focuses on emerging tech companies',
              risk: 'High',
              return: '15-20%',
              minAmount: '₹10000',
              sector: 'Technology'
            }]
          },
          {
            name: 'Healthcare',
            marketPerformance: '+1.8%',
            recommendations: [{
              name: 'Healthcare Innovation Fund',
              description: 'Biotech and medical technology',
              risk: 'Medium',
              return: '10-14%',
              minAmount: '₹8000',
              sector: 'Healthcare'
            }]
          },
          {
            name: 'Renewable Energy',
            marketPerformance: '+3.2%',
            recommendations: [{
              name: 'Green Energy Fund',
              description: 'Solar and wind energy companies',
              risk: 'Medium',
              return: '12-16%',
              minAmount: '₹7000',
              sector: 'Energy'
            }]
          }
        ];
      }

      const performanceData = sectorData['Rank A: Real-Time Performance'];
      console.log('Performance data:', performanceData);
      
      // Get top performing sectors
      const sectors = Object.entries(performanceData)
        .filter(([key, value]) => {
          // Filter out metadata and ensure value is a string with percentage
          return !key.includes('Last Refreshed') && 
                 !key.includes('Information') && 
                 typeof value === 'string' && 
                 value.includes('%');
        })
        .map(([sector, performance]) => {
          const sectorName = sector.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Calculate risk level based on performance
          const performanceValue = parseFloat(performance.replace('%', ''));
          let riskLevel = 'Medium';
          let expectedReturn = '8-12%';
          
          if (performanceValue > 5) {
            riskLevel = 'High';
            expectedReturn = '15-20%';
          } else if (performanceValue < -2) {
            riskLevel = 'Low';
            expectedReturn = '5-8%';
          }

          return {
            name: sectorName,
            marketPerformance: performance,
            recommendations: [{
              name: `${sectorName} Growth Fund`,
              description: `Focuses on ${sectorName.toLowerCase()} companies`,
              risk: riskLevel,
              return: expectedReturn,
              minAmount: '₹10000',
              sector: sectorName
            }]
          };
        })
        .sort((a, b) => {
          const aValue = parseFloat(a.marketPerformance.replace('%', ''));
          const bValue = parseFloat(b.marketPerformance.replace('%', ''));
          return bValue - aValue;
        })
        .slice(0, 4); // Get top 4 performing sectors

      console.log('Processed sectors:', sectors);

      // Get news for the top sectors
      const news = await financialApi.getFinancialNews('finance');
      console.log('News data received:', news);

      // Add recent news
      if (news && news.length > 0) {
        sectors.forEach(sector => {
          sector.news = news
            .filter(article => 
              article.title.toLowerCase().includes(sector.name.toLowerCase())
            )
            .slice(0, 2);
        });
      }

      // Filter recommendations based on user's balance
      const filteredRecommendations = sectors.map(sector => ({
        ...sector,
        recommendations: sector.recommendations.filter(rec => 
          parseInt(rec.minAmount.replace('₹', '').replace(',', '')) <= balance
        )
      }));

      console.log('Final recommendations:', filteredRecommendations);
      return filteredRecommendations;
    } catch (error) {
      console.error('Error in getInvestmentRecommendations:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvestmentResponse = async (balance) => {
    const recommendations = await getInvestmentRecommendations(balance);
    if (!recommendations) {
      return "I'm having trouble fetching real-time market data. Please try again later.";
    }

    let response = `Based on your current balance of ₹${balance.toFixed(2)}, here are personalized investment recommendations:\n\n`;

    recommendations.forEach(sector => {
      if (sector.recommendations.length > 0) {
        response += `📊 ${sector.name} Sector:\n`;
        
        // Add market performance if available
        if (sector.marketPerformance) {
          response += `   Market Performance: ${sector.marketPerformance}\n\n`;
        }

        sector.recommendations.forEach(rec => {
          response += `\n💡 ${rec.name}\n`;
          response += `   Description: ${rec.description}\n`;
          response += `   Risk Level: ${rec.risk}\n`;
          response += `   Expected Return: ${rec.return}\n`;
          response += `   Minimum Investment: ${rec.minAmount}\n`;
        });

        // Add relevant news if available
        if (sector.news && sector.news.length > 0) {
          response += `\n📰 Recent News:\n`;
          sector.news.forEach(article => {
            response += `   - ${article.title}\n`;
            response += `     Source: ${article.source.name}\n`;
          });
        }
        response += '\n';
      }
    });

    if (response === `Based on your current balance of ₹${balance.toFixed(2)}, here are personalized investment recommendations:\n\n`) {
      return `I couldn't find any investment options suitable for your current balance of ₹${balance.toFixed(2)}. Consider saving more to access our investment opportunities.`;
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    const { balance } = calculateFinancialMetrics();
    const botResponse = await generateBotResponse(input, balance);
    setMessages(prev => [...prev, botResponse]);
  };

  const generateBotResponse = async (userInput, balance) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return {
        text: 'Hello! I can help you with:\n- Investment recommendations\n- Financial analysis\n- Portfolio suggestions\n- Market insights\n\nWhat would you like to know?',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (lowerInput.includes('invest') || lowerInput.includes('portfolio') || lowerInput.includes('recommend')) {
      const response = await generateInvestmentResponse(balance);
      return {
        text: response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (lowerInput.includes('stock') || lowerInput.includes('market')) {
      try {
        const symbol = userInput.split(' ').find(word => word.length <= 5 && word.length >= 1);
        if (symbol) {
          const stockData = await financialApi.getStockData(symbol);
          if (stockData) {
            return {
              text: `Stock Information for ${symbol}:\nPrice: $${stockData.price}\nChange: ${stockData.change}%\nVolume: ${stockData.volume}`,
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString(),
            };
          }
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
      return {
        text: 'Please specify a stock symbol (e.g., "AAPL" for Apple)',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (lowerInput.includes('news') || lowerInput.includes('update')) {
      try {
        const news = await financialApi.getFinancialNews();
        if (news && news.length > 0) {
          const newsText = news.slice(0, 3).map(article => 
            `📰 ${article.title}\n   Source: ${article.source.name}\n   ${article.url}\n`
          ).join('\n');
          return {
            text: `Latest Financial News:\n\n${newsText}`,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
          };
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    } else if (lowerInput.includes('balance') || lowerInput.includes('total')) {
      const { totalIncome, totalExpense, balance, savingsRate } = calculateFinancialMetrics();
      return {
        text: `Your current balance is ₹${balance.toFixed(2)}\nTotal income: ₹${totalIncome.toFixed(2)}\nTotal expenses: ₹${totalExpense.toFixed(2)}\nSavings rate: ${savingsRate.toFixed(1)}%`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      return {
        text: 'I can help you with:\n- Investment recommendations\n- Financial analysis\n- Portfolio suggestions\n- Market insights\n- Stock information\n- Latest news\n\nWhat would you like to know?',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  };

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: '#1976d2',
          color: 'white',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </IconButton>

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SmartToyIcon />
            <Typography variant="h6">Investment Assistant</Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: message.sender === 'user' ? '#1976d2' : '#757575',
                    }}
                  >
                    {message.sender === 'user' ? 'U' : 'B'}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '80%',
                      backgroundColor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
                      color: message.sender === 'user' ? 'white' : 'black',
                      borderRadius: 2,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                      {message.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Fetching real-time data...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Ask about investments, stocks, or news..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={input.trim() === '' || isLoading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatBot; 