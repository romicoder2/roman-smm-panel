import React from 'react';
import { Crown, MessageCircle, ShieldCheck, Zap, Heart } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Footer: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { systemConfig } = useData();

  return (
    <footer className="border-t border-cyan-500/10 bg-[#05070c] text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-white">ROMAN SMM</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Premier Social Media Growth Platform. Verified manual order fulfillment, VIP priority execution, and dedicated 24/7 service.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              ROMAN EMPIRE Certified Quality
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition-colors">
                  Home Landing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-cyan-400 transition-colors">
                  Service Catalog & Rates
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/membership')} className="hover:text-cyan-400 transition-colors">
                  VIP Membership Plans
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/add-funds')} className="hover:text-cyan-400 transition-colors">
                  Deposit Funds (PKR)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/support')} className="hover:text-cyan-400 transition-colors">
                  Support Tickets
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Accepted Payments</h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex justify-between items-center text-slate-200 font-semibold mb-1">
                  <span>JazzCash / Easypaisa / SadaPay</span>
                  <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 bg-cyan-950/60 rounded border border-cyan-800/40">Manual</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Account No: <span className="text-cyan-300 font-mono font-bold">{systemConfig.paymentJazzCash || '923037224620'}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Account Holder: <span className="text-slate-200 font-medium">{systemConfig.accountHolder || 'Mian Roman'}</span>
                </p>
              </div>
              <p className="text-[10px] text-slate-400">
                Instant verification after uploading payment screenshot and Transaction ID (TID).
              </p>
            </div>
          </div>

          {/* Official Channel */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Official Community</h4>
            <p className="text-xs text-slate-400 mb-3">
              Join the official Roman Empire WhatsApp broadcast for daily bonuses, promotional vouchers & server updates.
            </p>
            <a
              href={systemConfig.whatsappUrl || 'https://whatsapp.com/channel/0029VawwXaeEquiIR1CLXA30'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Join WhatsApp Channel
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} ROMAN SMM PANEL — ROMAN EMPIRE. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Zap className="w-3 h-3 text-cyan-400 inline" /> for maximum viral reach & high retention
          </p>
        </div>
      </div>
    </footer>
  );
};
