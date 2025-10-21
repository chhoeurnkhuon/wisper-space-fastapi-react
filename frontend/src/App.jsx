import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function App() {
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
          p: { xs: 3, sm: 5 },
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: '#1F2937',
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '2rem', sm: '3rem' },
          }}
        >
          Welcome to Whisper Space
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#4B5563',
            mb: 4,
            fontSize: { xs: '1rem', sm: '1.2rem' },
          }}
        >
          Connect and share your thoughts with others.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            sx={{
              bgcolor: '#1F2937',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'medium',
              '&:hover': {
                bgcolor: '#374151',
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="outlined"
            sx={{
              borderColor: '#1F2937',
              color: '#1F2937',
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'medium',
              '&:hover': {
                borderColor: '#374151',
                color: '#374151',
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default App;