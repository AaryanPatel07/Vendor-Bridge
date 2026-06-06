import { useEffect, useState } from 'react';
import KPICards from './KPICards';
import RFQLifecycle from './RFQLifecycle';
import VendorLeaderboard from './VendorLeaderboard';
import RFQTable from './RFQTable';
import SpendChart from './SpendChart';
import PendingActions from './PendingActions';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-indigo-300 text-xs tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen p-5 space-y-5" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* ── Header ── */}
      <div
        className="rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
        style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeUp 0.4s ease' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Procurement Command Center</h1>
            <p className="text-xs text-indigo-300 mt-0.5">VendorBridge ERP · FY 2025 Q3</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulse-dot 1.5s ease infinite' }} />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
          <LiveClock />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-indigo-300" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Jul 2025
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
        <KPICards />
      </div>

      {/* ── Lifecycle ── */}
      <div style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}>
        <RFQLifecycle />
      </div>

      {/* ── Analytics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
        <SpendChart />
        <VendorLeaderboard />
        <PendingActions />
      </div>

      {/* ── Table ── */}
      <div style={{ animation: 'fadeUp 0.5s ease 0.25s both' }}>
        <RFQTable />
      </div>

      {/* ── Footer ── */}
      <div className="text-center pb-2">
        <p className="text-xs text-indigo-400/50">VendorBridge ERP · Hackathon Build · All data is mock</p>
      </div>

    </div>
  );
}
