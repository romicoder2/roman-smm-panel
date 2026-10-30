import React from 'react';
import {
  Crown,
  Zap,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface LandingPageProps {
  navigate: (route: string) => void;
  openAuth: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate, openAuth }) => {
  const { currentUser } = useAuth();
  const { categories, vipPlans, systemConfig } = useData();

  return (
    <div className="min-h-screen text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Glowing backdrop ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            <span>ROMAN EMPIRE VIP SOCIAL EXPANSION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            ROMAN <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">SMM PANEL</span>
          </h1>

          <p className="mt-4 text-xl sm:text-2xl text-cyan-200/90 font-medium tracking-wide">
            {systemConfig.tagline || 'Your Social Media Growth Platform.'}
          </p>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
            The premier Pakistani SMM control center. Boost TikTok, Instagram, YouTube, Facebook, and WhatsApp Channels with verified high-retention campaigns, VIP discounts, and instant PKR payments.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {currentUser ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuth('register')}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  Create VIP Account
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
                <button
                  onClick={() => openAuth('login')}
                  className="px-8 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-white font-bold text-sm tracking-wider uppercase transition-all"
                >
                  Sign In
                </button>
              </>
            )}

            <a
              href={systemConfig.whatsappUrl || 'https://whatsapp.com/channel/0029VawwXaeEquiIR1CLXA30'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-sm tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp Channel
            </a>
          </div>

          {/* Quick Stats banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Manual Verification</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">24/7</p>
              <p className="text-xs text-slate-400 mt-1">Dedicated Support</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">PKR</p>
              <p className="text-xs text-slate-400 mt-1">JazzCash & Easypaisa</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">Up to 20%</p>
              <p className="text-xs text-slate-400 mt-1">VIP Member Discount</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-[#070a12]/60 border-y border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Why Choose Roman Empire
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Engineered for High-Retention Authentic Growth
            </p>
            <p className="text-xs text-slate-400 mt-2">
              We strictly deliver legitimate, platform-compliant distribution campaigns with zero bots and transparent progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Local Pakistani Payment Gateways</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deposit funds seamlessly with JazzCash, Easypaisa, and SadaPay directly to account <span className="text-cyan-300 font-mono">923037224620</span> (Mian Roman). Manual admin verification protects every rupee.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">5-Tier VIP Membership Club</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock automated discounts ranging from 5% up to 20% off all orders. Silver, Gold, Diamond, and Premium tiers give you priority queue execution and WhatsApp support.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">16 Comprehensive Service Categories</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                From TikTok viral boosts and Instagram Explore pushes to YouTube Watchtime and WhatsApp Channel subscribers, find the exact promotional package tailored for your audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Services Preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Service Catalog
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Top Social Media Platforms Supported
            </p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            Browse All 16 Categories & Rates
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate('/services')}
              className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/15 hover:border-cyan-400/40 cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400 font-extrabold text-xs group-hover:scale-110 transition-transform">
                  ★
                </span>
                <span className="text-[10px] text-cyan-300/80 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/30">
                  Instant Queue
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {cat.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">Verified organic placements</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#07090e]/80 border-y border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Simple 4-Step Process
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              How ROMAN SMM PANEL Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/20 absolute top-3 right-4">01</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 font-extrabold">
                1
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Create Account</h3>
              <p className="text-xs text-slate-400">
                Register in 10 seconds. Get your unique referral code and instant dashboard access.
              </p>
            </div>

            <div className="relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/20 absolute top-3 right-4">02</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 font-extrabold">
                2
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Deposit Funds</h3>
              <p className="text-xs text-slate-400">
                Send payment to JazzCash, Easypaisa, or SadaPay. Submit your TID for admin approval.
              </p>
            </div>

            <div className="relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/20 absolute top-3 right-4">03</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 font-extrabold">
                3
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Place SMM Order</h3>
              <p className="text-xs text-slate-400">
                Select your service, paste post/profile link, enter quantity with automatic discount calculation.
              </p>
            </div>

            <div className="relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/20 absolute top-3 right-4">04</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 font-extrabold">
                4
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Track Viral Growth</h3>
              <p className="text-xs text-slate-400">
                Monitor status in real-time from Pending to Completed with dedicated ticket support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-950/60 border border-yellow-600/40 text-yellow-300 text-xs font-bold mb-3">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            VIP PRIVILEGES
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            ROMAN VIP Membership Plans
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Upgrade your membership directly from your wallet balance to unlock permanent discounts and priority server queues.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {vipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 flex flex-col justify-between transition-all ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-slate-900 via-[#0d1527] to-[#070a12] border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] relative -translate-y-2'
                  : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold text-[10px] uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-base font-extrabold text-white">{plan.name}</h3>
                <div className="mt-3 mb-4">
                  <span className="text-2xl font-black text-cyan-300">
                    {plan.price === 0 ? 'FREE' : `Rs. ${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-xs text-slate-400"> /month</span>}
                </div>

                <div className="py-1 px-2.5 rounded bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 text-xs font-bold inline-block mb-4">
                  {plan.discountPercentage}% Discount on Orders
                </div>

                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  if (currentUser) navigate('/membership');
                  else openAuth('register');
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  plan.isPopular
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {plan.price === 0 ? 'Current Default' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Official WhatsApp Channel Banner */}
      <section className="py-12 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border-y border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <MessageCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Join ROMAN SMM Official WhatsApp Channel</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Stay updated with server speed notifications, free coupon codes, and priority support direct from Mian Roman.
              </p>
            </div>
          </div>
          <a
            href={systemConfig.whatsappUrl || 'https://whatsapp.com/channel/0029VawwXaeEquiIR1CLXA30'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0"
          >
            Open WhatsApp Channel
          </a>
        </div>
      </section>
    </div>
  );
};
