import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Box, Button, Chip, List, ListItem, ListItemText, Paper } from '@mui/material';
import { TrendingUp, RequestQuote, CheckCircle, Receipt, Assignment, Add, Business, BarChart } from '@mui/icons-material';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { rfqs, quotations, purchaseOrders, invoices, vendors } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const pendingApprovals = quotations.filter(q => q.status === 'pending').length;
  const activeRFQs = rfqs.filter(r => r.status === 'open').length;

  const stats = [
    { label: 'Active RFQs', value: activeRFQs, icon: <RequestQuote />, color: '#3b82f6' },
    { label: 'Pending Approvals', value: pendingApprovals, icon: <CheckCircle />, color: '#f59e0b' },
    { label: 'Purchase Orders', value: purchaseOrders.length, icon: <Receipt />, color: '#10b981' },
    { label: 'Invoices', value: invoices.length, icon: <Assignment />, color: '#6366f1' },
  ];

  const recentRFQs = rfqs.slice(0, 3);
  const recentQuotations = quotations.slice(0, 3);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Welcome back, {user?.name}!</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/rfq/create')}
        >
          Create RFQ
        </Button>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      p: 1,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent RFQs</Typography>
              <Button size="small" onClick={() => navigate('/rfq')}>View All</Button>
            </Box>
            <List>
              {recentRFQs.map((rfq) => (
                <ListItem
                  key={rfq.id}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { bgcolor: '#f9fafb' },
                  }}
                >
                  <ListItemText
                    primary={rfq.title}
                    secondary={`Deadline: ${rfq.deadline}`}
                  />
                  <Chip
                    label={rfq.status}
                    size="small"
                    color={rfq.status === 'open' ? 'success' : 'default'}
                  />
                </ListItem>
              ))}
              {recentRFQs.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No RFQs yet. Create your first RFQ!
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Quotations</Typography>
              <Button size="small" onClick={() => navigate('/approvals')}>View All</Button>
            </Box>
            <List>
              {recentQuotations.map((quotation) => {
                const vendor = vendors.find(v => v.id === quotation.vendorId);
                return (
                  <ListItem
                    key={quotation.id}
                    sx={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: '#f9fafb' },
                    }}
                  >
                    <ListItemText
                      primary={vendor?.name}
                      secondary={`Amount: $${quotation.totalAmount.toLocaleString()}`}
                    />
                    <Chip
                      label={quotation.status}
                      size="small"
                      color={
                        quotation.status === 'approved'
                          ? 'success'
                          : quotation.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </ListItem>
                );
              })}
              {recentQuotations.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No quotations yet.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/rfq/create')}
                >
                  Create RFQ
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Business />}
                  onClick={() => navigate('/vendors')}
                >
                  Manage Vendors
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CheckCircle />}
                  onClick={() => navigate('/approvals')}
                >
                  Review Approvals
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BarChart />}
                  onClick={() => navigate('/reports')}
                >
                  View Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
