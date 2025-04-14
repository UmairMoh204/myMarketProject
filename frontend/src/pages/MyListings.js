import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { formatPrice, formatDate } from '../utils/utils';
import { useAuth } from '../context/AuthContext';
import '../styles/marketplace.css';

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      const token = user?.token || localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/listings/?filter=my_listings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setListings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your listings. Please try again later.');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateListingClick = () => {
    navigate('/create-listing');
  };

  if (loading) {
    return (
      <Box className="loading-spinner">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" className="error-message">
        <Typography variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="fade-in">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Listings
        </Typography>
        <Button
          onClick={handleCreateListingClick}
          variant="contained"
          color="primary"
          className="custom-button"
          startIcon={<AddIcon />}
        >
          Create New Listing
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search your listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredListings.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6">You haven't created any listings yet</Typography>
          <Typography variant="body1" color="textSecondary">
            Click the "Create New Listing" button to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Link to={`/listings/${listing.id}`} className="listing-link">
                <Box className="marketplace-card">
                  <img
                    src={listing.image_url || 'https://via.placeholder.com/300x200'}
                    alt={listing.title}
                    className="marketplace-image"
                  />
                  <Box p={2}>
                    <Typography variant="h6" className="listing-title">
                      {listing.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="listing-description">
                      {listing.description}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" className="listing-price">
                        {formatPrice(listing.price)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(listing.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyListings; 