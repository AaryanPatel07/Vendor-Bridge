import { pendingActionsData } from './mockData';

const icons: Record<string, JSX.Element> = {
  approval: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  review: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  po: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
};

export default function PendingActions() {
  return (
    <div className="rounded-2xl p-5 flex flex-col" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Pending Actions</h2>
        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center" style={{ animation: 'pulse-dot 1.5s ease infinite' }}>
          {pendingActionsData.reduce((s, a) => s + a.count, 0)}
        </span>
      </div>

      <div className="space-y-2 flex-1">
        {pendingActionsData.map((a, i) => (
          <div
            key={a.label}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}20`, color: a.color }}>
              {icons[a.icon]}
            </div>
            <p className="text-xs font-medium text-white/70 flex-1 leading-tight group-hover:text-white transition-colors">{a.label}</p>
            <span className="text-sm font-extrabold flex-shrink-0" style={{ color: a.color }}>{a.count}</span>
          </div>
        ))}
      </div>

      <button
        className="mt-4 w-full text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 text-white"
        style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Review All Pending →
      </button>
    </div>
  );
}
