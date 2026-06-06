const BASE = 24;   // RFQs Created
const QUOTES = 87; // Quotations Received
const REVIEW = 31; // Under Review
const APPROVED = 18;
const PO = 14;

const stages = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'RFQs Created',
    count: BASE,
    metric: '100% baseline',
    color: '#6366f1',
    accent: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.35)',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    label: 'Quotations Received',
    count: QUOTES,
    metric: `Avg ${(QUOTES / BASE).toFixed(1)} per RFQ`,
    color: '#8b5cf6',
    accent: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.35)',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    label: 'Under Review',
    count: REVIEW,
    metric: 'Currently evaluating',
    color: '#f59e0b',
    accent: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.35)',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Approved',
    count: APPROVED,
    metric: `${Math.round((APPROVED / BASE) * 100)}% conversion`,
    color: '#10b981',
    accent: 'rgba(16,185,129,0.15)',
    border: 'rgba(16,185,129,0.35)',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    label: 'PO Issued',
    count: PO,
    metric: `${Math.round((PO / BASE) * 100)}% conversion`,
    color: '#0ea5e9',
    accent: 'rgba(14,165,233,0.15)',
    border: 'rgba(14,165,233,0.35)',
  },
];

export default function RFQLifecycle() {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {/* Summary banner */}
      <div
        className="rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <svg className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-indigo-200 leading-tight">
          <span className="font-semibold text-white">{BASE} RFQs</span> generated{' '}
          <span className="font-semibold text-white">{QUOTES} quotations</span> resulting in{' '}
          <span className="font-semibold text-white">{APPROVED} approvals</span> and{' '}
          <span className="font-semibold text-white">{PO} purchase orders</span> this quarter.
        </p>
      </div>

      {/* Pipeline */}
      <div className="flex items-stretch gap-0">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex items-stretch flex-1 min-w-0">

            {/* Stage card */}
            <div
              className="flex-1 rounded-xl p-3 flex flex-col gap-1 cursor-default transition-all duration-200 min-w-0"
              style={{ background: stage.accent, border: `1px solid ${stage.border}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = stage.accent.replace('0.15', '0.25'); }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = stage.accent; }}
            >
              {/* Icon + label row */}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stage.color}25`, color: stage.color }}
                >
                  {stage.icon}
                </span>
                <span className="text-xs text-white/60 font-medium truncate leading-tight">{stage.label}</span>
              </div>

              {/* Count */}
              <p className="text-2xl font-extrabold text-white leading-none pl-0.5">{stage.count}</p>

              {/* Metric */}
              <p className="text-xs leading-tight pl-0.5" style={{ color: stage.color }}>{stage.metric}</p>

              {/* Progress bar relative to base */}
              <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((stage.count / (i === 1 ? QUOTES : BASE)) * 100))}%`,
                    background: stage.color,
                  }}
                />
              </div>
            </div>

            {/* Connector arrow */}
            {i < stages.length - 1 && (
              <div className="flex items-center justify-center w-6 flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
