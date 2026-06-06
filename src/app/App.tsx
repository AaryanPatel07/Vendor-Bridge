import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import VendorManagement from './components/vendors/VendorManagement';
import RFQCreation from './components/rfq/RFQCreation';
import RFQList from './components/rfq/RFQList';
import QuotationSubmission from './components/quotations/QuotationSubmission';
import QuotationComparison from './components/quotations/QuotationComparison';
import ApprovalWorkflow from './components/approvals/ApprovalWorkflow';
import PurchaseOrders from './components/purchase-orders/PurchaseOrders';
import InvoiceGeneration from './components/invoices/InvoiceGeneration';
import ActivityLogs from './components/activity/ActivityLogs';
import Reports from './components/reports/Reports';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B4B9E',
    },
    secondary: {
      main: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="vendors" element={<VendorManagement />} />
                <Route path="rfq" element={<RFQList />} />
                <Route path="rfq/create" element={<RFQCreation />} />
                <Route path="quotations/submit/:rfqId" element={<QuotationSubmission />} />
                <Route path="quotations/compare/:rfqId" element={<QuotationComparison />} />
                <Route path="approvals" element={<ApprovalWorkflow />} />
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="invoices" element={<InvoiceGeneration />} />
                <Route path="activity" element={<ActivityLogs />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
