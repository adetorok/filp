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
  Rating,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Contractor {
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

const ContractorMarketplace: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState(0);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const theme = useTheme();

  // Mock data with realistic contractor information
  useEffect(() => {
    const mockContractors: Contractor[] = [
      {
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
          {
            id: '2',
            type: 'Workers Compensation',
            carrier: 'Travelers',
            policyNumber: 'TR456789',
            coverageAmount: 1000000,
            coverageBand: '$1M–$2M',
            effectiveDate: '2024-01-01',
            expirationDate: '2025-01-01',
            verified: true,
            source: 'Travelers Insurance',
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
      },
      {
        id: '2',
        name: 'Carlos Rodriguez',
        company: 'Rodriguez Electrical',
        email: 'carlos@rodriguezelectrical.com',
        phone: '+1-555-0456',
        address: '456 Electric Ave',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        trades: ['Electrical', 'Low Voltage'],
        experienceLevel: 'Experienced',
        yearsExperience: 8,
        overallScore: 88,
        complianceTier: 'A',
        licenses: [
          {
            id: '2',
            type: 'Electrical Contractor',
            number: 'EC789012',
            state: 'TX',
            status: 'Active',
            issueDate: '2016-05-20',
            expirationDate: '2025-05-20',
            verified: true,
            source: 'Texas Department of Licensing and Regulation',
          },
        ],
        insurance: [
          {
            id: '3',
            type: 'General Liability',
            carrier: 'Allstate',
            policyNumber: 'AL345678',
            coverageAmount: 1000000,
            coverageBand: '$1M–$2M',
            effectiveDate: '2024-01-01',
            expirationDate: '2025-01-01',
            verified: true,
            source: 'Allstate Insurance',
          },
        ],
        legalEvents: [],
        permits: [
          {
            id: '2',
            city: 'Dallas',
            type: 'Electrical',
            status: 'Finaled',
            filedDate: '2024-02-01',
            issuedDate: '2024-02-05',
            finaledDate: '2024-02-28',
            daysOpen: 27,
            inspectionResults: [
              { type: 'Rough-Electrical', date: '2024-02-15', outcome: 'Pass' },
              { type: 'Final-Electrical', date: '2024-02-25', outcome: 'Pass' },
            ],
          },
        ],
        reviews: [
          {
            id: '2',
            customerName: 'John Smith',
            customerOrg: 'Smith Investments',
            rating: 5,
            comment: 'Professional and knowledgeable. Great attention to detail.',
            date: '2024-02-10',
            verified: true,
          },
        ],
        availability: '<2 weeks',
        hourlyRate: 75,
        serviceAreas: ['Dallas', 'Plano', 'Frisco'],
        verified: true,
        lastUpdated: '2024-02-10',
      },
      {
        id: '3',
        name: 'David Chen',
        company: 'Chen Plumbing & HVAC',
        email: 'david@chenplumbing.com',
        phone: '+1-555-0789',
        address: '789 Service Blvd',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        trades: ['Plumbing', 'HVAC'],
        experienceLevel: 'Developing',
        yearsExperience: 4,
        overallScore: 76,
        complianceTier: 'B',
        licenses: [
          {
            id: '3',
            type: 'Plumbing Contractor',
            number: 'PC456789',
            state: 'TX',
            status: 'Active',
            issueDate: '2020-08-10',
            expirationDate: '2025-08-10',
            verified: true,
            source: 'Texas State Board of Plumbing Examiners',
          },
        ],
        insurance: [
          {
            id: '4',
            type: 'General Liability',
            carrier: 'Progressive',
            policyNumber: 'PR567890',
            coverageAmount: 500000,
            coverageBand: '<$500k',
            effectiveDate: '2024-01-01',
            expirationDate: '2025-01-01',
            verified: true,
            source: 'Progressive Insurance',
          },
        ],
        legalEvents: [
          {
            id: '1',
            type: 'Violation',
            severity: 'Minor',
            date: '2023-06-15',
            status: 'Resolved',
            description: 'Minor code violation - corrected same day',
            source: 'Houston Building Department',
          },
        ],
        permits: [
          {
            id: '3',
            city: 'Houston',
            type: 'Plumbing',
            status: 'Finaled',
            filedDate: '2024-01-20',
            issuedDate: '2024-01-25',
            finaledDate: '2024-02-15',
            daysOpen: 26,
            inspectionResults: [
              { type: 'Rough-Plumbing', date: '2024-02-05', outcome: 'Pass' },
              { type: 'Final-Plumbing', date: '2024-02-12', outcome: 'Pass' },
            ],
          },
        ],
        reviews: [
          {
            id: '3',
            customerName: 'Emily Davis',
            customerOrg: 'Davis Realty',
            rating: 4,
            comment: 'Good work but had some scheduling issues.',
            date: '2024-01-25',
            verified: true,
          },
        ],
        availability: '<1 month',
        hourlyRate: 65,
        serviceAreas: ['Houston', 'Sugar Land', 'Katy'],
        verified: true,
        lastUpdated: '2024-01-30',
      },
    ];
    setContractors(mockContractors);
    setLoading(false);
  }, []);

  const handleSearch = () => {
    // In a real app, this would make an API call
    console.log('Searching contractors...', { searchTerm, stateFilter, tradeFilter, experienceFilter, scoreFilter });
  };

  const handleContractorClick = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setDetailOpen(true);
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

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.trades.some(trade => trade.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = stateFilter === 'all' || contractor.state === stateFilter;
    const matchesTrade = tradeFilter === 'all' || contractor.trades.includes(tradeFilter);
    const matchesExperience = experienceFilter === 'all' || contractor.experienceLevel === experienceFilter;
    const matchesScore = contractor.overallScore >= scoreFilter;
    return matchesSearch && matchesState && matchesTrade && matchesExperience && matchesScore;
  });

  const stats = [
    {
      title: 'Total Contractors',
      value: contractors.length,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Verified',
      value: contractors.filter(c => c.verified).length,
      icon: <VerifiedIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Avg Score',
      value: Math.round(contractors.reduce((sum, c) => sum + c.overallScore, 0) / contractors.length || 0),
      icon: <StarIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Tier A',
      value: contractors.filter(c => c.complianceTier === 'A').length,
      icon: <CheckCircleIcon />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Contractor Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find and verify contractors with comprehensive background checks
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

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  label="State"
                >
                  <MenuItem value="all">All States</MenuItem>
                  <MenuItem value="TX">Texas</MenuItem>
                  <MenuItem value="CA">California</MenuItem>
                  <MenuItem value="FL">Florida</MenuItem>
                  <MenuItem value="NY">New York</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select
                  value={tradeFilter}
                  onChange={(e) => setTradeFilter(e.target.value)}
                  label="Trade"
                >
                  <MenuItem value="all">All Trades</MenuItem>
                  <MenuItem value="General Contractor">General Contractor</MenuItem>
                  <MenuItem value="Electrical">Electrical</MenuItem>
                  <MenuItem value="Plumbing">Plumbing</MenuItem>
                  <MenuItem value="HVAC">HVAC</MenuItem>
                  <MenuItem value="Framing">Framing</MenuItem>
                  <MenuItem value="Drywall">Drywall</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  label="Experience"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="New">New (1-3 years)</MenuItem>
                  <MenuItem value="Developing">Developing (3-6 years)</MenuItem>
                  <MenuItem value="Experienced">Experienced (6-10 years)</MenuItem>
                  <MenuItem value="Veteran">Veteran (10+ years)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Min Score"
                type="number"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contractors Grid */}
      <Grid container spacing={3}>
        {filteredContractors.map((contractor) => (
          <Grid item xs={12} md={6} lg={4} key={contractor.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              }}
              onClick={() => handleContractorClick(contractor)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mr: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {contractor.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {contractor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contractor.company}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {contractor.city}, {contractor.state}
                      </Typography>
                    </Box>
                  </Box>
                  {contractor.verified && (
                    <VerifiedIcon sx={{ color: theme.palette.success.main }} />
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Trades
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {contractor.trades.slice(0, 3).map((trade, index) => (
                      <Chip
                        key={index}
                        label={trade}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontSize: '0.75rem',
                        }}
                      />
                    ))}
                    {contractor.trades.length > 3 && (
                      <Chip
                        label={`+${contractor.trades.length - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Overall Score
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color={getScoreColor(contractor.overallScore)}
                    >
                      {contractor.overallScore}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Compliance
                    </Typography>
                    <Chip
                      label={`Tier ${contractor.complianceTier}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getComplianceColor(contractor.complianceTier), 0.1),
                        color: getComplianceColor(contractor.complianceTier),
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Experience
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {contractor.yearsExperience} years
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Availability
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {contractor.availability}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={contractor.reviews.reduce((sum, r) => sum + r.rating, 0) / contractor.reviews.length || 0} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({contractor.reviews.length} reviews)
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    ${contractor.hourlyRate}/hr
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Contractor Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {selectedContractor?.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedContractor?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedContractor?.company}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Overview" />
            <Tab label="Verification" />
            <Tab label="Performance" />
            <Tab label="Reviews" />
          </Tabs>

          {tabValue === 0 && selectedContractor && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary={selectedContractor.email} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary={selectedContractor.phone} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText primary={`${selectedContractor.address}, ${selectedContractor.city}, ${selectedContractor.state} ${selectedContractor.zip}`} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Service Details
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <WorkIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Trades" 
                        secondary={selectedContractor.trades.join(', ')} 
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <TimelineIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Experience" 
                        secondary={`${selectedContractor.yearsExperience} years (${selectedContractor.experienceLevel})`} 
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Service Areas" 
                        secondary={selectedContractor.serviceAreas.join(', ')} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 1 && selectedContractor && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Licenses
              </Typography>
              {selectedContractor.licenses.map((license) => (
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
                Insurance
              </Typography>
              {selectedContractor.insurance.map((insurance) => (
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

          {tabValue === 2 && selectedContractor && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight={700} color="primary">
                        {selectedContractor.overallScore}
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
                        {selectedContractor.permits.filter(p => p.status === 'Finaled').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed Permits
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight={700} color="warning.main">
                        {Math.round(selectedContractor.permits.reduce((sum, p) => sum + p.daysOpen, 0) / selectedContractor.permits.length || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Days per Permit
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 3 && selectedContractor && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              {selectedContractor.reviews.map((review) => (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          <Button variant="contained">
            Invite to Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContractorMarketplace;