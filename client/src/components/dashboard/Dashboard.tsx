import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { apiConfig } from '../../config/api';
import * as Sentry from '@sentry/react';

// Configure axios with base URL
axios.defaults.baseURL = apiConfig.baseURL;

interface DashboardStats {
  propertyStats: Array<{ _id: string; count: number }>;
  dealStats: Array<{ _id: string; count: number }>;
  expenseStats: Array<{ _id: string; total: number }>;
  taskStats: Array<{ _id: string; count: number }>;
  recentProperties: Array<{
    _id: string;
    address: { fullAddress: string };
    status: string;
    updatedAt: string;
  }>;
  recentDeals: Array<{
    _id: string;
    dealName: string;
    status: string;
    estimatedProfit: number;
    propertyId: { address: { fullAddress: string } };
    updatedAt: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Add this button component to test Sentry's error tracking
  const ErrorButton = () => {
    return (
      <Button
        variant="contained"
        color="error"
        onClick={() => {
          throw new Error('This is your first error!');
        }}
        sx={{ mb: 2 }}
      >
        Break the world
      </Button>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Sentry Error Testing Button */}
      <ErrorButton />
      
      <Grid container spacing={3}>
        {/* Property Status Chart */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Properties by Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.propertyStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(stats?.propertyStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Deal Status Chart */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deals by Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.dealStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expense Categories */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <List>
              {(stats?.expenseStats || []).map((expense, index) => (
                <ListItem key={expense._id}>
                  <ListItemText
                    primary={expense._id}
                    secondary={`$${expense.total.toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Task Status */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Status
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {(stats?.taskStats || []).map((task) => (
                <Chip
                  key={task._id}
                  label={`${task._id}: ${task.count}`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Properties */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Properties
              </Typography>
              <List>
                {(stats?.recentProperties || []).map((property) => (
                  <ListItem key={property._id}>
                    <ListItemText
                      primary={property.address.fullAddress}
                      secondary={
                        <Box>
                          <Chip
                            label={property.status}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          {new Date(property.updatedAt).toLocaleDateString()}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Deals */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Deals
              </Typography>
              <List>
                {(stats?.recentDeals || []).map((deal) => (
                  <ListItem key={deal._id}>
                    <ListItemText
                      primary={deal.dealName || deal.propertyId.address.fullAddress}
                      secondary={
                        <Box>
                          <Chip
                            label={deal.status}
                            size="small"
                            color="secondary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" component="span">
                            Est. Profit: ${deal.estimatedProfit?.toLocaleString() || 'N/A'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
