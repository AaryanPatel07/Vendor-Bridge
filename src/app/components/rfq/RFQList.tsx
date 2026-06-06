import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ModuleContainer, PageHeader, KPICard, sharedStyles } from '../ui/ModuleShared';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const FilterIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const COLORS = ['#6366f1', '#a855f7', '#f59e0b', '#10b981'];

export default function RFQList() {
  const { rfqs, vendors } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const rfqKPIs = [
    { label: 'Total RFQs', value: rfqs.length, trend: '+12%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { label: 'Open RFQs', value: rfqs.filter(r => r.status === 'open').length, trend: '+5%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Avg Responses', value: '4.2', trend: '+0.8', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> },
    { label: 'Savings Opportunity', value: '$240K', trend: '+18%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  const statusDistribution = [
    { name: 'Open', value: rfqs.filter(r => r.status === 'open').length },
    { name: 'Draft', value: rfqs.filter(r => r.status === 'draft').length },
    { name: 'Closed', value: rfqs.filter(r => r.status === 'closed').length },
  ];

  return (
    <ModuleContainer>
      <PageHeader 
        title="Request for Quotations (RFQs)"
        description="Launch and manage strategic sourcing events to optimize procurement costs."
        primaryAction={{
          label: "Create RFQ",
          onClick: () => navigate('/rfq/create'),
          icon: <AddIcon />
        }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rfqKPIs.map((kpi, idx) => (
          <KPICard key={kpi.label} {...kpi} index={idx} />
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sharedStyles.card + " h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">RFQ Status Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} innerRadius="65%" outerRadius="90%" paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {statusDistribution.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={sharedStyles.card + " lg:col-span-2 h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">RFQ Activity (Last 30 Days)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{name: 'W1', rfqs: 4}, {name: 'W2', rfqs: 7}, {name: 'W3', rfqs: 5}, {name: 'W4', rfqs: 8}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="rfqs" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
            placeholder="Search by RFQ title, ID or category..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-black text-white/60 focus:outline-none hover:bg-white/10 transition-all cursor-pointer">
            <option>All Statuses</option>
            <option>Open</option>
            <option>Draft</option>
            <option>Closed</option>
          </select>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <FilterIcon />
          </button>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className={sharedStyles.tableHeader}>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">RFQ ID</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Title</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Items</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Deadline</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Assigned Vendors</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className={sharedStyles.tableRow}>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-indigo-400">RFQ-{rfq.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-white">{rfq.title}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">Strategic Event</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={sharedStyles.badge}>{rfq.items.length} item(s)</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-white/70">{rfq.deadline}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex -space-x-2 overflow-hidden">
                      {rfq.assignedVendors.map(vendorId => {
                        const vendor = vendors.find(v => v.id === vendorId);
                        return (
                          <div key={vendorId} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#1a1a2e] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white" title={vendor?.name}>
                            {vendor?.name.charAt(0)}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={sharedStyles.statusBadge(rfq.status === 'open' ? 'emerald' : rfq.status === 'closed' ? 'rose' : 'slate')}>
                      {rfq.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => navigate(`/quotations/compare/${rfq.id}`)}
                      className="px-4 py-1.5 rounded-lg text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleContainer>
  );
}
