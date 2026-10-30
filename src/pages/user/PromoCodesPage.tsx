import React, { useState } from 'react';
import { Tag, Copy, Check, ArrowRight, Sparkles, Percent, Gift } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const PromoCodesPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { promoCodes } = useData();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeCodes = promoCodes.filter((p) => p.isActive);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-cyan-400" />
            Promo Codes & Discounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Apply active promotional coupons at checkout in the New Order system to save on your social media growth.
          </p>
        </div>

        <button
          onClick={() => navigate('/new-order')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
        >
          Use Code Now →
        </button>
      </div>

      {/* Grid of codes */}
      {activeCodes.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs glass-card rounded-2xl border border-cyan-500/15">
          <p>No promotional codes active at the moment. Check back soon or join our WhatsApp Channel!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCodes.map((promo) => (
            <div
              key={promo.id}
              className="glass-card p-5 rounded-2xl border border-cyan-500/25 flex flex-col justify-between hover:border-cyan-400/40 transition-all shadow-[0_0_20px_rgba(6,182,212,0.08)]"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    {promo.discountType === 'percentage' ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <Gift className="w-4 h-4" />
                    )}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-base font-mono font-black text-cyan-300 tracking-wider">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy promo code"
                  >
                    {copiedCode === promo.code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <p className="text-white font-bold text-sm">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% Off Entire Order`
                      : `Flat Rs. ${promo.discountValue} Discount`}
                  </p>
                  {promo.minOrderAmount ? (
                    <p className="text-slate-400 text-[11px]">
                      Minimum order amount: <strong>Rs. {promo.minOrderAmount}</strong>
                    </p>
                  ) : null}
                  {promo.maxDiscount ? (
                    <p className="text-slate-400 text-[11px]">
                      Max discount cap: <strong>Rs. {promo.maxDiscount}</strong>
                    </p>
                  ) : null}
                  {promo.expiresAt ? (
                    <p className="text-slate-400 text-[11px]">
                      Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    handleCopy(promo.code);
                    navigate('/new-order');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-black hover:bg-cyan-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  Apply to New Order
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
