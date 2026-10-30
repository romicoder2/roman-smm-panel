import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  CreditCard,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AdminSettings: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { systemConfig, updateConfig } = useData();

  const [siteName, setSiteName] = useState(systemConfig.siteName || 'ROMAN SMM PANEL');
  const [brandName, setBrandName] = useState(systemConfig.brandName || 'ROMAN EMPIRE');
  const [tagline, setTagline] = useState(
    systemConfig.tagline || 'Your Social Media Growth Platform.'
  );
  const [announcement, setAnnouncement] = useState(systemConfig.announcement || '');
  const [whatsappUrl, setWhatsappUrl] = useState(
    systemConfig.whatsappUrl || 'https://whatsapp.com/channel/0029VawwXaeEquiIR1CLXA30'
  );
  const [paymentJazzCash, setPaymentJazzCash] = useState(
    systemConfig.paymentJazzCash || '923037224620'
  );
  const [paymentEasypaisa, setPaymentEasypaisa] = useState(
    systemConfig.paymentEasypaisa || '923037224620'
  );
  const [paymentSadaPay, setPaymentSadaPay] = useState(
    systemConfig.paymentSadaPay || '923037224620'
  );
  const [accountHolder, setAccountHolder] = useState(
    systemConfig.accountHolder || 'Mian Roman'
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    systemConfig.maintenanceMode || false
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await updateConfig({
      siteName,
      brandName,
      tagline,
      announcement,
      whatsappUrl,
      paymentJazzCash,
      paymentEasypaisa,
      paymentSadaPay,
      accountHolder,
      maintenanceMode,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-400" />
            Website & Payment Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Updates to payment accounts, WhatsApp broadcast link, and announcement banners propagate instantly across the platform.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Platform settings updated successfully in Firestore.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            Platform Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Website Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Brand Name</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tagline</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Top Announcement Banner (Displayed on Navbar)
            </label>
            <textarea
              rows={2}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Payment Gateways (JazzCash, Easypaisa, SadaPay) */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Manual Deposit Account Details (PKR)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                JazzCash Account Number
              </label>
              <input
                type="text"
                required
                value={paymentJazzCash}
                onChange={(e) => setPaymentJazzCash(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Easypaisa Account Number
              </label>
              <input
                type="text"
                required
                value={paymentEasypaisa}
                onChange={(e) => setPaymentEasypaisa(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                SadaPay Account Number
              </label>
              <input
                type="text"
                required
                value={paymentSadaPay}
                onChange={(e) => setPaymentSadaPay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-rose-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Official Channels & Maintenance */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            Community & Platform Mode
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              WhatsApp Broadcast Channel Link
            </label>
            <input
              type="url"
              required
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="maintMode"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-400"
            />
            <label htmlFor="maintMode" className="text-xs font-bold text-white cursor-pointer">
              Enable Maintenance Mode (Restricts new order placements)
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-black" />
          {saving ? 'Saving Changes...' : 'Save All Platform Settings'}
        </button>
      </form>
    </div>
  );
};
