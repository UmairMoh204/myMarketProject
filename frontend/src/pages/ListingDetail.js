import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
} from '@mui/material';
import { endpoints } from '../config/api';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(endpoints.listing(id));
      setListing(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing. Please try again later.');
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOpenDialog(true);
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${endpoints.listing(id)}/contact/`, {
        message,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOpenDialog(false);
      setMessage('');
      // Show success message or notification here
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
            {listing.image_url ? (
              <img
                src={listing.image_url}
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
              ${listing.price}
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
              <Chip
                label={listing.location}
                variant="outlined"
              />
            </Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Listed by: {listing.owner_name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleContact}
              sx={{ mt: 2 }}
            >
              Contact Seller
            </Button>
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
    </Container>
  );
};

export default ListingDetail; 