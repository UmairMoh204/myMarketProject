import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { endpoints } from '../config/api';
import { formatPrice } from '../utils/utils';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const fetchListing = useCallback(async () => {
    try {
      const response = await axios.get(`${endpoints.listing(id)}/`);
      setListing(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing. Please try again later.');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [id, fetchListing]);

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOpenDialog(true);
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      image: listing.image,
    });
    setSnackbar({
      open: true,
      message: 'Item added to cart successfully!',
    });
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${endpoints.listings}${id}/contact/`, {
        message,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOpenDialog(false);
      setMessage('');
      setSnackbar({
        open: true,
        message: 'Message sent successfully!',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container>
        <Alert severity="error">Listing not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {listing.image ? (
              <img
                src={listing.image}
                alt={listing.title}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                }}
              >
                <Typography color="textSecondary">No image available</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {listing.title}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              {formatPrice(listing.price)}
            </Typography>
            <Typography variant="body1" paragraph>
              {listing.description}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={listing.category}
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <Chip
                label={listing.condition}
                color="secondary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            </Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Listed by: {listing.seller_name}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                fullWidth
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={handleContact}
                fullWidth
              >
                Contact Seller
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Contact Seller</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained" color="primary">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default ListingDetail; 