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
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stack,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery
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
  Star as StarIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon,
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbarOpen(true);
    setContactOpen(false);
    setContactForm({ name: '', email: '', message: '' });
  };

  const features = [
    {
      icon: <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Property Management',
      description: 'Track all your properties with detailed analytics, photos, and financial projections.',
      color: 'primary'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Deal Analysis',
      description: 'Analyze potential deals with advanced ROI calculations and market comparisons.',
      color: 'success'
    },
    {
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Expense Tracking',
      description: 'Monitor all project expenses with detailed categorization and reporting.',
      color: 'warning'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Task Management',
      description: 'Organize and track renovation tasks with deadlines and progress monitoring.',
      color: 'secondary'
    },
    {
      icon: <ContactsIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      title: 'Contractor Network',
      description: 'Access verified contractors with ratings, reviews, and work history.',
      color: 'info'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Advanced Reports',
      description: 'Generate comprehensive reports for taxes, investors, and project analysis.',
      color: 'error'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'First 6 months',
      description: 'Perfect for your first project',
      features: [
        '1 Property',
        'Basic Analytics',
        'Expense Tracking',
        'Task Management',
        'Email Support'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outlined' as const,
      popular: false
    },
    {
      name: 'Professional',
      price: '$29.99',
      period: 'per month',
      description: 'For serious real estate investors',
      features: [
        'Unlimited Properties',
        'Advanced Analytics',
        'Contractor Marketplace',
        'Rental Management',
        'Priority Support',
        'Custom Reports',
        'API Access'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'contained' as const,
      popular: true
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Properties Managed' },
    { number: '$2.5B+', label: 'Deal Value Tracked' },
    { number: '98%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Support Available' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Real Estate Investor',
      content: 'This platform transformed how I manage my flip projects. The analytics are incredible!',
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      role: 'Property Developer',
      content: 'The contractor marketplace saved me thousands in vetting costs. Highly recommended!',
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Investment Group',
      content: 'Finally, a tool that scales with our growing portfolio. The reporting is top-notch.',
      avatar: 'ER'
    }
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/')}>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => document.getElementById('features')?.scrollIntoView()}>
            <ListItemText primary="Features" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => document.getElementById('pricing')?.scrollIntoView()}>
            <ListItemText primary="Pricing" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setContactOpen(true)}>
            <ListItemText primary="Contact" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/login')}>
            <ListItemText primary="Login" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/register')}>
            <ListItemText primary="Get Started" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            HomeFlip Pro
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button color="inherit" onClick={() => document.getElementById('features')?.scrollIntoView()}>
                Features
              </Button>
              <Button color="inherit" onClick={() => document.getElementById('pricing')?.scrollIntoView()}>
                Pricing
              </Button>
              <Button color="inherit" onClick={() => setContactOpen(true)}>
                Contact
              </Button>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </Box>
          )}
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

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawer}
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Transform Your Real Estate Investment Journey
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                The all-in-one platform for property flippers, investors, and real estate professionals. 
                Manage deals, track expenses, and grow your portfolio with confidence.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    py: 2, 
                    px: 4,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => document.getElementById('features')?.scrollIntoView()}
                  sx={{ 
                    py: 2, 
                    px: 4,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  startIcon={<PlayArrowIcon />}
                >
                  Watch Demo
                </Button>
              </Stack>
              <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                {stats.slice(0, 2).map((stat, index) => (
                  <Box key={index} textAlign="center">
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <Typography variant="h6" sx={{ opacity: 0.8 }}>
                  Interactive Dashboard Preview
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Everything You Need to Succeed
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Powerful tools designed specifically for real estate investors and property flippers
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.number}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Choose the plan that fits your investment journey
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{ 
                        position: 'absolute', 
                        top: -12, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        fontWeight: 600
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      {plan.description}
                    </Typography>
                    
                    <List sx={{ mb: 4 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: 4, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={plan.buttonVariant}
                      size="large"
                      onClick={() => navigate('/register')}
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

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Trusted by Real Estate Professionals
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              See what our users are saying about their success
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Ready to Transform Your Real Estate Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of successful investors who trust HomeFlip Pro
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  py: 2, 
                  px: 4,
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Start Your Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setContactOpen(true)}
                sx={{ 
                  py: 2, 
                  px: 4,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Contact Sales
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 6, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                HomeFlip Pro
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The complete platform for real estate investors and property flippers.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small">
                  <EmailIcon />
                </IconButton>
                <IconButton size="small">
                  <PhoneIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Product
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Features" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Pricing" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="API" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Support
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Help Center" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Contact" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Status" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Company
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="About" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Blog" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Careers" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Legal
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Privacy" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Terms" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemText primary="Security" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              © 2024 HomeFlip Pro. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Get in Touch</DialogTitle>
        <form onSubmit={handleContactSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Send Message</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Thank you for your message! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPage;