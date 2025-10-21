import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VerifyPage() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const BASE_URI = import.meta.env.VITE_BASE_URI || 'http://localhost:8000';

  useEffect(() => {
    console.log('VerifyPage: Starting verification process');
    console.log('BASE_URI:', BASE_URI);
    console.log('Location:', location);

    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      console.log('Token from URL:', token);

      if (!token) {
        console.error('VerifyPage: No token provided in URL');
        setStatus('error');
        setMessage('Invalid verification link: No token provided');
        return;
      }

      try {
        console.log('VerifyPage: Sending POST request to /verify');
        const response = await axios.post(
          `${BASE_URI}verify`,
          { token },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        console.log('VerifyPage: Response received:', response.data);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully');
        setTimeout(() => {
          console.log('VerifyPage: Redirecting to /login');
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('VerifyPage: Verification failed:', error);
        let errorMessage = 'Verification failed. Please try again or request a new verification email.';
        if (error.response) {
          console.error('Response error details:', error.response.data);
          errorMessage = error.response.data?.detail || errorMessage;
          if (error.response.status === 401) {
            errorMessage = 'Authentication error: The server rejected the request. Please request a new verification email.';
          }
        } else if (error.request) {
          console.error('No response received from server');
          errorMessage = 'Unable to connect to the server. Please check if the backend is running on http://localhost:8000.';
        } else {
          console.error('Error details:', error.message);
          errorMessage = error.message || errorMessage;
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