import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  CreditCard,
  Wallet,
  Clock,
  Compass,
  History,
  Crown,
  Tag,
  Share2,
  Bell,
  Headphones,
  User,
  KeyRound,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserSidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openPasswordModal?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ currentRoute, navigate, openPasswordModal }) => {
  const { userProfile, wallet, activeVipPlan, unreadNotifsCount, isAdmin, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'New Order', route: '/new-order', icon: PlusCircle, highlight: true },
    { label: 'Services', route: '/services', icon: Layers },
    { label: 'Add Funds', route: '/add-funds', icon: CreditCard },
    { label: 'My Wallet', route: '/wallet', icon: Wallet },
    { label: 'Order History', route: '/orders', icon: Clock },
    { label: 'Track Orders', route: '/orders', icon: Compass },
    { label: 'Deposit History', route: '/deposits', icon: History },
    { label: 'VIP Membership', route: '/membership', icon: Crown, badge: activeVipPlan?.name },
    { label: 'Promo Codes', route: '/promo-codes', icon: Tag },
    { label: 'Refer & Earn', route: '/refer', icon: Share2 },
    { label: 'Notifications', route: '/notifications', icon: Bell, count: unreadNotifsCount },
    { label: 'Support Tickets', route: '/support', icon: Headphones },
    { label: 'Profile Settings', route: '/profile', icon: User },
    { label: 'Change Password', action: 'password', icon: KeyRound },
  ];

  return (
    <aside className="w-64 bg-[#070a12]/95 border-r border-cyan-500/15 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* User Mini Profile Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900/90 to-[#0b0f19] border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              {userProfile?.username?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-white truncate">{userProfile?.fullName || 'VIP Member'}</p>
              <p className="text-[11px] text-cyan-400 truncate">@{userProfile?.username}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Balance:</span>
            <span className="font-extrabold text-cyan-300">
              Rs. {(wallet?.balance ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Tier:</span>
            <span className="text-yellow-400 font-semibold flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-400" />
              {activeVipPlan?.name || 'Basic'}
            </span>
          </div>
        </div>

        {/* Menu list */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Panel Navigation
          </p>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.action === 'password') {
                    if (openPasswordModal) openPasswordModal();
                    else navigate('/profile');
                  } else if (item.route) {
                    navigate(item.route);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : item.highlight
                    ? 'text-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : item.highlight ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-[10px] font-extrabold text-black">
                    {item.count}
                  </span>
                )}

                {item.badge && item.badge !== 'Basic Member' && (
                  <span className="text-[10px] text-yellow-300 font-bold px-1.5 py-0.5 rounded bg-yellow-950/60 border border-yellow-700/50">
                    VIP
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-600/40 hover:bg-amber-900/50 transition-colors"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            Admin Control Panel
          </button>
        )}

        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
