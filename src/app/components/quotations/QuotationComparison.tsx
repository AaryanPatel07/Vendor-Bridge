import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Rating
} from '@mui/material';
import { CheckCircle, TrendingDown } from '@mui/icons-material';
import { useData } from '../../context/DataContext';

export default function QuotationComparison() {
  const { rfqId } = useParams();
  const { rfqs, quotations, vendors, updateQuotationStatus } = useData();
  const navigate = useNavigate();

  const rfq = rfqs.find(r => r.id === rfqId);
  const rfqQuotations = quotations.filter(q => q.rfqId === rfqId);

  const lowestPrice = Math.min(...rfqQuotations.map(q => q.totalAmount));

  const handleApprove = (quotationId: string) => {
    updateQuotationStatus(quotationId, 'approved');
    alert('Quotation approved! You can now generate a Purchase Order.');
    navigate('/approvals');
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
      <Typography variant="h5" gutterBottom>Quotation Comparison</Typography>

      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>RFQ: {rfq.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Deadline: {rfq.deadline} | {rfqQuotations.length} quotation(s) received
        </Typography>
      </Paper>

      {rfqQuotations.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No quotations received yet
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigate(`/quotations/submit/${rfqId}`)}
          >
            Submit Quotation (Vendor View)
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                <TableCell>Vendor</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Delivery Days</TableCell>
                <TableCell>Vendor Rating</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rfqQuotations.map((quotation) => {
                const vendor = vendors.find(v => v.id === quotation.vendorId);
                const isLowest = quotation.totalAmount === lowestPrice;

                return (
                  <TableRow
                    key={quotation.id}
                    hover
                    sx={isLowest ? { bgcolor: '#f0fdf4' } : {}}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{vendor?.name || 'Unknown Vendor'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vendor?.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          ${quotation.totalAmount.toLocaleString()}
                        </Typography>
                        {isLowest && (
                          <Chip
                            icon={<TrendingDown />}
                            label="Lowest"
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{quotation.deliveryDays} days</TableCell>
                    <TableCell>
                      <Rating value={vendor?.rating || 0} precision={0.5} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {quotation.notes || 'No notes'}
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {quotation.status === 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(quotation.id)}
                        >
                          Approve
                        </Button>
                      )}
                      {quotation.status === 'approved' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate('/purchase-orders')}
                        >
                          Create PO
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/rfq')}>
          Back to RFQs
        </Button>
        {rfqQuotations.some(q => q.status === 'approved') && (
          <Button variant="contained" onClick={() => navigate('/purchase-orders')}>
            Go to Purchase Orders
          </Button>
        )}
      </Box>
    </Box>
  );
}
