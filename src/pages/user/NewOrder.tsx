import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ArrowRight,
  Crown,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const NewOrder: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { currentUser, userProfile, wallet, activeVipPlan } = useAuth();
  const { categories, services, promoCodes, placeOrder } = useData();

  // Active categories & services
  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);

  // Form selections
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(activeCategories[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [targetLink, setTargetLink] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);

  // Promo code
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Filtered services for chosen category
  const filteredServices = useMemo(() => {
    return services.filter((s) => s.categoryId === selectedCategoryId && s.isActive);
  }, [services, selectedCategoryId]);

  // Auto-select first service when category changes
  React.useEffect(() => {
    if (filteredServices.length > 0) {
      if (!filteredServices.some((s) => s.id === selectedServiceId)) {
        setSelectedServiceId(filteredServices[0].id);
        setQuantity(filteredServices[0].minQuantity || 1000);
      }
    } else {
      setSelectedServiceId('');
    }
  }, [selectedCategoryId, filteredServices]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Dynamic link placeholder
  const linkPlaceholder = useMemo(() => {
    if (!selectedService) return 'Enter target URL link...';
    if (selectedService.linkType === 'video') {
      return 'For video or post promotion, enter your Video/Post Link.';
    }
    if (selectedService.linkType === 'profile') {
      return 'For profile promotion, enter your Profile Link.';
    }
    if (selectedService.linkType === 'channel') {
      return 'For channel promotion, enter your Channel Link.';
    }
    return 'For promotion, enter your target link.';
  }, [selectedService]);

  // Step 5: Pricing calculation formula
  // Total Price = (Quantity / 1000) * Price Per 1000
  const calculation = useMemo(() => {
    if (!selectedService || !quantity || quantity <= 0) {
      return {
        originalPrice: 0,
        vipDiscount: 0,
        promoDiscount: 0,
        finalPrice: 0,
      };
    }

    const pricePer1000 = selectedService.pricePer1000 || 0;
    const originalPrice = Math.round((quantity / 1000) * pricePer1000 * 100) / 100;

    // 1. VIP Discount
    const vipPercent = activeVipPlan?.discountPercentage || 0;
    const vipDiscount = Math.round(((originalPrice * vipPercent) / 100) * 100) / 100;

    const priceAfterVip = Math.max(0, originalPrice - vipDiscount);

    // 2. Promo code discount
    let promoDiscount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        const disc = (priceAfterVip * appliedPromo.discountValue) / 100;
        promoDiscount = appliedPromo.maxDiscount ? Math.min(disc, appliedPromo.maxDiscount) : disc;
      } else {
        promoDiscount = appliedPromo.discountValue;
      }
      promoDiscount = Math.round(promoDiscount * 100) / 100;
    }

    const finalPrice = Math.max(0, Math.round((originalPrice - vipDiscount - promoDiscount) * 100) / 100);

    return {
      originalPrice,
      vipDiscount,
      promoDiscount,
      finalPrice,
    };
  }, [selectedService, quantity, activeVipPlan, appliedPromo]);

  // Apply promo code
  const handleApplyPromo = () => {
    setPromoError(null);
    if (!promoInput.trim()) return;

    const code = promoInput.trim().toUpperCase();
    const found = promoCodes.find((p) => p.code.toUpperCase() === code && p.isActive);

    if (!found) {
      setPromoError('Invalid or expired promo code.');
      setAppliedPromo(null);
      return;
    }

    if (found.minOrderAmount && calculation.originalPrice < found.minOrderAmount) {
      setPromoError(`Minimum order of Rs. ${found.minOrderAmount} required for this code.`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const currentBalance = wallet?.balance ?? 0;
  const isInsufficientBalance = currentBalance < calculation.finalPrice;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
      setOrderError('Please sign in to place an order.');
      return;
    }

    if (!selectedService) {
      setOrderError('Please select a service.');
      return;
    }

    if (!targetLink.trim()) {
      setOrderError('Target link is required.');
      return;
    }

    if (quantity < selectedService.minQuantity || quantity > selectedService.maxQuantity) {
      setOrderError(
        `Quantity must be between ${selectedService.minQuantity.toLocaleString()} and ${selectedService.maxQuantity.toLocaleString()}.`
      );
      return;
    }

    if (isInsufficientBalance) {
      setOrderError(
        `Insufficient wallet balance. You need Rs. ${calculation.finalPrice}, but have Rs. ${currentBalance}. Please Add Funds.`
      );
      return;
    }

    setSubmitting(true);
    setOrderError(null);

    const chosenCat = categories.find((c) => c.id === selectedCategoryId);

    const res = await placeOrder({
      userId: currentUser.uid,
      username: userProfile.username,
      categoryId: selectedCategoryId,
      categoryName: chosenCat?.name || 'General',
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      targetLink: targetLink.trim(),
      quantity,
      pricePer1000: selectedService.pricePer1000,
      originalPrice: calculation.originalPrice,
      vipDiscount: calculation.vipDiscount,
      promoDiscount: calculation.promoDiscount,
      finalPrice: calculation.finalPrice,
      promoCode: appliedPromo?.code,
    });

    setSubmitting(false);

    if (res.success && res.orderId) {
      setOrderSuccess(
        `Your order #${res.orderId} has been successfully submitted to ROMAN SMM PANEL. Waiting for admin manual processing.`
      );
      setTargetLink('');
      setAppliedPromo(null);
      setPromoInput('');
    } else {
      setOrderError(res.error || 'Failed to place order.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-cyan-400" />
            Place New Order
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose your service, paste your destination link, and let ROMAN EMPIRE handle high-retention execution.
          </p>
        </div>

        {/* Live balance indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs">
          <Wallet className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-none">Wallet Balance</span>
            <span className="font-extrabold text-cyan-300">Rs. {currentBalance.toLocaleString()}</span>
          </div>
          <button
            onClick={() => navigate('/add-funds')}
            className="ml-2 text-[10px] font-bold text-cyan-400 hover:underline"
          >
            + Add Funds
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {orderSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            Order Submitted Successfully!
          </div>
          <p>{orderSuccess}</p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs"
            >
              Track Order Status →
            </button>
            <button
              onClick={() => setOrderSuccess(null)}
              className="text-xs text-emerald-300 hover:underline"
            >
              Place Another Order
            </button>
          </div>
        </div>
      )}

      {/* Order Error */}
      {orderError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{orderError}</span>
          </div>
          {isInsufficientBalance && (
            <button
              onClick={() => navigate('/add-funds')}
              className="px-3 py-1 rounded bg-rose-500 text-black font-bold text-xs whitespace-nowrap"
            >
              Add Funds (PKR)
            </button>
          )}
        </div>
      )}

      {/* Multi-step Form */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5 glass-card p-6 rounded-2xl border border-cyan-500/25">
          {/* STEP 1: Select Category */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Step 1: Select Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: Select Service */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Step 2: Select Service
            </label>
            {filteredServices.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No services active in this category.</p>
            ) : (
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  const s = services.find((srv) => srv.id === e.target.value);
                  if (s) setQuantity(s.minQuantity);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                {filteredServices.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — Rs. {srv.pricePer1000}/1k
                  </option>
                ))}
              </select>
            )}

            {/* Service Details Card */}
            {selectedService && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs text-slate-300 space-y-1.5">
                <p className="text-slate-400 leading-relaxed">{selectedService.description}</p>
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                  <span>
                    Min: <strong className="text-cyan-300">{selectedService.minQuantity.toLocaleString()}</strong>
                  </span>
                  <span>
                    Max: <strong className="text-cyan-300">{selectedService.maxQuantity.toLocaleString()}</strong>
                  </span>
                  <span>
                    Rate: <strong className="text-emerald-400">Rs. {selectedService.pricePer1000} / 1000</strong>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    Est: {selectedService.estimatedTime}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Required Target Link with dynamic placeholder */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Step 3: Target Link
            </label>
            <input
              type="url"
              required
              value={targetLink}
              onChange={(e) => setTargetLink(e.target.value)}
              placeholder={linkPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Ensure your account or video privacy is set to <strong>Public</strong> before placing order.
            </p>
          </div>

          {/* STEP 4: Enter Quantity */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Step 4: Quantity
              </label>
              {selectedService && (
                <span className="text-[11px] text-slate-400">
                  Range: {selectedService.minQuantity.toLocaleString()} - {selectedService.maxQuantity.toLocaleString()}
                </span>
              )}
            </div>
            <input
              type="number"
              required
              min={selectedService?.minQuantity || 100}
              max={selectedService?.maxQuantity || 1000000}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors font-bold text-base"
            />

            {/* Quick quantity selector pills */}
            <div className="mt-2 flex flex-wrap gap-2">
              {[1000, 2500, 5000, 10000, 25000].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 font-semibold transition-colors"
                >
                  +{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Promo Code Input */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Apply Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="e.g. ROMAN10 or WELCOME50"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs uppercase font-mono focus:border-cyan-400 focus:outline-none"
              />
              {appliedPromo ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="px-3 py-2 rounded-lg bg-rose-950 text-rose-300 border border-rose-700 text-xs font-bold"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold"
                >
                  Apply
                </button>
              )}
            </div>
            {promoError && <p className="text-[11px] text-rose-400 mt-1">{promoError}</p>}
            {appliedPromo && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Promo "{appliedPromo.code}" applied successfully!
              </p>
            )}
          </div>
        </div>

        {/* STEP 5 & 6: Order Summary & Price Breakdown Card */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Order Calculation
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Service:</span>
                <span className="text-white font-medium truncate max-w-[150px] text-right">
                  {selectedService?.name || 'None'}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Quantity:</span>
                <span className="text-white font-bold">{quantity.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Price Per 1000:</span>
                <span className="text-white">Rs. {selectedService?.pricePer1000 || 0}</span>
              </div>

              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Original Price:</span>
                <span className="text-slate-200 font-semibold">Rs. {calculation.originalPrice}</span>
              </div>

              {/* VIP Discount */}
              {calculation.vipDiscount > 0 && (
                <div className="flex justify-between text-yellow-300">
                  <span className="flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-yellow-400" />
                    VIP Discount ({activeVipPlan?.discountPercentage}%):
                  </span>
                  <span className="font-bold">- Rs. {calculation.vipDiscount}</span>
                </div>
              )}

              {/* Promo Discount */}
              {calculation.promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    Promo ({appliedPromo?.code}):
                  </span>
                  <span className="font-bold">- Rs. {calculation.promoDiscount}</span>
                </div>
              )}

              {/* Final Price */}
              <div className="pt-3 border-t border-cyan-500/30 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-white">Final Payable:</span>
                <span className="text-2xl font-black text-cyan-400 tracking-tight">
                  Rs. {calculation.finalPrice}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px]">
                <span className="text-slate-400">Available Wallet:</span>
                <span
                  className={`font-bold ${
                    isInsufficientBalance ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  Rs. {currentBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {isInsufficientBalance && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] space-y-1.5">
                <p className="font-bold">Insufficient Balance</p>
                <p>
                  You need Rs. {(calculation.finalPrice - currentBalance).toFixed(2)} more to place this order.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/add-funds')}
                  className="w-full mt-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs uppercase"
                >
                  Deposit Funds Now
                </button>
              </div>
            )}

            {/* STEP 6: Confirm and Place Order */}
            <button
              type="submit"
              disabled={submitting || isInsufficientBalance || !selectedService || !targetLink.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span className="animate-pulse">Placing Order...</span>
              ) : (
                <>
                  Confirm & Submit Order
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="text-white font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Manual Admin Processing Notice:
            </p>
            <p>
              All orders are queued for manual inspection by ROMAN EMPIRE operators to guarantee platform-safe organic distribution.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
