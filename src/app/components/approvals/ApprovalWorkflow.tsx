import { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function ApprovalWorkflow() {
  const { quotations, vendors, updateQuotationStatus } = useData();
  const { user } = useAuth();
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);

  const pendingQuotations = quotations.filter(q => q.status === 'pending');

  const handleOpenDialog = (quotationId: string, type: 'approve' | 'reject') => {
    setSelectedQuotation(quotationId);
    setDialogType(type);
  };

  const handleCloseDialog = () => {
    setSelectedQuotation(null);
    setDialogType(null);
    setRemarks('');
  };

  const handleSubmit = () => {
    if (!selectedQuotation || !dialogType) return;

    const newStatus = dialogType === 'approve' ? 'approved' : 'rejected';
    updateQuotationStatus(selectedQuotation, newStatus);

    alert(`Quotation ${newStatus}!`);
    handleCloseDialog();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Approval Workflow</Typography>

      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="body1">
          {pendingQuotations.length} quotation(s) pending approval
        </Typography>
      </Paper>

      {pendingQuotations.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No pending approvals
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell>Quotation ID</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Delivery Days</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingQuotations.map((quotation) => {
                const vendor = vendors.find(v => v.id === quotation.vendorId);
                return (
                  <TableRow key={quotation.id} hover>
                    <TableCell>QT-{quotation.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{vendor?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vendor?.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">
                        ${quotation.totalAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{quotation.deliveryDays} days</TableCell>
                    <TableCell>
                      {new Date(quotation.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip label={quotation.status} size="small" color="warning" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleOpenDialog(quotation.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleOpenDialog(quotation.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(dialogType)} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'approve' ? 'Approve Quotation' : 'Reject Quotation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add your remarks or comments..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={dialogType === 'approve' ? 'success' : 'error'}
          >
            {dialogType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
