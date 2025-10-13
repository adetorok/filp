import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Rating
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Contacts as ContactsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Contact {
  _id: string;
  type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  specialties: string[];
  rating: number;
  notes: string;
  isActive: boolean;
  // Contractor verification data
  overallScore?: number;
  overallGrade?: string;
  hasActiveLicense?: boolean;
  hasActiveInsurance?: boolean;
  riskScore?: number;
  insuranceScore?: number;
  experienceScore?: number;
  reviewCount?: number;
  projectCount?: number;
  yearsInBusiness?: number;
  totalProjects?: number;
  totalValue?: number;
  businessStartDate?: string;
  licenses?: Array<{
    number: string;
    state: string;
    status: string;
    adminVerified: boolean;
    expiresOn?: string;
  }>;
  policies?: Array<{
    type: string;
    insurerName: string;
    expiresOn?: string;
  }>;
  legalEvents?: Array<{
    type: string;
    severity: string;
    title: string;
    filedOn?: string;
  }>;
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    specialties: [] as string[],
    rating: 0,
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts');
      const contactsData = response.data;
      
      // For contractor contacts, fetch verification data
      const contactsWithVerification = await Promise.all(
        contactsData.map(async (contact: Contact) => {
          if (contact.type === 'CONTRACTOR') {
            try {
              const contractorResponse = await axios.get(`/api/contractors?name=${encodeURIComponent(contact.name)}`);
              const contractorData = contractorResponse.data.find((c: any) => 
                c.name === contact.name || c.companyName === contact.company
              );
              
              if (contractorData) {
                return {
                  ...contact,
                  ...contractorData
                };
              }
            } catch (error) {
              console.error('Error fetching contractor data:', error);
            }
          }
          return contact;
        })
      );
      
      setContacts(contactsWithVerification);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        type: contact.type,
        name: contact.name,
        company: contact.company || '',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || { street: '', city: '', state: '', zipCode: '' },
        specialties: contact.specialties || [],
        rating: contact.rating || 0,
        notes: contact.notes || ''
      });
    } else {
      setEditingContact(null);
      setFormData({
        type: '',
        name: '',
        company: '',
        email: '',
        phone: '',
        address: { street: '', city: '', state: '', zipCode: '' },
        specialties: [],
        rating: 0,
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingContact(null);
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
        [name]: value
      }));
    }
  };

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      specialties
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await axios.put(`/api/contacts/${editingContact._id}`, formData);
      } else {
        await axios.post('/api/contacts', formData);
      }
      fetchContacts();
      handleClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`/api/contacts/${id}`);
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Contractor': 'primary',
      'Vendor': 'secondary',
      'Agent': 'success',
      'Lender': 'warning',
      'Inspector': 'info',
      'Attorney': 'error',
      'Other': 'default'
    };
    return colors[type] || 'default';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Contractor': return <BusinessIcon />;
      case 'Vendor': return <BusinessIcon />;
      case 'Agent': return <ContactsIcon />;
      case 'Lender': return <BusinessIcon />;
      case 'Inspector': return <ContactsIcon />;
      case 'Attorney': return <ContactsIcon />;
      default: return <ContactsIcon />;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'error';
      case 'F': return 'error';
      default: return 'default';
    }
  };

  const renderContractorBadges = (contact: Contact) => {
    if (contact.type !== 'Contractor') return null;

    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
        {/* Overall Grade */}
        {contact.overallGrade && (
          <Chip
            icon={<StarIcon />}
            label={`Grade: ${contact.overallGrade}`}
            color={getGradeColor(contact.overallGrade) as any}
            size="small"
          />
        )}
        
        {/* License Status */}
        {contact.hasActiveLicense ? (
          <Chip
            icon={<VerifiedIcon />}
            label="Licensed"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<CancelIcon />}
            label="No License"
            color="error"
            size="small"
          />
        )}
        
        {/* Insurance Status */}
        {contact.hasActiveInsurance ? (
          <Chip
            icon={<SecurityIcon />}
            label="Insured"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<WarningIcon />}
            label="No Insurance"
            color="warning"
            size="small"
          />
        )}
        
        {/* Risk Score */}
        {contact.riskScore !== undefined && (
          <Chip
            icon={contact.riskScore >= 80 ? <CheckCircleIcon /> : <WarningIcon />}
            label={`Risk: ${contact.riskScore}%`}
            color={contact.riskScore >= 80 ? 'success' : contact.riskScore >= 60 ? 'warning' : 'error'}
            size="small"
          />
        )}
        
        {/* Experience Score */}
        {contact.experienceScore !== undefined && (
          <Chip
            icon={<CheckCircleIcon />}
            label={`Experience: ${contact.experienceScore}%`}
            color={contact.experienceScore >= 80 ? 'success' : contact.experienceScore >= 60 ? 'info' : 'warning'}
            size="small"
          />
        )}
        
        {/* Years in Business */}
        {contact.yearsInBusiness !== undefined && contact.yearsInBusiness > 0 && (
          <Chip
            icon={<BusinessIcon />}
            label={`${contact.yearsInBusiness} years`}
            color="info"
            size="small"
          />
        )}
        
        {/* Total Projects */}
        {contact.totalProjects !== undefined && contact.totalProjects > 0 && (
          <Chip
            icon={<StarIcon />}
            label={`${contact.totalProjects} projects`}
            color="default"
            size="small"
          />
        )}
        
        {/* Review Count */}
        {contact.reviewCount !== undefined && (
          <Chip
            icon={<StarIcon />}
            label={`${contact.reviewCount} reviews`}
            color="default"
            size="small"
          />
        )}
      </Box>
    );
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Contacts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Contact
        </Button>
      </Box>

      <Grid container spacing={3}>
        {contacts.map((contact) => (
          <Grid item xs={12} sm={6} md={4} key={contact._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {getTypeIcon(contact.type)}
                  <Box sx={{ ml: 1, flexGrow: 1 }}>
                    <Typography variant="h6" noWrap>
                      {contact.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contact.company || contact.type}
                    </Typography>
                  </Box>
                  <Chip
                    label={contact.type}
                    color={getTypeColor(contact.type) as any}
                    size="small"
                  />
                </Box>

                {/* Contractor Verification Badges */}
                {renderContractorBadges(contact)}
                
                {contact.email && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{contact.email}</Typography>
                  </Box>
                )}
                
                {contact.phone && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{contact.phone}</Typography>
                  </Box>
                )}
                
                {contact.specialties && contact.specialties.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Specialties:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {contact.specialties.map((specialty, index) => (
                        <Chip
                          key={index}
                          label={specialty}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {contact.rating > 0 && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Rating value={contact.rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({contact.rating}/5)
                    </Typography>
                  </Box>
                )}
                
                {contact.notes && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {contact.notes}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpen(contact)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(contact._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContact ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="Contractor">Contractor</MenuItem>
                    <MenuItem value="Vendor">Vendor</MenuItem>
                    <MenuItem value="Agent">Agent</MenuItem>
                    <MenuItem value="Lender">Lender</MenuItem>
                    <MenuItem value="Inspector">Inspector</MenuItem>
                    <MenuItem value="Attorney">Attorney</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company (Optional)"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rating (0-5)"
                  name="rating"
                  type="number"
                  inputProps={{ min: 0, max: 5 }}
                  value={formData.rating}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Address (Optional)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
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
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specialties (comma-separated)"
                  name="specialties"
                  value={formData.specialties.join(', ')}
                  onChange={handleSpecialtyChange}
                  placeholder="e.g., Plumbing, Electrical, Flooring"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingContact ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Contacts;
