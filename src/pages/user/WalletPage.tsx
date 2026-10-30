import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Filter,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { WalletTransaction, TransactionType } from '../../types';

export const WalletPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, wallet } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentUser) return;

    const txQuery = query(
      collection(db, 'wallet_transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubs = onSnapshot(txQuery, (snap) => {
      setTransactions(snap.docs.map((d) => d.data() as WalletTransaction));
      setLoading(false);
    });

    return () => unsubs();
  }, [currentUser]);

  const filteredTx = transactions.filter((t) => {
    if (typeFilter === 'all') return true;
    return t.type === typeFilter;
  });

  const getTxTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'deposit_credit':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
            Deposit Credit
          </span>
        );
      case 'order_deduction':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-600/40">
            Order Deduction
          </span>
        );
      case 'order_refund':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-950/80 text-teal-300 border border-teal-600/40">
            Order Refund
          </span>
        );
      case 'vip_purchase':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-950/80 text-yellow-300 border border-yellow-600/40">
            VIP Purchase
          </span>
        );
      case 'referral_reward':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-600/40">
            Referral Reward
          </span>
        );
      case 'admin_adjustment':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-600/40">
            Admin Adjustment
          </span>
        );
      default:
        return <span className="text-slate-400 text-[10px]">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-[#070a12] border border-cyan-500/30 relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Verified Immutable Financial Ledger
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white">
                Rs. {(wallet?.balance ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-cyan-300 font-semibold uppercase">PKR Available</span>
            </div>
            <div className="mt-3 flex items-center gap-6 text-xs text-slate-400">
              <div>
                Total Deposited:{' '}
                <strong className="text-emerald-400">
                  Rs. {(wallet?.totalDeposited ?? 0).toLocaleString()}
                </strong>
              </div>
              <div>
                Total Spent:{' '}
                <strong className="text-slate-200">
                  Rs. {(wallet?.totalSpent ?? 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/add-funds')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4 text-black" />
              Deposit via JazzCash / Easypaisa
            </button>
            <button
              onClick={() => navigate('/new-order')}
              className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Wallet Transaction Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Every transaction is recorded with previous balance, new balance, and verified transaction reference.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Movements ({transactions.length})</option>
            <option value="deposit_credit">Deposits</option>
            <option value="order_deduction">Orders</option>
            <option value="order_refund">Refunds</option>
            <option value="vip_purchase">VIP Purchases</option>
            <option value="referral_reward">Referral Rewards</option>
            <option value="admin_adjustment">Admin Adjustments</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl border border-cyan-500/20 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading transaction ledger...
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No transactions match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Prev Bal</th>
                  <th className="py-3 px-4">New Bal</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTx.map((tx) => {
                  const isCredit =
                    tx.type === 'deposit_credit' ||
                    tx.type === 'order_refund' ||
                    tx.type === 'referral_reward';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap text-[11px]">
                        {tx.id.substring(0, 10)}...
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{getTxTypeBadge(tx.type)}</td>
                      <td className="py-3 px-4 text-white max-w-[240px] truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 font-mono font-black whitespace-nowrap">
                        <span className={isCredit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isCredit ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        Rs. {tx.previousBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-100 whitespace-nowrap">
                        Rs. {tx.newBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
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
