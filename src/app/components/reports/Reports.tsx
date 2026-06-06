import { Box, Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../../context/DataContext';

export default function Reports() {
  const { vendors, rfqs, quotations, purchaseOrders, invoices } = useData();

  const vendorCategories = vendors.reduce((acc, vendor) => {
    acc[vendor.category] = (acc[vendor.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(vendorCategories).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = [
    { name: 'Open RFQs', value: rfqs.filter(r => r.status === 'open').length },
    { name: 'Pending Approvals', value: quotations.filter(q => q.status === 'pending').length },
    { name: 'Approved', value: quotations.filter(q => q.status === 'approved').length },
  ];

  const spendingData = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 19000 },
    { month: 'Mar', amount: 15000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 22000 },
    { month: 'Jun', amount: invoices.reduce((sum, inv) => sum + inv.total, 0) },
  ];

  const COLORS = ['#6B4B9E', '#9CA3AF', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const stats = [
    { label: 'Total Vendors', value: vendors.length, color: '#6B4B9E' },
    { label: 'Active RFQs', value: rfqs.filter(r => r.status === 'open').length, color: '#3b82f6' },
    { label: 'Total Purchase Orders', value: purchaseOrders.length, color: '#10b981' },
    { label: 'Total Invoices', value: invoices.length, color: '#f59e0b' },
  ];

  const totalSpend = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const avgOrderValue = purchaseOrders.length > 0
    ? purchaseOrders.reduce((sum, po) => sum + po.total, 0) / purchaseOrders.length
    : 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reports & Analytics</Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Procurement Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Vendor Categories</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Monthly Procurement Spending</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#6B4B9E" name="Spending ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Procurement Spend</Typography>
              <Typography variant="h3" color="primary">
                ${totalSpend.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across {invoices.length} invoice(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Order Value</Typography>
              <Typography variant="h3" color="primary">
                ${avgOrderValue.toFixed(0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Based on {purchaseOrders.length} purchase order(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Vendor Performance Summary</Typography>
            <Box sx={{ mt: 2 }}>
              {vendors.slice(0, 5).map((vendor) => {
                const vendorQuotations = quotations.filter(q => q.vendorId === vendor.id);
                const approvedCount = vendorQuotations.filter(q => q.status === 'approved').length;

                return (
                  <Box
                    key={vendor.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      bgcolor: '#f9fafb',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body1">{vendor.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {vendor.category} | Rating: {vendor.rating}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">
                        {vendorQuotations.length} quotation(s)
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        {approvedCount} approved
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
