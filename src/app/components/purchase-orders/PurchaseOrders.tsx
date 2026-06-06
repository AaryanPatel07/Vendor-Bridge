import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ModuleContainer, PageHeader, KPICard, sharedStyles } from '../ui/ModuleShared';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const ExportIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function PurchaseOrders() {
  const { quotations, vendors, purchaseOrders, addPurchaseOrder } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const approvedQuotations = quotations.filter(q => q.status === 'approved');

  const poKPIs = [
    { label: 'Total PO Value', value: `$${(purchaseOrders.reduce((s, p) => s + p.total, 0) / 1000).toFixed(1)}K`, trend: '+14%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Pending POs', value: purchaseOrders.filter(p => p.status === 'pending').length, trend: '-2%', trendUp: false, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Avg PO Cycle', value: '4.2 Days', trend: '-1.1', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { label: 'Ready for PO', value: approvedQuotations.length, trend: 'High', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  ];

  const spendTrendData = [
    { name: 'Jan', amount: 45000 },
    { name: 'Feb', amount: 52000 },
    { name: 'Mar', amount: 48000 },
    { name: 'Apr', amount: 61000 },
    { name: 'May', amount: 55000 },
    { name: 'Jun', amount: 67000 },
  ];

  const handleCreatePO = (quotation: any) => {
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
  };

  return (
    <ModuleContainer>
      <PageHeader 
        title="Purchase Orders"
        description="Formalize commitments and track procurement fulfillment."
        primaryAction={{
          label: "Export POs",
          onClick: () => {},
          icon: <ExportIcon />
        }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {poKPIs.map((kpi, idx) => (
          <KPICard key={kpi.label} {...kpi} index={idx} />
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sharedStyles.card + " lg:col-span-2 h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Purchase Spend Trend</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={sharedStyles.card + " h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">PO Status</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Pending', value: purchaseOrders.filter(p => p.status === 'pending').length },
                    { name: 'Completed', value: purchaseOrders.filter(p => p.status === 'completed').length }
                  ]} 
                  innerRadius="65%" 
                  outerRadius="90%" 
                  paddingAngle={4} 
                  dataKey="value" 
                  strokeWidth={0}
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                </Pie>
                <RechartsTooltip />
              </PieChart>
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
            placeholder="Search POs, vendors, or references..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-black text-white/60 focus:outline-none hover:bg-white/10 transition-all cursor-pointer">
            <option>All POs</option>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* Main PO Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className={sharedStyles.tableHeader}>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">PO Number</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Vendor</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Value</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Created</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {purchaseOrders.map((po) => {
                const vendor = vendors.find(v => v.id === po.vendorId);
                return (
                  <tr key={po.id} className={sharedStyles.tableRow}>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-indigo-400">{po.poNumber}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-white">{vendor?.name}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black">{vendor?.category}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-white">${po.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white/70">{new Date(po.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={sharedStyles.statusBadge(po.status === 'completed' ? 'emerald' : 'rose')}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="px-4 py-1.5 rounded-lg text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                        View PO
                      </button>
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
