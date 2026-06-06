import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Typography
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useData } from '../../context/DataContext';

export default function RFQList() {
  const { rfqs, vendors } = useData();
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Request for Quotations (RFQs)</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/rfq/create')}>
          Create RFQ
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9fafb' }}>
              <TableCell>RFQ ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Assigned Vendors</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id} hover>
                <TableCell>RFQ-{rfq.id}</TableCell>
                <TableCell>{rfq.title}</TableCell>
                <TableCell>{rfq.items.length} item(s)</TableCell>
                <TableCell>{rfq.deadline}</TableCell>
                <TableCell>
                  {rfq.assignedVendors.map(vendorId => {
                    const vendor = vendors.find(v => v.id === vendorId);
                    return (
                      <Chip
                        key={vendorId}
                        label={vendor?.name || 'Unknown'}
                        size="small"
                        sx={{ mr: 0.5 }}
                      />
                    );
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={rfq.status}
                    size="small"
                    color={rfq.status === 'open' ? 'success' : rfq.status === 'closed' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/quotations/compare/${rfq.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
