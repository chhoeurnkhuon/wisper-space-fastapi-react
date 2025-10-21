import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import axios from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../redux/reducer/authSlice';

function ProfilePage() {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!token) {
      setError('No authentication token. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      const res = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setError(null);
    } catch (error) {
      let errorMessage = 'Failed to load profile. Please try again.';
      if (error.response) {
        errorMessage = error.response.data?.detail || errorMessage;
        if (error.response.status === 401) {
          errorMessage = 'Invalid or expired token. Please log in again.';
          setTimeout(() => navigate('/login'), 3000);
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your network.';
      }
      setError(errorMessage);
    }
  };

  const handleLogout = () => {
    dispatch(clearToken());
    navigate('/login');
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  return (
    <Box
      sx={{
        height: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6B7280 0%, #1F2937 100%)',
        overflow: 'hidden',
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
          '&:hover': { transform: 'translateY(-4px)' },
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: '#1F2937', fontWeight: 'bold', mb: 2, fontSize: { xs: '1.8rem', sm: '2.2rem' } }}
        >
          User Profile
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button
              variant="text"
              onClick={fetchProfile}
              sx={{ ml: 2, textTransform: 'none' }}
            >
              Retry
            </Button>
          </Alert>
        )}
        {user ? (
          <>
            <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>
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
              onClick={handleLogout}
              sx={{
                bgcolor: '#1976D2',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'medium',
                '&:hover': { bgcolor: '#1565C0', transform: 'scale(1.05)' },
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