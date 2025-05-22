import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import moment from 'moment';

const TableData = ({ data, user }) => {
  return (
    <div className="table-responsive">
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction, index) => (
            <tr key={index}>
              <td>{moment(transaction.date).format('YYYY-MM-DD')}</td>
              <td>{transaction.title}</td>
              <td style={{ color: transaction.transactionType === 'income' ? 'green' : 'red' }}>
                {transaction.transactionType === 'income' ? '+' : '-'}${transaction.amount}
              </td>
              <td>{transaction.category}</td>
              <td>{transaction.transactionType}</td>
              <td>{transaction.description}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch transactions from localStorage
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  return (
    <div className="container mt-4">
      <h2>Transaction History</h2>
      <TableData data={transactions} user={user} />
    </div>
  );
};

export default Transactions;
