import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Share as ShareIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { formatPrice, formatDate, isValidImageUrl, getDefaultImageUrl } from '../utils/utils';
import { useCart } from '../context/CartContext';
import '../styles/marketplace.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const categoryLabels = {
    'electronics': 'Electronics',
    'clothing': 'Clothing',
    'home': 'Home & Garden',
    'sports': 'Sports & Outdoors',
    'books': 'Books & Media',
    'toys': 'Toys & Games',
    'other': 'Other'
  };

  const conditionLabels = {
    'new': 'New',
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/listings/${id}/`);
        setListing(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load listing details. Please try again later.');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleContactSeller = () => {
    if (listing.seller_email) {
      window.location.href = `mailto:${listing.seller_email}?subject=Regarding your listing: ${listing.title}`;
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      image_url: listing.image_url,
      seller_name: listing.seller_name,
    });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/listings')}
          className="custom-button"
          style={{ marginTop: '16px' }}
        >
          Back to Listings
        </Button>
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container maxWidth="md" className="empty-state">
        <Typography variant="h6">Listing not found</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/listings')}
          className="custom-button"
          style={{ marginTop: '16px' }}
        >
          Back to Listings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="fade-in">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/listings')}
        className="back-button"
      >
        Back to Listings
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper className="listing-detail-card" elevation={2}>
            <img
              src={isValidImageUrl(listing.image_url) ? listing.image_url : getDefaultImageUrl()}
              alt={listing.title}
              className="marketplace-image"
              style={{ height: '400px' }}
            />
            <Box p={3}>
              <Typography variant="h4" className="listing-title">
                {listing.title}
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h5" className="price-tag">
                  {formatPrice(listing.price)}
                </Typography>
                <Chip
                  icon={<AccessTimeIcon />}
                  label={formatDate(listing.created_at)}
                  size="small"
                  style={{ marginLeft: '16px' }}
                />
              </Box>
              <Typography variant="body1" paragraph>
                {listing.description}
              </Typography>
              <Divider style={{ margin: '24px 0' }} />
              <Box className="seller-info">
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon style={{ marginRight: '8px' }} />
                  <Typography variant="subtitle1">
                    Listed by: {listing.seller_name || 'Anonymous'}
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    className="custom-button"
                    sx={{ mr: 2 }}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EmailIcon />}
                    onClick={handleContactSeller}
                    className="custom-button"
                  >
                    Contact Seller
                  </Button>
                  <Tooltip title="Share listing">
                    <IconButton
                      onClick={handleShare}
                      className="share-button"
                      size="large"
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="listing-detail-card" elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Listing Details
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Category
                </Typography>
                <Chip label={categoryLabels[listing.category] || 'Uncategorized'} />
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Condition
                </Typography>
                <Chip label={conditionLabels[listing.condition] || 'Not specified'} />
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Location
                </Typography>
                <Typography variant="body2">
                  {listing.location || 'Location not specified'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Item added to cart successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListingDetail; 