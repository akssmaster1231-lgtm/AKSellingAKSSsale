import React, { useState, useMemo } from 'react';
import { Product, ProductColor } from '../../types';
import { 
  Search, Filter, Plus, Layers, AlertCircle, AlertTriangle, 
  CheckCircle2, Edit3, Trash2, Tag, Eye, ChevronDown, Check,
  X, Sparkles, ArrowUpRight, DollarSign, Package, Home, Zap
} from 'lucide-react';

export type CatalogStatusTab = 'Active' | 'Activation Pending' | 'Blocked' | 'Paused';
export type StockSubFilter = 'All' | 'Out of Stock' | 'Low Stock';

interface SellerInventoryViewProps {
  products: Product[];
  onOpenAddCatalog: () => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onRefresh?: () => void;
}

export const SellerInventoryView: React.FC<SellerInventoryViewProps> = ({
  products,
  onOpenAddCatalog,
  onUpdateProduct,
  onDeleteProduct,
  onRefresh,
}) => {
  const [activeCatalogTab, setActiveCatalogTab] = useState<CatalogStatusTab>('Active');
  const [stockFilter, setStockFilter] = useState<StockSubFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Quick Inline Editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<string>('');

  // Catalog Status Real Counts
  const counts = useMemo(() => {
    const active = products.filter((p) => p.inStock || p.stockCount > 0).length;
    const pending = 0;
    const blocked = 0;
    const paused = products.filter((p) => !p.inStock && p.stockCount === 0).length;
    const outOfStock = products.filter((p) => p.stockCount === 0 || !p.inStock).length;
    const lowStock = products.filter((p) => p.stockCount > 0 && p.stockCount <= 10).length;

    return {
      active,
      pending,
      blocked,
      paused,
      outOfStock,
      lowStock,
      allStock: products.length,
    };
  }, [products]);

  // Categories list
  const categories = ['All', 'Oversized', 'Graphic', 'Acid Wash', 'Plain Basics', 'Polo & Collared', 'Anime & Gaming', 'Gym & Active'];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Stock Sub-Filter
      if (stockFilter === 'Out of Stock' && (product.stockCount > 0 && product.inStock)) {
        return false;
      }
      if (stockFilter === 'Low Stock' && (product.stockCount > 10 || product.stockCount === 0)) {
        return false;
      }

      // 2. Category
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // 3. Search Query (Title, ID, SKU, Fabric)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesId = product.id.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesCategory) return false;
      }

      return true;
    });
  }, [products, stockFilter, selectedCategory, searchQuery]);

  // Stock Quantity Modifier (+ / -)
  const handleModifyStock = (product: Product, delta: number) => {
    const newStock = Math.max(0, (product.stockCount || 0) + delta);
    onUpdateProduct(product.id, {
      stockCount: newStock,
      inStock: newStock > 0,
    });
  };

  const handleSaveStockInput = (productId: string) => {
    const newStock = Math.max(0, parseInt(tempStock, 10) || 0);
    onUpdateProduct(productId, {
      stockCount: newStock,
      inStock: newStock > 0,
    });
    setEditingStockId(null);
  };

  const handleSavePriceInput = (productId: string) => {
    const newPrice = Math.max(99, parseInt(tempPrice, 10) || 0);
    onUpdateProduct(productId, {
      price: newPrice,
    });
    setEditingPriceId(null);
  };

  const handleToggleProductStatus = (product: Product) => {
    const newInStock = !product.inStock;
    onUpdateProduct(product.id, {
      inStock: newInStock,
      stockCount: newInStock && product.stockCount === 0 ? 25 : product.stockCount,
    });
  };

  return (
    <div id="seller-inventory-view" className="space-y-3 pb-24 px-3 sm:px-4 max-w-7xl mx-auto pt-3">
      {/* 1. TOP HEADER ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0A3A1E]" />
            <span>Catalog &amp; Inventory Management</span>
          </h3>
          <p className="text-[11px] text-slate-500">Live SKUs active on WhatsApp &amp; Customer storefront</p>
        </div>

        <button
          id="inventory-btn-add-product"
          type="button"
          onClick={onOpenAddCatalog}
          className="bg-[#FFC107] hover:bg-[#FFD700] active:scale-95 text-[#052610] px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Single / Bulk Catalog</span>
        </button>
      </div>

      {/* 2. CATALOG STATUS TABS (Active, Activation Pending, Blocked, Paused) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {[
          { id: 'Active' as const, label: 'Active', count: counts.active },
          { id: 'Activation Pending' as const, label: 'QC Pending', count: counts.pending },
          { id: 'Paused' as const, label: 'Paused', count: counts.paused },
          { id: 'Blocked' as const, label: 'Blocked', count: counts.blocked },
        ].map((tab) => {
          const isActive = activeCatalogTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`catalog-tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => setActiveCatalogTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. SEARCH & SUB-FILTERS (All Stock, Out of Stock, Low Stock) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="inventory-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU ID, T-Shirt Title, or Category..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3A1E] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stock Sub-Filters Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1">
            {[
              { id: 'All' as const, label: 'All Stock', count: counts.allStock },
              { id: 'Out of Stock' as const, label: 'Out of Stock', count: counts.outOfStock },
              { id: 'Low Stock' as const, label: 'Low Stock (<10)', count: counts.lowStock },
            ].map((sub) => {
              const isActive = stockFilter === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setStockFilter(sub.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{sub.label}</span>
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sub.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0A3A1E]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. PRODUCTS / INVENTORY LIST */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No items match your filter</h4>
            <p className="text-xs text-slate-500">Try clearing your search query or selecting "All Stock".</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isOutOfStock = product.stockCount === 0 || !product.inStock;
            const isLowStock = product.stockCount > 0 && product.stockCount <= 10;

            return (
              <div
                key={product.id}
                id={`inventory-card-${product.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 transition-all overflow-hidden p-4 space-y-3"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80'}
                    alt={product.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded truncate">
                        SKU: {product.id}
                      </span>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock (${product.stockCount})` : `In Stock (${product.stockCount})`}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 truncate">
                      {product.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>{product.category}</span>
                      {product.customCategoryName && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">
                          Custom: {product.customCategoryName}
                        </span>
                      )}
                      <span>•</span>
                      <span>{product.fabric.slice(0, 24)}...</span>
                    </p>

                    {/* Quick Placement Toggles */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold mr-0.5">Showcase:</span>
                      
                      {/* Home Showcase Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = product.showOnHome !== false && !product.isStandardCatalogOnly;
                          onUpdateProduct(product.id, {
                            showOnHome: !currentVal,
                            ...(currentVal ? {} : { isStandardCatalogOnly: false })
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          product.showOnHome !== false && !product.isStandardCatalogOnly
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Toggle Home Showcase display"
                      >
                        <Home className="w-2.5 h-2.5" />
                        <span>Home</span>
                      </button>

                      {/* Best Deals / Flash Sale Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = !!product.featureInBestDeals;
                          onUpdateProduct(product.id, {
                            featureInBestDeals: !currentVal,
                            ...(currentVal ? {} : { isStandardCatalogOnly: false })
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          product.featureInBestDeals
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Toggle Best Deals / Flash Sale showcase"
                      >
                        <Zap className="w-2.5 h-2.5 text-amber-600" />
                        <span>Best Deals</span>
                      </button>

                      {/* Standard Catalog Only Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = !!product.isStandardCatalogOnly;
                          onUpdateProduct(product.id, {
                            isStandardCatalogOnly: !currentVal,
                            ...(currentVal ? { showOnHome: true } : { showOnHome: false, featureInBestDeals: false })
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          product.isStandardCatalogOnly
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Toggle Catalog Only (hidden from Home/Deals)"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>Catalog Only</span>
                      </button>
                    </div>

                    {/* Price and Discount Info */}
                    <div className="flex items-center gap-2 pt-0.5">
                      {editingPriceId === product.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-700">₹</span>
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-20 px-2 py-0.5 text-xs font-bold rounded border border-emerald-500 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePriceInput(product.id)}
                            className="p-1 bg-[#0A3A1E] text-[#FFC107] rounded hover:bg-[#052610] cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-slate-900">₹{product.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {product.discountPercent}% Off
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriceId(product.id);
                              setTempPrice(String(product.price));
                            }}
                            title="Edit Price"
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Stock Quantity Adjuster Strip */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Stock Units:</span>

                    {editingStockId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempStock}
                          onChange={(e) => setTempStock(e.target.value)}
                          className="w-16 px-2 py-1 text-xs font-bold rounded border border-emerald-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveStockInput(product.id)}
                          className="p-1 bg-[#0A3A1E] text-[#FFC107] rounded hover:bg-[#052610] cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleModifyStock(product, -5)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs active:scale-95"
                          title="Decrease by 5"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModifyStock(product, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs active:scale-95"
                          title="Decrease by 1"
                        >
                          -1
                        </button>
                        <span
                          onClick={() => {
                            setEditingStockId(product.id);
                            setTempStock(String(product.stockCount));
                          }}
                          className="px-2.5 text-xs font-black text-slate-900 cursor-pointer hover:underline"
                        >
                          {product.stockCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleModifyStock(product, +1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs active:scale-95"
                          title="Add 1"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModifyStock(product, +10)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs active:scale-95"
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleProductStatus(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        product.inStock
                          ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {product.inStock ? 'Pause Catalog' : 'Activate Catalog'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
