import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, TextField, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function QuotationSubmission() {
  const { rfqId } = useParams();
  const { rfqs, addQuotation } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const rfq = rfqs.find(r => r.id === rfqId);

  const [quotationItems, setQuotationItems] = useState(
    rfq?.items.map(item => ({
      productName: item.productName,
      unitPrice: 0,
      totalPrice: 0,
    })) || []
  );

  const [deliveryDays, setDeliveryDays] = useState(14);
  const [notes, setNotes] = useState('');

  const handlePriceChange = (index: number, unitPrice: number) => {
    const newItems = [...quotationItems];
    const quantity = rfq?.items[index].quantity || 1;
    newItems[index] = {
      ...newItems[index],
      unitPrice,
      totalPrice: unitPrice * quantity,
    };
    setQuotationItems(newItems);
  };

  const totalAmount = quotationItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = () => {
    if (!rfqId) return;

    addQuotation({
      rfqId,
      vendorId: user?.id || '1',
      items: quotationItems,
      deliveryDays,
      notes,
      totalAmount,
      status: 'pending',
    });

    alert('Quotation submitted successfully!');
    navigate('/rfq');
  };

  if (!rfq) {
    return (
      <Box>
        <Typography variant="h5">RFQ not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Submit Quotation</Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>RFQ Details</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Title</Typography>
            <Typography variant="body1">{rfq.title}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Deadline</Typography>
            <Typography variant="body1">{rfq.deadline}</Typography>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Quotation Items</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell>Product/Service</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Price ($)</TableCell>
                <TableCell>Total Price ($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rfq.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={quotationItems[index]?.unitPrice || 0}
                      onChange={(e) => handlePriceChange(index, parseFloat(e.target.value))}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell>
                    ${quotationItems[index]?.totalPrice.toFixed(2) || 0}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <Typography variant="h6">Total Amount:</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">${totalAmount.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Delivery Timeline (Days)"
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes/Comments"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about your quotation..."
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/rfq')}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Send />} onClick={handleSubmit}>
                Submit Quotation
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
