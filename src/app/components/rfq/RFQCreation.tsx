import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, TextField, Typography, Select, MenuItem, FormControl, InputLabel,
  IconButton, Grid, Chip, OutlinedInput
} from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function RFQCreation() {
  const { vendors, addRFQ } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
    assignedVendors: [] as string[],
    status: 'draft' as const,
  });

  const [items, setItems] = useState([
    { productName: '', description: '', quantity: 1, unit: 'pieces' }
  ]);

  const handleAddItem = () => {
    setItems([...items, { productName: '', description: '', quantity: 1, unit: 'pieces' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.deadline || formData.assignedVendors.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    addRFQ({
      ...formData,
      items,
      createdBy: user?.name || 'Unknown',
      status: 'open',
    });

    navigate('/rfq');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Create New RFQ</Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="RFQ Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Office Furniture Purchase"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Assign Vendors</InputLabel>
              <Select
                multiple
                value={formData.assignedVendors}
                onChange={(e) => setFormData({ ...formData, assignedVendors: e.target.value as string[] })}
                input={<OutlinedInput label="Assign Vendors" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const vendor = vendors.find(v => v.id === value);
                      return <Chip key={value} label={vendor?.name} size="small" />;
                    })}
                  </Box>
                )}
              >
                {vendors.filter(v => v.status === 'active').map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Items</Typography>
              <Button startIcon={<Add />} onClick={handleAddItem}>
                Add Item
              </Button>
            </Box>

            {items.map((item, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f9fafb' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Product/Service Name"
                      value={item.productName}
                      onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={4} md={1}>
                    <TextField
                      fullWidth
                      label="Unit"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2} md={1}>
                    <IconButton onClick={() => handleRemoveItem(index)} color="error">
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/rfq')}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Save />} onClick={handleSubmit}>
                Create RFQ
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
