import { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton,
  Typography, InputAdornment
} from '@mui/material';
import { Add, Search, Edit, Star } from '@mui/icons-material';
import { useData } from '../../context/DataContext';
import type { Vendor } from '../../context/DataContext';

export default function VendorManagement() {
  const { vendors, addVendor } = useData();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    gst: '',
    status: 'active' as const,
    rating: 0,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: '',
      gst: '',
      status: 'active',
      rating: 0,
    });
  };

  const handleSubmit = () => {
    addVendor(formData);
    handleClose();
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Vendor Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Vendor
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search vendors by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9fafb' }}>
              <TableCell>Vendor Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>GST</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.id} hover>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{vendor.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{vendor.phone}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{vendor.gst}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Star sx={{ color: '#fbbf24', fontSize: 18 }} />
                    <Typography variant="body2">{vendor.rating}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={vendor.status}
                    size="small"
                    color={vendor.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Vendor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Vendor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="GST Number"
            value={formData.gst}
            onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            margin="normal"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Vendor</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
