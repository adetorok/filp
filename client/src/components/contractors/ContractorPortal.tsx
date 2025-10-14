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
  useTheme,
  alpha,
  Alert,
  Snackbar,
  Divider,
  LinearProgress,
  Rating,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface ContractorProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  trades: string[];
  experienceLevel: string;
  yearsExperience: number;
  overallScore: number;
  complianceTier: string;
  licenses: License[];
  insurance: Insurance[];
  legalEvents: LegalEvent[];
  permits: Permit[];
  reviews: Review[];
  availability: string;
  hourlyRate?: number;
  serviceAreas: string[];
  verified: boolean;
  lastUpdated: string;
  challengeStatus?: string;
  challengeReason?: string;
}

interface License {
  id: string;
  type: string;
  number: string;
  state: string;
  status: string;
  issueDate: string;
  expirationDate: string;
  verified: boolean;
  source: string;
}

interface Insurance {
  id: string;
  type: string;
  carrier: string;
  policyNumber: string;
  coverageAmount: number;
  coverageBand: string;
  effectiveDate: string;
  expirationDate: string;
  verified: boolean;
  source: string;
}

interface LegalEvent {
  id: string;
  type: string;
  severity: string;
  date: string;
  status: string;
  description: string;
  source: string;
}

interface Permit {
  id: string;
  city: string;
  type: string;
  status: string;
  filedDate: string;
  issuedDate?: string;
  finaledDate?: string;
  daysOpen: number;
  inspectionResults: InspectionResult[];
}

interface InspectionResult {
  type: string;
  date: string;
  outcome: string;
  notes?: string;
}

interface Review {
  id: string;
  customerName: string;
  customerOrg: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

const ContractorPortal: React.FC = () => {
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeReason, setChallengeReason] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user } = useAuth();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    trades: [] as string[],
    yearsExperience: 0,
    hourlyRate: 0,
    serviceAreas: [] as string[],
    availability: '',
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockProfile: ContractorProfile = {
      id: '1',
      name: 'Mike Johnson',
      company: 'Johnson Construction LLC',
      email: 'mike@johnsonconstruction.com',
      phone: '+1-555-0123',
      address: '123 Builder St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      trades: ['General Contractor', 'Framing', 'Drywall'],
      experienceLevel: 'Veteran',
      yearsExperience: 12,
      overallScore: 92,
      complianceTier: 'A',
      licenses: [
        {
          id: '1',
          type: 'General Contractor',
          number: 'GC123456',
          state: 'TX',
          status: 'Active',
          issueDate: '2012-03-15',
          expirationDate: '2025-03-15',
          verified: true,
          source: 'Texas Department of Licensing and Regulation',
        },
      ],
      insurance: [
        {
          id: '1',
          type: 'General Liability',
          carrier: 'State Farm',
          policyNumber: 'SF789456',
          coverageAmount: 2000000,
          coverageBand: '$2M–$5M',
          effectiveDate: '2024-01-01',
          expirationDate: '2025-01-01',
          verified: true,
          source: 'State Farm Insurance',
        },
      ],
      legalEvents: [],
      permits: [
        {
          id: '1',
          city: 'Austin',
          type: 'Building',
          status: 'Finaled',
          filedDate: '2024-01-15',
          issuedDate: '2024-01-20',
          finaledDate: '2024-03-15',
          daysOpen: 59,
          inspectionResults: [
            { type: 'Rough-Framing', date: '2024-02-10', outcome: 'Pass' },
            { type: 'Final-Building', date: '2024-03-10', outcome: 'Pass' },
          ],
        },
      ],
      reviews: [
        {
          id: '1',
          customerName: 'Sarah Wilson',
          customerOrg: 'Wilson Properties',
          rating: 5,
          comment: 'Excellent work quality and communication. Finished on time and within budget.',
          date: '2024-01-20',
          verified: true,
        },
      ],
      availability: 'Immediate',
      hourlyRate: 85,
      serviceAreas: ['Austin', 'Round Rock', 'Cedar Park'],
      verified: true,
      lastUpdated: '2024-02-15',
      challengeStatus: 'None',
    };
    setProfile(mockProfile);
    setLoading(false);
  }, []);

  const handleEdit = () => {
    setFormData({
      name: profile?.name || '',
      company: profile?.company || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      zip: profile?.zip || '',
      trades: profile?.trades || [],
      yearsExperience: profile?.yearsExperience || 0,
      hourlyRate: profile?.hourlyRate || 0,
      serviceAreas: profile?.serviceAreas || [],
      availability: profile?.availability || '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    // In a real app, this would make an API call
    setProfile(prev => prev ? { ...prev, ...formData } : null);
    setEditing(false);
    setSnackbarMessage('Profile updated successfully!');
    setSnackbarOpen(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleChallenge = () => {
    setChallengeOpen(true);
  };

  const handleSubmitChallenge = () => {
    // In a real app, this would make an API call
    setSnackbarMessage('Score challenge submitted for review!');
    setSnackbarOpen(true);
    setChallengeOpen(false);
    setChallengeReason('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 80) return theme.palette.warning.main;
    if (score >= 70) return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  const getComplianceColor = (tier: string) => {
    switch (tier) {
      case 'A': return theme.palette.success.main;
      case 'B': return theme.palette.warning.main;
      case 'C': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const stats = [
    {
      title: 'Overall Score',
      value: profile?.overallScore || 0,
      icon: <StarIcon />,
      color: getScoreColor(profile?.overallScore || 0),
    },
    {
      title: 'Compliance Tier',
      value: profile?.complianceTier || 'C',
      icon: <SecurityIcon />,
      color: getComplianceColor(profile?.complianceTier || 'C'),
    },
    {
      title: 'Years Experience',
      value: profile?.yearsExperience || 0,
      icon: <TimelineIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Completed Projects',
      value: profile?.permits?.filter(p => p.status === 'Finaled').length || 0,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Contractor Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your profile and track your performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
            <Button
              variant="contained"
              startIcon={editing ? <SaveIcon /> : <EditIcon />}
              onClick={editing ? handleSave : handleEdit}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Box>
        </Box>
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
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Profile Information
                </Typography>
                {profile?.challengeStatus === 'None' && (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleChallenge}
                  >
                    Challenge Score
                  </Button>
                )}
              </Box>

              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab label="Basic Info" />
                <Tab label="Verification" />
                <Tab label="Performance" />
                <Tab label="Reviews" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  {editing ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="City"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
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
                        <TextField
                          fullWidth
                          label="ZIP Code"
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Trades</InputLabel>
                          <Select
                            multiple
                            value={formData.trades}
                            onChange={(e) => setFormData({ ...formData, trades: e.target.value as string[] })}
                            label="Trades"
                          >
                            <MenuItem value="General Contractor">General Contractor</MenuItem>
                            <MenuItem value="Electrical">Electrical</MenuItem>
                            <MenuItem value="Plumbing">Plumbing</MenuItem>
                            <MenuItem value="HVAC">HVAC</MenuItem>
                            <MenuItem value="Framing">Framing</MenuItem>
                            <MenuItem value="Drywall">Drywall</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Years Experience"
                          type="number"
                          value={formData.yearsExperience}
                          onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Hourly Rate"
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Availability</InputLabel>
                          <Select
                            value={formData.availability}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                            label="Availability"
                          >
                            <MenuItem value="Immediate">Immediate</MenuItem>
                            <MenuItem value="<2 weeks"><2 weeks</MenuItem>
                            <MenuItem value="<1 month"><1 month</MenuItem>
                            <MenuItem value="<3 months"><3 months</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button onClick={handleCancel}>Cancel</Button>
                          <Button variant="contained" onClick={handleSave}>
                            Save Changes
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <List>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <BusinessIcon />
                            </ListItemIcon>
                            <ListItemText primary="Company" secondary={profile?.company} />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <EmailIcon />
                            </ListItemIcon>
                            <ListItemText primary="Email" secondary={profile?.email} />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <PhoneIcon />
                            </ListItemIcon>
                            <ListItemText primary="Phone" secondary={profile?.phone} />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <List>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <LocationIcon />
                            </ListItemIcon>
                            <ListItemText primary="Address" secondary={`${profile?.address}, ${profile?.city}, ${profile?.state} ${profile?.zip}`} />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <WorkIcon />
                            </ListItemIcon>
                            <ListItemText primary="Trades" secondary={profile?.trades.join(', ')} />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <AttachMoneyIcon />
                            </ListItemIcon>
                            <ListItemText primary="Hourly Rate" secondary={`$${profile?.hourlyRate}/hr`} />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}

              {tabValue === 1 && profile && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    License Verification
                  </Typography>
                  {profile.licenses.map((license) => (
                    <Accordion key={license.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Typography variant="subtitle1" sx={{ flex: 1 }}>
                            {license.type} - {license.number}
                          </Typography>
                          <Chip
                            label={license.status}
                            color={license.status === 'Active' ? 'success' : 'error'}
                            size="small"
                            sx={{ mr: 2 }}
                          />
                          {license.verified && <VerifiedIcon sx={{ color: 'success.main' }} />}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              State: {license.state}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Issue Date: {new Date(license.issueDate).toLocaleDateString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Expiration: {new Date(license.expirationDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Source: {license.source}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Insurance Coverage
                  </Typography>
                  {profile.insurance.map((insurance) => (
                    <Accordion key={insurance.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Typography variant="subtitle1" sx={{ flex: 1 }}>
                            {insurance.type} - {insurance.carrier}
                          </Typography>
                          <Chip
                            label={insurance.coverageBand}
                            color="primary"
                            size="small"
                            sx={{ mr: 2 }}
                          />
                          {insurance.verified && <VerifiedIcon sx={{ color: 'success.main' }} />}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Policy: {insurance.policyNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Coverage: ${insurance.coverageAmount.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Effective: {new Date(insurance.effectiveDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expires: {new Date(insurance.expirationDate).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {tabValue === 2 && profile && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" fontWeight={700} color="primary">
                            {profile.overallScore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Overall Score
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" fontWeight={700} color="success.main">
                            {profile.permits.filter(p => p.status === 'Finaled').length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Completed Projects
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" fontWeight={700} color="warning.main">
                            {Math.round(profile.permits.reduce((sum, p) => sum + p.daysOpen, 0) / profile.permits.length || 0)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Avg Days per Project
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 3 && profile && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Customer Reviews
                  </Typography>
                  {profile.reviews.map((review) => (
                    <Card key={review.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {review.customerName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={review.rating} readOnly size="small" />
                            {review.verified && <VerifiedIcon sx={{ ml: 1, color: 'success.main', fontSize: 16 }} />}
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {review.customerOrg} • {new Date(review.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          {review.comment}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <RefreshIcon />
                  </ListItemIcon>
                  <ListItemText primary="Refresh Verification" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="View All Permits" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="View All Reviews" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Update Availability" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Score Challenge
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                If you believe your score is incorrect, you can submit a challenge for review.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={handleChallenge}
                disabled={profile?.challengeStatus !== 'None'}
              >
                {profile?.challengeStatus === 'None' ? 'Challenge Score' : 'Challenge Submitted'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Challenge Dialog */}
      <Dialog open={challengeOpen} onClose={() => setChallengeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Challenge Your Score</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Challenge"
            value={challengeReason}
            onChange={(e) => setChallengeReason(e.target.value)}
            placeholder="Please explain why you believe your score is incorrect..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChallengeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitChallenge}>
            Submit Challenge
          </Button>
        </DialogActions>
      </Dialog>

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

export default ContractorPortal;