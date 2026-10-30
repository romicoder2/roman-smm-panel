import React, { useState } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const AddFunds: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile, wallet } = useAuth();
  const { systemConfig, submitDeposit } = useData();

  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'Easypaisa' | 'SadaPay'>('JazzCash');
  const [amount, setAmount] = useState<number>(500);
  const [transactionId, setTransactionId] = useState<string>('');
  const [screenshotData, setScreenshotData] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const accountNumber =
    paymentMethod === 'JazzCash'
      ? systemConfig.paymentJazzCash || '923037224620'
      : paymentMethod === 'Easypaisa'
      ? systemConfig.paymentEasypaisa || '923037224620'
      : systemConfig.paymentSadaPay || '923037224620';

  const accountHolder = systemConfig.accountHolder || 'Mian Roman';

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Screenshot file size must be under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotData(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
      setErrorMsg('Please sign in to submit a deposit request.');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMsg('Transaction ID (TID) is required.');
      return;
    }

    if (amount < 100) {
      setErrorMsg('Minimum deposit amount is Rs. 100.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res = await submitDeposit({
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      username: userProfile.username,
      paymentMethod,
      accountNumber,
      amount,
      transactionId: transactionId.trim(),
      screenshotUrl: screenshotData || undefined,
    });

    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(
        'Your deposit request has been submitted successfully. Waiting for admin verification.'
      );
      setTransactionId('');
      setScreenshotData('');
    } else {
      setErrorMsg(res.error || 'Failed to submit deposit.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            Add Funds to Wallet
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manual Verification System • Pay via JazzCash, Easypaisa, or SadaPay in PKR
          </p>
        </div>

        <button
          onClick={() => navigate('/deposits')}
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
        >
          View Deposit History →
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            Deposit Request Submitted
          </div>
          <p>{successMsg}</p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => navigate('/deposits')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs"
            >
              Check Verification Status
            </button>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-xs text-emerald-300 hover:underline"
            >
              Submit Another Deposit
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Account Details Card */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/25 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Official Payment Details
            </h3>

            {/* Method selection tabs */}
            <div className="grid grid-cols-3 gap-2">
              {(['JazzCash', 'Easypaisa', 'SadaPay'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                    paymentMethod === method
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Account Box */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {paymentMethod} Account Number
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-mono font-black text-cyan-300 tracking-wider">
                    {accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Copy number"
                  >
                    {copiedAccount ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Account Holder
                </span>
                <p className="text-xs font-bold text-white mt-0.5">{accountHolder}</p>
              </div>
            </div>

            {/* Deposit Instructions */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <p className="text-white font-semibold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Deposit Instructions:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Send your desired amount (Min Rs. 100) via your {paymentMethod} app.</li>
                <li>Copy the Transaction ID (TID) from the SMS or app receipt.</li>
                <li>Take a screenshot of the completed transfer receipt.</li>
                <li>Submit the form with your exact TID and screenshot.</li>
                <li>Admin manually verifies and credits your wallet within 5-30 minutes.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Deposit Submission Form */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-cyan-500/25">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            Submit Deposit Request
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Payment Method Used
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
              >
                <option value="JazzCash">JazzCash (923037224620 - Mian Roman)</option>
                <option value="Easypaisa">Easypaisa (923037224620 - Mian Roman)</option>
                <option value="SadaPay">SadaPay (923037224620 - Mian Roman)</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Deposit Amount in PKR (Pakistani Rupees)
              </label>
              <input
                type="number"
                required
                min={100}
                step={10}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-400 focus:outline-none"
              />

              {/* Quick preset buttons */}
              <div className="mt-2 flex flex-wrap gap-2">
                {[200, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 font-semibold"
                  >
                    Rs. {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Transaction ID (TID)
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.trim())}
                placeholder="e.g. 12345678901 (from your SMS or App receipt)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Must match the TID on your receipt. Duplicate TIDs are automatically rejected.
              </p>
            </div>

            {/* Upload Screenshot */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Payment Screenshot
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-800 border-dashed rounded-xl hover:border-cyan-500/40 transition-colors bg-slate-950/40">
                <div className="space-y-2 text-center">
                  {screenshotData ? (
                    <div className="relative inline-block">
                      <img
                        src={screenshotData}
                        alt="Receipt preview"
                        className="max-h-40 rounded-lg border border-cyan-500/40 shadow-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => setScreenshotData('')}
                        className="mt-2 text-[11px] text-rose-400 hover:underline block mx-auto"
                      >
                        Remove Screenshot
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <div className="flex text-xs text-slate-400 justify-center">
                        <label className="relative cursor-pointer rounded-md font-bold text-cyan-400 hover:text-cyan-300">
                          <span>Upload receipt image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-[10px] text-slate-500">PNG, JPG, JPEG up to 3MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting || !transactionId.trim() || amount < 100}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="animate-pulse">Submitting Deposit...</span>
                ) : (
                  <>
                    Submit Deposit Request (Rs. {amount})
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
