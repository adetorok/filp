import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  CreditCard as CreditCardIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  trialEndsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  projectCount: number;
  maxProjects: number;
}

interface Pricing {
  free: {
    name: string;
    price: number;
    period: string;
    maxProjects: number;
    features: string[];
  };
  pro: {
    name: string;
    price: number;
    period: string;
    maxProjects: number;
    additionalProjectPrice: number;
    features: string[];
  };
}

const Subscription: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchPricing();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get('/api/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await axios.get('/api/subscription/pricing');
      setPricing(response.data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      // In a real implementation, you would integrate with Stripe here
      const response = await axios.post('/api/subscription/upgrade', {
        paymentMethodId: 'pm_demo', // Demo payment method
        stripeCustomerId: 'cus_demo' // Demo customer ID
      });
      
      setSubscription(response.data.subscription);
      setUpgradeOpen(false);
      setPaymentMethod('');
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }

    setCancelLoading(true);
    try {
      const response = await axios.post('/api/subscription/cancel');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      const response = await axios.post('/api/subscription/reactivate');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'cancelled': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'trial': return 'Free Trial';
      case 'cancelled': return 'Cancelled';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const isTrialExpired = () => {
    if (!subscription || subscription.status !== 'trial') return false;
    return new Date() > new Date(subscription.trialEndsAt);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Subscription Management
      </Typography>

      {/* Current Subscription */}
      {subscription && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight="bold">
                Current Plan: {subscription.plan === 'free' ? 'Free Trial' : 'Pro'}
              </Typography>
              <Chip
                label={getStatusText(subscription.status)}
                color={getStatusColor(subscription.status) as any}
                size="medium"
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Plan Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Projects"
                      secondary={`${subscription.projectCount} / ${subscription.maxProjects === 999 ? 'Unlimited' : subscription.maxProjects}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={getStatusText(subscription.status)}
                    />
                  </ListItem>
                  {subscription.status === 'trial' && (
                    <ListItem>
                      <ListItemText
                        primary="Trial Ends"
                        secondary={new Date(subscription.trialEndsAt).toLocaleDateString()}
                      />
                    </ListItem>
                  )}
                  {subscription.status === 'active' && (
                    <ListItem>
                      <ListItemText
                        primary="Next Billing"
                        secondary={new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {subscription.plan === 'free' && (
                    <Button
                      variant="contained"
                      startIcon={<StarIcon />}
                      onClick={() => setUpgradeOpen(true)}
                      disabled={isTrialExpired()}
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                  
                  {subscription.plan === 'pro' && !subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? <CircularProgress size={20} /> : 'Cancel Subscription'}
                    </Button>
                  )}
                  
                  {subscription.plan === 'pro' && subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={handleReactivate}
                    >
                      Reactivate Subscription
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>

            {isTrialExpired() && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Your free trial has expired. Upgrade to Pro to continue using the platform.
              </Alert>
            )}

            {subscription.cancelAtPeriodEnd && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Your subscription will be cancelled at the end of your current billing period ({new Date(subscription.currentPeriodEnd).toLocaleDateString()}).
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      {pricing && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {pricing.free.name}
                </Typography>
                <Typography variant="h3" color="primary.main" gutterBottom>
                  ${pricing.free.price}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {pricing.free.period}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Perfect for getting started with your first project
                </Typography>
                
                <List>
                  {pricing.free.features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative'
              }}
            >
              <Chip
                label="Most Popular"
                color="primary"
                sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {pricing.pro.name}
                </Typography>
                <Typography variant="h3" color="primary.main" gutterBottom>
                  ${pricing.pro.price}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {pricing.pro.period}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  For serious real estate investors
                </Typography>
                
                <List>
                  {pricing.pro.features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Additional projects: ${pricing.pro.additionalProjectPrice}/month each
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upgrade to Pro</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You're about to upgrade to our Pro plan for $29.99/month. This includes unlimited projects and all premium features.
          </Typography>
          
          <TextField
            fullWidth
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            margin="normal"
            placeholder="Enter payment method (demo: pm_demo)"
            helperText="This is a demo. In production, you would integrate with Stripe."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpgrade}
            variant="contained"
            disabled={upgradeLoading || !paymentMethod}
            startIcon={upgradeLoading ? <CircularProgress size={20} /> : <CreditCardIcon />}
          >
            {upgradeLoading ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subscription;
