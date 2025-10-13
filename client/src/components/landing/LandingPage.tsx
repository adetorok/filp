import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List as MuiList,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  Contacts as ContactsIcon,
  Assessment as AssessmentIcon,
  Support as SupportIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  HomeWork as HomeWorkIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    setSnackbarOpen(true);
    setContactOpen(false);
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const features = [
    {
      icon: <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Property Management',
      description: 'Track all your properties with detailed information, photos, and documents.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Deal Analysis',
      description: 'Analyze potential deals with comprehensive ROI calculations and market analysis.'
    },
    {
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Expense Tracking',
      description: 'Track all expenses by category, vendor, and property with receipt management.'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Project Management',
      description: 'Manage tasks, timelines, and contractors for each renovation project.'
    },
    {
      icon: <HomeWorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Rental Management',
      description: 'Complete rental property management with tenant tracking, income/expense management, and lease management. (PRO Feature)'
    },
    {
      icon: <ContactsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Contact Management',
      description: 'Organize contractors, vendors, agents, and other business contacts.'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Reporting & Analytics',
      description: 'Generate detailed reports on profits, expenses, and project performance.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'First 6 months',
      description: 'Perfect for getting started with your first project',
      features: [
        '1 Project',
        'Basic property management',
        'Deal analysis tools',
        'Expense tracking',
        'Task management',
        'Basic reporting',
        'Email support'
      ],
      popular: false,
      buttonText: 'Get Started Free',
      buttonVariant: 'outlined' as const
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: 'per month',
      description: 'For serious real estate investors',
      features: [
        'Unlimited projects',
        '🏠 Rental Management System',
        'Advanced analytics',
        'Custom reporting',
        'Priority support',
        'API access',
        'Team collaboration',
        'Advanced deal analysis',
        'Market data integration',
        'Document management',
        'Mobile app access'
      ],
      popular: true,
      buttonText: 'Start Pro Trial',
      buttonVariant: 'contained' as const
    }
  ];

  const rentalPlans = [
    {
      name: 'Rental Basic',
      price: '$19.99',
      period: 'per month',
      description: 'For 1-2 rental properties',
      features: [
        'Up to 2 rental properties',
        'Tenant management',
        'Rental income tracking',
        'Basic expense tracking',
        'Lease management',
        'Maintenance requests',
        'Basic reporting',
        'Email support'
      ],
      buttonText: 'Start Rental Basic',
      buttonVariant: 'outlined' as const
    },
    {
      name: 'Rental Premium',
      price: '$39.99',
      period: 'per month',
      description: 'For 3-10 rental properties',
      features: [
        'Up to 10 rental properties',
        'Advanced tenant management',
        'Complete financial tracking',
        'APOD reports',
        'Schedule E preparation',
        'Legal document templates',
        'Advanced reporting',
        'Priority support',
        'API access',
        'Team collaboration',
        'Mobile app access'
      ],
      popular: true,
      buttonText: 'Start Rental Premium',
      buttonVariant: 'contained' as const
    }
  ];

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'You get full access to all features for your first project for 6 months completely free. No credit card required to start.'
    },
    {
      question: 'What happens after the free trial?',
      answer: 'After 6 months, you can continue with the Pro plan at $29.99/month for your first project, and $4.99/month for each additional project.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
    },
    {
      question: 'What\'s the difference between Pro and Rental plans?',
      answer: 'Pro plan includes house flipping tools + rental management. Rental plans are focused specifically on rental property management with tiered pricing based on the number of properties.'
    },
    {
      question: 'Can I switch between plans?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and security measures to protect your data. We never share your information with third parties.'
    },
    {
      question: 'Do you offer team accounts?',
      answer: 'Yes, Pro accounts include team collaboration features. You can invite team members and assign different permission levels.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'Free users get email support, while Pro users get priority support with faster response times and phone support for urgent issues.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Real Estate Investor',
      content: 'HomeFlip has transformed how I manage my flip projects. The deal analysis tools helped me avoid a bad investment that would have cost me $50k.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Property Developer',
      content: 'The expense tracking and reporting features are incredible. I can see exactly where every dollar goes and optimize my profits.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'House Flipper',
      content: 'The project management tools keep me organized and on schedule. My projects are completing 20% faster than before.',
      rating: 5
    }
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            HomeFlip
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" onClick={() => document.getElementById('features')?.scrollIntoView()}>
              Features
            </Button>
            <Button color="inherit" onClick={() => document.getElementById('pricing')?.scrollIntoView()}>
              Pricing
            </Button>
            <Button color="inherit" onClick={() => document.getElementById('help')?.scrollIntoView()}>
              Help
            </Button>
            <Button variant="outlined" onClick={() => navigate('/register')}>
              Sign Up
            </Button>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Login
            </Button>
          </Box>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              HomeFlip
            </Typography>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <MuiList>
            <ListItem button onClick={() => { document.getElementById('features')?.scrollIntoView(); handleDrawerToggle(); }}>
              <ListItemText primary="Features" />
            </ListItem>
            <ListItem button onClick={() => { document.getElementById('pricing')?.scrollIntoView(); handleDrawerToggle(); }}>
              <ListItemText primary="Pricing" />
            </ListItem>
            <ListItem button onClick={() => { document.getElementById('help')?.scrollIntoView(); handleDrawerToggle(); }}>
              <ListItemText primary="Help" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/register'); handleDrawerToggle(); }}>
              <ListItemText primary="Sign Up" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/login'); handleDrawerToggle(); }}>
              <ListItemText primary="Login" />
            </ListItem>
          </MuiList>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box sx={{ pt: 10, pb: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                The Complete House Flipping Software
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
                Manage properties, track expenses, analyze deals, and maximize profits with our all-in-one platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    backgroundColor: 'white', 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => document.getElementById('features')?.scrollIntoView()}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <img
                  src="https://via.placeholder.com/600x400/667eea/ffffff?text=HomeFlip+Dashboard"
                  alt="HomeFlip Dashboard"
                  style={{ width: '100%', maxWidth: '500px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Everything You Need to Succeed
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Our comprehensive platform covers every aspect of house flipping
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', p: 3, '&:hover': { boxShadow: 4 } }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Breakdown */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Our Services
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Detailed breakdown of what we offer
          </Typography>

          <Grid container spacing={4}>
            <Grid xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                  Deal Analysis
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="ROI Calculations" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Market Analysis" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Repair Cost Estimation" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Comparable Sales" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                  Project Management
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Task Scheduling" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Contractor Management" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Progress Tracking" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Timeline Management" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                  Financial Management
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Expense Tracking" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Profit Analysis" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Tax Preparation" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Financial Reporting" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Rental Management Section - PRO Feature */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" component="h3" textAlign="center" gutterBottom fontWeight="bold" color="primary.main">
              🏠 Rental Management (PRO Feature)
            </Typography>
            <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              Complete rental property management system for long-term investors
            </Typography>
            
            <Grid container spacing={4}>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                    Tenant Management
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Tenant Database & Contact Info" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Lease Management & Renewals" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Move-in/Move-out Checklists" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Tenant Screening & Applications" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Rent Collection & Late Fee Tracking" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Emergency Contact Management" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                    Rental Financials
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Rental Income Tracking" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Operating Expense Management" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Capital Expenditure Tracking" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Cash Flow Analysis" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="APOD Reports (Annual Property Operating Data)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Schedule E Tax Preparation" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                    Property Maintenance
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Maintenance Request Tracking" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Vendor Management & Scheduling" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Inspection Checklists" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Preventive Maintenance Scheduling" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Work Order Management" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Property Condition Reports" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                    Legal & Documentation
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Lease Agreement Templates" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Rental Applications & Screening" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Security Deposit Agreements" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Notice Templates (Rent Increase, Entry, etc.)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Violation Letters & Documentation" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Legal Document Storage" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Start free, upgrade when you're ready
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    position: 'relative',
                    ...(plan.popular && {
                      border: '2px solid',
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                      zIndex: 1
                    })
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" component="h3" gutterBottom fontWeight="bold">
                      {plan.name}
                    </Typography>
                    <Typography variant="h2" component="div" gutterBottom color="primary.main">
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {plan.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    <List>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ py: 0.5 }}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={plan.buttonVariant}
                      size="large"
                      onClick={() => navigate('/register')}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Rental Management Pricing Section */}
      <Box sx={{ py: 8, backgroundColor: 'primary.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            🏠 Rental Management Pricing
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Dedicated rental property management for long-term investors
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {rentalPlans.map((plan, index) => (
              <Grid xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    position: 'relative',
                    ...(plan.popular && {
                      border: '2px solid',
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                      zIndex: 1
                    })
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" component="h3" gutterBottom fontWeight="bold">
                      {plan.name}
                    </Typography>
                    <Typography variant="h2" component="div" gutterBottom color="primary.main">
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {plan.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    <List>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ py: 0.5 }}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant={plan.buttonVariant}
                      color="primary"
                      size="large"
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            What Our Users Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} color="warning" />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box id="help" sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Everything you need to know about HomeFlip
          </Typography>

          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="bold">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Get in Touch
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Have questions? We're here to help!
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon color="primary" sx={{ mr: 2 }} />
                  <Typography>support@homeflip.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon color="primary" sx={{ mr: 2 }} />
                  <Typography>1-800-HOMEFLIP</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SupportIcon color="primary" sx={{ mr: 2 }} />
                  <Typography>Live chat available 24/7</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Send us a message
                  </Typography>
                  <form onSubmit={handleContactSubmit}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      value={contactForm.message}
                      onChange={handleContactChange}
                      margin="normal"
                      required
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{ mt: 2 }}
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid xs={12} md={4}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                HomeFlip
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                The complete house flipping software for serious real estate investors.
              </Typography>
            </Grid>
            <Grid xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0 }}>
                  <Button color="inherit" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <Button color="inherit" onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <Button color="inherit" onClick={() => document.getElementById('help')?.scrollIntoView()}>
                    Help
                  </Button>
                </ListItem>
              </List>
            </Grid>
            <Grid xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Email: support@homeflip.com<br />
                Phone: 1-800-HOMEFLIP
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.8 }}>
            © 2024 HomeFlip. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Us</DialogTitle>
        <DialogContent>
          <form onSubmit={handleContactSubmit}>
            <TextField
              fullWidth
              label="Your Name"
              name="name"
              value={contactForm.name}
              onChange={handleContactChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={contactForm.email}
              onChange={handleContactChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message"
              name="message"
              multiline
              rows={4}
              value={contactForm.message}
              onChange={handleContactChange}
              margin="normal"
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactOpen(false)}>Cancel</Button>
          <Button onClick={handleContactSubmit} variant="contained">
            Send
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
          Message sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPage;
