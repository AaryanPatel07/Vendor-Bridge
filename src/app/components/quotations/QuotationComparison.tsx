import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ModuleContainer, PageHeader, KPICard, sharedStyles } from '../ui/ModuleShared';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CheckIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const TrendingDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-white/10'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export default function QuotationComparison() {
  const { rfqId } = useParams();
  const { rfqs, quotations, vendors, updateQuotationStatus } = useData();
  const navigate = useNavigate();

  const rfq = rfqs.find(r => r.id === rfqId);
  const rfqQuotations = quotations.filter(q => q.rfqId === rfqId);

  const lowestPrice = Math.min(...rfqQuotations.map(q => q.totalAmount));

  const comparisonKPIs = [
    { label: 'Total Bids', value: rfqQuotations.length, trend: 'Received', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { label: 'Lowest Bid', value: `$${(lowestPrice / 1000).toFixed(1)}K`, trend: '-15% vs Avg', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { label: 'Avg Delivery', value: '4.5 Days', trend: 'Optimal', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Savings Est.', value: '$4.2K', trend: 'Projected', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  if (!rfq) return <ModuleContainer><PageHeader title="RFQ Not Found" description="The requested RFQ could not be located." /></ModuleContainer>;

  return (
    <ModuleContainer>
      <PageHeader 
        title="Quotation Comparison"
        description={`Analyzing ${rfqQuotations.length} responses for: ${rfq.title}`}
        secondaryAction={{
          label: "Back to RFQs",
          onClick: () => navigate('/rfq'),
          icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisonKPIs.map((kpi, idx) => (
          <KPICard key={kpi.label} {...kpi} index={idx} />
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sharedStyles.card + " lg:col-span-2 h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Price Comparison Matrix</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rfqQuotations.map(q => ({ name: vendors.find(v => v.id === q.vendorId)?.name.split(' ')[0], price: q.totalAmount }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="price" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={sharedStyles.card + " h-[340px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Decision Weightage</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Price', A: 120 }, { subject: 'Quality', A: 98 }, { subject: 'Delivery', A: 86 }, { subject: 'Service', A: 99 }, { subject: 'Risk', A: 85 }
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Radar name="Criteria" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className={sharedStyles.tableHeader}>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Vendor</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Bid Amount</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Lead Time</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Vendor Quality</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rfqQuotations.map((quotation) => {
                const vendor = vendors.find(v => v.id === quotation.vendorId);
                const isLowest = quotation.totalAmount === lowestPrice;

                return (
                  <tr key={quotation.id} className={sharedStyles.tableRow + (isLowest ? " bg-indigo-500/[0.05]" : "")}>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-white">{vendor?.name}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black">{vendor?.category}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLowest && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">Lowest Bid</span>}
                        <span className="text-sm font-black text-white">${quotation.totalAmount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-white/70">{quotation.deliveryDays} Days</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon key={s} filled={s <= Math.floor(vendor?.rating || 0)} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={sharedStyles.statusBadge(quotation.status === 'approved' ? 'emerald' : quotation.status === 'rejected' ? 'rose' : 'slate')}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {quotation.status === 'pending' && (
                        <button 
                          onClick={() => { updateQuotationStatus(quotation.id, 'approved'); navigate('/approvals'); }}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 text-[10px] font-black text-white hover:bg-indigo-500 transition-all uppercase tracking-widest">
                          Select & Approve
                        </button>
                      )}
                      {quotation.status === 'approved' && (
                        <button 
                          onClick={() => navigate('/purchase-orders')}
                          className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                          Create PO
                        </button>
                      )}
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
