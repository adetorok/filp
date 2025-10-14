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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Calculate as CalculateIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Deal {
  id: string;
  propertyAddress: string;
  status: string;
  arv: number;
  maxOffer: number;
  margin: number;
  createdBy: string;
  createdAt: string;
  financingType: string;
  purchasePrice: number;
  repairCost: number;
  holdingPeriod: number;
  sellingCosts: number;
  netProfit: number;
  roi: number;
}

const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user } = useAuth();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    propertyAddress: '',
    financingType: '',
    purchasePrice: 0,
    repairCost: 0,
    holdingPeriod: 0,
    sellingCosts: 0,
    arv: 0,
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockDeals: Deal[] = [
      {
        id: '1',
        propertyAddress: '123 Main St, Austin, TX',
        status: 'Approved',
        arv: 320000,
        maxOffer: 220000,
        margin: 100000,
        createdBy: 'John Smith',
        createdAt: '2024-01-15',
        financingType: 'Hard Money',
        purchasePrice: 220000,
        repairCost: 45000,
        holdingPeriod: 6,
        sellingCosts: 19200,
        netProfit: 35800,
        roi: 16.3,
      },
      {
        id: '2',
        propertyAddress: '456 Oak Ave, Dallas, TX',
        status: 'Proposed',
        arv: 280000,
        maxOffer: 180000,
        margin: 100000,
        createdBy: 'Sarah Johnson',
        createdAt: '2024-02-01',
        financingType: 'Cash',
        purchasePrice: 180000,
        repairCost: 35000,
        holdingPeriod: 4,
        sellingCosts: 16800,
        netProfit: 50200,
        roi: 27.9,
      },
      {
        id: '3',
        propertyAddress: '789 Pine St, Houston, TX',
        status: 'Rejected',
        arv: 180000,
        maxOffer: 120000,
        margin: 60000,
        createdBy: 'Mike Chen',
        createdAt: '2024-01-20',
        financingType: 'Conventional',
        purchasePrice: 120000,
        repairCost: 25000,
        holdingPeriod: 3,
        sellingCosts: 10800,
        netProfit: 14200,
        roi: 11.8,
      },
    ];
    setDeals(mockDeals);
    setLoading(false);
  }, []);

  const handleOpen = () => {
    setEditingDeal(null);
    setFormData({
      propertyAddress: '',
      financingType: '',
      purchasePrice: 0,
      repairCost: 0,
      holdingPeriod: 0,
      sellingCosts: 0,
      arv: 0,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDeal(null);
  };

  const calculateDeal = () => {
    const { purchasePrice, repairCost, arv, sellingCosts, holdingPeriod } = formData;
    
    // Calculate holding costs (simplified)
    const holdingCosts = holdingPeriod * 2000; // $2000/month estimated
    
    // Calculate total project cost
    const totalProjectCost = purchasePrice + repairCost + holdingCosts + sellingCosts;
    
    // Calculate profit and ROI
    const grossProfit = arv - totalProjectCost;
    const netProfit = grossProfit;
    const roi = (netProfit / totalProjectCost) * 100;
    const maxOffer = arv - repairCost - holdingCosts - sellingCosts - 20000; // $20k minimum profit
    
    return {
      totalProjectCost,
      grossProfit,
      netProfit,
      roi,
      maxOffer,
      margin: arv - maxOffer,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculations = calculateDeal();
    
    const newDeal: Deal = {
      id: editingDeal?.id || Date.now().toString(),
      propertyAddress: formData.propertyAddress,
      status: 'Proposed',
      arv: formData.arv,
      maxOffer: calculations.maxOffer,
      margin: calculations.margin,
      createdBy: user?.name || 'Current User',
      createdAt: editingDeal?.createdAt || new Date().toISOString().split('T')[0],
      financingType: formData.financingType,
      purchasePrice: formData.purchasePrice,
      repairCost: formData.repairCost,
      holdingPeriod: formData.holdingPeriod,
      sellingCosts: formData.sellingCosts,
      netProfit: calculations.netProfit,
      roi: calculations.roi,
    };

    if (editingDeal) {
      setDeals(deals.map(d => d.id === editingDeal.id ? newDeal : d));
      setSnackbarMessage('Deal updated successfully!');
    } else {
      setDeals([...deals, newDeal]);
      setSnackbarMessage('Deal analysis completed!');
    }
    setSnackbarOpen(true);
    handleClose();
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      propertyAddress: deal.propertyAddress,
      financingType: deal.financingType,
      purchasePrice: deal.purchasePrice,
      repairCost: deal.repairCost,
      holdingPeriod: deal.holdingPeriod,
      sellingCosts: deal.sellingCosts,
      arv: deal.arv,
    });
    setOpen(true);
  };

  const handleDelete = (deal: Deal) => {
    setDeals(deals.filter(d => d.id !== deal.id));
    setSnackbarMessage('Deal deleted successfully!');
    setSnackbarOpen(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, deal: Deal) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeal(deal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDeal(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Proposed':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 20) return theme.palette.success.main;
    if (roi >= 10) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const stats = [
    {
      title: 'Total Deals',
      value: deals.length,
      icon: <TrendingUpIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Approved',
      value: deals.filter(d => d.status === 'Approved').length,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Avg ROI',
      value: `${(deals.reduce((sum, d) => sum + d.roi, 0) / deals.length || 0).toFixed(1)}%`,
      icon: <AttachMoneyIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Total Potential Profit',
      value: `$${deals.reduce((sum, d) => sum + d.netProfit, 0).toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      color: theme.palette.info.main,
    },
  ];

  const calculations = calculateDeal();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Deal Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze potential real estate investments and calculate ROI
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

      {/* Deal Analysis Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Deal Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Property Address"
                value={formData.propertyAddress}
                onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                placeholder="123 Main St, City, State"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Financing</InputLabel>
                <Select
                  value={formData.financingType}
                  onChange={(e) => setFormData({ ...formData, financingType: e.target.value })}
                  label="Financing"
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Hard Money">Hard Money</MenuItem>
                  <MenuItem value="Conventional">Conventional</MenuItem>
                  <MenuItem value="FHA 203k">FHA 203k</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Repair Cost"
                type="number"
                value={formData.repairCost}
                onChange={(e) => setFormData({ ...formData, repairCost: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="ARV"
                type="number"
                value={formData.arv}
                onChange={(e) => setFormData({ ...formData, arv: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleSubmit}
                disabled={!formData.propertyAddress || !formData.arv}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                Analyze
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      {formData.arv > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    ${calculations.maxOffer.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Max Allowable Offer
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    ${calculations.netProfit.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Profit
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {calculations.roi.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ROI
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    ${calculations.totalProjectCost.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Project Cost
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Deals Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>ARV</TableCell>
                <TableCell>Max Offer</TableCell>
                <TableCell>Margin</TableCell>
                <TableCell>ROI</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, backgroundColor: theme.palette.primary.main }}>
                        <HomeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {deal.propertyAddress}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {deal.financingType} • {deal.holdingPeriod} months
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={deal.status}
                      color={getStatusColor(deal.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ${deal.arv.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ${deal.maxOffer.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ${deal.margin.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={getROIColor(deal.roi)}
                    >
                      {deal.roi.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {deal.createdBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, deal)}
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
      </Card>

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
          selectedDeal && handleEdit(selectedDeal);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          selectedDeal && handleDelete(selectedDeal);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

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

export default Deals;