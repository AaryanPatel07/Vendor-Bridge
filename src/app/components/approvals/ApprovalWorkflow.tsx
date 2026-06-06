import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ModuleContainer, PageHeader, KPICard, sharedStyles } from '../ui/ModuleShared';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function ApprovalWorkflow() {
  const { quotations, vendors, updateQuotationStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const pendingQuotations = quotations.filter(q => q.status === 'pending');
  const approvedCount = quotations.filter(q => q.status === 'approved').length;
  const rejectedCount = quotations.filter(q => q.status === 'rejected').length;

  const approvalKPIs = [
    { label: 'Pending Approvals', value: pendingQuotations.length, trend: 'High Priority', trendUp: false, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Avg Approval Time', value: '2.4 Hours', trend: '-15%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { label: 'Approval Rate', value: `${((approvedCount / (approvedCount + rejectedCount || 1)) * 100).toFixed(0)}%`, trend: '+2%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Pending Value', value: `$${(pendingQuotations.reduce((s, q) => s + q.totalAmount, 0) / 1000).toFixed(1)}K`, trend: 'Critical', trendUp: false, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  const radarData = [
    { subject: 'Price', A: 120, fullMark: 150 },
    { subject: 'Quality', A: 98, fullMark: 150 },
    { subject: 'Delivery', A: 86, fullMark: 150 },
    { subject: 'Service', A: 99, fullMark: 150 },
    { subject: 'Risk', A: 85, fullMark: 150 },
  ];

  return (
    <ModuleContainer>
      <PageHeader 
        title="Approval Workflow"
        description="Review and authorize procurement requests to ensure compliance and budget control."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {approvalKPIs.map((kpi, idx) => (
          <KPICard key={kpi.label} {...kpi} index={idx} />
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sharedStyles.card + " h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Approval Criteria Score</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Radar name="Criteria" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={sharedStyles.card + " lg:col-span-2 h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Decision Statistics</h3>
          <div className="flex-1 min-h-0 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Approved', value: approvedCount },
                      { name: 'Rejected', value: rejectedCount },
                      { name: 'Pending', value: pendingQuotations.length }
                    ]} 
                    innerRadius="65%" 
                    outerRadius="90%" 
                    paddingAngle={4} 
                    dataKey="value" 
                    strokeWidth={0}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4 pl-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">Approved</span>
                <span className="text-sm font-black text-white ml-auto">{approvedCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">Rejected</span>
                <span className="text-sm font-black text-white ml-auto">{rejectedCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">Pending</span>
                <span className="text-sm font-black text-white ml-auto">{pendingQuotations.length}</span>
              </div>
            </div>
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
            placeholder="Search by vendor, reference or category..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Approval Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className={sharedStyles.tableHeader}>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Quotation ID</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Vendor</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Delivery</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Submitted</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pendingQuotations.map((quotation) => {
                const vendor = vendors.find(v => v.id === quotation.vendorId);
                return (
                  <tr key={quotation.id} className={sharedStyles.tableRow}>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-indigo-400">QT-{quotation.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-white">{vendor?.name}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black">{vendor?.category}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-white">${quotation.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white/70">{quotation.deliveryDays} Days</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white/70">{new Date(quotation.submittedAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => updateQuotationStatus(quotation.id, 'approved')}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-[10px] font-black text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest border border-emerald-500/20">
                          Approve
                        </button>
                        <button 
                          onClick={() => updateQuotationStatus(quotation.id, 'rejected')}
                          className="px-4 py-1.5 rounded-lg bg-rose-500/10 text-[10px] font-black text-rose-400 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest border border-rose-500/20">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pendingQuotations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <p className="text-sm font-bold text-white/30 uppercase tracking-widest">No pending approvals found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleContainer>
  );
}
