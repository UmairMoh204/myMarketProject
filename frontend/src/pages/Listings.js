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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { formatPrice, formatDate } from '../utils/utils';
import { useAuth } from '../context/AuthContext';
import '../styles/marketplace.css';

const Listings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('recent');

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const token = user?.token || localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/listings/?filter=${filter}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      setListings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch listings. Please try again later.');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateListingClick = () => {
    if (user) {
      navigate('/create-listing');
    } else {
      navigate('/login', { state: { from: '/listings' } });
    }
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
          Marketplace Listings
        </Typography>
        <Button
          onClick={handleCreateListingClick}
          variant="contained"
          color="primary"
          className="custom-button"
        >
          {user ? 'Create Listing' : 'Sign in to Create Listing'}
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search listings..."
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

      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="listing filters"
          className="filter-buttons"
        >
          {user && (
            <ToggleButton value="my_listings" aria-label="my listings">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                My Listings
              </Box>
            </ToggleButton>
          )}
          <ToggleButton value="recent" aria-label="most recent">
            <AccessTimeIcon sx={{ mr: 1 }} />
            Most Recent
          </ToggleButton>
          <ToggleButton value="popular" aria-label="popular">
            <TrendingUpIcon sx={{ mr: 1 }} />
            Popular
          </ToggleButton>
          <ToggleButton value="price_low" aria-label="price low to high">
            <AttachMoneyIcon sx={{ mr: 1 }} />
            Price: Low to High
          </ToggleButton>
          <ToggleButton value="price_high" aria-label="price high to low">
            <AttachMoneyIcon sx={{ mr: 1 }} />
            Price: High to Low
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filteredListings.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6">No listings found</Typography>
          <Typography variant="body1" color="textSecondary">
            Try adjusting your search or filters
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

export default Listings; 