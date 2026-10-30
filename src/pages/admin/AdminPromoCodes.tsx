import React, { useState } from 'react';
import { Tag, PlusCircle, Trash2, Edit, X, Percent, Gift } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { PromoCode } from '../../types';

export const AdminPromoCodes: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { promoCodes, savePromoCode, deletePromoCode } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(200);
  const [maxDiscount, setMaxDiscount] = useState<number>(500);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [expiresAt, setExpiresAt] = useState('2027-12-31');
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingCode(null);
    setCode('ROMAN' + Math.floor(Math.random() * 90 + 10));
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrder(200);
    setMaxDiscount(500);
    setUsageLimit(500);
    setExpiresAt('2027-12-31');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: PromoCode) => {
    setEditingCode(p);
    setCode(p.code);
    setDiscountType(p.discountType);
    setDiscountValue(p.discountValue);
    setMinOrder(p.minOrderAmount || 0);
    setMaxDiscount(p.maxDiscount || 0);
    setUsageLimit(p.usageLimit || 0);
    setExpiresAt(p.expiresAt || '');
    setIsActive(p.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const promoData: PromoCode = {
      id: editingCode ? editingCode.id : 'promo-' + code.trim().toLowerCase(),
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrder) || undefined,
      maxDiscount: discountType === 'percentage' ? Number(maxDiscount) || undefined : undefined,
      usageLimit: Number(usageLimit) || undefined,
      usedCount: editingCode ? editingCode.usedCount : 0,
      isActive,
      expiresAt: expiresAt || undefined,
    };

    await savePromoCode(promoData);
    setModalOpen(false);
  };

  const handleDelete = async (id: string, c: string) => {
    const confirm = window.confirm(`Delete promo code "${c}"?`);
    if (!confirm) return;
    await deletePromoCode(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-rose-400" />
            Promo Code & Discount Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create percentage or fixed discount coupons, usage caps, and expiration dates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          Create Promo Code
        </button>
      </div>

      {/* Promo Codes Table */}
      <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Value</th>
              <th className="py-3 px-4">Min Order</th>
              <th className="py-3 px-4">Max Cap</th>
              <th className="py-3 px-4">Usage / Limit</th>
              <th className="py-3 px-4">Expires</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {promoCodes.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-mono font-black text-cyan-300">{p.code}</td>
                <td className="py-3 px-4 capitalize">{p.discountType}</td>
                <td className="py-3 px-4 font-bold text-white">
                  {p.discountType === 'percentage' ? `${p.discountValue}%` : `Rs. ${p.discountValue}`}
                </td>
                <td className="py-3 px-4">
                  {p.minOrderAmount ? `Rs. ${p.minOrderAmount}` : 'None'}
                </td>
                <td className="py-3 px-4">
                  {p.maxDiscount ? `Rs. ${p.maxDiscount}` : 'None'}
                </td>
                <td className="py-3 px-4">
                  {p.usedCount} / {p.usageLimit || '∞'}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                      title="Edit Promo"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.code)}
                      className="p-1.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                      title="Delete Promo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
              {editingCode ? `Edit Promo: ${editingCode.code}` : 'Create Promo Code'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP20"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase text-xs focus:border-rose-400 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Min Order (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Max Discount (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min={0}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promoActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="promoActive" className="text-xs font-bold text-white cursor-pointer">
                  Promo Code is Active
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Save Promo Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
