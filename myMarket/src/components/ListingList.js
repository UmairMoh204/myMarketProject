import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Container } from '@mui/material';

function ListingList() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/listings/')
      .then(response => response.json())
      .then(data => setListings(data))
      .catch(error => console.error('Error fetching listings:', error));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Listings
      </Typography>
      <Grid container spacing={3}>
        {listings.map(listing => (
          <Grid item xs={12} sm={6} md={4} key={listing.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  ${listing.price}
                </Typography>
                <Typography variant="caption" display="block">
                  Posted by: {listing.owner.username}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ListingList; 