import { useData } from '../../context/DataContext';
import { ModuleContainer, PageHeader, KPICard, sharedStyles } from '../ui/ModuleShared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#f59e0b', '#10b981', '#ef4444'];

export default function Reports() {
  const { vendors, rfqs, quotations, purchaseOrders, invoices } = useData();

  const totalSpend = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const avgOrderValue = purchaseOrders.length > 0
    ? purchaseOrders.reduce((sum, po) => sum + po.total, 0) / purchaseOrders.length
    : 0;

  const reportKPIs = [
    { label: 'Annual Spend', value: `$${(totalSpend / 1000).toFixed(1)}K`, trend: '+12%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Avg Order Value', value: `$${(avgOrderValue / 1000).toFixed(1)}K`, trend: '+4%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { label: 'Sourcing Savings', value: '18.4%', trend: '+2.1%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { label: 'Compliance Rate', value: '96.8%', trend: '+0.5%', trendUp: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.955 11.955 0 01-8.618 3.04M12 21.48a11.952 11.952 0 008.618-3.04M12 21.48a11.952 11.952 0 01-8.618-3.04" /></svg> },
  ];

  const vendorCategories = vendors.reduce((acc, vendor) => {
    acc[vendor.category] = (acc[vendor.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(vendorCategories).map(([name, value]) => ({
    name,
    value,
  }));

  const spendingData = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 19000 },
    { month: 'Mar', amount: 15000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 22000 },
    { month: 'Jun', amount: totalSpend },
  ];

  return (
    <ModuleContainer>
      <PageHeader 
        title="Procurement Reports"
        description="Comprehensive analytics and performance tracking for strategic procurement decisions."
        primaryAction={{
          label: "Export Full Report",
          onClick: () => {},
          icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportKPIs.map((kpi, idx) => (
          <KPICard key={kpi.label} {...kpi} index={idx} />
        ))}
      </div>

      {/* Analytics Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={sharedStyles.card + " lg:col-span-2 h-[360px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Spending Trend Analysis</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="reportSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="amount" stroke="#a855f7" fillOpacity={1} fill="url(#reportSpend)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={sharedStyles.card + " h-[360px]"}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Category Allocation</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius="65%" outerRadius="90%" paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {categoryData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Row 2 - Table & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={sharedStyles.card}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Top Performing Vendors</h3>
          <div className="space-y-4">
            {vendors.slice(0, 5).map((vendor) => {
              const vendorQuotations = quotations.filter(q => q.vendorId === vendor.id);
              const approvedCount = vendorQuotations.filter(q => q.status === 'approved').length;
              const winRate = ((approvedCount / (vendorQuotations.length || 1)) * 100).toFixed(0);

              return (
                <div key={vendor.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">{vendor.name}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{vendor.category} • Rating: {vendor.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-400">{winRate}% Win Rate</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{vendorQuotations.length} Quotes</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={sharedStyles.card}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Procurement Status Overview</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { n: 'RFQs', v: rfqs.length },
                { n: 'Quotations', v: quotations.length },
                { n: 'PO', v: purchaseOrders.length },
                { n: 'Invoices', v: invoices.length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="n" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="v" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
}
