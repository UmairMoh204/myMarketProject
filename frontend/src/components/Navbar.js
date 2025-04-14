import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ShoppingCart as ShoppingCartIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  List as ListIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <>
                <IconButton sx={{ color: 'black' }}>
                  <NotificationsIcon sx={{ color: 'black' }} />
                </IconButton>
              </>
            )}

            <IconButton
              component={RouterLink}
              to="/cart"
              sx={{ color: 'black' }}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon sx={{ color: 'black' }} />
              </Badge>
            </IconButton>

            <IconButton
              component={RouterLink}
              to="/create-listing"
              sx={{ color: 'black' }}
            >
              <AddIcon sx={{ color: 'black' }} />
            </IconButton>

            <IconButton
              component={RouterLink}
              to="/my-listings"
              sx={{ color: 'black' }}
            >
              <ListIcon sx={{ color: 'black' }} />
            </IconButton>

            {user ? (
              <>
                <IconButton
                  component={RouterLink}
                  to="/profile"
                  sx={{ color: 'black' }}
                >
                  <PersonIcon sx={{ color: 'black' }} />
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  sx={{ color: 'black' }}
                >
                  <LogoutIcon sx={{ color: 'black' }} />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'black' }}
                  startIcon={<PersonIcon sx={{ color: 'black' }} />}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  sx={{ color: 'black' }}
                  startIcon={<PersonIcon sx={{ color: 'black' }} />}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 