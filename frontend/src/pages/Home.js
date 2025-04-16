import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateListing = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/create-listing');
    }
  };

  return (
    <Container>
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Marketplace
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Buy and sell items in your local community
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/listings"
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
          >
            Browse Listings
          </Button>
          <Button
            onClick={handleCreateListing}
            variant="outlined"
            size="large"
          >
            Create Listing
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Home; 