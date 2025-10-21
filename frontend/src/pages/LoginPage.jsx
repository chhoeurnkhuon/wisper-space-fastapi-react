import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import axios from '../api/axiosInstance';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setToken } from '../redux/reducer/authSlice';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [showResend, setShowResend] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const data = new URLSearchParams();
    data.append('username', formData.username);
    data.append('password', formData.password);

    try {
      const response = await axios.post('/auth/login', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token } = response.data;
      setStatus('success');
      setMessage('Login successful');
      dispatch(setToken(access_token));
      setFormData({ username: '', password: '' });
      navigate('/dashboard');
    } catch (error) {
      setStatus('error');
      const errorMsg = error.response?.data?.detail || 'Login failed';
      setMessage(errorMsg);
      if (errorMsg.includes('email not verified')) {
        setShowResend(true);
      }
    }
  };

  const handleResendVerification = async () => {
    setStatus('loading');
    try {
      await axios.post('/auth/resend-verification', { email: formData.username });
      setStatus('success');
      setMessage('Verification email resent. Please check your inbox.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Failed to resend verification email');
    }
  };

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
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 2, color: '#1F2937' }}>
          Login
        </Typography>
        {status === 'success' && <Alert severity="success">{message}</Alert>}
        {status === 'error' && <Alert severity="error">{message}</Alert>}
        <Box component="form" onSubmit={handleLogin}>
          <TextField
            name="username"
            label="Email"
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
            aria-label="Email"
          />
          <TextField
            name="password"
            label="Password"
            variant="outlined"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
            aria-label="Password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
        {showResend && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={handleResendVerification}
              disabled={status === 'loading'}
            >
              Resend Verification Email
            </Button>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;