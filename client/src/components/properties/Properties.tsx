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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Property {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: number;
  purchasePrice: number;
  arv: number;
  status: string;
  exitStrategy: string;
  daysOnProject: number;
  currentROI: number;
  createdAt: string;
}

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user } = useAuth();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    propertyType: '',
    beds: 0,
    baths: 0,
    sqft: 0,
    purchasePrice: 0,
    arv: 0,
    status: '',
    exitStrategy: '',
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        propertyType: 'Single-Family',
        beds: 3,
        baths: 2,
        sqft: 1800,
        purchasePrice: 250000,
        arv: 320000,
        status: 'In Renovation',
        exitStrategy: 'Flip',
        daysOnProject: 45,
        currentROI: 18.5,
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        street: '456 Oak Ave',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        propertyType: 'Townhouse',
        beds: 4,
        baths: 3,
        sqft: 2200,
        purchasePrice: 180000,
        arv: 280000,
        status: 'Under Contract',
        exitStrategy: 'BRRRR',
        daysOnProject: 12,
        currentROI: 25.2,
        createdAt: '2024-02-01',
      },
      {
        id: '3',
        street: '789 Pine St',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        propertyType: 'Condo',
        beds: 2,
        baths: 2,
        sqft: 1200,
        purchasePrice: 120000,
        arv: 180000,
        status: 'Sold',
        exitStrategy: 'Flip',
        daysOnProject: 0,
        currentROI: 32.1,
        createdAt: '2023-12-10',
      },
    ];
    setProperties(mockProperties);
    setLoading(false);
  }, []);

  const handleOpen = () => {
    setEditingProperty(null);
    setFormData({
      street: '',
      city: '',
      state: '',
      zip: '',
      propertyType: '',
      beds: 0,
      baths: 0,
      sqft: 0,
      purchasePrice: 0,
      arv: 0,
      status: '',
      exitStrategy: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProperty(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call
    const newProperty: Property = {
      id: editingProperty?.id || Date.now().toString(),
      ...formData,
      daysOnProject: editingProperty?.daysOnProject || 0,
      currentROI: editingProperty?.currentROI || 0,
      createdAt: editingProperty?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingProperty) {
      setProperties(properties.map(p => p.id === editingProperty.id ? newProperty : p));
      setSnackbarMessage('Property updated successfully!');
    } else {
      setProperties([...properties, newProperty]);
      setSnackbarMessage('Property added successfully!');
    }
    setSnackbarOpen(true);
    handleClose();
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      street: property.street,
      city: property.city,
      state: property.state,
      zip: property.zip,
      propertyType: property.propertyType,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      purchasePrice: property.purchasePrice,
      arv: property.arv,
      status: property.status,
      exitStrategy: property.exitStrategy,
    });
    setOpen(true);
  };

  const handleDelete = (property: Property) => {
    setProperties(properties.filter(p => p.id !== property.id));
    setSnackbarMessage('Property deleted successfully!');
    setSnackbarOpen(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, property: Property) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sold':
        return 'success';
      case 'In Renovation':
        return 'warning';
      case 'Under Contract':
        return 'info';
      case 'Evaluating':
        return 'default';
      default:
        return 'default';
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 20) return theme.palette.success.main;
    if (roi >= 10) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: 'Total Properties',
      value: properties.length,
      icon: <HomeIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Projects',
      value: properties.filter(p => p.status === 'In Renovation').length,
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Total Invested',
      value: `$${properties.reduce((sum, p) => sum + p.purchasePrice, 0).toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Avg ROI',
      value: `${(properties.reduce((sum, p) => sum + p.currentROI, 0) / properties.length || 0).toFixed(1)}%`,
      icon: <TrendingUpIcon />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Properties
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your real estate investment portfolio
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

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Evaluating">Evaluating</MenuItem>
                  <MenuItem value="Under Contract">Under Contract</MenuItem>
                  <MenuItem value="In Renovation">In Renovation</MenuItem>
                  <MenuItem value="Sold">Sold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                >
                  More Filters
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpen}
                >
                  Add Property
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Purchase Price</TableCell>
                <TableCell>ARV</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>ROI</TableCell>
                <TableCell>Days</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, backgroundColor: theme.palette.primary.main }}>
                        <HomeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {property.street}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {property.city}, {property.state} {property.zip}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {property.beds} bed • {property.baths} bath • {property.sqft.toLocaleString()} sqft
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={property.propertyType} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ${property.purchasePrice.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ${property.arv.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.status}
                      color={getStatusColor(property.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={getROIColor(property.currentROI)}
                    >
                      {property.currentROI.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {property.daysOnProject} days
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, property)}
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

      {/* Add Property Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    label="State"
                  >
                    <MenuItem value="TX">Texas</MenuItem>
                    <MenuItem value="CA">California</MenuItem>
                    <MenuItem value="FL">Florida</MenuItem>
                    <MenuItem value="NY">New York</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    label="Property Type"
                  >
                    <MenuItem value="Single-Family">Single-Family</MenuItem>
                    <MenuItem value="Multi-Family">Multi-Family</MenuItem>
                    <MenuItem value="Condo">Condo</MenuItem>
                    <MenuItem value="Townhouse">Townhouse</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Baths"
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: parseInt(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Square Feet"
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => setFormData({ ...formData, sqft: parseInt(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Financial Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseInt(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="After Repair Value (ARV)"
                  type="number"
                  value={formData.arv}
                  onChange={(e) => setFormData({ ...formData, arv: parseInt(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="Evaluating">Evaluating</MenuItem>
                    <MenuItem value="Under Contract">Under Contract</MenuItem>
                    <MenuItem value="In Renovation">In Renovation</MenuItem>
                    <MenuItem value="Sold">Sold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Exit Strategy</InputLabel>
                  <Select
                    value={formData.exitStrategy}
                    onChange={(e) => setFormData({ ...formData, exitStrategy: e.target.value })}
                    label="Exit Strategy"
                  >
                    <MenuItem value="Flip">Flip</MenuItem>
                    <MenuItem value="BRRRR">BRRRR</MenuItem>
                    <MenuItem value="Long-Term Rental">Long-Term Rental</MenuItem>
                    <MenuItem value="Wholesale">Wholesale</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProperty ? 'Update' : 'Add'} Property
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
          selectedProperty && handleEdit(selectedProperty);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          selectedProperty && handleDelete(selectedProperty);
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

export default Properties;