import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ModuleContainer, PageHeader, KPICard, sharedStyles } from '../ui/ModuleShared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const AddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function InvoiceGeneration() {
  const { purchaseOrders, vendors, invoices, addInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const invoiceKPIs = [
    { label: 'Total Invoiced', value: `$${(invoices.reduce((s, i) => s + i.total, 0) / 1000).toFixed(1)}K`, trend: '+22%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { label: 'Pending Payment', value: invoices.filter(i => i.status !== 'paid').length, trend: '+3', trendUp: false, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Paid Invoices', value: invoices.filter(i => i.status === 'paid').length, trend: '+15%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Invoicing Accuracy', value: '99.4%', trend: '+0.2%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
  ];

  const agingData = [
    { range: '0-30 Days', count: 12, color: '#6366f1' },
    { range: '31-60 Days', count: 5, color: '#f59e0b' },
    { range: '61-90 Days', count: 2, color: '#ef4444' },
    { range: '90+ Days', count: 1, color: '#7f1d1d' },
  ];

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
  };

  return (
    <ModuleContainer>
      <PageHeader 
        title="Invoice Management"
        description="Monitor vendor billing, manage payment cycles, and track accounts payable."
        primaryAction={{
          label: "Print Report",
          onClick: () => {},
          icon: <PrintIcon />
        }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {invoiceKPIs.map((kpi, idx) => (
          <KPICard key={kpi.label} {...kpi} index={idx} />
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sharedStyles.card + " lg:col-span-2 h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Invoicing Volume (Last 6 Months)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{m: 'Jan', v: 42000}, {m: 'Feb', v: 38000}, {m: 'Mar', v: 51000}, {m: 'Apr', v: 46000}, {m: 'May', v: 58000}, {m: 'Jun', v: 62000}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="v" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={sharedStyles.card + " h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Accounts Payable Aging</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="range" type="category" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {agingData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center gap-4 bg-white/[0.05] border border-white/10">
        <div className="relative flex-1 min-w-[280px]">
          <div className="absolute inset-y-0 left-3.5 flex items-center text-white/20">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            placeholder="Search invoice numbers, vendors, or amounts..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-black text-white/60 focus:outline-none hover:bg-white/10 transition-all cursor-pointer">
            <option>All Invoices</option>
            <option>Draft</option>
            <option>Sent</option>
            <option>Paid</option>
          </select>
        </div>
      </div>

      {/* Main Invoice Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className={sharedStyles.tableHeader}>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Invoice #</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Vendor</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Value</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Date</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((invoice) => {
                const vendor = vendors.find(v => v.id === invoice.vendorId);
                return (
                  <tr key={invoice.id} className={sharedStyles.tableRow}>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-indigo-400">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-white">{vendor?.name}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black">{vendor?.category}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-white">${invoice.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white/70">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={sharedStyles.statusBadge(invoice.status === 'paid' ? 'emerald' : invoice.status === 'sent' ? 'indigo' : 'slate')}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-4 py-1.5 rounded-lg text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                          PDF
                        </button>
                        <button className="px-4 py-1.5 rounded-lg text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleContainer>
  );
}
