import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Wallet,
  PlusCircle,
  MinusCircle,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useData } from '../../context/DataContext';
import { UserProfile, UserWallet } from '../../types';

export const AdminUsers: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { adjustUserWallet, blockUserToggle } = useData();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [wallets, setWallets] = useState<{ [uid: string]: UserWallet }>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected user modal for wallet adjustment or profile review
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [processingAdjust, setProcessingAdjust] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const unsubsUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => d.data() as UserProfile));
      setLoading(false);
    });

    const unsubsWallets = onSnapshot(collection(db, 'wallets'), (snap) => {
      const map: { [uid: string]: UserWallet } = {};
      snap.docs.forEach((d) => {
        map[d.id] = d.data() as UserWallet;
      });
      setWallets(map);
    });

    return () => {
      unsubsUsers();
      unsubsWallets();
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.uid.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustReason.trim() || adjustAmount <= 0) return;

    setProcessingAdjust(true);
    setActionError(null);
    setActionSuccess(null);

    const delta = adjustType === 'credit' ? adjustAmount : -adjustAmount;
    const res = await adjustUserWallet(selectedUser.uid, delta, adjustReason.trim());

    setProcessingAdjust(false);
    if (res.success) {
      setActionSuccess(`Successfully updated wallet balance by ${delta >= 0 ? '+' : ''}Rs. ${delta}`);
      setAdjustReason('');
    } else {
      setActionError(res.error || 'Failed to adjust balance.');
    }
  };

  const handleToggleBlock = async (u: UserProfile) => {
    const next = !u.isBlocked;
    const confirm = window.confirm(
      `Are you sure you want to ${next ? 'BLOCK' : 'UNBLOCK'} @${u.username}?`
    );
    if (!confirm) return;

    const res = await blockUserToggle(u.uid, next);
    if (res.success) {
      if (selectedUser?.uid === u.uid) {
        setSelectedUser({ ...selectedUser, isBlocked: next });
      }
    } else {
      alert('Error updating user block state: ' + res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-400" />
            User Management & Wallets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search registered users, audit balances, block/suspend accounts, and make audited wallet adjustments.
          </p>
        </div>

        <div className="text-xs text-slate-300 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          Total Users: <strong className="text-white">{users.length}</strong>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username, full name, email, or UID..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-rose-400 focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-12">Loading users list...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-12">No users matched search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">VIP Tier</th>
                  <th className="py-3 px-4">Balance (PKR)</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const userWallet = wallets[u.uid];
                  const balance = userWallet?.balance ?? 0;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white truncate max-w-[150px]">{u.fullName}</div>
                        <div className="text-[11px] text-cyan-300 font-mono">@{u.username}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-yellow-300 font-semibold flex items-center gap-1">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          {u.vipPlanId || 'Basic'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        Rs. {balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.role === 'admin'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isBlocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-700">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setActionError(null);
                              setActionSuccess(null);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => handleToggleBlock(u)}
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              u.isBlocked
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected User Modal: Adjust Wallet & View Data */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0c0a14] border border-rose-500/30 p-6 shadow-2xl text-slate-200 space-y-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                USER PROFILE & WALLET LEDGER
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{selectedUser.fullName}</h3>
              <p className="text-xs text-cyan-300 font-mono">@{selectedUser.username} • {selectedUser.email}</p>
            </div>

            {/* Current Balance Display */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Available Balance</span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  Rs. {(wallets[selectedUser.uid]?.balance ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Referral Code</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {selectedUser.referralCode || 'None'}
                </span>
              </div>
            </div>

            {actionSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Wallet Adjustment Form */}
            <form onSubmit={handleAdjustWallet} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-rose-400" />
                Adjust Wallet Balance (Immutable Ledger)
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-1.5 rounded-lg text-xs font-bold ${
                    adjustType === 'credit'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  + Add Credit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-1.5 rounded-lg text-xs font-bold ${
                    adjustType === 'debit'
                      ? 'bg-rose-500 text-black shadow-md'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  - Deduct Balance
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Amount in PKR
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Audit Reason (Mandatory)
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Manual payment bonus, Correction, Promo credit"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={processingAdjust || !adjustReason.trim() || adjustAmount <= 0}
                className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
              >
                {processingAdjust
                  ? 'Executing Ledger Update...'
                  : `${adjustType === 'credit' ? 'Credit' : 'Debit'} Rs. ${adjustAmount} to User Wallet`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
