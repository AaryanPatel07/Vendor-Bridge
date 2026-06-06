import { createContext, useContext, useState, ReactNode } from 'react';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  gst: string;
  status: 'active' | 'inactive';
  rating: number;
}

export interface RFQItem {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface RFQ {
  id: string;
  title: string;
  items: RFQItem[];
  deadline: string;
  assignedVendors: string[];
  status: 'draft' | 'open' | 'closed';
  createdAt: string;
  createdBy: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  items: {
    productName: string;
    unitPrice: number;
    totalPrice: number;
  }[];
  deliveryDays: number;
  notes: string;
  totalAmount: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Approval {
  id: string;
  quotationId: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  quotationId: string;
  poNumber: string;
  vendorId: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  status: 'pending' | 'completed';
}

export interface Invoice {
  id: string;
  poId: string;
  invoiceNumber: string;
  vendorId: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  status: 'draft' | 'sent' | 'paid';
}

export interface ActivityLog {
  id: string;
  type: 'rfq' | 'quotation' | 'approval' | 'po' | 'invoice';
  description: string;
  timestamp: string;
  user: string;
}

interface DataContextType {
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;

  rfqs: RFQ[];
  addRFQ: (rfq: Omit<RFQ, 'id' | 'createdAt'>) => void;

  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'submittedAt'>) => void;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;

  approvals: Approval[];
  updateApproval: (id: string, data: Partial<Approval>) => void;

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'poNumber'>) => void;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => void;

  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock initial data
const mockVendors: Vendor[] = [
  { id: '1', name: 'Tech Solutions Inc', email: 'contact@techsol.com', phone: '+1-555-0101', category: 'IT Services', gst: 'GST123456', status: 'active', rating: 4.5 },
  { id: '2', name: 'Office Supplies Co', email: 'sales@officesupply.com', phone: '+1-555-0102', category: 'Office Supplies', gst: 'GST234567', status: 'active', rating: 4.2 },
  { id: '3', name: 'Industrial Parts Ltd', email: 'info@indparts.com', phone: '+1-555-0103', category: 'Manufacturing', gst: 'GST345678', status: 'active', rating: 4.8 },
];

const mockRFQs: RFQ[] = [
  {
    id: '1',
    title: 'Office Furniture Purchase',
    items: [{ productName: 'Office Desk', description: 'Ergonomic standing desk', quantity: 20, unit: 'pieces' }],
    deadline: '2026-06-20',
    assignedVendors: ['2'],
    status: 'open',
    createdAt: '2026-06-01',
    createdBy: 'John Doe'
  },
  {
    id: '2',
    title: 'IT Equipment Procurement',
    items: [{ productName: 'Laptops', description: 'Dell XPS 15', quantity: 10, unit: 'pieces' }],
    deadline: '2026-06-25',
    assignedVendors: ['1'],
    status: 'open',
    createdAt: '2026-06-03',
    createdBy: 'John Doe'
  },
];

const mockQuotations: Quotation[] = [
  {
    id: '1',
    rfqId: '1',
    vendorId: '2',
    items: [{ productName: 'Office Desk', unitPrice: 450, totalPrice: 9000 }],
    deliveryDays: 14,
    notes: 'Includes assembly and installation',
    totalAmount: 9000,
    submittedAt: '2026-06-05',
    status: 'pending'
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [rfqs, setRFQs] = useState<RFQ[]>(mockRFQs);
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: '1', type: 'rfq', description: 'New RFQ created: Office Furniture Purchase', timestamp: '2026-06-01T10:00:00Z', user: 'John Doe' },
    { id: '2', type: 'quotation', description: 'Quotation submitted by Office Supplies Co', timestamp: '2026-06-05T14:30:00Z', user: 'Office Supplies Co' },
  ]);

  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    const newVendor = { ...vendor, id: Date.now().toString() };
    setVendors([...vendors, newVendor]);
    addActivityLog({ type: 'rfq', description: `New vendor registered: ${vendor.name}`, user: 'System' });
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const addRFQ = (rfq: Omit<RFQ, 'id' | 'createdAt'>) => {
    const newRFQ = { ...rfq, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setRFQs([...rfqs, newRFQ]);
    addActivityLog({ type: 'rfq', description: `New RFQ created: ${rfq.title}`, user: rfq.createdBy });
  };

  const addQuotation = (quotation: Omit<Quotation, 'id' | 'submittedAt'>) => {
    const newQuotation = { ...quotation, id: Date.now().toString(), submittedAt: new Date().toISOString() };
    setQuotations([...quotations, newQuotation]);
    const vendor = vendors.find(v => v.id === quotation.vendorId);
    addActivityLog({ type: 'quotation', description: `Quotation submitted by ${vendor?.name}`, user: vendor?.name || 'Vendor' });
  };

  const updateQuotationStatus = (id: string, status: Quotation['status']) => {
    setQuotations(quotations.map(q => q.id === id ? { ...q, status } : q));
  };

  const updateApproval = (id: string, data: Partial<Approval>) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'poNumber'>) => {
    const poNumber = `PO-${Date.now()}`;
    const newPO = { ...po, id: Date.now().toString(), poNumber, createdAt: new Date().toISOString() };
    setPurchaseOrders([...purchaseOrders, newPO]);
    addActivityLog({ type: 'po', description: `Purchase Order created: ${poNumber}`, user: 'System' });
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const newInvoice = { ...invoice, id: Date.now().toString(), invoiceNumber, createdAt: new Date().toISOString() };
    setInvoices([...invoices, newInvoice]);
    addActivityLog({ type: 'invoice', description: `Invoice created: ${invoiceNumber}`, user: 'System' });
  };

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog = { ...log, id: Date.now().toString(), timestamp: new Date().toISOString() };
    setActivityLogs([newLog, ...activityLogs]);
  };

  return (
    <DataContext.Provider value={{
      vendors, addVendor, updateVendor,
      rfqs, addRFQ,
      quotations, addQuotation, updateQuotationStatus,
      approvals, updateApproval,
      purchaseOrders, addPurchaseOrder,
      invoices, addInvoice,
      activityLogs, addActivityLog
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
