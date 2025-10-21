import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import axios from '../api/axiosInstance';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await axios.post('/auth/register', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setStatus('success');
      setMessage('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Registration failed. Please try again.');
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
          Register
        </Typography>
        {status === 'success' && <Alert severity="success">{message}</Alert>}
        {status === 'error' && <Alert severity="error">{message}</Alert>}
        <Box component="form" onSubmit={handleRegister}>
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
            aria-label="Username"
          />
          <TextField
            name="email"
            label="Email"
            variant="outlined"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
            aria-label="Email"
          />
          <TextField
            name="password"
            type="password"
            label="Password"
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
            aria-label="Password"
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default RegisterPage;