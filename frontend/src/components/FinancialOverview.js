import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const FinancialOverview = ({ transactions }) => {
  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.transactionType === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    return {
      income,
      expenses,
      balance
    };
  };

  const { income, expenses, balance } = calculateTotals();

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Financial Overview
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TrendingUpIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="body1">
          Income: ₹{income.toFixed(2)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TrendingDownIcon color="error" sx={{ mr: 1 }} />
        <Typography variant="body1">
          Expenses: ₹{expenses.toFixed(2)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography 
          variant="body1" 
          color={balance >= 0 ? 'success.main' : 'error.main'}
        >
          Balance: ₹{balance.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default FinancialOverview; 