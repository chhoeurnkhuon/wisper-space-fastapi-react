import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import axios from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VerifyPage() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link: No token provided');
        return;
      }

      try {
        const response = await axios.post(
          '/verify',
          { token },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        let errorMessage = 'Verification failed. Please try again or request a new verification email.';
        if (error.response) {
          errorMessage = error.response.data?.detail || errorMessage;
          if (error.response.status === 401) {
            errorMessage = 'Authentication error: The server rejected the request. Please request a new verification email.';
          }
        } else if (error.request) {
          errorMessage = 'Unable to connect to the server. Please check your network.';
        }
        setStatus('error');
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #6B7280 0%, #1F2937 100%)',
      }}
    >
      <Box
        sx={{
          p: 4,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#1F2937', fontWeight: 'bold' }}>
          Email Verification
        </Typography>
        {status === 'verifying' && (
          <>
            <Typography>Verifying your email...</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          </>
        )}
        {status === 'success' && (
          <>
            <Alert severity="success">{message}</Alert>
            <Typography sx={{ mt: 2 }}>
              Redirecting to login in a few seconds...
            </Typography>
          </>
        )}
        {status === 'error' && (
          <>
            <Alert severity="error">{message}</Alert>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
              >
                Back to Register
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default VerifyPage;