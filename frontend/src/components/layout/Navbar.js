import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import SchoolIcon from '@mui/icons-material/School';

const Navbar = () => {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Configuration', path: '/config' },
    { name: 'Preferences', path: '/preferences' },
    { name: 'Results', path: '/results' },
    { name: 'Analytics', path: '/analytics' },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            MatchWZRD
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                component={RouterLink}
                to={item.path}
                sx={{ color: 'white', mx: 1 }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;