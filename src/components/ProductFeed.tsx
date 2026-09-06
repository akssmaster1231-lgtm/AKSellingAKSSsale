import React, { useState, useMemo } from 'react';
import { Product, AppCategory } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, Shirt, Flame, Tag, Layers, RefreshCw, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface ProductFeedProps {
  products: Product[];
  categories?: AppCategory[];
  onOpenProduct: (product: Product) => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Product) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
}

const DEFAULT_CATEGORY_FILTERS = [
  { label: 'All Apparel', value: 'All', icon: Sparkles },
  { label: 'Oversized Tees', value: 'Oversized', icon: Shirt },
  { label: 'Jeans & Denim', value: 'Jeans & Denim', icon: Tag },
  { label: 'Cargo Pants', value: 'Cargo Pants', icon: Layers },
  { label: 'Hoodies & Sweats', value: 'Hoodies & Sweats', icon: Flame },
  { label: 'Graphic DTF', value: 'Graphic', icon: Flame },
  { label: 'Shirts & Trousers', value: 'Shirts & Trousers', icon: Shirt },
  { label: 'Acid Wash Vintage', value: 'Acid Wash', icon: Tag },
  { label: 'Anime & Manga', value: 'Anime & Gaming', icon: Layers },
  { label: 'Plain Basics', value: 'Plain Basics', icon: Shirt },
  { label: 'Waffle Knit Polos', value: 'Polo & Collared', icon: Sparkles },
  { label: 'Gym & Active', value: 'Gym & Active', icon: Flame },
];

export const ProductFeed: React.FC<ProductFeedProps> = ({
  products,
  categories = [],
  onOpenProduct,
  wishlistIds,
  onToggleWishlist,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  onClearSearch,
}) => {
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('popular');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under500' | 'under700' | 'above700'>('all');
  const [assuredOnly, setAssuredOnly] = useState(false);

  // Dynamically merge default filters with any custom categories created in Firebase
  const categoryFilters = useMemo(() => {
    const customList = categories
      .filter((c) => c.isCustom || !DEFAULT_CATEGORY_FILTERS.some((d) => d.value.toLowerCase() === c.name.toLowerCase()))
      .map((c) => ({
        label: c.name,
        value: c.name,
        icon: Tag,
        isCustom: true,
        emoji: c.icon,
      }));

    return [...DEFAULT_CATEGORY_FILTERS, ...customList];
  }, [categories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Granular Placement & Visibility Filter
    // When viewing 'All' and not explicitly searching, respect storefront placement toggles:
    // Exclude products marked with isStandardCatalogOnly === true or showOnHome === false
    if ((!selectedCategory || selectedCategory === 'All') && !searchQuery.trim()) {
      result = result.filter((p) => {
        if (p.isStandardCatalogOnly) return false;
        if (p.showOnHome === false) return false;
        return true;
      });
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter((p) => {
        const prodCat = (p.category || '').toLowerCase();
        const customCat = (p.customCategoryName || '').toLowerCase();
        return (
          prodCat === catLower ||
          customCat === catLower ||
          prodCat.includes(catLower) ||
          (catLower === 'oversized' && (prodCat.includes('t-shirt') || prodCat.includes('tee') || prodCat.includes('oversized'))) ||
          (catLower === 'jeans & denim' && (prodCat.includes('jean') || prodCat.includes('denim'))) ||
          (catLower === 'cargo pants' && prodCat.includes('cargo')) ||
          (catLower === 'hoodies & sweats' && (prodCat.includes('hoodie') || prodCat.includes('sweat')))
        );
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.customCategoryName && p.customCategoryName.toLowerCase().includes(q)) ||
          p.fabric.toLowerCase().includes(q) ||
          p.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }

    // Assured filter
    if (assuredOnly) {
      result = result.filter((p) => p.isAssured);
    }

    // Price filter
    if (priceFilter === 'under500') {
      result = result.filter((p) => p.price <= 500);
    } else if (priceFilter === 'under700') {
      result = result.filter((p) => p.price <= 700);
    } else if (priceFilter === 'above700') {
      result = result.filter((p) => p.price > 700);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else {
      // popular
      result.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, assuredOnly, priceFilter, sortBy]);

  return (
    <section className="space-y-4" id="flipkart-product-feed-section">
      {/* Category Pills Bar (WhatsApp Chat Filters Style) */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categoryFilters.map((cat: any) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.emoji ? (
                  <span className="text-xs">{cat.emoji}</span>
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FFC107]' : 'text-slate-500'}`} />
                )}
                <span>{cat.label}</span>
                {cat.isCustom && (
                  <span className={`text-[8px] uppercase tracking-wider px-1 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-[#FFC107]/20 text-[#FFC107]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Custom
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Controls Row */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Result Counter & Assured Badge Toggle */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800">
            Showing <strong className="text-[#0A3A1E] font-mono font-black">{filteredProducts.length}</strong> T-Shirts
          </span>

          <button
            onClick={() => setAssuredOnly((a) => !a)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
              assuredOnly
                ? 'bg-[#FFC107]/20 border-[#FFC107] text-[#052610]'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${assuredOnly ? 'bg-[#0A3A1E] border-[#0A3A1E]' : 'border-slate-400'}`}>
              {assuredOnly && <CheckCircle2 className="w-2.5 h-2.5 text-[#FFC107]" />}
            </div>
            <span>AK-Assured Only</span>
          </button>
        </div>

        {/* Right: Quick Price Filter & Sort Dropdown */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Price Range Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                priceFilter === 'all' ? 'bg-[#0A3A1E] shadow-xs text-[#FFC107]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter('under500')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                priceFilter === 'under500' ? 'bg-[#0A3A1E] shadow-xs text-[#FFC107]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              &lt; ₹500
            </button>
            <button
              onClick={() => setPriceFilter('under700')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                priceFilter === 'under700' ? 'bg-[#0A3A1E] shadow-xs text-[#FFC107]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              &lt; ₹700
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 pl-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1 px-2.5 rounded-xl border border-slate-200 outline-none cursor-pointer text-xs"
              id="sort-products-select"
            >
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search Banner */}
      {searchQuery && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-2.5 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
          <span>
            Search results for "<strong>{searchQuery}</strong>" ({filteredProducts.length} items found)
          </span>
          <button
            onClick={onClearSearch}
            className="text-[#0A3A1E] font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4"
          id="flipkart-product-grid"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenProduct={onOpenProduct}
              isWishlisted={wishlistIds.has(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#0A3A1E] flex items-center justify-center mx-auto">
            <Shirt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No T-shirts match your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, price range, or category filter to discover more streetwear styles.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setPriceFilter('all');
              setAssuredOnly(false);
              onClearSearch();
            }}
            className="inline-flex items-center gap-1.5 bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
};

