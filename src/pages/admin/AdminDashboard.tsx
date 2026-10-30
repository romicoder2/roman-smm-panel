import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  ShoppingCart,
  Crown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Tag,
  Share2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  UserProfile,
  DepositRequest,
  SmmOrder,
  UserWallet,
  PromoCode,
} from '../../types';

export const AdminDashboard: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubsUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => d.data() as UserProfile));
    });

    const unsubsDeposits = onSnapshot(collection(db, 'deposits'), (snap) => {
      setDeposits(snap.docs.map((d) => d.data() as DepositRequest));
    });

    const unsubsOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map((d) => d.data() as SmmOrder));
    });

    const unsubsWallets = onSnapshot(collection(db, 'wallets'), (snap) => {
      setWallets(snap.docs.map((d) => d.data() as UserWallet));
      setLoading(false);
    });

    return () => {
      unsubsUsers();
      unsubsDeposits();
      unsubsOrders();
      unsubsWallets();
    };
  }, []);

  // Compute stats from live Firestore data
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.isBlocked).length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;

  const totalDepositsCount = deposits.length;
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const approvedDeposits = deposits.filter((d) => d.status === 'approved');
  const totalDepositPKR = approvedDeposits.reduce((acc, d) => acc + (d.amount || 0), 0);

  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const processingOrders = orders.filter((o) => o.status === 'processing' || o.status === 'in_progress');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalOrderRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((acc, o) => acc + (o.finalPrice || 0), 0);

  const totalSystemBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const vipMembersCount = users.filter((u) => u.vipPlanId && u.vipPlanId !== 'vip-basic').length;

  return (
    <div className="space-y-6">
      {/* Admin Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-[#070a12] border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
              MASTER SYSTEM CONTROL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            ROMAN SMM PANEL Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Firestore aggregated statistics, financial balances, and pending actions queue.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {pendingDeposits.length > 0 && (
            <button
              onClick={() => navigate('/admin/deposits')}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 animate-pulse"
            >
              Verify Deposits ({pendingDeposits.length})
            </button>
          )}
          {pendingOrders.length > 0 && (
            <button
              onClick={() => navigate('/admin/orders')}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5"
            >
              Process Orders ({pendingOrders.length})
            </button>
          )}
        </div>
      </div>

      {/* Main 14 Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {/* Total Users */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Total Users</span>
          <p className="text-xl font-black text-white mt-1">{totalUsers}</p>
          <span className="text-[10px] text-slate-500">Registered accounts</span>
        </div>

        {/* Active Users */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Active Users</span>
          <p className="text-xl font-black text-emerald-400 mt-1">{activeUsers}</p>
          <span className="text-[10px] text-slate-500">Non-restricted</span>
        </div>

        {/* Blocked Users */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Blocked Users</span>
          <p className="text-xl font-black text-rose-400 mt-1">{blockedUsers}</p>
          <span className="text-[10px] text-slate-500">Suspended</span>
        </div>

        {/* Total Deposits PKR */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Approved Deposits</span>
          <p className="text-xl font-black text-cyan-300 mt-1">Rs. {totalDepositPKR.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">{approvedDeposits.length} approved</span>
        </div>

        {/* Pending Deposits */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Pending Deposits</span>
          <p className="text-xl font-black text-amber-400 mt-1">{pendingDeposits.length}</p>
          <span className="text-[10px] text-slate-500">Awaiting TID check</span>
        </div>

        {/* Total Orders */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Total Orders</span>
          <p className="text-xl font-black text-blue-400 mt-1">{totalOrdersCount}</p>
          <span className="text-[10px] text-slate-500">All-time count</span>
        </div>

        {/* Pending Orders */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Pending Orders</span>
          <p className="text-xl font-black text-amber-400 mt-1">{pendingOrders.length}</p>
          <span className="text-[10px] text-slate-500">To execute</span>
        </div>

        {/* Processing Orders */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">In Progress Orders</span>
          <p className="text-xl font-black text-sky-400 mt-1">{processingOrders.length}</p>
          <span className="text-[10px] text-slate-500">Processing queue</span>
        </div>

        {/* Completed Orders */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Completed Orders</span>
          <p className="text-xl font-black text-teal-300 mt-1">{completedOrders.length}</p>
          <span className="text-[10px] text-slate-500">Delivered</span>
        </div>

        {/* Total Wallet Balances */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">User Wallet Balances</span>
          <p className="text-xl font-black text-emerald-300 mt-1">Rs. {totalSystemBalance.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Total liability in PKR</span>
        </div>

        {/* Membership Revenue */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">VIP Members</span>
          <p className="text-xl font-black text-yellow-300 mt-1">{vipMembersCount}</p>
          <span className="text-[10px] text-slate-500">Active VIP plans</span>
        </div>

        {/* Order Revenue */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Order Revenue</span>
          <p className="text-xl font-black text-purple-300 mt-1">Rs. {totalOrderRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Gross order volume</span>
        </div>

        {/* Promo Redemptions */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Promo Redemptions</span>
          <p className="text-xl font-black text-pink-300 mt-1">
            {orders.filter((o) => o.promoCode).length}
          </p>
          <span className="text-[10px] text-slate-500">Coupons redeemed</span>
        </div>

        {/* Referral Rewards */}
        <div className="glass-card p-3.5 rounded-xl border border-rose-500/20">
          <span className="text-[11px] text-slate-400 font-medium">Affiliate Users</span>
          <p className="text-xl font-black text-indigo-300 mt-1">
            {users.filter((u) => u.referredBy).length}
          </p>
          <span className="text-[10px] text-slate-500">Referred signups</span>
        </div>
      </div>

      {/* Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Deposit Verification Queue */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              Pending Deposit Verification ({pendingDeposits.length})
            </h3>
            <button
              onClick={() => navigate('/admin/deposits')}
              className="text-xs text-cyan-400 hover:underline font-bold"
            >
              Manage All
            </button>
          </div>

          {pendingDeposits.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              All deposit requests have been processed! No pending items.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingDeposits.slice(0, 5).map((dep) => (
                <div
                  key={dep.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">@{dep.username}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {dep.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      TID: <strong className="text-cyan-300 font-mono">{dep.transactionId}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      Rs. {dep.amount}
                    </span>
                    <button
                      onClick={() => navigate('/admin/deposits')}
                      className="px-2.5 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-black text-[11px] font-bold"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Orders Queue */}
        <div className="glass-card rounded-2xl p-5 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              Pending Orders Queue ({pendingOrders.length})
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Manage All
            </button>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No pending orders. All orders are completed or in progress.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingOrders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-300 font-bold text-[11px]">{ord.id}</span>
                      <span className="text-white font-medium truncate max-w-[160px]">
                        {ord.serviceName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                      Link: {ord.targetLink}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-slate-200">
                      {ord.quantity.toLocaleString()} qty
                    </span>
                    <button
                      onClick={() => navigate('/admin/orders')}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold"
                    >
                      Process
                    </button>
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
