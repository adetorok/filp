import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Deal {
  _id: string;
  dealName: string;
  propertyId: {
    _id: string;
    address: { fullAddress: string };
  };
  offerPrice: number;
  estimatedARV: number;
  totalInvestment: number;
  estimatedProfit: number;
  estimatedROI: number;
  status: string;
  createdAt: string;
}

const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    dealName: '',
    offerPrice: 0,
    closingCosts: 0,
    holdingCosts: 0,
    repairCosts: 0,
    sellingCosts: 0,
    estimatedARV: 0,
    status: 'Analyzing'
  });

  useEffect(() => {
    fetchDeals();
    fetchProperties();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await axios.get('/api/deals');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
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

  const handleOpen = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        propertyId: deal.propertyId._id,
        dealName: deal.dealName || '',
        offerPrice: deal.offerPrice,
        closingCosts: 0,
        holdingCosts: 0,
        repairCosts: 0,
        sellingCosts: 0,
        estimatedARV: deal.estimatedARV,
        status: deal.status
      });
    } else {
      setEditingDeal(null);
      setFormData({
        propertyId: '',
        dealName: '',
        offerPrice: 0,
        closingCosts: 0,
        holdingCosts: 0,
        repairCosts: 0,
        sellingCosts: 0,
        estimatedARV: 0,
        status: 'Analyzing'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDeal(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('Costs') || name.includes('ARV') 
              ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await axios.put(`/api/deals/${editingDeal._id}`, formData);
      } else {
        await axios.post('/api/deals', formData);
      }
      fetchDeals();
      handleClose();
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await axios.delete(`/api/deals/${id}`);
        fetchDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
      }
    }
  };

  const handleCalculate = async (id: string) => {
    try {
      const deal = deals.find(d => d._id === id);
      if (deal) {
        await axios.post(`/api/deals/${id}/calculate`, {
          offerPrice: formData.offerPrice,
          closingCosts: formData.closingCosts,
          holdingCosts: formData.holdingCosts,
          repairCosts: formData.repairCosts,
          sellingCosts: formData.sellingCosts,
          estimatedARV: formData.estimatedARV
        });
        fetchDeals();
      }
    } catch (error) {
      console.error('Error calculating deal:', error);
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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Deals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Deal
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Deal Name</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Offer Price</TableCell>
              <TableCell>Est. ARV</TableCell>
              <TableCell>Total Investment</TableCell>
              <TableCell>Est. Profit</TableCell>
              <TableCell>ROI</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal._id}>
                <TableCell>{deal.dealName || 'Unnamed Deal'}</TableCell>
                <TableCell>{deal.propertyId.address.fullAddress}</TableCell>
                <TableCell>${deal.offerPrice.toLocaleString()}</TableCell>
                <TableCell>${deal.estimatedARV.toLocaleString()}</TableCell>
                <TableCell>${deal.totalInvestment?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>
                  <Typography
                    color={deal.estimatedProfit > 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    ${deal.estimatedProfit?.toLocaleString() || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {deal.estimatedROI ? `${deal.estimatedROI.toFixed(1)}%` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={deal.status}
                    color={getStatusColor(deal.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(deal)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(deal._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Deal Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDeal ? 'Edit Deal' : 'Add New Deal'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    required
                  >
                    {properties.map((property) => (
                      <MenuItem key={property._id} value={property._id}>
                        {property.address.fullAddress}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deal Name (Optional)"
                  name="dealName"
                  value={formData.dealName}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Financial Details
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Offer Price"
                  name="offerPrice"
                  type="number"
                  value={formData.offerPrice}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated ARV"
                  name="estimatedARV"
                  type="number"
                  value={formData.estimatedARV}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Closing Costs"
                  name="closingCosts"
                  type="number"
                  value={formData.closingCosts}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Holding Costs"
                  name="holdingCosts"
                  type="number"
                  value={formData.holdingCosts}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Repair Costs"
                  name="repairCosts"
                  type="number"
                  value={formData.repairCosts}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Selling Costs"
                  name="sellingCosts"
                  type="number"
                  value={formData.sellingCosts}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <MenuItem value="Analyzing">Analyzing</MenuItem>
                    <MenuItem value="Under Contract">Under Contract</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Sold">Sold</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            {editingDeal && (
              <Button
                onClick={() => handleCalculate(editingDeal._id)}
                startIcon={<CalculateIcon />}
              >
                Calculate
              </Button>
            )}
            <Button type="submit" variant="contained">
              {editingDeal ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Deals;
