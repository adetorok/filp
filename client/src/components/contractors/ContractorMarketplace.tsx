import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon
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
      id={`contractor-tabpanel-${index}`}
      aria-labelledby={`contractor-tab-${index}`}
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

const ContractorMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    trade: '',
    experienceLevel: '',
    minGrade: 'F',
    hasLicense: 'all',
    hasInsurance: 'all',
    sort: 'score'
  });

  const experienceLevels = [
    { value: '', label: 'All Experience Levels' },
    { value: '1-3', label: '1-3 Years (New)' },
    { value: '3-6', label: '3-6 Years (Developing)' },
    { value: '6-10', label: '6-10 Years (Experienced)' },
    { value: '10+', label: '10+ Years (Veteran)' }
  ];

  const trades = [
    'GENERAL', 'GC', 'PLUMBING', 'ELECTRICAL', 'HVAC', 
    'ROOFING', 'PAINTING', 'FLOORING', 'OTHER'
  ];

  const grades = ['A', 'B', 'C', 'D', 'F'];

  useEffect(() => {
    fetchContractors();
  }, [filters]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/contractor-marketplace/search?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setContractors(data.contractors);
      } else {
        setError(data.message || 'Failed to fetch contractors');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const experienceLevels = ['', '1-3', '3-6', '6-10', '10+'];
    setFilters(prev => ({
      ...prev,
      experienceLevel: experienceLevels[newValue]
    }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
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

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case '1-3': return 'error';
      case '3-6': return 'warning';
      case '6-10': return 'info';
      case '10+': return 'success';
      default: return 'default';
    }
  };

  const renderContractorCard = (contractor: Contractor) => {
    const experienceLevel = contractor.yearsInBusiness 
      ? contractor.yearsInBusiness <= 3 ? '1-3'
        : contractor.yearsInBusiness <= 6 ? '3-6'
        : contractor.yearsInBusiness <= 10 ? '6-10'
        : '10+'
      : '1-3';

    return (
      <Card key={contractor.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              {contractor.name.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                {contractor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contractor.companyName || 'Independent Contractor'}
              </Typography>
            </Box>
            <Chip
              label={`Grade: ${contractor.overallGrade}`}
              color={getGradeColor(contractor.overallGrade) as any}
              size="small"
            />
          </Box>

          {/* Experience Level Badge */}
          <Chip
            icon={<BusinessIcon />}
            label={`${experienceLevel} Years`}
            color={getExperienceLevelColor(experienceLevel) as any}
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Key Metrics */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {contractor.overallScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overall Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="secondary">
                  #{contractor.peerRanking.rank}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  of {contractor.peerRanking.total} peers
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Status Badges */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {contractor.hasActiveLicense ? (
              <Chip icon={<VerifiedIcon />} label="Licensed" color="success" size="small" />
            ) : (
              <Chip icon={<CancelIcon />} label="No License" color="error" size="small" />
            )}
            
            {contractor.hasActiveInsurance ? (
              <Chip icon={<SecurityIcon />} label="Insured" color="success" size="small" />
            ) : (
              <Chip icon={<WarningIcon />} label="No Insurance" color="warning" size="small" />
            )}
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box textAlign="center">
              <Typography variant="body2" fontWeight="bold">
                {contractor.projectCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Projects
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" fontWeight="bold">
                {contractor.reviewCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reviews
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" fontWeight="bold">
                {contractor.peerRanking.percentile}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Percentile
              </Typography>
            </Box>
          </Box>

          {/* Trades */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Specialties:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {contractor.trades.slice(0, 3).map((trade, index) => (
                <Chip key={index} label={trade} size="small" variant="outlined" />
              ))}
              {contractor.trades.length > 3 && (
                <Chip label={`+${contractor.trades.length - 3}`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>

          {/* Location */}
          {(contractor.city || contractor.state) && (
            <Typography variant="body2" color="text.secondary">
              📍 {[contractor.city, contractor.state].filter(Boolean).join(', ')}
            </Typography>
          )}
        </CardContent>

        <CardActions>
          <Button 
            size="small" 
            onClick={() => navigate(`/contractors/${contractor.id}`)}
          >
            View Details
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => navigate(`/contractors/${contractor.id}/reviews`)}
          >
            Reviews
          </Button>
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        🏗️ Contractor Marketplace
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Find and compare verified contractors by experience level and performance
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Trade</InputLabel>
              <Select
                value={filters.trade}
                onChange={(e) => handleFilterChange('trade', e.target.value)}
                label="Trade"
              >
                <MenuItem value="">All Trades</MenuItem>
                {trades.map(trade => (
                  <MenuItem key={trade} value={trade}>{trade}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Min Grade</InputLabel>
              <Select
                value={filters.minGrade}
                onChange={(e) => handleFilterChange('minGrade', e.target.value)}
                label="Min Grade"
              >
                {grades.map(grade => (
                  <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>License</InputLabel>
              <Select
                value={filters.hasLicense}
                onChange={(e) => handleFilterChange('hasLicense', e.target.value)}
                label="License"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="true">Licensed Only</MenuItem>
                <MenuItem value="false">No License</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                label="Sort By"
              >
                <MenuItem value="score">Overall Score</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
                <MenuItem value="reviews">Reviews</MenuItem>
                <MenuItem value="projects">Projects</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Experience Level Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="experience level tabs">
          <Tab label="All Contractors" />
          <Tab label="1-3 Years (New)" />
          <Tab label="3-6 Years (Developing)" />
          <Tab label="6-10 Years (Experienced)" />
          <Tab label="10+ Years (Veteran)" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {contractors.length} Contractors Found
        </Typography>
        
        {contractors.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No contractors found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search terms
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {contractors.map(contractor => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={contractor.id}>
                {renderContractorCard(contractor)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ContractorMarketplace;
