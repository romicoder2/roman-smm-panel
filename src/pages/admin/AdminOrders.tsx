import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Clock,
  AlertCircle,
  X,
  Edit,
  RotateCcw,
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useData } from '../../context/DataContext';
import { SmmOrder, OrderStatus } from '../../types';

export const AdminOrders: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { updateOrderStatus } = useData();

  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit status modal
  const [editingOrder, setEditingOrder] = useState<SmmOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubs = onSnapshot(ordersQuery, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as SmmOrder));
      setLoading(false);
    });
    return () => unsubs();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.username.toLowerCase().includes(search.toLowerCase()) ||
        o.serviceName.toLowerCase().includes(search.toLowerCase()) ||
        o.targetLink.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleOpenEdit = (ord: SmmOrder) => {
    setEditingOrder(ord);
    setNewStatus(ord.status);
    setAdminNotes(ord.adminNotes || '');
    setActionMsg(null);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setSavingStatus(true);
    setActionMsg(null);

    const res = await updateOrderStatus(editingOrder, newStatus, adminNotes.trim());
    setSavingStatus(false);

    if (res.success) {
      setActionMsg({
        type: 'success',
        text: `Order #${editingOrder.id} status updated to ${newStatus.toUpperCase()}${
          newStatus === 'cancelled' || newStatus === 'refunded'
            ? ' and Rs. ' + editingOrder.finalPrice + ' refunded to user wallet.'
            : '.'
        }`,
      });
      setEditingOrder(null);
    } else {
      setActionMsg({
        type: 'error',
        text: res.error || 'Failed to update order status.',
      });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
            Completed
          </span>
        );
      case 'processing':
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700">
            {status.replace('_', ' ')}
          </span>
        );
      case 'cancelled':
      case 'refunded':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
            {status}
          </span>
        );
      case 'partial':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700">
            Partial
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-rose-400" />
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track links, inspect service orders, update processing status, and automatically trigger refunds on cancellation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Total Orders: <strong className="text-white">{orders.length}</strong>
          </span>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, username, link..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-rose-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-12">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-12">No orders matched.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Target Link</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {ord.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">@{ord.username}</td>
                    <td className="py-3 px-4 text-slate-200 max-w-[180px] truncate">
                      {ord.serviceName}
                    </td>
                    <td className="py-3 px-4 max-w-[160px] truncate">
                      <a
                        href={ord.targetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span className="truncate">{ord.targetLink}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4 font-bold">{ord.quantity.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      Rs. {ord.finalPrice}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(ord)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 mx-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0c0a14] p-6 rounded-2xl border border-rose-500/40 text-slate-200 space-y-4">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white">
              Manage Order #{editingOrder.id}
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <p>
                Service: <strong className="text-white">{editingOrder.serviceName}</strong>
              </p>
              <p>
                Target Link:{' '}
                <a
                  href={editingOrder.targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline font-mono break-all"
                >
                  {editingOrder.targetLink}
                </a>
              </p>
              <p>
                Quantity: <strong>{editingOrder.quantity.toLocaleString()}</strong> | Amount:{' '}
                <strong className="text-emerald-400">Rs. {editingOrder.finalPrice}</strong>
              </p>
              <p>
                Ordered by: <strong>@{editingOrder.username}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Change Execution Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                >
                  <option value="pending">Pending (Not yet started)</option>
                  <option value="processing">Processing (Queued on servers)</option>
                  <option value="in_progress">In Progress (Delivery actively boosting)</option>
                  <option value="completed">Completed (Successfully fulfilled)</option>
                  <option value="partial">Partial (Partially delivered)</option>
                  <option value="cancelled">
                    Cancelled (Refunds Rs. {editingOrder.finalPrice} to user wallet)
                  </option>
                  <option value="refunded">
                    Refunded (Direct refund to user wallet)
                  </option>
                </select>

                {(newStatus === 'cancelled' || newStatus === 'refunded') && (
                  <p className="text-[11px] text-amber-300 mt-1 font-semibold flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    Notice: Selecting Cancelled/Refunded will automatically credit Rs. {editingOrder.finalPrice} back to @{editingOrder.username}'s wallet.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Internal / User Admin Note
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Started batch 1 / Finished high retention campaign"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingStatus}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
              >
                {savingStatus ? 'Updating Order...' : 'Confirm Order Status Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
