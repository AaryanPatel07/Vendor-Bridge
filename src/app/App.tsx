import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
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

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b6cff', // deep blue
      dark: '#054bb5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7dd3fc', // light cyan
      contrastText: '#04263b',
    },
    background: {
      default: '#F8FAFF',
      paper: '#FFFFFF',
    },
    info: {
      main: '#38bdf8',
    }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
    h1: { fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 600 },
    h3: { fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'transparent',
          boxShadow: 'none',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 14px'
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9))',
          border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(2,6,23,0.04)' : 'rgba(255,255,255,0.04)'}`
        })
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          width: 260,
          background: `linear-gradient(180deg, ${theme.palette.primary.main}10, #f7fbff)`,
          borderRight: `1px solid ${theme.palette.primary.main}15`
        })
      }
    }
  }
});

theme = responsiveFontSizes(theme);

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
