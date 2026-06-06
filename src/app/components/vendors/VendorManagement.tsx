import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { vendorKPIs, vendorDistribution } from './vendorMockData';
import { useData } from '../../context/DataContext';

// --- Icons ---
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const ExportIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const AddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-white/10'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// --- Components ---

const gradients = [
  'linear-gradient(135deg,#6366f1,#818cf8)',
  'linear-gradient(135deg,#a855f7,#c084fc)',
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#10b981,#34d399)',
];

const KPICard = ({ label, value, trend, trendUp, icon, index }: any) => (
  <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2 group cursor-default transition-all duration-300 hover:translate-y-[-4px]" 
       style={{ 
         background: 'rgba(255,255,255,0.05)', 
         border: '1px solid rgba(255,255,255,0.1)', 
         backdropFilter: 'blur(16px)',
         animation: `fadeUp 0.5s ease ${index * 0.1}s both`
       }}>
    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ background: gradients[index % 4] }} />
    
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: gradients[index % 4] }}>
        {icon === 'vendors' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        {icon === 'active' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        {icon === 'preferred' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>}
        {icon === 'rating' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    </div>
    <div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-2xl border backdrop-blur-md" 
         style={{ background: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
        <p className="font-semibold text-white/90">{d.name}</p>
      </div>
      <p className="text-white font-bold">{d.value} Vendors</p>
    </div>
  );
};

export default function VendorManagement() {
  const { vendors, addVendor } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'IT Services',
    gst: '',
    status: 'active' as const,
    rating: 4.0
  });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    addVendor({
      ...newVendor,
      responseTime: '2.5h',
      ordersWon: 0,
      onTimeDelivery: 100,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newVendor.name}`
    });
    setIsModalOpen(false);
    setNewVendor({
      name: '',
      email: '',
      phone: '',
      category: 'IT Services',
      gst: '',
      status: 'active',
      rating: 4.0
    });
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 space-y-6 min-h-screen relative" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ animation: 'fadeUp 0.4s ease' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Vendor Management</h1>
          <p className="text-sm text-white/60 font-medium">Strategic sourcing and supplier relationship management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-bold hover:bg-white/10 transition-all">
            <ExportIcon /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
            <AddIcon /> Add Vendor
          </button>
        </div>
      </div>

      {/* --- KPI Section --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorKPIs.map((kpi, idx) => (
          <KPICard key={kpi.label} {...kpi} index={idx} />
        ))}
      </div>

      {/* --- Analytics Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Distribution */}
        <div className="rounded-2xl p-6 flex flex-col h-[340px]" 
             style={{ 
               background: 'rgba(255,255,255,0.05)', 
               border: '1px solid rgba(255,255,255,0.1)', 
               backdropFilter: 'blur(16px)',
               animation: 'fadeUp 0.5s ease 0.2s both'
             }}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Vendor Distribution</h3>
          <div className="flex-1 min-h-0 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vendorDistribution} innerRadius="65%" outerRadius="90%" paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {vendorDistribution.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3 pl-4">
              {vendorDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2 group cursor-default">
                  <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-125" style={{ background: d.color }} />
                  <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition-colors truncate flex-1">{d.name}</span>
                  <span className="text-[10px] font-black text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard (Spans 2 columns) */}
        <div className="lg:col-span-2 rounded-2xl p-6 flex flex-col h-[340px]" 
             style={{ 
               background: 'rgba(255,255,255,0.05)', 
               border: '1px solid rgba(255,255,255,0.1)', 
               backdropFilter: 'blur(16px)',
               animation: 'fadeUp 0.5s ease 0.3s both'
             }}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Top Vendor Performance</h3>
          <div className="flex-1 overflow-auto space-y-3 pr-2 custom-scrollbar">
            {vendors.sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5).map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group cursor-default">
                <img src={v.avatar} alt={v.name} className="w-10 h-10 rounded-lg bg-white/10 border border-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{v.name}</p>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{v.category}</p>
                </div>
                <div className="hidden md:flex flex-col items-center px-5 border-l border-white/5">
                  <span className="text-[9px] text-white/20 uppercase font-black">Resp. Time</span>
                  <span className="text-xs font-black text-white">{v.responseTime || 'N/A'}</span>
                </div>
                <div className="hidden md:flex flex-col items-center px-5 border-l border-white/5">
                  <span className="text-[9px] text-white/20 uppercase font-black">On-Time</span>
                  <span className="text-xs font-black text-emerald-400">{v.onTimeDelivery || 0}%</span>
                </div>
                <div className="flex flex-col items-end pl-5 border-l border-white/5 min-w-[70px]">
                  <div className="flex items-center gap-0.5">
                    <StarIcon filled />
                    <span className="text-xs font-black text-white">{v.rating}</span>
                  </div>
                  <span className="text-[9px] text-white/20 uppercase font-black">Rating</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Control Panel --- */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center gap-4" 
           style={{ 
             background: 'rgba(255,255,255,0.05)', 
             border: '1px solid rgba(255,255,255,0.1)',
             animation: 'fadeUp 0.5s ease 0.4s both'
           }}>
        <div className="relative flex-1 min-w-[280px]">
          <div className="absolute inset-y-0 left-3.5 flex items-center text-white/20">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            placeholder="Search by vendor name, category, or email..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-black text-white/60 focus:outline-none hover:bg-white/10 transition-all cursor-pointer">
            <option>All Categories</option>
            <option>IT Services</option>
            <option>Office Supplies</option>
            <option>Manufacturing</option>
            <option>Software</option>
            <option>Logistics</option>
          </select>
          <select className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-black text-white/60 focus:outline-none hover:bg-white/10 transition-all cursor-pointer">
            <option>Status: All</option>
            <option>Active</option>
            <option>Preferred</option>
            <option>Inactive</option>
            <option>Blacklisted</option>
          </select>
          <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <FilterIcon />
          </button>
        </div>
      </div>

      {/* --- Vendor Table --- */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col" style={{ animation: 'fadeUp 0.5s ease 0.5s both' }}>
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-white/10">
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Vendor Profile</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Industry</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Score</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">SLA Resp</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Volume</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">OTD Rate</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-4.5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="group hover:bg-indigo-500/[0.03] transition-colors cursor-default">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={vendor.avatar} alt={vendor.name} className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 object-cover" />
                        {vendor.status === 'preferred' && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-[#1a1a2e] shadow-lg">
                            <StarIcon filled />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{vendor.name}</p>
                        <p className="text-xs text-white/30 font-medium">{vendor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/50 uppercase tracking-tight group-hover:border-white/20 transition-all">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon key={s} filled={s <= Math.floor(vendor.rating)} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-white/70">{vendor.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-black text-white/80">{vendor.responseTime || '--'}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-black text-white/80">{vendor.ordersWon || 0}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`text-[11px] font-black ${vendor.onTimeDelivery && vendor.onTimeDelivery >= 95 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {vendor.onTimeDelivery || 0}%
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                        <div className={`h-full rounded-full transition-all duration-1000`} 
                             style={{ 
                               width: `${vendor.onTimeDelivery || 0}%`, 
                               backgroundColor: vendor.onTimeDelivery && vendor.onTimeDelivery >= 95 ? '#34d399' : '#fbbf24' 
                             }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                      vendor.status === 'preferred' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' :
                      vendor.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      vendor.status === 'inactive' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-all">
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">View</button>
                      <button className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* --- Pagination --- */}
        <div className="px-6 py-5 flex items-center justify-between border-t border-white/10 bg-white/[0.01]">
          <span className="text-xs text-white/20 font-medium">Showing <span className="text-white/60 font-black">1-{filteredVendors.length}</span> of <span className="text-white/60 font-black">{vendors.length}</span> strategic partners</span>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/20 hover:bg-white/10 transition-all uppercase tracking-widest disabled:opacity-30" disabled>Prev</button>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg bg-indigo-600 border border-indigo-500 text-[10px] font-black text-white">1</button>
              <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/40 hover:bg-white/10 transition-all">2</button>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 hover:bg-white/10 transition-all uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>

      {/* --- Add Vendor Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#1a1a2e] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden" style={{ animation: 'fadeUp 0.3s ease' }}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Onboard New Vendor</h2>
                <p className="text-xs text-white/40 mt-0.5">Register a new supplier to the procurement network</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleAddVendor} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Vendor Name</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Industry Category</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer" value={newVendor.category} onChange={e => setNewVendor({...newVendor, category: e.target.value})}>
                    <option>IT Services</option>
                    <option>Office Supplies</option>
                    <option>Manufacturing</option>
                    <option>Software</option>
                    <option>Logistics</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Contact Email</label>
                  <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Phone Number</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">GST/VAT Number</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" value={newVendor.gst} onChange={e => setNewVendor({...newVendor, gst: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Initial Status</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer" value={newVendor.status} onChange={e => setNewVendor({...newVendor, status: e.target.value as any})}>
                    <option value="active">Active</option>
                    <option value="preferred">Preferred</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest">Complete Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
