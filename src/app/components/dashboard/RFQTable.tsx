import { rfqTableData } from './mockData';

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  Open:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  dot: '#60a5fa' },
  Comparing: { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', dot: '#c084fc' },
  Approved:  { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  dot: '#4ade80' },
  Closed:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', dot: '#94a3b8' },
};

export default function RFQTable() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">RFQ Management</h2>
        <span className="text-xs text-indigo-300/60">{rfqTableData.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-white/30 uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['RFQ', 'Category', 'Invited', 'Received', 'Deadline', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rfqTableData.map((row, i) => {
              const s = statusConfig[row.status];
              return (
                <tr
                  key={row.id}
                  className="transition-all duration-150 cursor-default"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white text-sm">{row.name}</p>
                    <p className="text-xs text-white/30">{row.id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-white/50 text-xs">{row.category}</td>
                  <td className="px-5 py-3.5 text-center text-white/60 font-medium">{row.vendorsInvited}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`font-bold ${row.quotationsReceived === row.vendorsInvited ? 'text-green-400' : 'text-white/60'}`}>
                      {row.quotationsReceived}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/40 text-xs whitespace-nowrap">{row.deadline}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
