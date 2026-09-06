import React, { useState, useMemo } from 'react';
import { MOCK_CATEGORIES } from '../data/mockData';
import { 
  Sparkles, Shirt, Flame, Palette, Tv, Crown, Layers, 
  Activity, Scissors, Search, ArrowRight, CheckCircle2, TrendingUp, Zap, Tag
} from 'lucide-react';
import { TabType, AppCategory, Product } from '../types';

interface DisplayCategory {
  id: string;
  name: string;
  count: string;
  icon: string;
  image: string;
  isCustom?: boolean;
  emoji?: string;
}

interface CategoryViewProps {
  onSelectCategory: (category: string) => void;
  setActiveTab: (tab: TabType) => void;
  categories?: AppCategory[];
  products?: Product[];
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  onSelectCategory,
  setActiveTab,
  categories = [],
  products = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const ICON_MAP: Record<string, any> = {
    Sparkles,
    Shirt,
    Flame,
    Palette,
    Tv,
    Crown,
    Layers,
    Activity,
    Scissors,
    Tag,
  };

  const CATEGORY_TAGS: Record<string, string> = {
    'cat-oversized': '🔥 240+ GSM',
    'cat-graphic': '⚡ Trending',
    'cat-acid': '🧪 Vintage',
    'cat-anime': '🍙 Otaku Drop',
    'cat-polo': '👑 Waffle Knit',
    'cat-plain': '✨ 100% Pima',
    'cat-gym': '💪 Dri-Fit',
    'cat-jeans': '👖 Baggy Fit',
    'cat-cargos': '🪖 6-Pocket',
    'cat-hoodies': '❄️ Heavyweight',
    'cat-shirts': '🏖️ Resort Linen',
  };

  // Combine mock categories with any custom categories from Firestore
  const allCategories: DisplayCategory[] = useMemo(() => {
    const customList: DisplayCategory[] = categories
      .filter((c) => c.isCustom || !MOCK_CATEGORIES.some((m) => m.name.toLowerCase() === c.name.toLowerCase()))
      .map((c) => {
        // Count products belonging to this category
        const count = products.filter(
          (p) => (p.category || '').toLowerCase() === c.name.toLowerCase() || (p.customCategoryName || '').toLowerCase() === c.name.toLowerCase()
        ).length;

        return {
          id: `custom-cat-${c.id}`,
          name: c.name,
          count: `${count} Items`,
          icon: 'Tag',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          isCustom: true,
          emoji: c.icon,
        };
      });

    return [...customList, ...MOCK_CATEGORIES];
  }, [categories, products]);

  const handleCategoryClick = (catName: string) => {
    const filterValue = catName === 'All Tees' ? 'All' : catName;
    onSelectCategory(filterValue);
    setActiveTab('home');
  };

  const filteredCategories = allCategories.filter((cat) => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.count.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-12 space-y-6" id="category-hub-view">
      
      {/* Header with Search and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107] animate-pulse" />
            <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
              Explore T-Shirt Collections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Browse by fit, aesthetics, fabric GSM weights, and limited edition drops.
          </p>
        </div>

        {/* Quick Category Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search fits & fabrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 1. TOP QUICK HORIZONTAL REEL OF CIRCULAR BADGES */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0A3A1E]" />
            <span>Top Trending Drops</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Swipe circles to discover
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {MOCK_CATEGORIES.slice(0, 8).map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Shirt;
            const tag = CATEGORY_TAGS[cat.id];

            return (
              <button
                key={`reel-${cat.id}`}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center gap-2 focus:outline-none group shrink-0 select-none cursor-pointer"
                id={`cat-reel-${cat.id}`}
              >
                {/* Circular Avatar Container with Gradient Border */}
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#FFC107] via-amber-300 to-[#0A3A1E] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-white p-0.5">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {/* Floating Icon badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 text-[#FFC107] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    <Icon className="w-3 h-3" />
                  </div>
                </div>

                {/* Clean Label & Count Text */}
                <div className="text-center w-20 sm:w-22">
                  <span className="block text-[11px] font-bold text-slate-900 truncate group-hover:text-[#0A3A1E] transition-colors">
                    {cat.name}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-medium truncate">
                    {cat.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN COMPREHENSIVE CIRCULAR CATEGORY GRID */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              All Apparel & Streetwear Categories ({filteredCategories.length})
            </h2>
          </div>
          <span className="text-xs text-[#0A3A1E] font-bold">
            100% Bio-Washed Combed Cotton
          </span>
        </div>

        {/* Circular Grid: 3 cols on mobile, 4 cols on tablet, 6 cols on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-y-6 gap-x-3 sm:gap-x-4 pt-2">
          {filteredCategories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Shirt;
            const tag = CATEGORY_TAGS[cat.id];

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="group flex flex-col items-center text-center cursor-pointer select-none focus:outline-none"
                id={`cat-circle-card-${cat.id}`}
              >
                {/* Outer Circular Ring with subtle glow on hover */}
                <div className="relative mb-2.5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 group-hover:from-[#FFC107] group-hover:via-amber-300 group-hover:to-[#0A3A1E] transition-all duration-300 shadow-xs group-hover:shadow-lg group-hover:scale-105">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      {/* Dark overlay with icon in center */}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors flex items-center justify-center" />
                    </div>
                  </div>

                  {/* Corner Mini Icon Badge */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white text-slate-800 shadow-sm border border-slate-200 flex items-center justify-center group-hover:bg-[#FFC107] group-hover:text-[#052610] transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Top Floating Mini Tag */}
                  {(cat.isCustom || tag) && (
                    <div className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter whitespace-nowrap shadow-xs border ${
                      cat.isCustom
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-900/90 text-white border-white/20'
                    }`}>
                      {cat.isCustom ? '✨ Custom Drop' : tag}
                    </div>
                  )}
                </div>

                {/* Clean Label & Item Count Neatly Placed Underneath */}
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-[#0A3A1E] transition-colors leading-tight truncate max-w-[110px]">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate max-w-[100px]">
                  {cat.count}
                </p>

                {/* Action Link */}
                <span className="text-[9px] font-bold text-[#0A3A1E] opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-0.5">
                  <span>Shop</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
