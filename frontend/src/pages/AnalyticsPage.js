import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        
        if (data.success) {
          setAnalytics(data.analytics);
        } else {
          setError(data.error || 'Failed to fetch analytics data');
        }
      } catch (err) {
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!analytics || !analytics.top_choices || !analytics.school_stats || !analytics.session_stats) {
    return (
      <Box p={3}>
        <Alert severity="info">No analytics data available. Please process preferences first.</Alert>
      </Box>
    );
  }

  const schoolData = Object.values(analytics.school_stats)
    .map(school => ({
      name: school.name,
      fillRate: school.fill_rate || 0,
      averageScore: school.average_preference_score || 0,
      top3Applications: school.top_3_applications || 0,
      totalCapacity: school.total_capacity || 0,
      totalMatches: school.total_matches || 0,
    }))
    .sort((a, b) => b.averageScore - a.averageScore); // Sort by average score

  const sessionData = Object.entries(analytics.session_stats)
    .map(([key, stats]) => ({
      name: key.replace('session_', 'Session '),
      averageScore: stats.average_preference_score || 0,
      totalMatches: stats.total_matches || 0,
    }))
    .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1])); // Sort by session number

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Matching Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    Total Matches: {analytics.overall_stats.total_matches}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    Average Preference Score: {analytics.overall_stats.average_preference_score?.toFixed(2) || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    Students with At Least One Top 3 Choice: {analytics.top_choices.students_with_at_least_one_top_3} ({analytics.top_choices.total_students > 0 ? ((analytics.top_choices.students_with_at_least_one_top_3 / analytics.top_choices.total_students * 100).toFixed(1)) : 0}%)
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Choice Distribution */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Top Choice Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 400, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: '1st Choice', value: analytics.top_choices.first_choice },
                        { name: '2nd Choice', value: analytics.top_choices.second_choice },
                        { name: '3rd Choice', value: analytics.top_choices.third_choice },
                        { name: 'Other', value: analytics.top_choices.other_choice }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} students`, 'Count']}
                      />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        fill="#8884d8" 
                        name="Number of Students"
                        label={{ 
                          position: 'top',
                          formatter: (value) => <tspan style={{ fontWeight: 'bold' }}>{value}</tspan>
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Match Distribution Summary
                  </Typography>
                  <Typography variant="body1" paragraph>
                    This chart shows how many students received their best possible match:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Typography>
                            <strong>{analytics.top_choices.first_choice}</strong> students ({((analytics.top_choices.first_choice / analytics.top_choices.total_students) * 100).toFixed(1)}%)
                          </Typography>
                        }
                        secondary="received their first choice in at least one session"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Typography>
                            <strong>{analytics.top_choices.second_choice}</strong> students ({((analytics.top_choices.second_choice / analytics.top_choices.total_students) * 100).toFixed(1)}%)
                          </Typography>
                        }
                        secondary="received their second choice (but not first) in at least one session"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Typography>
                            <strong>{analytics.top_choices.third_choice}</strong> students ({((analytics.top_choices.third_choice / analytics.top_choices.total_students) * 100).toFixed(1)}%)
                          </Typography>
                        }
                        secondary="received their third choice (but not first or second) in at least one session"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Typography>
                            <strong>{analytics.top_choices.other_choice}</strong> students ({((analytics.top_choices.other_choice / analytics.top_choices.total_students) * 100).toFixed(1)}%)
                          </Typography>
                        }
                        secondary="did not receive any of their top 3 choices"
                      />
                    </ListItem>
                  </List>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    In total, <strong>{analytics.top_choices.students_with_at_least_one_top_3}</strong> out of <strong>{analytics.top_choices.total_students}</strong> students ({((analytics.top_choices.students_with_at_least_one_top_3 / analytics.top_choices.total_students) * 100).toFixed(1)}%) received at least one of their top 3 choices.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* School Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                School Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>School</TableCell>
                      <TableCell align="right">Fill Rate</TableCell>
                      <TableCell align="right">Capacity</TableCell>
                      <TableCell align="right">Matches</TableCell>
                      <TableCell align="right">Average Score</TableCell>
                      <TableCell align="right">Top 3 Applications</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schoolData.map((school) => (
                      <TableRow key={school.name}>
                        <TableCell>{school.name}</TableCell>
                        <TableCell align="right">{school.fillRate.toFixed(1)}%</TableCell>
                        <TableCell align="right">{school.totalCapacity}</TableCell>
                        <TableCell align="right">{school.totalMatches}</TableCell>
                        <TableCell align="right">{school.averageScore.toFixed(2)}</TableCell>
                        <TableCell align="right">{school.top3Applications}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Session Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Session Statistics
              </Typography>
              <Box height={300}>
                <ResponsiveContainer>
                  <BarChart
                    data={sessionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="averageScore" fill="#8884d8" name="Average Score" />
                    <Bar yAxisId="right" dataKey="totalMatches" fill="#82ca9d" name="Total Matches" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;