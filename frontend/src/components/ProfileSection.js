import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Profile = ({ user }) => {
  return (
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          margin: '0 auto',
          mb: 1,
          bgcolor: 'primary.main'
        }}
      >
        {user?.avatarImage ? (
          <img
            src={user.avatarImage}
            alt="avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <AccountCircleIcon sx={{ fontSize: 40 }} />
        )}
      </Avatar>
      <Typography variant="h6" gutterBottom>
        {user?.name || 'Guest User'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {user?.email || 'guest@example.com'}
      </Typography>
    </Box>
  );
};

export default Profile; 