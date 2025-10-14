import React from 'react';
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
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Home,
  AttachMoney,
  Assignment,
  People,
  Assessment,
  Add,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Properties',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: <Home />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Deals',
      value: '8',
      change: '+1',
      changeType: 'positive',
      icon: <TrendingUp />,
      color: theme.palette.success.main,
    },
    {
      title: 'Total Invested',
      value: '$2.4M',
      change: '+$120K',
      changeType: 'positive',
      icon: <AttachMoney />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Net Profit',
      value: '$340K',
      change: '+$45K',
      changeType: 'positive',
      icon: <Assessment />,
      color: theme.palette.success.main,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'property',
      title: 'New property added',
      description: '123 Main St, Austin, TX',
      time: '2 hours ago',
      icon: <Home />,
      color: theme.palette.primary.main,
    },
    {
      id: 2,
      type: 'deal',
      title: 'Deal analysis completed',
      description: 'ROI: 24.5% - Ready to proceed',
      time: '4 hours ago',
      icon: <TrendingUp />,
      color: theme.palette.success.main,
    },
    {
      id: 3,
      type: 'task',
      title: 'Task completed',
      description: 'Permit application submitted',
      time: '6 hours ago',
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
    {
      id: 4,
      type: 'expense',
      title: 'Expense recorded',
      description: 'Materials: $2,450',
      time: '1 day ago',
      icon: <AttachMoney />,
      color: theme.palette.warning.main,
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Schedule inspection',
      property: '123 Main St',
      dueDate: 'Tomorrow',
      priority: 'high',
      assignee: 'Mike Johnson',
    },
    {
      id: 2,
      title: 'Order materials',
      property: '456 Oak Ave',
      dueDate: 'In 2 days',
      priority: 'medium',
      assignee: 'Sarah Wilson',
    },
    {
      id: 3,
      title: 'Final walkthrough',
      property: '789 Pine St',
      dueDate: 'In 3 days',
      priority: 'high',
      assignee: 'John Smith',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your real estate investments today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha(stat.color, 0.15)}`,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight={700} color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpward sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                  ) : (
                    <ArrowDownward sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={stat.changeType === 'positive' ? 'success.main' : 'error.main'}
                    fontWeight={600}
                  >
                    {stat.change}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                  Recent Activity
                </Typography>
                <Button size="small" startIcon={<Add />}>
                  Add Activity
                </Button>
              </Box>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: alpha(activity.color, 0.1),
                            color: activity.color,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {activity.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                  Upcoming Tasks
                </Typography>
                <Button size="small" startIcon={<Add />}>
                  Add Task
                </Button>
              </Box>
              <List>
                {upcomingTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getPriorityColor(task.priority), 0.1),
                                color: getPriorityColor(task.priority),
                                fontWeight: 600,
                                textTransform: 'capitalize',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {task.property}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Due: {task.dueDate} • {task.assignee}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < upcomingTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Home />}
                    sx={{
                      py: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                    }}
                  >
                    Add Property
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    sx={{ py: 2 }}
                  >
                    Analyze Deal
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assignment />}
                    sx={{ py: 2 }}
                  >
                    Create Task
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    sx={{ py: 2 }}
                  >
                    Find Contractors
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;