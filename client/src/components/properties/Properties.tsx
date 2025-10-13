import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useProperties } from '../../contexts/PropertyContext';
import type { SelectChangeEvent } from '@mui/material/Select';

interface PropertyFormData {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  purchasePrice: number;
  estimatedRepairCosts: number;
  estimatedARV: number;
  status: string;
}

const Properties: React.FC = () => {
  const { properties, loading, createProperty, updateProperty, deleteProperty } = useProperties();
  const [open, setOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    propertyType: 'Single Family',
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    purchasePrice: 0,
    estimatedRepairCosts: 0,
    estimatedARV: 0,
    status: 'Analyzing'
  });

  const handleOpen = (property?: any) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        address: property.address,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFeet: property.squareFeet,
        purchasePrice: property.purchasePrice,
        estimatedRepairCosts: property.estimatedRepairCosts,
        estimatedARV: property.estimatedARV,
        status: property.status
      });
    } else {
      setEditingProperty(null);
      setFormData({
        address: { street: '', city: '', state: '', zipCode: '' },
        propertyType: 'Single Family',
        bedrooms: 0,
        bathrooms: 0,
        squareFeet: 0,
        purchasePrice: 0,
        estimatedRepairCosts: 0,
        estimatedARV: 0,
        status: 'Analyzing'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProperty(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name.includes('Price') || name.includes('Costs') || name.includes('ARV') || 
                name.includes('bedrooms') || name.includes('bathrooms') || name.includes('squareFeet') 
                ? Number(value) : value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const buildFullAddress = (addr: { street: string; city: string; state: string; zipCode: string }) =>
        [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');

      const payload = {
        ...formData,
        address: {
          ...formData.address,
          fullAddress: buildFullAddress(formData.address)
        }
      } as any; // conforms to Partial<Property> expected by context

      if (editingProperty) {
        await updateProperty(editingProperty._id, payload);
      } else {
        await createProperty(payload);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Under Contract': return 'info';
      case 'Sold': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Properties
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Property
        </Button>
      </Box>

      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <HomeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" noWrap>
                    {property.address.fullAddress}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {property.propertyType} • {property.bedrooms} bed • {property.bathrooms} bath
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  {property.squareFeet.toLocaleString()} sq ft
                </Typography>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Purchase Price:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${property.purchasePrice.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Est. ARV:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${property.estimatedARV.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2">Est. Profit:</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={property.estimatedProfit > 0 ? 'success.main' : 'error.main'}
                  >
                    ${property.estimatedProfit.toLocaleString()}
                  </Typography>
                </Box>
                
                <Chip
                  label={property.status}
                  color={getStatusColor(property.status) as any}
                  size="small"
                />
              </CardContent>
              
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpen(property)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(property._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Property Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Address
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Property Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Single Family">Single Family</MenuItem>
                    <MenuItem value="Condo">Condo</MenuItem>
                    <MenuItem value="Townhouse">Townhouse</MenuItem>
                    <MenuItem value="Multi-Family">Multi-Family</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Analyzing">Analyzing</MenuItem>
                    <MenuItem value="Under Contract">Under Contract</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Sold">Sold</MenuItem>
                    <MenuItem value="Rented">Rented</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Square Feet"
                  name="squareFeet"
                  type="number"
                  value={formData.squareFeet}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Financial Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Est. Repair Costs"
                  name="estimatedRepairCosts"
                  type="number"
                  value={formData.estimatedRepairCosts}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Est. ARV"
                  name="estimatedARV"
                  type="number"
                  value={formData.estimatedARV}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProperty ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Properties;
