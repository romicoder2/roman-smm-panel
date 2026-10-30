import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { VipPlan } from '../../types';

export const VipMembership: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile, wallet, activeVipPlan, vipDaysRemaining } = useAuth();
  const { vipPlans, purchaseVipMembership } = useData();

  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPlan = async (plan: VipPlan) => {
    if (!currentUser) {
      setErrorMsg('Please sign in to select a VIP plan.');
      return;
    }

    if (activeVipPlan?.id === plan.id && plan.id !== 'vip-basic') {
      // It's a renewal
    }

    const currentBalance = wallet?.balance ?? 0;
    if (plan.price > 0 && currentBalance < plan.price) {
      setErrorMsg(
        `Insufficient wallet balance. You need Rs. ${plan.price}, but have Rs. ${currentBalance}. Please Add Funds first.`
      );
      return;
    }

    setPurchasingPlanId(plan.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await purchaseVipMembership(currentUser.uid, plan.id);
    setPurchasingPlanId(null);

    if (res.success) {
      setSuccessMsg(
        `Congratulations! ${plan.name} has been activated successfully. Your ${plan.discountPercentage}% discount is now live.`
      );
    } else {
      setErrorMsg(res.error || 'Failed to activate VIP plan.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Current VIP Status Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-950/40 via-slate-900 to-[#070a12] border border-yellow-500/30 relative overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-yellow-400" />
                Active VIP Membership
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {activeVipPlan?.name || 'Basic Member'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Automatic Discount:{' '}
              <strong className="text-yellow-300">
                {activeVipPlan?.discountPercentage || 0}% OFF
              </strong>{' '}
              on all new orders.
              {userProfile?.vipExpiry && userProfile.vipPlanId !== 'vip-basic' && (
                <span className="ml-2 text-slate-400">
                  (Expires: {new Date(userProfile.vipExpiry).toLocaleDateString()} —{' '}
                  <span className="text-cyan-300 font-bold">{vipDaysRemaining} days remaining</span>)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Available Balance</span>
              <span className="font-mono font-extrabold text-cyan-300 text-sm">
                Rs. {(wallet?.balance ?? 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => navigate('/add-funds')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold uppercase transition-all"
            >
              + Add Funds
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => navigate('/add-funds')}
            className="px-3 py-1 rounded bg-rose-500 text-black font-bold text-xs"
          >
            Deposit Funds
          </button>
        </div>
      )}

      {/* Plans Grid */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-black text-white">Choose Your Growth Tier</h2>
          <p className="text-xs text-slate-400 mt-1">
            Upgrades take effect instantly. Your wallet balance is securely debited, and normal pricing resumes automatically upon expiry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {vipPlans.map((plan) => {
            const isCurrent = activeVipPlan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-slate-900 via-[#0d162a] to-[#070a12] border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                    : isCurrent
                    ? 'bg-slate-900/90 border-2 border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                    : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-400 text-black font-black text-[10px] uppercase tracking-wider">
                    Current Active
                  </div>
                )}

                {plan.isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-400 text-black font-black text-[10px] uppercase tracking-wider">
                    Recommended
                  </div>
                )}

                <div>
                  <h3 className="text-base font-extrabold text-white">{plan.name}</h3>
                  <div className="mt-3 mb-4">
                    <span className="text-2xl font-black text-cyan-300">
                      {plan.price === 0 ? 'FREE' : `Rs. ${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-slate-400"> /{plan.durationDays} days</span>
                    )}
                  </div>

                  <div className="py-1 px-2.5 rounded bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 text-xs font-bold inline-block mb-4">
                    {plan.discountPercentage}% Discount
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
                  type="button"
                  disabled={isCurrent || purchasingPlanId === plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-default ${
                    isCurrent
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                      : plan.isPopular
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {purchasingPlanId === plan.id ? (
                    <span className="animate-pulse">Activating...</span>
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : plan.price === 0 ? (
                    'Switch to Basic'
                  ) : (
                    `Upgrade (Rs. ${plan.price})`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
