import React from 'react';

// --- Types ---
export interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  index: number;
}

export interface PageHeaderProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

// --- Shared Styles ---
export const sharedStyles = {
  container: "p-6 space-y-6 min-h-screen relative",
  background: { background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  card: "rounded-2xl p-6 flex flex-col backdrop-blur-xl border border-white/10 bg-white/[0.05]",
  tableHeader: "sticky top-0 z-10 bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-white/10",
  tableRow: "group hover:bg-indigo-500/[0.03] transition-colors cursor-default",
  badge: "px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-tight",
  statusBadge: (color: string) => `inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border bg-${color}-500/10 text-${color}-400 border-${color}-500/20 shadow-[0_0_15px_rgba(0,0,0,0.1)]`,
  scrollbar: `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
  `
};

const gradients = [
  'linear-gradient(135deg,#6366f1,#818cf8)',
  'linear-gradient(135deg,#a855f7,#c084fc)',
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#10b981,#34d399)',
];

// --- Components ---

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, primaryAction, secondaryAction }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
    <div>
      <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>
      <p className="text-sm text-white/60 font-medium">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      {secondaryAction && (
        <button 
          onClick={secondaryAction.onClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-bold hover:bg-white/10 transition-all">
          {secondaryAction.icon} {secondaryAction.label}
        </button>
      )}
      {primaryAction && (
        <button 
          onClick={primaryAction.onClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
          {primaryAction.icon} {primaryAction.label}
        </button>
      )}
    </div>
  </div>
);

export const KPICard: React.FC<KPICardProps> = ({ label, value, trend, trendUp, icon, index }) => (
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
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

export const ModuleContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={sharedStyles.container} style={sharedStyles.background}>
    {children}
    <style jsx>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      ${sharedStyles.scrollbar}
    `}</style>
  </div>
);
