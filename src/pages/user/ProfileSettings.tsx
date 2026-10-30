import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updatePassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const ProfileSettings: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile, logout, refreshUserData } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    setErrorMsg(null);
    setProfileSuccess(null);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        fullName: fullName.trim(),
        updatedAt: new Date().toISOString(),
      });
      if (currentUser) {
        await updateProfile(currentUser, { displayName: fullName.trim() });
      }
      await refreshUserData();
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSavingPass(true);
    setErrorMsg(null);
    setPassSuccess(null);

    try {
      await updatePassword(currentUser, newPassword);
      setPassSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change password. You may need to re-login first.');
    } finally {
      setSavingPass(false);
    }
  };

  const handleSendVerification = async () => {
    if (!currentUser) return;
    try {
      await sendEmailVerification(currentUser);
      setEmailVerificationSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send verification email.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account information, update security credentials, and view account status.
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {profileSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {passSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{passSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/25 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Account Profile
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                disabled
                value={`@${userProfile?.username || ''}`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500">Username is unique and permanent.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                {currentUser?.emailVerified ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Email Verified
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    Unverified Email
                  </span>
                )}

                {!currentUser?.emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    {emailVerificationSent ? 'Verification Sent!' : 'Send Verification Email'}
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider transition-all"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password & Security */}
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/25 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Security & Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="text-slate-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Account Protection Rules:
              </p>
              <p>• Minimum 6 characters with mixed letters & numbers</p>
              <p>• Avoid reusing passwords across external services</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPass || !newPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-40"
              >
                {savingPass ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Session Logout */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-600/40 hover:bg-rose-900/50 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out of Current Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
