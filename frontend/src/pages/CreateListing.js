import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Alert,
} from '@mui/material';
import { endpoints } from '../config/api';

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    condition: '',
    location: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to create a listing');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(endpoints.listings, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error.response?.data?.message || 'Failed to create listing. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Listing
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            margin="normal"
            InputProps={{
              startAdornment: <Typography>$</Typography>,
            }}
          />
          <TextField
            fullWidth
            label="Image URL"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            margin="normal"
          >
            <MenuItem value="electronics">Electronics</MenuItem>
            <MenuItem value="clothing">Clothing</MenuItem>
            <MenuItem value="home">Home & Garden</MenuItem>
            <MenuItem value="sports">Sports & Outdoors</MenuItem>
            <MenuItem value="books">Books & Media</MenuItem>
            <MenuItem value="toys">Toys & Games</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
            margin="normal"
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="like_new">Like New</MenuItem>
            <MenuItem value="good">Good</MenuItem>
            <MenuItem value="fair">Fair</MenuItem>
            <MenuItem value="poor">Poor</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            margin="normal"
          />
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
            >
              Create Listing
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateListing; 