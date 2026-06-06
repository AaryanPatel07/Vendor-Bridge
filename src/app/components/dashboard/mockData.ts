export const kpiData = [
  {
    label: 'Active RFQs',
    value: '24',
    trend: '+12%',
    trendUp: true,
    icon: 'rfq',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    label: 'Quotations Received',
    value: '87',
    trend: '+8%',
    trendUp: true,
    icon: 'quote',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    label: 'Pending Approvals',
    value: '13',
    trend: '-3%',
    trendUp: false,
    icon: 'clock',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    label: 'Open Purchase Orders',
    value: '41',
    trend: '+5%',
    trendUp: true,
    icon: 'po',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    label: 'Total Procurement Spend',
    value: '$2.4M',
    trend: '+18%',
    trendUp: true,
    icon: 'spend',
    color: '#0ea5e9',
    bg: '#f0f9ff',
  },
  {
    label: 'Cost Savings',
    value: '$340K',
    trend: '+22%',
    trendUp: true,
    icon: 'savings',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
];

export const rfqLifecycleData = [
  { stage: 'RFQ Created', count: 24, color: '#3b82f6' },
  { stage: 'Quotations Received', count: 87, color: '#8b5cf6' },
  { stage: 'Under Review', count: 31, color: '#f59e0b' },
  { stage: 'Approved', count: 18, color: '#10b981' },
  { stage: 'PO Issued', count: 14, color: '#0ea5e9' },
];

export const vendorLeaderboard = [
  { name: 'TechSupply Co.', rating: 4.9, responseTime: '1.2h', onTimeDelivery: 98, badge: '🥇' },
  { name: 'Global Office Pro', rating: 4.7, responseTime: '2.1h', onTimeDelivery: 95, badge: '🥈' },
  { name: 'SwiftSourcing Ltd', rating: 4.6, responseTime: '3.4h', onTimeDelivery: 93, badge: '🥉' },
  { name: 'Apex Furnishings', rating: 4.4, responseTime: '4.0h', onTimeDelivery: 89, badge: '' },
  { name: 'CoreIT Solutions', rating: 4.2, responseTime: '5.5h', onTimeDelivery: 86, badge: '' },
];

export const rfqTableData = [
  { id: 'RFQ-001', name: 'Laptop Fleet Renewal', category: 'IT Equipment', vendorsInvited: 6, quotationsReceived: 4, deadline: '2025-08-10', status: 'Comparing' },
  { id: 'RFQ-002', name: 'Office Chairs – HQ', category: 'Furniture', vendorsInvited: 4, quotationsReceived: 4, deadline: '2025-08-14', status: 'Approved' },
  { id: 'RFQ-003', name: 'Cloud Software Licenses', category: 'Software', vendorsInvited: 3, quotationsReceived: 2, deadline: '2025-08-20', status: 'Open' },
  { id: 'RFQ-004', name: 'Managed IT Services', category: 'Services', vendorsInvited: 5, quotationsReceived: 5, deadline: '2025-07-30', status: 'Closed' },
  { id: 'RFQ-005', name: 'Printer Consumables Q3', category: 'Office Supplies', vendorsInvited: 4, quotationsReceived: 1, deadline: '2025-08-25', status: 'Open' },
  { id: 'RFQ-006', name: 'Network Infrastructure', category: 'IT Equipment', vendorsInvited: 7, quotationsReceived: 3, deadline: '2025-09-01', status: 'Open' },
];

export const spendChartData = [
  { name: 'IT Equipment', value: 820000, color: '#3b82f6' },
  { name: 'Furniture', value: 340000, color: '#8b5cf6' },
  { name: 'Software', value: 560000, color: '#0ea5e9' },
  { name: 'Services', value: 430000, color: '#f59e0b' },
  { name: 'Office Supplies', value: 250000, color: '#10b981' },
];

export const pendingActionsData = [
  { label: 'RFQs awaiting approval', count: 5, color: '#f59e0b', bg: '#fffbeb', icon: 'approval' },
  { label: 'Quotations awaiting review', count: 12, color: '#8b5cf6', bg: '#f5f3ff', icon: 'review' },
  { label: 'Purchase Orders awaiting generation', count: 4, color: '#0ea5e9', bg: '#f0f9ff', icon: 'po' },
];
