import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
  Clock,
  Shield,
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { SupportTicket, SupportMessage } from '../../types';

export const AdminSupport: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc'));
    const unsubs = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => d.data() as SupportTicket);
      setTickets(list);
      setLoading(false);

      if (activeTicket) {
        const found = list.find((t) => t.id === activeTicket.id);
        if (found) setActiveTicket(found);
      }
    });
    return () => unsubs();
  }, [activeTicket?.id]);

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setSendingReply(true);
    const msg: SupportMessage = {
      senderId: currentUser?.uid || 'admin',
      senderName: 'Mian Roman (Admin)',
      isAdmin: true,
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'support_tickets', activeTicket.id), {
      messages: arrayUnion(msg),
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    });

    setReplyText('');
    setSendingReply(false);
  };

  const handleUpdateStatus = async (ticketId: string, status: SupportTicket['status']) => {
    await updateDoc(doc(db, 'support_tickets', ticketId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-rose-400" />
            Admin Support Inbox
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Answer user support inquiries, resolve order bottlenecks, and close tickets.
          </p>
        </div>

        <div className="text-xs text-slate-300 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          Open Tickets:{' '}
          <strong className="text-amber-400">
            {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="glass-card rounded-2xl border border-rose-500/20 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            All Inquiries ({tickets.length})
          </h3>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No support tickets found.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeTicket?.id === t.id
                      ? 'bg-rose-950/40 border-rose-500/50 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-300">{t.id}</span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        t.status === 'open'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : t.status === 'in_progress'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : t.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5 truncate">{t.subject}</h4>
                  <p className="text-[11px] text-slate-400 truncate">@{t.username} • {t.userEmail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat thread */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-rose-500/20 p-5 flex flex-col justify-between min-h-[500px]">
          {activeTicket ? (
            <>
              <div>
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {activeTicket.id}
                      </span>
                      <span className="text-xs font-bold text-white">@{activeTicket.username}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {activeTicket.category}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      {activeTicket.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleUpdateStatus(activeTicket.id, e.target.value as any)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="py-4 space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {activeTicket.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                        <span className={m.isAdmin ? 'text-amber-400 font-bold' : 'text-cyan-300 font-bold'}>
                          {m.senderName}
                        </span>
                        <span>• {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                          m.isAdmin
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100 rounded-br-none'
                            : 'bg-slate-900 border border-slate-700 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAdminReply} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official admin response to client..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-rose-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase disabled:opacity-40 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  Reply
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-400">Select a Ticket to Respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
