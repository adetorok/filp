import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Support as SupportIcon,
  QuestionAnswer as QuestionAnswerIcon,
  VideoLibrary as VideoLibraryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';

const Help: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const faqs = [
    {
      question: 'How do I get started with my first project?',
      answer: 'After signing up, you\'ll have access to a free trial for 6 months with 1 project. Go to the Properties section and click "Add Property" to create your first project. You can then add deals, track expenses, and manage tasks for that property.'
    },
    {
      question: 'What happens after my free trial expires?',
      answer: 'After 6 months, you can continue with the Pro plan at $29.99/month for your first project, and $4.99/month for each additional project. You\'ll get unlimited projects and access to all premium features.'
    },
    {
      question: 'How do I analyze a potential deal?',
      answer: 'Go to the Deals section and click "Add Deal". Enter the property details, offer price, estimated repair costs, and ARV. The system will automatically calculate ROI, profit margins, and other key metrics to help you make informed decisions.'
    },
    {
      question: 'Can I track expenses by category?',
      answer: 'Yes! In the Expenses section, you can categorize expenses by type (Acquisition, Rehab, Holding, Selling, etc.) and subcategory. This helps you understand where your money is going and prepare for taxes.'
    },
    {
      question: 'How do I manage contractors and vendors?',
      answer: 'Use the Contacts section to store information about contractors, vendors, agents, and other business contacts. You can rate them, track specialties, and keep notes for future reference.'
    },
    {
      question: 'What kind of reports can I generate?',
      answer: 'The Reports section provides comprehensive analytics including profit/loss reports, expense breakdowns by category, task completion rates, and property performance metrics. Pro users get access to custom reporting features.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and security measures to protect your data. We never share your information with third parties, and you can export your data at any time.'
    },
    {
      question: 'Can I use this on my mobile device?',
      answer: 'Yes! The platform is fully responsive and works great on mobile devices. Pro users also get access to our mobile app for even better on-the-go experience.'
    },
    {
      question: 'What if I need help or have questions?',
      answer: 'We offer multiple support channels: email support for all users, priority support for Pro users, live chat, and comprehensive documentation. You can also contact us directly through the form below.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to Pro features until the end of your billing period. You can also reactivate your subscription if you change your mind.'
    }
  ];

  const supportChannels = [
    {
      icon: <EmailIcon />,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'support@homeflip.com'
    },
    {
      icon: <PhoneIcon />,
      title: 'Phone Support',
      description: 'Call us for urgent issues (Pro users)',
      contact: '1-800-HOMEFLIP'
    },
    {
      icon: <SupportIcon />,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available 24/7'
    }
  ];

  const resources = [
    {
      icon: <VideoLibraryIcon />,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all features',
      link: '#'
    },
    {
      icon: <DescriptionIcon />,
      title: 'Documentation',
      description: 'Comprehensive guides and API documentation',
      link: '#'
    },
    {
      icon: <QuestionAnswerIcon />,
      title: 'Community Forum',
      description: 'Connect with other users and share tips',
      link: '#'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    setSnackbarOpen(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Help & Support
      </Typography>

      {/* Support Channels */}
      <Grid container spacing={3} mb={4}>
        {supportChannels.map((channel, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {channel.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {channel.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {channel.description}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {channel.contact}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Resources */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Additional Resources
        </Typography>
        <Grid container spacing={2}>
          {resources.map((resource, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {resource.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {resource.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {resource.description}
                  </Typography>
                  <Button size="small" variant="outlined">
                    Access
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* FAQ */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Frequently Asked Questions
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion key={index}>
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
      </Paper>

      {/* Contact Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
        </Typography>
        
        <form onSubmit={handleContactSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={contactForm.name}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={contactForm.email}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={contactForm.subject}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={contactForm.message}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<EmailIcon />}
              >
                Send Message
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default Help;
