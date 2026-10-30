import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { SmmService, ServiceCategory } from '../../types';

export const AdminServices: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const {
    categories,
    services,
    saveService,
    deleteService,
    saveCategory,
    deleteCategory,
  } = useData();

  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [search, setSearch] = useState('');

  // Service form modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<SmmService | null>(null);

  const [serviceId, setServiceId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState(categories[0]?.id || '');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(200);
  const [serviceMin, setServiceMin] = useState<number>(1000);
  const [serviceMax, setServiceMax] = useState<number>(100000);
  const [serviceEstTime, setServiceEstTime] = useState('1-3 Hours');
  const [serviceLinkType, setServiceLinkType] = useState<'video' | 'profile' | 'channel' | 'general'>('video');
  const [serviceActive, setServiceActive] = useState<boolean>(true);

  // Category form modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryOrder, setCategoryOrder] = useState<number>(1);
  const [categoryActive, setCategoryActive] = useState<boolean>(true);

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceId('srv-' + Date.now().toString(36).slice(-5));
    setServiceName('');
    setServiceCategory(categories[0]?.id || '');
    setServiceDescription('');
    setServicePrice(200);
    setServiceMin(1000);
    setServiceMax(100000);
    setServiceEstTime('1-2 Hours');
    setServiceLinkType('video');
    setServiceActive(true);
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: SmmService) => {
    setEditingService(srv);
    setServiceId(srv.id);
    setServiceName(srv.name);
    setServiceCategory(srv.categoryId);
    setServiceDescription(srv.description);
    setServicePrice(srv.pricePer1000);
    setServiceMin(srv.minQuantity);
    setServiceMax(srv.maxQuantity);
    setServiceEstTime(srv.estimatedTime);
    setServiceLinkType(srv.linkType);
    setServiceActive(srv.isActive);
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceId.trim()) return;

    const newSrv: SmmService = {
      id: serviceId.trim(),
      categoryId: serviceCategory,
      name: serviceName.trim(),
      description: serviceDescription.trim(),
      pricePer1000: Number(servicePrice),
      minQuantity: Number(serviceMin),
      maxQuantity: Number(serviceMax),
      estimatedTime: serviceEstTime.trim(),
      linkType: serviceLinkType,
      isActive: serviceActive,
    };

    await saveService(newSrv);
    setServiceModalOpen(false);
  };

  const handleDeleteService = async (id: string, name: string) => {
    const confirm = window.confirm(`Delete service "${name}" (ID: ${id})?`);
    if (!confirm) return;
    await deleteService(id);
  };

  const handleOpenAddCategory = () => {
    setCategoryId('cat-' + Date.now().toString(36).slice(-4));
    setCategoryName('');
    setCategoryOrder(categories.length + 1);
    setCategoryActive(true);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !categoryId.trim()) return;

    const newCat: ServiceCategory = {
      id: categoryId.trim(),
      name: categoryName.trim(),
      order: Number(categoryOrder),
      isActive: categoryActive,
    };

    await saveCategory(newCat);
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const confirm = window.confirm(
      `Delete category "${name}"?\n(Make sure no active services are left under this category)`
    );
    if (!confirm) return;
    await deleteCategory(id);
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-400" />
            Service & Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create categories, adjust pricing per 1,000 in PKR, modify minimum and maximum order quantities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-rose-500 text-black shadow-md'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-rose-500 text-black shadow-md'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>
      </div>

      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddService}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              Add New Service
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Rate / 1k (PKR)</th>
                    <th className="py-3 px-4">Min / Max</th>
                    <th className="py-3 px-4">Est. Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredServices.map((srv) => {
                    const cat = categories.find((c) => c.id === srv.categoryId);
                    return (
                      <tr key={srv.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-300">{srv.id}</td>
                        <td className="py-3 px-4 font-bold text-white max-w-[220px] truncate">
                          {srv.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{cat?.name || srv.categoryId}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-400">
                          Rs. {srv.pricePer1000}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {srv.minQuantity.toLocaleString()} - {srv.maxQuantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{srv.estimatedTime}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              srv.isActive
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {srv.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditService(srv)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                              title="Edit service"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv.id, srv.name)}
                              className="p-1.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                              title="Delete service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              Add Category
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-rose-500/20 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category ID</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Services Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((c) => {
                  const srvCount = services.filter((s) => s.categoryId === c.id).length;
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-bold text-slate-400">{c.order}</td>
                      <td className="py-3 px-4 font-mono text-cyan-300">{c.id}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                      <td className="py-3 px-4">{srvCount} services</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.isActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="p-1.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0c0a14] p-6 rounded-2xl border border-rose-500/40 text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setServiceModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white">
              {editingService ? `Edit Service: ${editingService.name}` : 'Create New SMM Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Service ID</label>
                  <input
                    type="text"
                    required
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. TikTok High Reach Video Promotion"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Describe service distribution features..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Rate per 1000 (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceMin}
                    onChange={(e) => setServiceMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceMax}
                    onChange={(e) => setServiceMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={serviceEstTime}
                    onChange={(e) => setServiceEstTime(e.target.value)}
                    placeholder="e.g. 0-2 Hours"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Link Type</label>
                  <select
                    value={serviceLinkType}
                    onChange={(e) => setServiceLinkType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                  >
                    <option value="video">Video / Post Link</option>
                    <option value="profile">Profile Link</option>
                    <option value="channel">Channel Link</option>
                    <option value="general">General Target Link</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srvActive"
                  checked={serviceActive}
                  onChange={(e) => setServiceActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="srvActive" className="text-xs font-bold text-white cursor-pointer">
                  Service is Active in User Panel
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Save SMM Service
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c0a14] p-6 rounded-2xl border border-rose-500/40 text-slate-200 space-y-4">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white">Add New Category</h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category ID</label>
                <input
                  type="text"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. TikTok Services"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Display Order</label>
                <input
                  type="number"
                  required
                  value={categoryOrder}
                  onChange={(e) => setCategoryOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={categoryActive}
                  onChange={(e) => setCategoryActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="catActive" className="text-xs font-bold text-white cursor-pointer">
                  Category is Active
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
