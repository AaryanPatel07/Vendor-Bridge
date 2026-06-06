import { vendorLeaderboard } from './mockData';

const rankColors = ['#f59e0b', '#94a3b8', '#cd7c2f', '#6366f1', '#6366f1'];
const rankLabels = ['1st', '2nd', '3rd', '4th', '5th'];

export default function VendorLeaderboard() {
  return (
    <div className="rounded-2xl p-5 flex flex-col" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Top Vendors</h2>
      <div className="space-y-2 flex-1">
        {vendorLeaderboard.map((v, i) => (
          <div
            key={v.name}
            className="flex items-center gap-3 p-2.5 rounded-xl group cursor-default transition-all duration-200"
            style={{ background: i === 0 ? 'rgba(245,158,11,0.08)' : 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = i === 0 ? 'rgba(245,158,11,0.08)' : 'transparent')}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
              style={{ background: `${rankColors[i]}20`, color: rankColors[i], border: `1px solid ${rankColors[i]}30` }}>
              {rankLabels[i]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{v.name}</p>
              <p className="text-xs text-white/40">Avg resp: {v.responseTime}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs font-bold text-yellow-400">★ {v.rating}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v.onTimeDelivery}%`, background: v.onTimeDelivery >= 95 ? '#22c55e' : v.onTimeDelivery >= 90 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <span className="text-xs text-white/50">{v.onTimeDelivery}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
