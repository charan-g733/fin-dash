import React, { useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { styled } from '@mui/material/styles';
import Profile from './ProfileSection';
import FinancialOverview from './FinancialOverview';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme, isOpen }) => ({
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  width: isOpen ? 280 : 60,
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderRight: '1px solid #e0e0e0',
  transition: 'width 0.3s ease',
  overflow: 'hidden',
  zIndex:200,
}));

const Sidebar = ({ user, transactions }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <StyledPaper elevation={0} isOpen={isOpen}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={toggleSidebar}>
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {isOpen && (
        <>
          <Profile user={user} />
          <Divider sx={{ my: 2 }} />
          <FinancialOverview transactions={transactions} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<TrendingUpIcon />}
              onClick={() => handleNavigation('/stock-prediction')}
            >
              Stock Prediction
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleNavigation('/investments')}
            >
              Investments
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleNavigation('/transactions')}
            >
              Transactions
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleNavigation('/settings')}
            >
              Settings
            </Button>
          </Box>
        </>
      )}
    </StyledPaper>
  );
};

export default Sidebar;