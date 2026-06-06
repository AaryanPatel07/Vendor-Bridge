import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useData } from '../../context/DataContext';

export default function PurchaseOrders() {
  const { quotations, vendors, purchaseOrders, addPurchaseOrder } = useData();
  const navigate = useNavigate();
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const approvedQuotations = quotations.filter(q => q.status === 'approved');

  const handleCreatePO = (quotation: any) => {
    const vendor = vendors.find(v => v.id === quotation.vendorId);

    const items = quotation.items.map((item: any) => ({
      productName: item.productName,
      quantity: 1,
      unitPrice: item.unitPrice,
      total: item.totalPrice,
    }));

    const subtotal = quotation.totalAmount;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    addPurchaseOrder({
      quotationId: quotation.id,
      vendorId: quotation.vendorId,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
    });

    alert('Purchase Order created successfully!');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Purchase Orders</Typography>

      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="body1">
          {purchaseOrders.length} purchase order(s) | {approvedQuotations.length} approved quotation(s) ready for PO
        </Typography>
      </Paper>

      {approvedQuotations.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#eff6ff' }}>
          <Typography variant="h6" gutterBottom>Approved Quotations Ready for PO</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedQuotations.map((quotation) => {
                  const vendor = vendors.find(v => v.id === quotation.vendorId);
                  const hasPO = purchaseOrders.some(po => po.quotationId === quotation.id);

                  return (
                    <TableRow key={quotation.id}>
                      <TableCell>{vendor?.name}</TableCell>
                      <TableCell>${quotation.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {hasPO ? (
                          <Chip label="PO Created" size="small" color="success" />
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleCreatePO(quotation)}
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
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9fafb' }}>
              <TableCell>PO Number</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Tax (18%)</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders.map((po) => {
              const vendor = vendors.find(v => v.id === po.vendorId);
              return (
                <TableRow key={po.id} hover>
                  <TableCell>{po.poNumber}</TableCell>
                  <TableCell>{vendor?.name}</TableCell>
                  <TableCell>${po.subtotal.toLocaleString()}</TableCell>
                  <TableCell>${po.tax.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      ${po.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(po.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={po.status}
                      size="small"
                      color={po.status === 'completed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => setSelectedPO(po)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {purchaseOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No purchase orders yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(selectedPO)} onClose={() => setSelectedPO(null)} maxWidth="md" fullWidth>
        <DialogTitle>Purchase Order Details - {selectedPO?.poNumber}</DialogTitle>
        <DialogContent>
          {selectedPO && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Vendor: {vendors.find(v => v.id === selectedPO.vendorId)?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Created: {new Date(selectedPO.createdAt).toLocaleDateString()}
              </Typography>

              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPO.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.unitPrice}</TableCell>
                        <TableCell align="right">${item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Typography variant="body2">Subtotal: ${selectedPO.subtotal.toLocaleString()}</Typography>
                <Typography variant="body2">Tax (18%): ${selectedPO.tax.toFixed(2)}</Typography>
                <Typography variant="h6">Total: ${selectedPO.total.toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPO(null)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setSelectedPO(null);
            navigate('/invoices');
          }}>
            Generate Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
