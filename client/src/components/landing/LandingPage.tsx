import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  Alert,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const navigate = useNavigate();
  const theme = useTheme();

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
      icon: <HomeIcon />,
      title: 'Property Management',
      description: 'Complete property database with photos, documents, and status tracking for all your flip projects.',
      color: theme.palette.primary.main,
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Deal Analysis',
      description: 'Advanced ROI calculations, profit analysis, and scenario planning to maximize your returns.',
      color: theme.palette.success.main,
    },
    {
      icon: <PeopleIcon />,
      title: 'Contractor Verification',
      description: 'Comprehensive contractor scoring system with license verification and peer rankings.',
      color: theme.palette.warning.main,
    },
    {
      icon: <AssessmentIcon />,
      title: 'Financial Reporting',
      description: 'Detailed profit/loss reports, expense tracking, and comprehensive analytics.',
      color: theme.palette.error.main,
    },
    {
      icon: <BuildIcon />,
      title: 'Task Management',
      description: 'Project task scheduling, progress monitoring, and team collaboration tools.',
      color: theme.palette.info.main,
    },
    {
      icon: <TimelineIcon />,
      title: 'Permit Tracking',
      description: 'Monitor permit applications, inspections, and compliance across all projects.',
      color: theme.palette.secondary.main,
    },
  ];

  const pricingPlans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: 'first 6 months',
      description: 'Perfect for getting started',
      features: [
        '1 project included',
        'Basic house flipping features',
        'Email support',
        'Limited contractor verification',
      ],
      popular: false,
      color: theme.palette.grey[500],
    },
    {
      name: 'Pro Plan',
      price: '$29.99',
      period: 'per month',
      description: 'For serious real estate investors',
      features: [
        'Unlimited projects',
        'Full contractor verification',
        'Advanced analytics & reporting',
        'Priority support',
        'API access',
        'Team collaboration',
      ],
      popular: true,
      color: theme.palette.primary.main,
    },
    {
      name: 'Rental Premium',
      price: '$39.99',
      period: 'per month',
      description: 'Complete rental management',
      features: [
        'Up to 10 rental properties',
        'Advanced tenant management',
        'Complete financial tracking',
        'APOD reports',
        'Schedule E preparation',
        'Priority support',
      ],
      popular: false,
      color: theme.palette.secondary.main,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Real Estate Investor',
      company: 'Johnson Properties',
      content: 'HomeFlip Pro has revolutionized how I manage my flip projects. The contractor verification system alone has saved me thousands.',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      role: 'Property Developer',
      company: 'Chen Development',
      content: 'The deal analysis tools are incredibly accurate. I can now make investment decisions with confidence.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Real Estate Agent',
      company: 'Rodriguez Realty',
      content: 'The reporting features help me provide better insights to my clients. Highly recommended!',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'How does the contractor verification work?',
      answer: 'Our system tracks contractor licenses, insurance, legal history, and permit performance to provide comprehensive scoring and peer rankings.',
    },
    {
      question: 'Can I use this for rental properties too?',
      answer: 'Yes! Our Pro plan includes rental management features with tenant tracking, lease management, and APOD reports.',
    },
    {
      question: 'Is there a mobile app?',
      answer: 'Currently we offer a responsive web app that works great on mobile devices. A native mobile app is coming soon.',
    },
    {
      question: 'How secure is my data?',
      answer: 'We use enterprise-grade security with encryption, secure hosting, and regular backups to protect your information.',
    },
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <HomeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight={700} color="primary">
              HomeFlip Pro
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')}>
              Get Started
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
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            <ListItemButton onClick={() => navigate('/login')}>
              <ListItemText primary="Sign In" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/register')}>
              <ListItemText primary="Get Started" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          pt: 12,
          pb: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight={700} gutterBottom>
                The Complete Platform for Real Estate Investors
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Manage properties, analyze deals, verify contractors, and maximize profits with our comprehensive real estate investment platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Watch Demo
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  p: 4,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Demo Credentials
                </Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Admin:</strong> admin@homeflip.com / password123
                  </Typography>
                  <Typography variant="body2">
                    <strong>User:</strong> john@homeflip.com / password123
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contractor:</strong> mike@contractor.com / password123
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Everything You Need to Succeed
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Powerful tools designed specifically for real estate investors
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
                      boxShadow: `0 12px 40px ${alpha(feature.color, 0.2)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        backgroundColor: alpha(feature.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ color: feature.color, fontSize: 28 }}>
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Choose the plan that fits your investment strategy
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                    borderColor: plan.popular ? theme.palette.primary.main : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${alpha(plan.color, 0.2)}`,
                    },
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
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color={plan.color} gutterBottom>
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {plan.period}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    <List sx={{ textAlign: 'left', mb: 3 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                          <CheckCircleIcon
                            sx={{ color: theme.palette.success.main, mr: 1, fontSize: 20 }}
                          />
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        background: plan.popular
                          ? `linear-gradient(135deg, ${plan.color} 0%, ${alpha(plan.color, 0.8)} 100%)`
                          : 'transparent',
                        '&:hover': {
                          background: plan.popular
                            ? `linear-gradient(135deg, ${alpha(plan.color, 0.9)} 0%, ${alpha(plan.color, 0.7)} 100%)`
                            : alpha(plan.color, 0.1),
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join thousands of successful real estate investors
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role} at {testimonial.company}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to know about HomeFlip Pro
            </Typography>
          </Box>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ArrowForwardIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Ready to Transform Your Real Estate Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of investors who are already using HomeFlip Pro to maximize their profits.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Start Your Free Trial Today
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight={700}>
                  HomeFlip Pro
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                The complete platform for real estate investors. Manage properties, analyze deals, and maximize profits.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">support@homeflip.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">+1 (555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Austin, TX</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button color="inherit" onClick={() => setContactOpen(true)}>
                  Contact Us
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 HomeFlip Pro. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Contact Us
          </Typography>
          <Box component="form" onSubmit={handleContactSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              required
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setContactOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Send Message
              </Button>
            </Box>
          </Box>
        </Box>
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