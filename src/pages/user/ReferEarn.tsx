import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Gift,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserProfile } from '../../types';

export const ReferEarn: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referredUsers, setReferredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const referralCode = userProfile?.referralCode || 'ROMAN-VIP';
  const referralUrl = `${window.location.origin}/?ref=${referralCode}`;

  useEffect(() => {
    if (!referralCode) return;

    // Listen to users who signed up with this code
    const refQuery = query(
      collection(db, 'users'),
      where('referredBy', '==', referralCode)
    );

    const unsubs = onSnapshot(refQuery, (snap) => {
      setReferredUsers(snap.docs.map((d) => d.data() as UserProfile));
      setLoading(false);
    });

    return () => unsubs();
  }, [referralCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-cyan-400" />
            Refer & Earn Rewards
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Invite fellow creators, agencies, and social influencers to ROMAN SMM PANEL and earn wallet credits.
          </p>
        </div>
      </div>

      {/* Hero Banner with Code & Link */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-[#070a12] border border-purple-500/30 relative overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.15)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-3">
              <Gift className="w-3.5 h-3.5 text-purple-400" />
              AFFILIATE PROGRAM
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Share Your Roman Empire Referral Code
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              When your referred friend signs up and completes their first verified deposit or order, bonus PKR rewards are credited automatically to your wallet.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-purple-500/30">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Your Referral Code
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-mono font-black text-cyan-300 tracking-wider">
                  {referralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Shareable Link
              </span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-extrabold uppercase shrink-0"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
          <p className="text-xs text-slate-400">Total Referrals</p>
          <p className="text-2xl font-black text-white mt-1">{referredUsers.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
          <p className="text-xs text-slate-400">Successful Qualified</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {referredUsers.filter((u) => u.vipPlanId && u.vipPlanId !== 'vip-basic').length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
          <p className="text-xs text-slate-400">Pending Qualification</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {referredUsers.filter((u) => !u.vipPlanId || u.vipPlanId === 'vip-basic').length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 text-center">
          <p className="text-xs text-slate-400">Reward Rate</p>
          <p className="text-2xl font-black text-purple-400 mt-1">5% PKR</p>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="glass-card rounded-2xl border border-cyan-500/20 overflow-hidden p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Referred Users History
        </h3>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">Loading referral history...</p>
        ) : referredUsers.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <p>No referrals yet. Share your link with friends to start earning rewards!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Registered Date</th>
                  <th className="py-2.5 px-3">VIP Tier</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {referredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-semibold text-white">@{u.username}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-yellow-300">{u.vipPlanId || 'Basic'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                        Active Friend
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
