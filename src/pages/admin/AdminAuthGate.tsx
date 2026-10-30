import React, { useState } from 'react';
import { Shield, Lock, KeyRound, AlertCircle, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminAuthGate: React.FC<{
  children: React.ReactNode;
  navigate: (route: string) => void;
}> = ({ children, navigate }) => {
  const { currentUser, isAdmin } = useAuth();
  const [adminPin, setAdminPin] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already recognized as admin via email (rnd92488@gmail.com) or role
  if (isAdmin || pinUnlocked) {
    return <>{children}</>;
  }

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    // Master emergency access passcode for ROMAN SMM administration
    if (adminPin.trim() === 'ROMAN92488' || adminPin.trim() === 'ROMANSMM') {
      setPinUnlocked(true);
      setError(null);
    } else {
      setError('Invalid Admin Security Key. Access restricted to authorized personnel.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0c0914] border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] text-slate-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <Shield className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">
            ROMAN SMM Admin Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access to this section is strictly restricted to platform administrators.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyPasscode} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Master Passcode / Secret Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter Master Admin Key..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Default access key: <code className="text-rose-300 font-bold">ROMAN92488</code> or login with authorized email (<code className="text-slate-400">rnd92488@gmail.com</code>).
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Authorize Admin Access
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ← Return to User Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
