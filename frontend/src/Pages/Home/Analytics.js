import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CircularProgressBar from "../../components/CircularProgressBar";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";

import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import ChatBot from "../../components/ChatBot";

const Analytics = ({ transactions, user }) => {
  const totalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter(item => item.transactionType === "credit");
  const totalExpenseTransactions = transactions.filter(item => item.transactionType === "expense");

  const totalIncomePercent = (totalIncomeTransactions.length / totalTransactions) * 100;
  const totalExpensePercent = (totalExpenseTransactions.length / totalTransactions) * 100;

  const totalTurnOver = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalTurnOverIncome = totalIncomeTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalTurnOverExpense = totalExpenseTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);

  const turnOverIncomePercent = ((totalTurnOverIncome - totalTurnOverExpense)  / totalTurnOverIncome) * 100;
  const turnOverExpensePercent = (totalTurnOverExpense / totalTurnOverIncome) * 100;


  const monthlyData = useMemo(() => {
    const dataMap = {};
    transactions.forEach(({ month, amount, transactionType }) => {
      if (!dataMap[month]) {
        dataMap[month] = { name: month, revenue: 0, expenses: 0 };
      }
      if (transactionType === "credit") {
        dataMap[month].revenue += amount;
      } else {
        dataMap[month].expenses += amount;
      }
    });
    return Object.values(dataMap);
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p className="label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ₹${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Container className="mt-4" sx={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-4">
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction Overview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    Total: {totalTransactions}
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Income: {totalIncomeTransactions.length}
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    Expense: {totalExpenseTransactions.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <CircularProgressBar percentage={totalIncomePercent.toFixed(0)} color="#4CAF50" />
                  <CircularProgressBar percentage={totalExpensePercent.toFixed(0)} color="#FF5733" />
                </Box>
              </CardContent>
            </Card>
          </Col>

          <Col lg={4} md={6} className="mb-4">
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Overview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    Total: ₹{totalTurnOver.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Income: ₹{totalTurnOverIncome.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    Expense: ₹{totalTurnOverExpense.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <CircularProgressBar percentage={turnOverIncomePercent.toFixed(0)} color="#4CAF50" />
                  <CircularProgressBar percentage={turnOverExpensePercent.toFixed(0)} color="#FF5733" />
                </Box>
              </CardContent>
            </Card>
          </Col>

          <Col lg={4} md={6} className="mb-4">
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Balance Overview
                </Typography>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  ₹{(totalTurnOverIncome - totalTurnOverExpense).toFixed(2)}
                </Typography>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey={(data) => data.revenue - data.expenses} 
                      name="Balance" 
                      stroke="#007BFF" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={6} md={12} className="mb-4">
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue & Expenses Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5733" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF5733" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4CAF50" fill="url(#revenueGradient)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#FF5733" fill="url(#expenseGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Col>

          <Col lg={6} md={12} className="mb-4">
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Income", value: totalTurnOverIncome-totalTurnOverExpense },
                        { name: "Expense", value: totalTurnOverExpense },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#4CAF50" />
                      <Cell fill="#FF5733" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12} md={12}>
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Revenue Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Col>
        </Row>
        <ChatBot transactions={transactions} />
      </Container>
    </Box>
  );
};

export default Analytics;
