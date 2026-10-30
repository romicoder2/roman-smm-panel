import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  Users,
  Crown,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SmmOrder, DepositRequest, UserProfile } from '../../types';

export const AdminReports: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubsOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map((d) => d.data() as SmmOrder));
    });
    const unsubsDeposits = onSnapshot(collection(db, 'deposits'), (snap) => {
      setDeposits(snap.docs.map((d) => d.data() as DepositRequest));
    });
    const unsubsUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => d.data() as UserProfile));
      setLoading(false);
    });

    return () => {
      unsubsOrders();
      unsubsDeposits();
      unsubsUsers();
    };
  }, []);

  // Export orders to CSV
  const handleExportOrdersCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export.');
      return;
    }
    const headers = [
      'Order ID',
      'User',
      'Service',
      'Quantity',
      'Amount (PKR)',
      'Status',
      'Target Link',
      'Date',
    ];
    const rows = orders.map((o) => [
      o.id,
      o.username,
      `"${o.serviceName.replace(/"/g, '""')}"`,
      o.quantity,
      o.finalPrice,
      o.status,
      `"${o.targetLink.replace(/"/g, '""')}"`,
      o.createdAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roman_smm_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export deposits to CSV
  const handleExportDepositsCSV = () => {
    if (deposits.length === 0) {
      alert('No deposits to export.');
      return;
    }
    const headers = [
      'Deposit ID',
      'User',
      'Method',
      'Amount (PKR)',
      'TID',
      'Status',
      'Admin Notes',
      'Date',
    ];
    const rows = deposits.map((d) => [
      d.id,
      d.username,
      d.paymentMethod,
      d.amount,
      d.transactionId,
      d.status,
      `"${(d.adminNotes || '').replace(/"/g, '""')}"`,
      d.createdAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roman_smm_deposits_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((acc, o) => acc + (o.finalPrice || 0), 0);

  const totalDeposited = deposits
    .filter((d) => d.status === 'approved')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-400" />
            Financial Reports & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Export real database records to CSV spreadsheets and monitor cash inflows and order volume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportOrdersCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Orders CSV
          </button>
          <button
            onClick={handleExportDepositsCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Deposits CSV
          </button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-rose-500/20">
          <span className="text-xs text-slate-400 font-medium">Total Orders Revenue</span>
          <p className="text-2xl font-black text-cyan-300 mt-2">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Excludes cancelled & refunded</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-rose-500/20">
          <span className="text-xs text-slate-400 font-medium">Verified Deposit Cash Inflow</span>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            Rs. {totalDeposited.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">JazzCash, Easypaisa, SadaPay</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-rose-500/20">
          <span className="text-xs text-slate-400 font-medium">Delivered Campaigns</span>
          <p className="text-2xl font-black text-blue-400 mt-2">
            {orders.filter((o) => o.status === 'completed').length} / {orders.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Completed orders</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-rose-500/20">
          <span className="text-xs text-slate-400 font-medium">Active VIP Subscriptions</span>
          <p className="text-2xl font-black text-yellow-300 mt-2">
            {users.filter((u) => u.vipPlanId && u.vipPlanId !== 'vip-basic').length} Members
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Recurring VIP tiers</p>
        </div>
      </div>

      {/* Visual Status Breakdown */}
      <div className="glass-card p-6 rounded-2xl border border-rose-500/20 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Order Status Distribution
        </h3>

        <div className="space-y-3">
          {[
            { status: 'completed', label: 'Completed', color: 'bg-emerald-500' },
            { status: 'processing', label: 'Processing', color: 'bg-blue-500' },
            { status: 'in_progress', label: 'In Progress', color: 'bg-cyan-500' },
            { status: 'pending', label: 'Pending Admin', color: 'bg-amber-500' },
            { status: 'cancelled', label: 'Cancelled / Refunded', color: 'bg-rose-500' },
          ].map((item) => {
            const count = orders.filter((o) =>
              item.status === 'cancelled'
                ? o.status === 'cancelled' || o.status === 'refunded'
                : o.status === item.status
            ).length;
            const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;

            return (
              <div key={item.status} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{item.label}</span>
                  <span className="text-slate-400 font-mono">
                    {count} orders ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
