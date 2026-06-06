import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- Types ---
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  onClick: () => void;
}

interface SidebarSectionProps {
  label: string;
  children: React.ReactNode;
}

// --- Icons (Modern SVG) ---
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Vendors: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  RFQs: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Compare: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Approvals: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  PO: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Invoices: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Reports: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Help: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

// --- Sub-components ---

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25' 
        : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-200/50 hover:translate-x-1'
    }`}
  >
    <div className={`flex-shrink-0 transition-colors ${active ? 'text-white' : 'group-hover:text-[#1E293B]'}`}>
      {icon}
    </div>
    <span className="text-sm font-semibold tracking-tight">{label}</span>
    {active && (
      <div className="absolute inset-0 rounded-xl bg-white/10 blur-sm -z-10" />
    )}
  </button>
);

const SidebarSection: React.FC<SidebarSectionProps> = ({ label, children }) => (
  <div className="space-y-1.5">
    <h3 className="px-4 text-[10px] font-black text-[#64748B]/50 uppercase tracking-[0.2em] mb-2">{label}</h3>
    <div className="space-y-0.5">{children}</div>
  </div>
);

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuGroups = [
    {
      label: 'Main',
      items: [
        { text: 'Dashboard', icon: <Icons.Dashboard />, path: '/' },
        { text: 'Vendors', icon: <Icons.Vendors />, path: '/vendors' },
        { text: 'RFQs', icon: <Icons.RFQs />, path: '/rfq' },
        { text: 'Quotation Comparison', icon: <Icons.Compare />, path: '/quotations/compare/1' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { text: 'Approvals', icon: <Icons.Approvals />, path: '/approvals' },
        { text: 'Purchase Orders', icon: <Icons.PO />, path: '/purchase-orders' },
        { text: 'Invoices', icon: <Icons.Invoices />, path: '/invoices' },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { text: 'Activity Logs', icon: <Icons.Activity />, path: '/activity' },
        { text: 'Reports', icon: <Icons.Reports />, path: '/reports' },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-[#F8FAFC] border-r border-slate-200 w-[260px] fixed left-0 top-0 z-40">
      {/* Branding Section */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg width="24" height="24" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="30" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1E293B] leading-none">VendorBridge</h2>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Procurement ERP</p>
          </div>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="h-[1px] bg-slate-200 w-full" />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar py-2">
        {menuGroups.map((group) => (
          <SidebarSection key={group.label} label={group.label}>
            {group.items.map((item) => (
              <SidebarItem
                key={item.text}
                icon={item.icon}
                label={item.text}
                path={item.path}
                active={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </SidebarSection>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center text-[#1E293B] font-bold overflow-hidden border border-slate-300">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1E293B] truncate">{user?.name || 'Aaryan Patel'}</p>
            <p className="text-[10px] font-medium text-[#64748B] truncate">Administrator</p>
          </div>
        </div>

        <div className="space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-200/50 transition-all text-xs font-semibold">
            <Icons.Settings /> Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-200/50 transition-all text-xs font-semibold">
            <Icons.Help /> Help Center
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-50/50 transition-all text-xs font-bold mt-2">
            <Icons.Logout /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-[#1E293B] shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[260px] transition-all duration-300">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
