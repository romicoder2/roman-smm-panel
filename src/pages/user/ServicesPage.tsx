import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Clock,
  ArrowRight,
  Crown,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SmmService } from '../../types';

export const ServicesPage: React.FC<{
  navigate: (route: string) => void;
  onSelectService?: (service: SmmService) => void;
}> = ({ navigate, onSelectService }) => {
  const { categories, services } = useData();
  const { activeVipPlan } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (!s.isActive) return false;
      const matchCat = selectedCategory === 'all' || s.categoryId === selectedCategory;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleOrderService = (srv: SmmService) => {
    if (onSelectService) onSelectService(srv);
    navigate('/new-order');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              ROMAN EMPIRE LIVE SERVICES
            </span>
            <span className="text-[10px] text-yellow-300 font-extrabold px-2 py-0.5 rounded bg-yellow-950/80 border border-yellow-600/40">
              {services.filter((s) => s.isActive).length} Available Services
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            Social Media Service Catalog & Rates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            All prices are denominated in Pakistani Rupees (PKR) per 1,000 units. Manual admin execution ensures safe delivery.
          </p>
        </div>

        {activeVipPlan && activeVipPlan.discountPercentage > 0 && (
          <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-500/40 flex items-center gap-2.5 text-xs text-yellow-200">
            <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>
              Your <strong>{activeVipPlan.name}</strong> automatically deducts{' '}
              <strong>{activeVipPlan.discountPercentage}%</strong> off all prices!
            </span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service name, platform, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Categories Tab Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            All Platforms ({services.filter((s) => s.isActive).length})
          </button>
          {activeCategories.map((c) => {
            const count = services.filter((s) => s.categoryId === c.id && s.isActive).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid/Table */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center text-slate-500 glass-card rounded-2xl border border-cyan-500/15">
          <p className="text-sm font-semibold">No services matched your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((srv) => {
            const cat = categories.find((c) => c.id === srv.categoryId);
            const discountedPrice = activeVipPlan
              ? Math.round(
                  (srv.pricePer1000 -
                    (srv.pricePer1000 * activeVipPlan.discountPercentage) / 100) *
                    100
                ) / 100
              : srv.pricePer1000;

            return (
              <div
                key={srv.id}
                className="glass-card p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between hover:border-cyan-400/40 transition-all hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                      ID: {srv.id}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {cat?.name || 'General'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {srv.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">Rate / 1000:</span>
                      <div className="text-right">
                        {activeVipPlan && activeVipPlan.discountPercentage > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="line-through text-slate-500 text-[11px]">
                              Rs. {srv.pricePer1000}
                            </span>
                            <span className="text-base font-black text-cyan-300">
                              Rs. {discountedPrice}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-black text-cyan-300">
                            Rs. {srv.pricePer1000}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Order Limits:</span>
                      <span className="text-slate-200">
                        {srv.minQuantity.toLocaleString()} - {srv.maxQuantity.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        Avg Delivery:
                      </span>
                      <span className="text-slate-200">{srv.estimatedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOrderService(srv)}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-black border border-cyan-500/40 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    Order This Service
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
