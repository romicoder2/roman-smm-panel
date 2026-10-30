import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SmmOrder, OrderStatus } from '../../types';

export const OrderHistory: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<SmmOrder | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubs = onSnapshot(ordersQuery, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as SmmOrder));
      setLoading(false);
    });

    return () => unsubs();
  }, [currentUser]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(searchId.toLowerCase()) ||
        o.serviceName.toLowerCase().includes(searchId.toLowerCase()) ||
        o.targetLink.toLowerCase().includes(searchId.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchId, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            Completed
          </span>
        );
      case 'processing':
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-600/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            {status.replace('_', ' ')}
          </span>
        );
      case 'cancelled':
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-600/50">
            {status}
          </span>
        );
      case 'partial':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-600/50">
            Partial
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-600/50">
            Pending Admin
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            Order History & Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time delivery progress of your social media promotion campaigns.
          </p>
        </div>

        <button
          onClick={() => navigate('/new-order')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search by Order ID or Link..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
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

      {/* Orders Table */}
      <div className="glass-card rounded-2xl border border-cyan-500/20 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
            Loading your orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <p>No orders found.</p>
            {orders.length === 0 && (
              <button
                onClick={() => navigate('/new-order')}
                className="mt-3 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
              >
                Place Your First Order
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Target Link</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {ord.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-[200px] truncate">
                      {ord.serviceName}
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate">
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
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      Rs. {ord.finalPrice}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 hover:text-white transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b0f19] border border-cyan-500/30 p-6 shadow-2xl text-slate-200 space-y-4">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-cyan-300 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/40">
                {selectedOrder.id}
              </span>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            <h3 className="text-base font-bold text-white">{selectedOrder.serviceName}</h3>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-white font-medium">{selectedOrder.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity Ordered:</span>
                <span className="text-white font-bold">{selectedOrder.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rate per 1000:</span>
                <span className="text-white">Rs. {selectedOrder.pricePer1000}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Original Price:</span>
                <span className="text-slate-300">Rs. {selectedOrder.originalPrice}</span>
              </div>
              {selectedOrder.vipDiscount > 0 && (
                <div className="flex justify-between text-yellow-300">
                  <span>VIP Discount:</span>
                  <span>- Rs. {selectedOrder.vipDiscount}</span>
                </div>
              )}
              {selectedOrder.promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Promo Discount ({selectedOrder.promoCode}):</span>
                  <span>- Rs. {selectedOrder.promoDiscount}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-cyan-300 pt-2 border-t border-slate-800">
                <span>Total Amount Paid:</span>
                <span>Rs. {selectedOrder.finalPrice}</span>
              </div>
            </div>

            {/* Target Link */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Target Link</span>
              <a
                href={selectedOrder.targetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono break-all hover:border-cyan-500/40"
              >
                {selectedOrder.targetLink}
              </a>
            </div>

            {/* Admin Notes if present */}
            {selectedOrder.adminNotes && (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/30 text-xs">
                <span className="font-bold text-amber-300 block mb-1">Admin Notes:</span>
                <p className="text-slate-300">{selectedOrder.adminNotes}</p>
              </div>
            )}

            <div className="text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-800">
              <span>Submitted: {new Date(selectedOrder.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(selectedOrder.updatedAt || selectedOrder.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
