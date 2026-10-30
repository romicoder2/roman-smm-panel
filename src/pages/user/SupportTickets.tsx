import React, { useState, useEffect } from 'react';
import {
  Headphones,
  PlusCircle,
  MessageSquare,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SupportTicket, SupportMessage } from '../../types';

export const SupportTickets: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile } = useAuth();
  const { systemConfig } = useData();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

  // New ticket modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [firstMessage, setFirstMessage] = useState('');
  const [creating, setCreating] = useState(false);

  // Reply message
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const ticketsQuery = query(
      collection(db, 'support_tickets'),
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubs = onSnapshot(ticketsQuery, (snap) => {
      const list = snap.docs.map((d) => d.data() as SupportTicket);
      setTickets(list);
      setLoading(false);

      // Keep active ticket in sync
      if (activeTicket) {
        const found = list.find((t) => t.id === activeTicket.id);
        if (found) setActiveTicket(found);
      }
    });

    return () => unsubs();
  }, [currentUser, activeTicket?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !subject.trim() || !firstMessage.trim()) return;

    setCreating(true);
    const ticketId = 'TCK-' + Date.now().toString(36).toUpperCase();
    const newMsg: SupportMessage = {
      senderId: currentUser.uid,
      senderName: userProfile.fullName,
      isAdmin: false,
      text: firstMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const newTicket: SupportTicket = {
      id: ticketId,
      userId: currentUser.uid,
      username: userProfile.username,
      userEmail: currentUser.email || '',
      subject: subject.trim(),
      category,
      priority,
      status: 'open',
      messages: [newMsg],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'support_tickets', ticketId), newTicket);

    setCreating(false);
    setNewModalOpen(false);
    setSubject('');
    setFirstMessage('');
    setActiveTicket(newTicket);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !activeTicket || !replyText.trim()) return;

    setSendingReply(true);
    const msg: SupportMessage = {
      senderId: currentUser.uid,
      senderName: userProfile.fullName,
      isAdmin: false,
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

  const handleCloseTicket = async (ticketId: string) => {
    await updateDoc(doc(db, 'support_tickets', ticketId), {
      status: 'closed',
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-cyan-400" />
            Customer Support Tickets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Need assistance with an order or deposit? Open a ticket or connect with our WhatsApp channel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={systemConfig.whatsappUrl || 'https://whatsapp.com/channel/0029VawwXaeEquiIR1CLXA30'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            WhatsApp Support
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setNewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            Open Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="glass-card rounded-2xl border border-cyan-500/20 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Your Tickets ({tickets.length})
          </h3>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs space-y-2">
              <p>No support tickets yet.</p>
              <button
                onClick={() => setNewModalOpen(true)}
                className="text-cyan-400 font-bold hover:underline"
              >
                Create one now
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeTicket?.id === t.id
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
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
                  <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400">
                    <span>{t.category}</span>
                    <span>{t.messages.length} msg(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Chat View */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-cyan-500/20 p-5 flex flex-col justify-between min-h-[500px]">
          {activeTicket ? (
            <>
              <div>
                {/* Active Ticket Header */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {activeTicket.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {activeTicket.category}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        Priority: {activeTicket.priority}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      {activeTicket.subject}
                    </h3>
                  </div>

                  {activeTicket.status !== 'closed' && (
                    <button
                      onClick={() => handleCloseTicket(activeTicket.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>

                {/* Messages Thread */}
                <div className="py-4 space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {activeTicket.messages.map((m, idx) => {
                    const isMe = m.senderId === currentUser?.uid;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                          <span className={m.isAdmin ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                            {m.senderName} {m.isAdmin && '★ [Admin]'}
                          </span>
                          <span>• {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-100 rounded-br-none'
                              : 'bg-slate-900 border border-slate-700 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Input */}
              {activeTicket.status === 'closed' ? (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  This ticket has been marked as closed.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to Roman Empire Support..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-extrabold text-xs uppercase disabled:opacity-40 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5 text-black" />
                    Reply
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-400">Select a Ticket to View Messages</p>
              <p className="text-xs text-slate-500 mt-1">Or click 'Open Ticket' to create a new support inquiry.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b0f19] border border-cyan-500/30 p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setNewModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">Open Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Order Issue">Order Issue (Status, Delay, Refill)</option>
                  <option value="Deposit Issue">Deposit Issue (JazzCash/Easypaisa/SadaPay)</option>
                  <option value="VIP Membership">VIP Membership & Discounts</option>
                  <option value="Referral Rewards">Referral Rewards & Affiliates</option>
                  <option value="General Question">General Inquiry / Custom API</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                >
                  <option value="low">Low (General queries)</option>
                  <option value="medium">Medium (Standard request)</option>
                  <option value="high">High (Urgent order update)</option>
                  <option value="urgent">Urgent (Payment / Account blockage)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Order #ORD-123 status inquiry"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Message Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Provide clear details including Order ID, TID, or links..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  {creating ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
