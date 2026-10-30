import React, { useState, useEffect } from 'react';
import { Share2, Users, CheckCircle2, Gift, Search, Award } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserProfile } from '../../types';

export const AdminReferrals: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => d.data() as UserProfile));
      setLoading(false);
    });
    return () => unsubs();
  }, []);

  const referredUsers = users.filter((u) => Boolean(u.referredBy));

  const filteredReferred = referredUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (u.referredBy && u.referredBy.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-rose-400" />
            Referral & Affiliate Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor user affiliate relationships, qualifying referred deposits, and reward distributions.
          </p>
        </div>

        <div className="text-xs text-slate-300 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          Referred Users: <strong className="text-cyan-400">{referredUsers.length}</strong>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-rose-500/20">
          <span className="text-xs text-slate-400">Total Referred Signups</span>
          <p className="text-2xl font-black text-white mt-1">{referredUsers.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-rose-500/20">
          <span className="text-xs text-slate-400">Active VIP Referrals</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {referredUsers.filter((u) => u.vipPlanId && u.vipPlanId !== 'vip-basic').length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-rose-500/20">
          <span className="text-xs text-slate-400">Standard Affiliate Commission</span>
          <p className="text-2xl font-black text-purple-400 mt-1">5% PKR</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or referral code..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-rose-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-12">Loading affiliate data...</p>
        ) : filteredReferred.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-12">No referral connections found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">New User</th>
                  <th className="py-3 px-4">Invited By Code</th>
                  <th className="py-3 px-4">VIP Tier</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4">Affiliate Qualification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReferred.map((u) => {
                  const isVip = u.vipPlanId && u.vipPlanId !== 'vip-basic';
                  return (
                    <tr key={u.uid} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">@{u.username}</div>
                        <div className="text-[10px] text-slate-400">{u.fullName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                        {u.referredBy}
                      </td>
                      <td className="py-3 px-4 text-yellow-300 font-semibold">
                        {u.vipPlanId || 'Basic'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {isVip ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                            Qualified VIP Member
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                            Standard Free Member
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
