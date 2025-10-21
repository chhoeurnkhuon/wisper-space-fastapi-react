import { Box, Typography } from '@mui/material';

function Home() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4">Welcome to Whisper Space</Typography>
      <Typography variant="body1">This is the home page.</Typography>
    </Box>
  );
}

export default Home;