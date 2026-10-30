import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  CreditCard,
  Crown,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserNotification } from '../../types';

export const NotificationsPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubs = onSnapshot(notifQuery, (snap) => {
      setNotifications(snap.docs.map((d) => d.data() as UserNotification));
      setLoading(false);
    });

    return () => unsubs();
  }, [currentUser]);

  const handleMarkAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  };

  const getNotifIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'deposit':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'vip':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'order':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'success':
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time system updates regarding order statuses, verified deposits, and VIP upgrades.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* List */}
      <div className="glass-card rounded-2xl border border-cyan-500/20 p-5 space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Bell className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p>You have no notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  n.isRead
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : 'bg-gradient-to-r from-cyan-950/30 to-slate-900 border-cyan-500/40 text-slate-200 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getNotifIcon(n.type)}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold ${
                        n.isRead ? 'text-slate-300' : 'text-white'
                      }`}
                    >
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                </div>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1 shadow-[0_0_6px_#06b6d4]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
