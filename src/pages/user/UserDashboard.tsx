import React, { useEffect, useState } from 'react';
import {
  Wallet,
  CreditCard,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Crown,
  Share2,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SmmOrder, DepositRequest, WalletTransaction } from '../../types';

export const UserDashboard: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile, wallet, activeVipPlan, vipDaysRemaining } = useAuth();
  const { systemConfig } = useData();

  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats calculation
  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'in_progress'
  ).length;
  const totalDepositedAmount = wallet?.totalDeposited || 0;

  useEffect(() => {
    if (!currentUser) return;

    // Fetch user orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubsOrders = onSnapshot(ordersQuery, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as SmmOrder));
      setLoading(false);
    });

    // Fetch user deposits
    const depositsQuery = query(
      collection(db, 'deposits'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubsDeposits = onSnapshot(depositsQuery, (snap) => {
      setDeposits(snap.docs.map((d) => d.data() as DepositRequest));
    });

    // Fetch recent ledger transactions
    const txQuery = query(
      collection(db, 'wallet_transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubsTx = onSnapshot(txQuery, (snap) => {
      setRecentTransactions(snap.docs.map((d) => d.data() as WalletTransaction));
    });

    return () => {
      unsubsOrders();
      unsubsDeposits();
      unsubsTx();
    };
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Welcome Card & Notice */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-[#070a12] border border-cyan-500/30 relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                ROMAN EMPIRE DASHBOARD
              </span>
              <span className="text-[10px] text-yellow-300 font-extrabold px-2 py-0.5 rounded bg-yellow-950/80 border border-yellow-600/40">
                {activeVipPlan?.name}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Welcome back, {userProfile?.fullName || 'Valued Client'}!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Account: <span className="text-slate-200 font-mono">@{userProfile?.username}</span> | Referral Code:{' '}
              <span className="text-cyan-300 font-mono font-bold">{userProfile?.referralCode || 'ROMAN-VIP'}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/new-order')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              Place New Order
            </button>
            <button
              onClick={() => navigate('/add-funds')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4 text-cyan-400" />
              Add Funds (PKR)
            </button>
          </div>
        </div>
      </div>

      {/* 7 Required Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Wallet Balance */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium">Available Balance</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-cyan-300 mt-2">
            Rs. {(wallet?.balance ?? 0).toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Manual Verification</span>
            <button
              onClick={() => navigate('/add-funds')}
              className="text-cyan-400 font-bold hover:underline"
            >
              Deposit +
            </button>
          </div>
        </div>

        {/* 2. Total Deposits */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium">Total Deposits</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            Rs. {totalDepositedAmount.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{deposits.length} submission(s)</span>
            <button onClick={() => navigate('/deposits')} className="text-emerald-400 hover:underline">
              History
            </button>
          </div>
        </div>

        {/* 3. Total Orders */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium">Total Orders</span>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400 mt-2">{totalOrdersCount}</p>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Lifetime campaigns</span>
          </div>
        </div>

        {/* 4. Completed Orders */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium">Completed Orders</span>
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-300 mt-2">{completedOrdersCount}</p>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>100% delivered</span>
          </div>
        </div>

        {/* 5. Pending Orders */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium">Pending Processing</span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{pendingOrdersCount}</p>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>In execution queue</span>
          </div>
        </div>

        {/* 6. Active VIP Membership */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium">VIP Membership</span>
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-yellow-300 mt-2 truncate">
            {activeVipPlan?.name || 'Basic Member'}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{activeVipPlan?.discountPercentage}% Discount</span>
            <button
              onClick={() => navigate('/membership')}
              className="text-yellow-400 font-semibold hover:underline"
            >
              Upgrade
            </button>
          </div>
        </div>

        {/* 7. Referral Rewards */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 col-span-2 lg:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-medium">Referral Program</span>
              <p className="text-lg font-bold text-white mt-1">
                Code: <span className="text-cyan-400 font-mono">{userProfile?.referralCode}</span>
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Share with friends to earn lifetime bonus credit.</span>
            <button
              onClick={() => navigate('/refer')}
              className="text-cyan-400 font-bold hover:underline shrink-0"
            >
              View Rewards →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/new-order')}
          className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Start Campaign</h4>
            <p className="text-[11px] text-cyan-300">Choose from 16 categories</p>
          </div>
          <ArrowRight className="w-5 h-5 text-cyan-400" />
        </div>

        <div
          onClick={() => navigate('/add-funds')}
          className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">JazzCash / Easypaisa</h4>
            <p className="text-[11px] text-emerald-300">Submit deposit request</p>
          </div>
          <CreditCard className="w-5 h-5 text-emerald-400" />
        </div>

        <div
          onClick={() => navigate('/support')}
          className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Need Support?</h4>
            <p className="text-[11px] text-blue-300">Open ticket or WhatsApp</p>
          </div>
          <ExternalLink className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              Recent Orders
            </h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All ({orders.length})
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-xs">No orders placed yet.</p>
              <button
                onClick={() => navigate('/new-order')}
                className="mt-3 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-colors"
              >
                Place Your First Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{ord.id}</td>
                      <td className="py-2.5 px-3 truncate max-w-[180px] text-white">{ord.serviceName}</td>
                      <td className="py-2.5 px-3">{ord.quantity.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-100">Rs. {ord.finalPrice}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'completed'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                              : ord.status === 'processing' || ord.status === 'in_progress'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-700/50'
                              : ord.status === 'cancelled' || ord.status === 'refunded'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-700/50'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Financial Ledger */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Wallet Movements
            </h3>
            <button
              onClick={() => navigate('/wallet')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Full Ledger
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">No transactions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="text-white font-medium truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-black font-mono ${
                        tx.type === 'deposit_credit' || tx.type === 'order_refund' || tx.type === 'referral_reward'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'deposit_credit' || tx.type === 'order_refund' || tx.type === 'referral_reward'
                        ? '+'
                        : '-'}
                      Rs. {tx.amount}
                    </span>
                    <p className="text-[10px] text-slate-400">Bal: Rs. {tx.newBalance}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
