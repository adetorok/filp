import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Fab,
  useTheme,
  alpha,
  Alert,
  Snackbar,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Expense {
  id: string;
  property: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receipt: string;
  enteredBy: string;
  createdAt: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user } = useAuth();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    property: '',
    category: '',
    vendor: '',
    description: '',
    amount: 0,
    date: '',
    paymentMethod: '',
    receipt: '',
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockExpenses: Expense[] = [
      {
        id: '1',
        property: '123 Main St, Austin, TX',
        category: 'Materials',
        vendor: 'Home Depot',
        description: 'Lumber and drywall materials',
        amount: 2500,
        date: '2024-01-15',
        paymentMethod: 'Credit Card',
        receipt: 'receipt_001.pdf',
        enteredBy: 'John Smith',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        property: '123 Main St, Austin, TX',
        category: 'Labor',
        vendor: 'Johnson Construction',
        description: 'Framing and drywall installation',
        amount: 4500,
        date: '2024-01-20',
        paymentMethod: 'Check',
        receipt: 'receipt_002.pdf',
        enteredBy: 'John Smith',
        createdAt: '2024-01-20',
      },
      {
        id: '3',
        property: '456 Oak Ave, Dallas, TX',
        category: 'Permits',
        vendor: 'City of Dallas',
        description: 'Building permit and inspection fees',
        amount: 850,
        date: '2024-02-01',
        paymentMethod: 'ACH',
        receipt: 'receipt_003.pdf',
        enteredBy: 'Sarah Johnson',
        createdAt: '2024-02-01',
      },
      {
        id: '4',
        property: '789 Pine St, Houston, TX',
        category: 'Appliances',
        vendor: 'Best Buy',
        description: 'Kitchen appliances package',
        amount: 3200,
        date: '2024-01-25',
        paymentMethod: 'Credit Card',
        receipt: 'receipt_004.pdf',
        enteredBy: 'Mike Chen',
        createdAt: '2024-01-25',
      },
    ];
    setExpenses(mockExpenses);
    setLoading(false);
  }, []);

  const handleOpen = () => {
    setEditingExpense(null);
    setFormData({
      property: '',
      category: '',
      vendor: '',
      description: '',
      amount: 0,
      date: '',
      paymentMethod: '',
      receipt: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      ...formData,
      enteredBy: user?.name || 'Current User',
      createdAt: editingExpense?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? newExpense : e));
      setSnackbarMessage('Expense updated successfully!');
    } else {
      setExpenses([...expenses, newExpense]);
      setSnackbarMessage('Expense added successfully!');
    }
    setSnackbarOpen(true);
    handleClose();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      property: expense.property,
      category: expense.category,
      vendor: expense.vendor,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      receipt: expense.receipt,
    });
    setOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setExpenses(expenses.filter(e => e.id !== expense.id));
    setSnackbarMessage('Expense deleted successfully!');
    setSnackbarOpen(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, expense: Expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Materials': theme.palette.primary.main,
      'Labor': theme.palette.success.main,
      'Permits': theme.palette.warning.main,
      'Appliances': theme.palette.error.main,
      'Utilities': theme.palette.info.main,
      'Marketing': theme.palette.secondary.main,
    };
    return colors[category] || theme.palette.grey[500];
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    {
      title: 'Total Expenses',
      value: expenses.length,
      icon: <ReceiptIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Total Amount',
      value: `$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'This Month',
      value: `$${expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((sum, e) => sum + e.amount, 0)
        .toLocaleString()}`,
      icon: <CalendarIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Avg per Expense',
      value: `$${Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length || 0).toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: theme.palette.info.main,
    },
  ];

  // Calculate category breakdown
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Expenses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and categorize all project expenses
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Category Breakdown */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>
              <List>
                {Object.entries(categoryBreakdown).map(([category, amount]) => {
                  const percentage = (amount / totalAmount) * 100;
                  return (
                    <ListItem key={category} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: getCategoryColor(category), width: 32, height: 32 }}>
                          <CategoryIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <MuiListItemText
                        primary={category}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              ${amount.toLocaleString()} ({percentage.toFixed(1)}%)
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{
                                mt: 1,
                                backgroundColor: alpha(getCategoryColor(category), 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getCategoryColor(category),
                                },
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Recent Expenses
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpen}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  Add Expense
                </Button>
              </Box>

              {/* Filters */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="Materials">Materials</MenuItem>
                      <MenuItem value="Labor">Labor</MenuItem>
                      <MenuItem value="Permits">Permits</MenuItem>
                      <MenuItem value="Appliances">Appliances</MenuItem>
                      <MenuItem value="Utilities">Utilities</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
                  >
                    More Filters
                  </Button>
                </Grid>
              </Grid>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Property</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {expense.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {expense.paymentMethod}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={expense.category}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getCategoryColor(expense.category), 0.1),
                              color: getCategoryColor(expense.category),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {expense.vendor}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ${expense.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(expense.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {expense.property}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, expense)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Expense Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Expense Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="Materials">Materials</MenuItem>
                    <MenuItem value="Labor">Labor</MenuItem>
                    <MenuItem value="Permits">Permits</MenuItem>
                    <MenuItem value="Appliances">Appliances</MenuItem>
                    <MenuItem value="Utilities">Utilities</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    label="Payment Method"
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Check">Check</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Debit Card">Debit Card</MenuItem>
                    <MenuItem value="ACH">ACH</MenuItem>
                    <MenuItem value="Wire">Wire</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={formData.property}
                    onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    label="Property"
                  >
                    <MenuItem value="123 Main St, Austin, TX">123 Main St, Austin, TX</MenuItem>
                    <MenuItem value="456 Oak Ave, Dallas, TX">456 Oak Ave, Dallas, TX</MenuItem>
                    <MenuItem value="789 Pine St, Houston, TX">789 Pine St, Houston, TX</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Receipt (Optional)"
                  value={formData.receipt}
                  onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
                  placeholder="receipt_001.pdf"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          // Handle view
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          selectedExpense && handleEdit(selectedExpense);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          selectedExpense && handleDelete(selectedExpense);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        onClick={handleOpen}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Expenses;