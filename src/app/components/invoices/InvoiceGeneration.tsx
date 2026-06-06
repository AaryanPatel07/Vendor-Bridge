import { useState, useRef } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { Add, Download, Print, Email, Visibility } from '@mui/icons-material';
import { useData } from '../../context/DataContext';
import jsPDF from 'jspdf';

export default function InvoiceGeneration() {
  const { purchaseOrders, vendors, invoices, addInvoice } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleCreateInvoice = (po: any) => {
    addInvoice({
      poId: po.id,
      vendorId: po.vendorId,
      items: po.items,
      subtotal: po.subtotal,
      tax: po.tax,
      total: po.total,
      status: 'draft',
    });
    alert('Invoice created successfully!');
  };

  const handleDownloadPDF = (invoice: any) => {
    const doc = new jsPDF();
    const vendor = vendors.find(v => v.id === invoice.vendorId);

    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 50);
    doc.text(`Vendor: ${vendor?.name}`, 20, 60);

    doc.text('Items:', 20, 80);
    let y = 90;
    invoice.items.forEach((item: any) => {
      doc.setFontSize(10);
      doc.text(`${item.productName} - Qty: ${item.quantity} - $${item.total}`, 20, y);
      y += 10;
    });

    y += 10;
    doc.setFontSize(12);
    doc.text(`Subtotal: $${invoice.subtotal.toLocaleString()}`, 20, y);
    doc.text(`Tax (18%): $${invoice.tax.toFixed(2)}`, 20, y + 10);
    doc.setFontSize(14);
    doc.text(`Total: $${invoice.total.toLocaleString()}`, 20, y + 20);

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  const handlePrint = (invoice: any) => {
    const vendor = vendors.find(v => v.id === invoice.vendorId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f9fafb; }
          .totals { margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <h1>INVOICE</h1>
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
        <p><strong>Vendor:</strong> ${vendor?.name}</p>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice}</td>
                <td>$${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> $${invoice.subtotal.toLocaleString()}</p>
          <p><strong>Tax (18%):</strong> $${invoice.tax.toFixed(2)}</p>
          <p style="font-size: 18px;"><strong>Total:</strong> $${invoice.total.toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendEmail = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEmailDialog(true);
  };

  const handleEmailSubmit = () => {
    alert(`Invoice sent to ${emailAddress} successfully!`);
    setEmailDialog(false);
    setEmailAddress('');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Invoice Generation</Typography>

      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="body1">
          {invoices.length} invoice(s) generated
        </Typography>
      </Paper>

      {purchaseOrders.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#eff6ff' }}>
          <Typography variant="h6" gutterBottom>Purchase Orders Ready for Invoice</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>PO Number</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.map((po) => {
                  const vendor = vendors.find(v => v.id === po.vendorId);
                  const hasInvoice = invoices.some(inv => inv.poId === po.id);

                  return (
                    <TableRow key={po.id}>
                      <TableCell>{po.poNumber}</TableCell>
                      <TableCell>{vendor?.name}</TableCell>
                      <TableCell>${po.total.toLocaleString()}</TableCell>
                      <TableCell>
                        {hasInvoice ? (
                          <Chip label="Invoice Created" size="small" color="success" />
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleCreateInvoice(po)}
                          >
                            Generate Invoice
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
              <TableCell>Invoice Number</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Tax (18%)</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => {
              const vendor = vendors.find(v => v.id === invoice.vendorId);
              return (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{vendor?.name}</TableCell>
                  <TableCell>${invoice.subtotal.toLocaleString()}</TableCell>
                  <TableCell>${invoice.tax.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      ${invoice.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      size="small"
                      color={
                        invoice.status === 'paid'
                          ? 'success'
                          : invoice.status === 'sent'
                          ? 'info'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownloadPDF(invoice)}
                      >
                        PDF
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Print />}
                        onClick={() => handlePrint(invoice)}
                      >
                        Print
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Email />}
                        onClick={() => handleSendEmail(invoice)}
                      >
                        Email
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No invoices yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(selectedInvoice) && !emailDialog} onClose={() => setSelectedInvoice(null)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box ref={invoiceRef}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Vendor</Typography>
                  <Typography variant="body1">
                    {vendors.find(v => v.id === selectedInvoice.vendorId)?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <TableContainer sx={{ mt: 3 }}>
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
                    {selectedInvoice.items.map((item: any, index: number) => (
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
                <Typography variant="body2">Subtotal: ${selectedInvoice.subtotal.toLocaleString()}</Typography>
                <Typography variant="body2">Tax (18%): ${selectedInvoice.tax.toFixed(2)}</Typography>
                <Typography variant="h6">Total: ${selectedInvoice.total.toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedInvoice(null)}>Close</Button>
          <Button startIcon={<Download />} onClick={() => handleDownloadPDF(selectedInvoice)}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Invoice via Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="recipient@example.com"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailSubmit} disabled={!emailAddress}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
