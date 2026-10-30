import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CreditCard,
  Layers,
  Crown,
  Tag,
  Share2,
  Headphones,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

interface AdminSidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  pendingDepositsCount?: number;
  pendingOrdersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute,
  navigate,
  pendingDepositsCount = 0,
  pendingOrdersCount = 0,
}) => {
  const adminNav = [
    { label: 'Admin Dashboard', route: '/admin', icon: LayoutDashboard },
    { label: 'User Management', route: '/admin/users', icon: Users },
    {
      label: 'Order Management',
      route: '/admin/orders',
      icon: ShoppingCart,
      count: pendingOrdersCount,
      countColor: 'bg-amber-500 text-black',
    },
    {
      label: 'Deposit Verification',
      route: '/admin/deposits',
      icon: CreditCard,
      count: pendingDepositsCount,
      countColor: 'bg-cyan-400 text-black animate-pulse',
    },
    { label: 'Service Management', route: '/admin/services', icon: Layers },
    { label: 'VIP Membership Plans', route: '/admin/vip', icon: Crown },
    { label: 'Promo Code System', route: '/admin/promo-codes', icon: Tag },
    { label: 'Referral & Rewards', route: '/admin/referrals', icon: Share2 },
    { label: 'Support Tickets', route: '/admin/support', icon: Headphones },
    { label: 'Reports & Analytics', route: '/admin/reports', icon: BarChart3 },
    { label: 'Website Settings', route: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0710]/95 border-r border-rose-500/20 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-5">
        {/* Admin Badge */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-purple-950/40 border border-amber-500/30">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Admin Command Center
              </p>
              <p className="text-[10px] text-slate-400">ROMAN SMM MASTER ACCESS</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Admin Management
          </p>
          {adminNav.map((item, idx) => {
            const Icon = item.icon;
            const isActive =
              currentRoute === item.route ||
              (item.route !== '/admin' && currentRoute.startsWith(item.route));

            return (
              <button
                key={idx}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-900/30 text-rose-200 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      item.countColor || 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Switch back to user panel */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 transition-colors shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Dashboard
        </button>
      </div>
    </aside>
  );
};
