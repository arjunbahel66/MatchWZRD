import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ResultsPage = () => {
  const [matches, setMatches] = useState([]);
  const [hasConfig, setHasConfig] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Check if config and preferences exist in the database
  useEffect(() => {
    const checkData = async () => {
      try {
        const [configRes, preferencesRes] = await Promise.all([
          fetch('/api/config/check'),
          fetch('/api/preferences/check')
        ]);
        
        const configData = await configRes.json();
        const preferencesData = await preferencesRes.json();
        
        setHasConfig(configData.exists);
        setHasPreferences(preferencesData.exists);
      } catch (error) {
        console.error('Error checking data:', error);
      }
    };
    
    checkData();
  }, []);

  useEffect(() => {
    const checkAndLoadResults = async () => {
      try {
        // First check if results exist
        const checkResponse = await fetch('/api/results/check');
        const checkData = await checkResponse.json();
        
        if (checkData.exists) {
          // If results exist, load them
          const response = await fetch('/api/results');
          const data = await response.json();
          if (data.success && data.matches && data.matches.length > 0) {
            setMatches(data.matches);
            setShowResults(true);
          } else {
            setShowResults(false);
          }
        } else {
          setShowResults(false);
        }
      } catch (error) {
        console.error('Error checking/loading results:', error);
        setShowResults(false);
      }
    };

    checkAndLoadResults();
  }, []);

  const handleProcessPreferences = async () => {
    setIsLoading(true);
    try {
      console.log("Sending request to process preferences...");
      const response = await fetch('/api/preferences/process', {
        method: 'POST'
      });
      const data = await response.json();
      console.log("Received response:", data);
      
      if (data.success) {
        console.log("Processing successful, setting matches:", data.matches);
        setMatches(data.matches);
        setShowResults(true);
      } else {
        console.error('Error processing preferences:', data.error);
        alert(`Error processing preferences: ${data.error}`);
      }
    } catch (error) {
      console.error('Error processing preferences:', error);
      alert(`Error processing preferences: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/results/export');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export results');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'matching_results.xlsx';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
      alert(`Error exporting results: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Matching Results
        </Typography>
        
        {(!hasConfig || !hasPreferences) ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography>
              Please complete the following steps before viewing results:
            </Typography>
            <Box component="ul" sx={{ mt: 1 }}>
              {!hasConfig && (
                <li>
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => navigate('/config')}
                  >
                    Upload Configuration
                  </Button>
                </li>
              )}
              {!hasPreferences && (
                <li>
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => navigate('/preferences')}
                  >
                    Upload Preferences
                  </Button>
                </li>
              )}
            </Box>
          </Alert>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleProcessPreferences}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Process Preferences'}
                  </Button>
                  {showResults && matches.length > 0 && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={handleExport}
                    >
                      Export Results (Excel)
                    </Button>
                  )}
                </Box>
                {showResults && matches.length > 0 && (
                  <>
                    <TableContainer component={Paper} elevation={1}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Student</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>School</strong></TableCell>
                            <TableCell><strong>Session</strong></TableCell>
                            <TableCell><strong>Match Score</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {matches.map((match) => (
                            <TableRow key={match.id}>
                              <TableCell>{match.student_name}</TableCell>
                              <TableCell>{match.student_email}</TableCell>
                              <TableCell>{match.school_name}</TableCell>
                              <TableCell>{match.session_number}</TableCell>
                              <TableCell>{typeof match.preference_score === 'object' ? match.preference_score.points : match.preference_score}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ResultsPage;