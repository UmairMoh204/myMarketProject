import React from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Container } from '@mui/material';
import './App.css';
import Sidebar from './components/Sidebar';
import Slider from './components/Slider';
import ItemSlider from './components/ItemSlider';
import ListingList from './components/ListingList';

function App() {
  const slides = [
    { id: 1, content: 'Slide 1' },
    { id: 2, content: 'Slide 2' },
    { id: 3, content: 'Slide 3' },
    { id: 4, content: 'Slide 4' },
    { id: 5, content: 'Slide 5' }
  ]                     

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MyMarket
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <ListingList />
      </Container>
    </>
  );
}

export default App;
