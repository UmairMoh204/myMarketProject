import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Marketplace
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/listings"
              color="inherit"
              sx={{
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              Browse
            </Button>

            {!isMobile && (
              <>
                <IconButton color="inherit" size="large">
                  <SearchIcon />
                </IconButton>
                <IconButton color="inherit" size="large">
                  <NotificationsIcon />
                </IconButton>
              </>
            )}
            
            <IconButton 
              color="inherit" 
              size="large"
              sx={{ 
                ml: 1,
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                }
              }}
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 