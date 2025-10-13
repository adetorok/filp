import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Gavel as GavelIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Contractor {
  id: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  state?: string;
  zip?: string;
  trades: string[];
  yearsInBusiness?: number;
  totalProjects: number;
  totalValue?: number;
  businessStartDate?: string;
  overallScore: number;
  overallGrade: string;
  hasActiveLicense: boolean;
  hasActiveInsurance: boolean;
  experienceScore: number;
  peerRanking: {
    rank: number;
    total: number;
    percentile: number;
  };
  reviewCount: number;
  projectCount: number;
  licenses: Array<{
    number: string;
    state: string;
    status: string;
    adminVerified: boolean;
    expiresOn?: string;
  }>;
  policies: Array<{
    type: string;
    insurerName: string;
    expiresOn?: string;
  }>;
  legalEvents: Array<{
    type: string;
    severity: string;
    title: string;
    filedOn?: string;
  }>;
  reviews: Array<{
    id: string;
    stars: number;
    comment?: string;
    createdAt: string;
    project?: {
      title: string;
    };
  }>;
  challenges: Array<{
    id: string;
    challengeType: string;
    description: string;
    status: string;
    createdAt: string;
    adminNotes?: string;
  }>;
  membership?: {
    membershipType: string;
    status: string;
    endDate?: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`portal-tabpanel-${index}`}
      aria-labelledby={`portal-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ContractorPortal: React.FC = () => {
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [challengeDialog, setChallengeDialog] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    challengeType: '',
    description: '',
    evidence: ''
  });

  const challengeTypes = [
    'RANKING_DISPUTE',
    'REVIEW_DISPUTE',
    'LICENSE_UPDATE',
    'INSURANCE_UPDATE',
    'LEGAL_EVENT_DISPUTE',
    'OTHER'
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contractor-portal/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setContractor(data.contractor);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contractor-portal/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractor)
      });
      
      if (response.ok) {
        setEditing(false);
        await fetchDashboardData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const handleSubmitChallenge = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contractor-portal/challenges', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(challengeForm)
      });
      
      if (response.ok) {
        setChallengeDialog(false);
        setChallengeForm({ challengeType: '', description: '', evidence: '' });
        await fetchDashboardData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit challenge');
      }
    } catch (err) {
      setError('Network error occurred');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'RESOLVED': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (!contractor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          No contractor data found. Please contact support.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            🏗️ Contractor Portal
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome back, {contractor.name}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEditToggle}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      {/* Dashboard Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall Score</Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {contractor.overallScore}%
              </Typography>
              <Chip
                label={`Grade: ${contractor.overallGrade}`}
                color={getGradeColor(contractor.overallGrade) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Peer Ranking</Typography>
              </Box>
              <Typography variant="h3" color="secondary" fontWeight="bold">
                #{contractor.peerRanking.rank}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {contractor.peerRanking.total} peers ({contractor.peerRanking.percentile}th percentile)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Projects</Typography>
              </Box>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {contractor.projectCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StarIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Reviews</Typography>
              </Box>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {contractor.reviewCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="portal tabs">
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<BusinessIcon />} label="Profile" />
          <Tab icon={<StarIcon />} label="Reviews" />
          <Tab icon={<GavelIcon />} label="Challenges" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Reviews
                </Typography>
                {contractor.reviews.length > 0 ? (
                  <List>
                    {contractor.reviews.slice(0, 5).map((review) => (
                      <ListItem key={review.id}>
                        <ListItemIcon>
                          <StarIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Rating value={review.stars} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                          secondary={review.comment || 'No comment provided'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No reviews yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Challenges
                </Typography>
                {contractor.challenges.length > 0 ? (
                  <List>
                    {contractor.challenges.slice(0, 5).map((challenge) => (
                      <ListItem key={challenge.id}>
                        <ListItemIcon>
                          <GavelIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={challenge.challengeType.replace('_', ' ')}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {challenge.description}
                              </Typography>
                              <Chip
                                label={challenge.status}
                                color={getStatusColor(challenge.status) as any}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No challenges submitted
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setChallengeDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Submit Challenge
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={contractor.name}
                  disabled={!editing}
                  onChange={(e) => setContractor(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={contractor.companyName || ''}
                  disabled={!editing}
                  onChange={(e) => setContractor(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={contractor.phone || ''}
                  disabled={!editing}
                  onChange={(e) => setContractor(prev => prev ? { ...prev, phone: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={contractor.email || ''}
                  disabled={!editing}
                  onChange={(e) => setContractor(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Years in Business"
                  type="number"
                  value={contractor.yearsInBusiness || ''}
                  disabled={!editing}
                  onChange={(e) => setContractor(prev => prev ? { ...prev, yearsInBusiness: parseInt(e.target.value) || 0 } : null)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={contractor.website || ''}
                  disabled={!editing}
                  onChange={(e) => setContractor(prev => prev ? { ...prev, website: e.target.value } : null)}
                />
              </Grid>
            </Grid>
            
            {editing && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Reviews Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Reviews
            </Typography>
            {contractor.reviews.length > 0 ? (
              <List>
                {contractor.reviews.map((review) => (
                  <ListItem key={review.id} divider>
                    <ListItemIcon>
                      <StarIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Rating value={review.stars} readOnly />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                          {review.project && (
                            <Chip label={review.project.title} size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={review.comment || 'No comment provided'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No reviews yet
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Challenges Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Ranking Challenges
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setChallengeDialog(true)}
              >
                Submit Challenge
              </Button>
            </Box>
            {contractor.challenges.length > 0 ? (
              <List>
                {contractor.challenges.map((challenge) => (
                  <ListItem key={challenge.id} divider>
                    <ListItemIcon>
                      <GavelIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="subtitle1">
                            {challenge.challengeType.replace('_', ' ')}
                          </Typography>
                          <Chip
                            label={challenge.status}
                            color={getStatusColor(challenge.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {challenge.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Submitted: {new Date(challenge.createdAt).toLocaleDateString()}
                          </Typography>
                          {challenge.adminNotes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Admin Notes: {challenge.adminNotes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No challenges submitted yet
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Challenge Dialog */}
      <Dialog open={challengeDialog} onClose={() => setChallengeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Ranking Challenge</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Challenge Type</InputLabel>
                <Select
                  value={challengeForm.challengeType}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, challengeType: e.target.value }))}
                  label="Challenge Type"
                >
                  {challengeTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={challengeForm.description}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please describe your challenge in detail..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evidence (URL)"
                value={challengeForm.evidence}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, evidence: e.target.value }))}
                placeholder="Link to supporting documents (optional)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChallengeDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitChallenge}
            disabled={!challengeForm.challengeType || !challengeForm.description}
          >
            Submit Challenge
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContractorPortal;
