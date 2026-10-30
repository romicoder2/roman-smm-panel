import React, { useState, useEffect } from 'react';
import {
  History,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { DepositRequest } from '../../types';

export const DepositHistory: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const depQuery = query(
      collection(db, 'deposits'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubs = onSnapshot(depQuery, (snap) => {
      setDeposits(snap.docs.map((d) => d.data() as DepositRequest));
      setLoading(false);
    });

    return () => unsubs();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            Deposit History & Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your manual JazzCash, Easypaisa, and SadaPay deposit verification requests.
          </p>
        </div>

        <button
          onClick={() => navigate('/add-funds')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          Add Funds
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-cyan-500/20 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading deposit history...
          </div>
        ) : deposits.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-3">
            <p>No deposit requests submitted yet.</p>
            <button
              onClick={() => navigate('/add-funds')}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
            >
              Submit Your First Deposit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Deposit ID</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount (PKR)</th>
                  <th className="py-3 px-4">Transaction ID (TID)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Admin Feedback</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {dep.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{dep.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      Rs. {dep.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">{dep.transactionId}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {dep.status === 'approved' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                          Approved
                        </span>
                      )}
                      {dep.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-600/50">
                          Pending Verification
                        </span>
                      )}
                      {dep.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-600/50">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">
                      {dep.adminNotes || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(dep.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {dep.screenshotUrl ? (
                        <button
                          onClick={() => setSelectedScreenshot(dep.screenshotUrl || null)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300"
                          title="View Screenshot"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px]">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-xl max-h-[85vh] bg-[#0b0f19] p-4 rounded-2xl border border-cyan-500/30 overflow-auto">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 p-2 text-white bg-slate-900/80 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedScreenshot}
              alt="Payment receipt proof"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
