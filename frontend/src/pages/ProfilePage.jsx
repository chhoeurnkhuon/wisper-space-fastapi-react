// pages/ProfilePage.jsx
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const BASE_URI = (import.meta.env.VITE_BASE_URI || 'http://localhost:8000').replace(/\/+$/, ''); // Remove trailing slashes

  const fetchProfile = async () => {
    if (!token) {
      console.error('ProfilePage: No token found in Redux state');
      setError('No authentication token. Please log in again.');
      return;
    }

    try {
      console.log('ProfilePage: Fetching profile from:', `${BASE_URI}/users/me`);
      const res = await axios.get(`${BASE_URI}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('ProfilePage: Profile data received:', res.data);
      setUser(res.data);
      setError(null);
    } catch (error) {
      console.error('ProfilePage: Failed to fetch profile:', error);
      let errorMessage = 'Failed to load profile. Please try again.';
      if (error.response) {
        console.error('ProfilePage: Error response:', error.response.data);
        errorMessage = error.response.data?.detail || errorMessage;
        if (error.response.status === 401) {
          errorMessage = 'Invalid or expired token. Please log in again.';
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else if (error.request) {
        console.error('ProfilePage: No response received');
        errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
      }
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  return (
    <Box
      sx={{
        height: '100vh', // Full viewport height
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6B7280 0%, #1F2937 100%)', // Matching other pages
        overflow: 'hidden', // Prevent scrolling
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)', // Subtle lift on hover
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#1F2937',
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
          }}
        >
          User Profile
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {user ? (
          <>
            <Typography
              variant="h6"
              sx={{
                color: '#1976D2', // Primary color for username
                mb: 1,
              }}
            >
              Welcome, {user.username || user.email}
            </Typography>
            <Typography sx={{ color: '#4B5563', mb: 1 }}>
              Email: {user.email}
            </Typography>
            <Typography sx={{ color: '#4B5563', mb: 1 }}>
              Role: {user.role}
            </Typography>
            <Typography sx={{ color: '#4B5563', mb: 2 }}>
              Verified: {user.is_verified ? 'Yes' : 'No'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#1976D2', // Primary color
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'medium',
                '&:hover': {
                  bgcolor: '#1565C0',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              Log Out
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography sx={{ color: '#4B5563' }}>Loading profile...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ProfilePage;