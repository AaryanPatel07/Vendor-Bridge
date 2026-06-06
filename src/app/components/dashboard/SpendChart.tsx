import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { spendChartData } from './mockData';

const total = spendChartData.reduce((s, d) => s + d.value, 0);
const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const percentage = ((d.value / total) * 100).toFixed(1);
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-2xl border backdrop-blur-md" 
         style={{ 
           background: 'rgba(15, 23, 42, 0.9)', 
           borderColor: 'rgba(255, 255, 255, 0.1)',
           color: '#fff'
         }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
        <p className="font-semibold text-white/90">{d.name}</p>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-white font-bold">{fmt(d.value)}</span>
        <span className="text-white/50">{percentage}%</span>
      </div>
    </div>
  );
};

export default function SpendChart() {
  const largestCategory = [...spendChartData].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="rounded-2xl p-6 flex flex-col h-full overflow-hidden" 
         style={{ 
           background: 'rgba(255,255,255,0.05)', 
           backdropFilter: 'blur(16px)', 
           border: '1px solid rgba(255,255,255,0.1)',
           minHeight: '420px' 
         }}>
      
      {/* Header & KPIs */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Spend Analytics</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-medium">Total Spend</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white tracking-tight">{fmt(total)}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 mt-0.5">
              <span>↑</span>
              <span>12% vs last month</span>
            </div>
          </div>
          
          <div className="flex flex-col border-l border-white/5 pl-4">
            <span className="text-[10px] text-white/40 uppercase font-medium">Categories</span>
            <span className="text-xl font-bold text-white tracking-tight">{spendChartData.length}</span>
          </div>

          <div className="flex flex-col border-l border-white/5 pl-4 overflow-hidden">
            <span className="text-[10px] text-white/40 uppercase font-medium">Largest Category</span>
            <span className="text-sm font-bold text-white truncate mt-1">{largestCategory.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content: 2 Columns */}
      <div className="flex flex-1 items-center gap-8 min-h-0">
        {/* Left: Donut Chart (Increased size) */}
        <div className="relative flex-1 h-full max-h-[240px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={spendChartData} 
                cx="50%" 
                cy="50%" 
                innerRadius="65%" 
                outerRadius="95%" 
                paddingAngle={4} 
                dataKey="value" 
                strokeWidth={0}
                animationBegin={0}
                animationDuration={1200}
              >
                {spendChartData.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-white tracking-tighter">{fmt(total)}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total</span>
          </div>
        </div>

        {/* Right: Compact Legend */}
        <div className="w-[140px] space-y-4">
          {spendChartData.map((d) => (
            <div key={d.name} className="group cursor-default">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[11px] font-medium text-white/50 group-hover:text-white/80 transition-colors truncate">
                  {d.name}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 pl-3.5">
                <span className="text-xs font-bold text-white/90">{fmt(d.value)}</span>
                <span className="text-[10px] font-medium text-white/20">|</span>
                <span className="text-[10px] font-medium text-white/40">{((d.value / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
