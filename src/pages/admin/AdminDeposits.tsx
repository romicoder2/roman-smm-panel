import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useData } from '../../context/DataContext';
import { DepositRequest, DepositStatus } from '../../types';

export const AdminDeposits: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { approveDeposit, rejectDeposit } = useData();

  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  // Action modals
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    const depQuery = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
    const unsubs = onSnapshot(depQuery, (snap) => {
      setDeposits(snap.docs.map((d) => d.data() as DepositRequest));
      setLoading(false);
    });
    return () => unsubs();
  }, []);

  const filteredDeposits = useMemo(() => {
    return deposits.filter((d) => {
      const matchSearch =
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.username.toLowerCase().includes(search.toLowerCase()) ||
        d.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        d.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [deposits, search, statusFilter]);

  const handleApprove = async (dep: DepositRequest) => {
    const confirm = window.confirm(
      `Approve deposit of Rs. ${dep.amount} via ${dep.paymentMethod} (TID: ${dep.transactionId}) for user @${dep.username}?\n\nThis will credit their wallet immediately.`
    );
    if (!confirm) return;

    setApprovingId(dep.id);
    setActionMsg(null);

    const res = await approveDeposit(dep, 'Verified and approved by Admin');
    setApprovingId(null);

    if (res.success) {
      setActionMsg({
        type: 'success',
        text: `Deposit #${dep.id} approved! Rs. ${dep.amount} has been credited to @${dep.username}'s wallet.`,
      });
    } else {
      setActionMsg({
        type: 'error',
        text: res.error || 'Failed to approve deposit.',
      });
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDeposit || !rejectionReason.trim()) return;

    setActionMsg(null);
    const res = await rejectDeposit(
      rejectingDeposit.id,
      rejectingDeposit.userId,
      rejectionReason.trim()
    );

    if (res.success) {
      setActionMsg({
        type: 'success',
        text: `Deposit #${rejectingDeposit.id} rejected. Rejection reason saved.`,
      });
      setRejectingDeposit(null);
      setRejectionReason('');
    } else {
      setActionMsg({
        type: 'error',
        text: res.error || 'Failed to reject deposit.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-rose-400" />
            Manual Deposit Verification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify payment receipts, check Transaction IDs (TID), and approve 1-click atomic wallet credits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 font-bold">
            Pending: {deposits.filter((d) => d.status === 'pending').length}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-bold">
            Approved: {deposits.filter((d) => d.status === 'approved').length}
          </span>
        </div>
      </div>

      {/* Action feedback */}
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, TID, or Deposit ID..."
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
            <option value="all">All Deposits ({deposits.length})</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-12">Loading deposits queue...</p>
        ) : filteredDeposits.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-12">No deposits match filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Deposit ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Transaction ID (TID)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Receipt</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {dep.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">@{dep.username}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{dep.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{dep.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
                      Rs. {dep.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-200 font-bold">{dep.transactionId}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {dep.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          Approved
                        </span>
                      )}
                      {dep.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700 animate-pulse">
                          Pending
                        </span>
                      )}
                      {dep.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {dep.screenshotUrl ? (
                        <button
                          onClick={() => setSelectedScreenshot(dep.screenshotUrl || null)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px]">No image</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(dep.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {dep.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(dep)}
                            disabled={approvingId === dep.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-40"
                          >
                            {approvingId === dep.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              setRejectingDeposit(dep);
                              setRejectionReason('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Viewer Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-xl max-h-[85vh] bg-[#0b0f19] p-4 rounded-2xl border border-rose-500/30 overflow-auto">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 p-2 text-white bg-slate-900/80 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">
              Payment Screenshot Proof
            </h4>
            <img
              src={selectedScreenshot}
              alt="Payment receipt proof"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c0a14] p-6 rounded-2xl border border-rose-500/40 text-slate-200 space-y-4">
            <button
              onClick={() => setRejectingDeposit(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-rose-400">
              Reject Deposit #{rejectingDeposit.id}
            </h3>
            <p className="text-xs text-slate-400">
              User @{rejectingDeposit.username} • Amount: Rs. {rejectingDeposit.amount} • TID: {rejectingDeposit.transactionId}
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Rejection Reason (Visible to user)
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. TID not found on JazzCash statement / Screenshot blurry / Invalid amount"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!rejectionReason.trim()}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
              >
                Confirm Deposit Rejection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
