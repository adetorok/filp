import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';

interface DashboardData {
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

interface ProfitLossData {
  dealId: string;
  property: string;
  dealName: string;
  totalInvestment: number;
  estimatedARV: number;
  estimatedProfit: number;
  estimatedROI: number;
  status: string;
  createdAt: string;
}

interface ExpenseData {
  _id: {
    category: string;
    property: string;
  };
  total: number;
  count: number;
}

interface TaskData {
  _id: {
    status: string;
    category: string;
    property: string;
  };
  count: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  totalEstimatedCost: number;
  totalActualCost: number;
}

const Reports: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [profitLossData, setProfitLossData] = useState<ProfitLossData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [taskData, setTaskData] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchProperties();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchProfitLossReport = async () => {
    try {
      const params = selectedProperty ? { propertyId: selectedProperty } : {};
      const response = await axios.get('/api/reports/profit-loss', { params });
      setProfitLossData(response.data);
    } catch (error) {
      console.error('Error fetching profit/loss data:', error);
    }
  };

  const fetchExpenseReport = async () => {
    try {
      const params = selectedProperty ? { propertyId: selectedProperty } : {};
      const response = await axios.get('/api/reports/expenses', { params });
      setExpenseData(response.data);
    } catch (error) {
      console.error('Error fetching expense data:', error);
    }
  };

  const fetchTaskReport = async () => {
    try {
      const params = selectedProperty ? { propertyId: selectedProperty } : {};
      const response = await axios.get('/api/reports/tasks', { params });
      setTaskData(response.data);
    } catch (error) {
      console.error('Error fetching task data:', error);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Property</InputLabel>
              <Select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <MenuItem value="">All Properties</MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property._id} value={property._id}>
                    {property.address.fullAddress}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={fetchProfitLossReport}
              startIcon={<TrendingUpIcon />}
            >
              Load Profit/Loss
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={fetchExpenseReport}
              startIcon={<ReceiptIcon />}
            >
              Load Expenses
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={fetchTaskReport}
              startIcon={<AssignmentIcon />}
            >
              Load Tasks
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Dashboard Overview */}
      {dashboardData && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Properties by Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.propertyStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, count }) => `${_id}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dashboardData.propertyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Deals by Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.dealStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expenses by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.expenseStats} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="_id" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tasks by Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.taskStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, count }) => `${_id}: ${count}`}
                      outerRadius={80}
                      fill="#ffc658"
                      dataKey="count"
                    >
                      {dashboardData.taskStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Profit/Loss Report */}
      {profitLossData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profit/Loss Report
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Deal Name</TableCell>
                    <TableCell>Total Investment</TableCell>
                    <TableCell>Est. ARV</TableCell>
                    <TableCell>Est. Profit</TableCell>
                    <TableCell>ROI</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profitLossData.map((deal) => (
                    <TableRow key={deal.dealId}>
                      <TableCell>{deal.property}</TableCell>
                      <TableCell>{deal.dealName || 'Unnamed Deal'}</TableCell>
                      <TableCell>${deal.totalInvestment.toLocaleString()}</TableCell>
                      <TableCell>${deal.estimatedARV.toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography
                          color={deal.estimatedProfit > 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          ${deal.estimatedProfit.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{deal.estimatedROI.toFixed(1)}%</TableCell>
                      <TableCell>{deal.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Expense Report */}
      {expenseData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expense Report
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Transaction Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenseData.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>{expense._id.category}</TableCell>
                      <TableCell>{expense._id.property}</TableCell>
                      <TableCell>${expense.total.toLocaleString()}</TableCell>
                      <TableCell>{expense.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Task Report */}
      {taskData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Task Report
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Est. Hours</TableCell>
                    <TableCell>Actual Hours</TableCell>
                    <TableCell>Est. Cost</TableCell>
                    <TableCell>Actual Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taskData.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{task._id.status}</TableCell>
                      <TableCell>{task._id.category}</TableCell>
                      <TableCell>{task._id.property}</TableCell>
                      <TableCell>{task.count}</TableCell>
                      <TableCell>{task.totalEstimatedHours || 'N/A'}</TableCell>
                      <TableCell>{task.totalActualHours || 'N/A'}</TableCell>
                      <TableCell>
                        {task.totalEstimatedCost ? `$${task.totalEstimatedCost.toLocaleString()}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {task.totalActualCost ? `$${task.totalActualCost.toLocaleString()}` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Reports;
