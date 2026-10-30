import React, { useState } from 'react';
import {
  Crown,
  Wallet,
  Bell,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, openAuth }) => {
  const { currentUser, userProfile, wallet, isAdmin, activeVipPlan, unreadNotifsCount, logout } = useAuth();
  const { systemConfig } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#07090e]/90 backdrop-blur-md border-b border-cyan-500/20">
      {/* Announcement bar if active */}
      {systemConfig.announcement && (
        <div className="bg-gradient-to-r from-blue-900/60 via-cyan-900/40 to-blue-900/60 border-b border-cyan-500/20 px-4 py-1.5 text-xs text-center text-cyan-200 font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <span className="truncate max-w-4xl">{systemConfig.announcement}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-900 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">ROMAN</span>
                <span className="font-bold text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">SMM</span>
              </div>
              <p className="text-[10px] text-cyan-400/80 font-semibold tracking-widest uppercase">
                {systemConfig.brandName || 'ROMAN EMPIRE'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNav('/')}
              className={`text-sm font-medium transition-colors ${
                currentRoute === '/' ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/services')}
              className={`text-sm font-medium transition-colors ${
                currentRoute === '/services' ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNav('/membership')}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentRoute === '/membership' ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 text-yellow-400" />
              VIP Plans
            </button>
            <a
              href={systemConfig.whatsappUrl || 'https://whatsapp.com/channel/0029VawwXaeEquiIR1CLXA30'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              WhatsApp Channel
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {currentUser && (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className={`text-sm font-medium transition-colors ${
                    currentRoute.startsWith('/dashboard') ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('/new-order')}
                  className={`text-sm font-medium transition-colors text-cyan-300 flex items-center gap-1 ${
                    currentRoute === '/new-order' ? 'text-cyan-400 font-semibold' : 'hover:text-cyan-200'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  New Order
                </button>
              </>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Admin Button if Admin */}
                {isAdmin && (
                  <button
                    onClick={() => handleNav(currentRoute.startsWith('/admin') ? '/dashboard' : '/admin')}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                      currentRoute.startsWith('/admin')
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'bg-gradient-to-r from-rose-600/30 to-amber-600/30 border-amber-500/50 text-amber-300 hover:border-amber-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    {currentRoute.startsWith('/admin') ? 'Exit Admin' : 'Admin Panel'}
                  </button>
                )}

                {/* Wallet Balance Pill */}
                <button
                  onClick={() => handleNav('/add-funds')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                  title="Add Funds"
                >
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-cyan-300/80 leading-none">Balance</span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      Rs. {(wallet?.balance ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-cyan-400 text-xs font-bold bg-cyan-500/20 rounded px-1">+</span>
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={() => handleNav('/notifications')}
                  className="relative p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-black text-black flex items-center justify-center shadow-[0_0_8px_#06b6d4]">
                      {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/40 text-slate-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-xs text-white">
                      {userProfile?.username?.charAt(0).toUpperCase() || 'R'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0b0f19] border border-cyan-500/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-xs font-bold text-white truncate">{userProfile?.fullName || 'User'}</p>
                        <p className="text-[11px] text-cyan-400 truncate">@{userProfile?.username}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {activeVipPlan?.name || 'Basic Member'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => handleNav('/dashboard')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded-lg flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => handleNav('/new-order')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded-lg flex items-center gap-2"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                          New Order
                        </button>
                        <button
                          onClick={() => handleNav('/orders')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded-lg flex items-center gap-2"
                        >
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          Order History
                        </button>
                        <button
                          onClick={() => handleNav('/wallet')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded-lg flex items-center gap-2"
                        >
                          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                          My Wallet
                        </button>
                        <button
                          onClick={() => handleNav('/membership')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded-lg flex items-center gap-2"
                        >
                          <Crown className="w-3.5 h-3.5 text-yellow-400" />
                          VIP Membership
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleNav('/admin')}
                            className="w-full text-left px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-950/40 rounded-lg flex items-center gap-2 font-bold"
                          >
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            Admin Panel
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={async () => {
                            await logout();
                            handleNav('/');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07090e] border-b border-cyan-500/20 px-4 py-4 space-y-3">
          <button
            onClick={() => handleNav('/')}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-cyan-400"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('/services')}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-cyan-400"
          >
            Services Catalog
          </button>
          <button
            onClick={() => handleNav('/membership')}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-cyan-400"
          >
            VIP Membership
          </button>
          {currentUser && (
            <>
              <button
                onClick={() => handleNav('/dashboard')}
                className="w-full text-left py-2 text-sm text-cyan-300 font-semibold"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNav('/new-order')}
                className="w-full text-left py-2 text-sm text-cyan-400 font-bold"
              >
                + New Order
              </button>
              <button
                onClick={() => handleNav('/add-funds')}
                className="w-full text-left py-2 text-sm text-slate-200"
              >
                Add Funds (JazzCash/Easypaisa/SadaPay)
              </button>
              <button
                onClick={() => handleNav('/orders')}
                className="w-full text-left py-2 text-sm text-slate-200"
              >
                Order History
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full text-left py-2 text-sm text-amber-400 font-bold"
                >
                  Admin Control Panel
                </button>
              )}
            </>
          )}
          <a
            href={systemConfig.whatsappUrl || 'https://whatsapp.com/channel/0029VawwXaeEquiIR1CLXA30'}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-2 text-sm text-emerald-400 font-medium"
          >
            Join WhatsApp Channel
          </a>
        </div>
      )}
    </nav>
  );
};
