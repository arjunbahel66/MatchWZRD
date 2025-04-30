import React from 'react';
import { Container, Typography, Paper, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Welcome to MatchWZRD
        </Typography>
        <Typography variant="h5" paragraph align="center">
          MBA Candidate Matching System
        </Typography>
        <Typography paragraph align="center">
          MatchWZRD helps match prospective MBA candidates with Admission Directors from their desired schools based on preferences.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Configuration</Typography>
              <Typography paragraph align="center">
                Set up event parameters including participants per session, schools attending, and more.
              </Typography>
              <Button component={Link} to="/config" variant="contained" color="primary" sx={{ mt: 'auto' }}>
                Configure
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Preferences</Typography>
              <Typography paragraph align="center">
                Import Excel sheets with student preference data and manage school preferences.
              </Typography>
              <Button component={Link} to="/preferences" variant="contained" color="primary" sx={{ mt: 'auto' }}>
                Manage Preferences
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Results</Typography>
              <Typography paragraph align="center">
                View and export final match outputs after running the matching algorithm.
              </Typography>
              <Button component={Link} to="/results" variant="contained" color="primary" sx={{ mt: 'auto' }}>
                View Results
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default HomePage;