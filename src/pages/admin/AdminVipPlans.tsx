import React, { useState } from 'react';
import { Crown, PlusCircle, Edit, CheckCircle2, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { VipPlan } from '../../types';

export const AdminVipPlans: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { vipPlans, saveVipPlan } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VipPlan | null>(null);

  const [planId, setPlanId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(299);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [discountPercentage, setDiscountPercentage] = useState<number>(5);
  const [benefitsText, setBenefitsText] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleOpenEdit = (p: VipPlan) => {
    setEditingPlan(p);
    setPlanId(p.id);
    setName(p.name);
    setPrice(p.price);
    setDurationDays(p.durationDays);
    setDiscountPercentage(p.discountPercentage);
    setBenefitsText(p.benefits.join('\n'));
    setIsActive(p.isActive);
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setPlanId('vip-' + Date.now().toString(36).slice(-4));
    setName('');
    setPrice(499);
    setDurationDays(30);
    setDiscountPercentage(10);
    setBenefitsText('High priority execution\nDedicated WhatsApp manager');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !planId.trim()) return;

    const benefits = benefitsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const planData: VipPlan = {
      id: planId.trim(),
      name: name.trim(),
      price: Number(price),
      durationDays: Number(durationDays),
      discountPercentage: Number(discountPercentage),
      benefits,
      badgeColor: 'border-cyan-400 text-cyan-300',
      isActive,
    };

    await saveVipPlan(planData);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-rose-400" />
            VIP Membership Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure VIP membership plans, prices in PKR, order discount percentages, and durations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          Add VIP Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vipPlans.map((plan) => (
          <div
            key={plan.id}
            className="glass-card p-5 rounded-2xl border border-rose-500/25 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {plan.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    plan.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white">{plan.name}</h3>
              <div className="mt-2 mb-3">
                <span className="text-xl font-black text-cyan-300">
                  {plan.price === 0 ? 'FREE' : `Rs. ${plan.price}`}
                </span>
                <span className="text-xs text-slate-400"> /{plan.durationDays} days</span>
              </div>

              <div className="py-1 px-2.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-bold inline-block mb-3">
                {plan.discountPercentage}% Discount on Orders
              </div>

              <ul className="space-y-1.5 text-xs text-slate-300">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleOpenEdit(plan)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c0a14] p-6 rounded-2xl border border-rose-500/40 text-slate-200 space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white">
              {editingPlan ? `Edit VIP Plan: ${editingPlan.name}` : 'Create VIP Plan'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plan ID</label>
                <input
                  type="text"
                  required
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diamond VIP"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Duration Days</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Benefits (One per line)
                </label>
                <textarea
                  rows={3}
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="planActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="planActive" className="text-xs font-bold text-white cursor-pointer">
                  Plan is Active
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Save VIP Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
