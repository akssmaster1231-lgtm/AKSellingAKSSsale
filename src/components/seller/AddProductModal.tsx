import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductColor, AppCategory } from '../../types';
import { createCustomCategoryInFirestore } from '../../lib/firebase';
import { 
  X, Camera, Image as ImageIcon, CheckCircle2,
  DollarSign, Layers, Tag, ShieldCheck, ArrowRight, ArrowLeft,
  Eye, Check, Trash2, RefreshCw, Box, Truck, HelpCircle,
  Percent, Award, Info, Palette, Scissors, Sparkles, Upload,
  AlertCircle, ChevronRight, FileText, CheckCheck, MapPin,
  Search, Ruler, Scale, Sliders, Shirt, Flame, ChevronDown,
  Building2, Receipt, BadgePercent, Globe, Sparkle, Lock, ExternalLink,
  Plus, Home, Zap, Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  categories?: AppCategory[];
  onAddCategory?: (category: AppCategory) => void;
}

// ---------------------------------------------------------------------------
// MULTI-LEVEL CATEGORY TAXONOMY
// ---------------------------------------------------------------------------
interface CategoryNode {
  id: string;
  path: string;
  mainCat: string;
  department: string;
  leafCat: string;
  icon: string;
  type: 'tops' | 'bottoms' | 'outerwear' | 'other';
  recommendedSizes: string[];
}

const CATEGORY_TAXONOMY: CategoryNode[] = [
  {
    id: 'men-top-oversized',
    path: 'Men Fashion > Topwear > Oversized T-Shirts',
    mainCat: 'Men Fashion',
    department: 'Topwear',
    leafCat: 'Oversized T-Shirts',
    icon: '👕',
    type: 'tops',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  {
    id: 'men-top-graphic',
    path: 'Men Fashion > Topwear > Graphic & DTF T-Shirts',
    mainCat: 'Men Fashion',
    department: 'Topwear',
    leafCat: 'Graphic & DTF T-Shirts',
    icon: '🎨',
    type: 'tops',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'men-top-polo',
    path: 'Men Fashion > Topwear > Polo & Collared T-Shirts',
    mainCat: 'Men Fashion',
    department: 'Topwear',
    leafCat: 'Polo & Collared T-Shirts',
    icon: '👔',
    type: 'tops',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'men-top-plain',
    path: 'Men Fashion > Topwear > Plain & Solid Basics',
    mainCat: 'Men Fashion',
    department: 'Topwear',
    leafCat: 'Plain & Solid Basics',
    icon: '⚪',
    type: 'tops',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'men-top-acid',
    path: 'Men Fashion > Topwear > Acid Wash & Vintage Dyed',
    mainCat: 'Men Fashion',
    department: 'Topwear',
    leafCat: 'Acid Wash & Vintage Dyed',
    icon: '🌪️',
    type: 'tops',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'men-top-casual-shirts',
    path: 'Men Fashion > Topwear > Casual & Cuban Shirts',
    mainCat: 'Men Fashion',
    department: 'Topwear',
    leafCat: 'Casual & Cuban Shirts',
    icon: '👔',
    type: 'tops',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'men-bottom-jeans',
    path: 'Men Fashion > Bottomwear > Jeans & Denim',
    mainCat: 'Men Fashion',
    department: 'Bottomwear',
    leafCat: 'Jeans & Denim',
    icon: '👖',
    type: 'bottoms',
    recommendedSizes: ['28', '30', '32', '34', '36', '38', '40'],
  },
  {
    id: 'men-bottom-cargos',
    path: 'Men Fashion > Bottomwear > Cargo Pants & Parachutes',
    mainCat: 'Men Fashion',
    department: 'Bottomwear',
    leafCat: 'Cargo Pants & Parachutes',
    icon: '🩳',
    type: 'bottoms',
    recommendedSizes: ['28', '30', '32', '34', '36', '38'],
  },
  {
    id: 'men-bottom-shorts',
    path: 'Men Fashion > Bottomwear > Sweatshorts & Active Track',
    mainCat: 'Men Fashion',
    department: 'Bottomwear',
    leafCat: 'Sweatshorts & Active Track',
    icon: '🏃',
    type: 'bottoms',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'men-outer-hoodies',
    path: 'Men Fashion > Outerwear > Hoodies & Sweatshirts',
    mainCat: 'Men Fashion',
    department: 'Outerwear',
    leafCat: 'Hoodies & Sweatshirts',
    icon: '🧥',
    type: 'outerwear',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'men-outer-jackets',
    path: 'Men Fashion > Outerwear > Jackets & Bomber',
    mainCat: 'Men Fashion',
    department: 'Outerwear',
    leafCat: 'Jackets & Bomber',
    icon: '🧥',
    type: 'outerwear',
    recommendedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
];

// ---------------------------------------------------------------------------
// PRESETS & ATTRIBUTE DATA
// ---------------------------------------------------------------------------
const WEIGHT_PRESETS = [
  { grams: 180, label: '180g', desc: 'Lightweight summer cotton' },
  { grams: 220, label: '220g', desc: 'Midweight combed cotton' },
  { grams: 240, label: '240g', desc: 'Heavyweight streetwear drape' },
  { grams: 280, label: '280g', desc: 'French Terry looped knit' },
  { grams: 320, label: '320g', desc: 'Ultra-dense boxy fleece' },
  { grams: 450, label: '450g', desc: 'Rigid cotton denim / cargo twill' },
  { grams: 650, label: '650g', desc: 'Heavyweight hoodie / outerwear' },
];

const COLOR_PRESETS = [
  { name: 'Onyx Black', hex: '#111827' },
  { name: 'Pure Off-White', hex: '#F9FAFB' },
  { name: 'Vintage Charcoal', hex: '#374151' },
  { name: 'Forest Green', hex: '#064E3B' },
  { name: 'Indigo Blue', hex: '#1E3A8A' },
  { name: 'Acid Wash Grey', hex: '#6B7280' },
  { name: 'Desert Beige', hex: '#D97706' },
  { name: 'Military Olive', hex: '#4D7C0F' },
  { name: 'Burgundy Wine', hex: '#831843' },
  { name: 'Pastel Lavender', hex: '#C084FC' },
  { name: 'Sky Denim Blue', hex: '#60A5FA' },
  { name: 'Chocolate Brown', hex: '#451A03' },
];

const FABRIC_TYPES = [
  '100% Super-Combed Cotton',
  '100% French Terry Cotton',
  'Cotton-Lycra Blend (95% Cotton / 5% Spandex)',
  '100% Rigid Cotton Denim',
  'Stretch Denim (98% Cotton / 2% Elastane)',
  'Heavy Cotton Twill Weave',
  'Poly-Cotton Fleece',
  '100% Bio-Washed Combed Cotton',
  'Supima Luxury Long-Staple Cotton',
  'Linen-Cotton Blend',
  'Waffle Knit Cotton',
];

const FIT_TYPES = [
  'Oversized / Boxy Fit',
  'Drop-Shoulder Relaxed Fit',
  'Regular Comfort Fit',
  'Slim Fit',
  'Baggy / Wide-Leg Fit',
  'Straight Leg Fit',
  'Relaxed Cargo Fit',
  'Tapered Ankle Fit',
  'Athletic Muscle Fit',
];

const GENERIC_NAMES = [
  'T-Shirt',
  'Oversized T-Shirt',
  'Jeans',
  'Cargo Pants',
  'Hoodie',
  'Sweatshirt',
  'Casual Shirt',
  'Shorts',
  'Trackpants',
  'Denim Jacket',
];

const NET_QUANTITIES = [
  '1 N (Single Piece)',
  '2 N (Pack of 2)',
  '3 N (Pack of 3)',
  '5 N (Pack of 5)',
];

const NECK_STYLES = [
  'Round Crew Neck',
  '1.25" High Ribbed Crew (Lycra Reinforced)',
  'Polo / Collared Neck',
  'V-Neck Collar',
  'Oversized Drop Collar',
  'Hooded Neck with Drawstrings',
  'Cuban / Camp Collar',
  'Mandarin / Band Collar',
  'Standard Button & Zip Fly (Waist)',
  'Elasticated Waistband with Drawcord',
];

const OCCASIONS = [
  'Casual Streetwear',
  'Daily Wear',
  'Party & Clubwear',
  'Gym & Active Training',
  'College & Campus',
  'Lounge & Travel',
  'Semi-Formal / Work Casual',
];

const PATTERNS = [
  'Solid / Plain',
  'Graphic Print',
  'Typography & Quotes',
  'Acid Washed / Vintage Mineral Dye',
  'Striped',
  'Colorblocked',
  'Distressed / Washed Raw Edge',
  'Checkered',
];

const PRINT_TYPES = [
  'High-Density Fade-Proof DTF Print',
  'HD Screen Print with Puff 3D',
  'Vintage Screen Print',
  'Embroidery & Chenille Patch',
  'Pigment Discharge Dye',
  'Sublimation All-Over Print',
  'Solid / No Print',
];

const SLEEVE_LENGTHS = [
  'Half Sleeve',
  'Drop-Shoulder Half Sleeve',
  'Full Sleeve',
  'Sleeveless',
  '3/4th Sleeve',
];

// Form 4 Specific Lookups
const CHARACTER_THEMES = [
  'None / Plain Solid',
  'Anime & Manga',
  'Streetwear & Typography',
  'Abstract & Geometric',
  'Vintage & Retro Acid Wash',
  'Pop Culture & Comics',
  'Minimalist Line Art',
  'Nature, Botanical & Floral',
  'Music, Band & Rock',
  'Athletic & Sports',
];

const HEMLINES = [
  'Straight Hem',
  'Curved / Scoop Hem',
  'Ribbed Lycra Waist Hem',
  'Raw Edge / Cut-Off Distressed',
  'Drawstring Toggle Hem',
  'Split Side Vent Hem',
];

const LENGTH_TYPES = [
  'Regular Length',
  'Oversized Longline',
  'Crop Length',
  'Hip Length',
  'Ankle Length (Bottoms)',
  'Full Length (Bottoms)',
];

// Form 3 Specific Legal & Tax Lookups
const GST_RATES = ['5%', '12%', '18%', '0%'];

const COMMON_HSN_CODES = [
  { code: '61091000', label: 'T-Shirts, Singlets & Vests (100% Cotton Knitted)', rate: '5%' },
  { code: '62034200', label: 'Men Jeans, Denim Trousers & Breeches (Woven Cotton)', rate: '5% / 12%' },
  { code: '62034300', label: 'Cargo Pants & Synthetic Trousers', rate: '5% / 12%' },
  { code: '61051000', label: 'Men Casual & Formal Shirts (Knitted Cotton)', rate: '5%' },
  { code: '61012000', label: 'Hoodies, Sweatshirts & Pullovers', rate: '5% / 12%' },
  { code: '62034990', label: 'Shorts & Sweatshorts', rate: '5%' },
];

const COUNTRIES_OF_ORIGIN = [
  'India',
  'Bangladesh',
  'Vietnam',
  'Sri Lanka',
  'Turkey',
  'Other',
];

// 5 Dedicated Image Slots Definition
const IMAGE_SLOTS = [
  { id: 0, label: 'Front View (Cover)', desc: 'Primary front view showing full garment', required: true },
  { id: 1, label: 'Back View / Print', desc: 'Back angle showing graphic or back drape', required: false },
  { id: 2, label: 'Close-Up / Detail', desc: 'Zoomed-in shot of DTF print, wash or stitching', required: false },
  { id: 3, label: 'Fabric / Label', desc: 'Collar ribbing, pocket, or fabric weave', required: false },
  { id: 4, label: 'Model / Fit Angle', desc: 'Side profile or styling angle on model', required: false },
];

// Standard Apparel Measurement Charts (Inches)
interface SizeChartRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
}

const DEFAULT_TOP_SIZE_CHART: SizeChartRow[] = [
  { size: 'S', chest: '40', length: '28', shoulder: '20', sleeve: '8.5' },
  { size: 'M', chest: '42', length: '29', shoulder: '21', sleeve: '9.0' },
  { size: 'L', chest: '44', length: '30', shoulder: '22', sleeve: '9.5' },
  { size: 'XL', chest: '46', length: '31', shoulder: '23', sleeve: '10.0' },
  { size: 'XXL', chest: '48', length: '32', shoulder: '24', sleeve: '10.5' },
  { size: '3XL', chest: '50', length: '33', shoulder: '25', sleeve: '11.0' },
];

const DEFAULT_BOTTOM_SIZE_CHART: SizeChartRow[] = [
  { size: '28', chest: '28-29', length: '39', shoulder: '38 (Hip)', sleeve: '12 (Thigh)' },
  { size: '30', chest: '30-31', length: '40', shoulder: '40 (Hip)', sleeve: '12.5 (Thigh)' },
  { size: '32', chest: '32-33', length: '41', shoulder: '42 (Hip)', sleeve: '13 (Thigh)' },
  { size: '34', chest: '34-35', length: '41.5', shoulder: '44 (Hip)', sleeve: '13.5 (Thigh)' },
  { size: '36', chest: '36-37', length: '42', shoulder: '46 (Hip)', sleeve: '14 (Thigh)' },
  { size: '38', chest: '38-39', length: '42.5', shoulder: '48 (Hip)', sleeve: '14.5 (Thigh)' },
  { size: '40', chest: '40-41', length: '43', shoulder: '50 (Hip)', sleeve: '15 (Thigh)' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  categories = [],
  onAddCategory,
}) => {
  // Wizard Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Hidden File Input Refs for Real Device Camera & Gallery Pickers
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadSlot, setActiveUploadSlot] = useState<number | null>(null);

  // Interactive Category Selector Dropdown / Modal
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState<boolean>(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

  // Dynamic Custom Category Creator States
  const [isCreatingCustomCat, setIsCreatingCustomCat] = useState<boolean>(false);
  const [customCatName, setCustomCatName] = useState<string>('');
  const [customCatDept, setCustomCatDept] = useState<string>('Topwear');
  const [customCatIcon, setCustomCatIcon] = useState<string>('🏷️');
  const [isSavingCustomCat, setIsSavingCustomCat] = useState<boolean>(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);

  // Granular Placement & Visibility Toggles (Flipkart-style channel distribution)
  const [placementShowOnHome, setPlacementShowOnHome] = useState<boolean>(true);
  const [placementFeatureInDeals, setPlacementFeatureInDeals] = useState<boolean>(false);
  const [placementStandardCatalogOnly, setPlacementStandardCatalogOnly] = useState<boolean>(false);

  // Quality Guidelines toggle in Form 1
  const [showQualityGuidelines, setShowQualityGuidelines] = useState<boolean>(false);

  // Size Chart Modal toggle in Form 2
  const [showSizeChartModal, setShowSizeChartModal] = useState<boolean>(false);

  // ==================== FORM 1: CATEGORY & PHOTOS ====================
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('');
  const [selectedCategoryNode, setSelectedCategoryNode] = useState<CategoryNode | null>(null);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  
  // 5 Photo Slots
  const [slotImages, setSlotImages] = useState<{ [key: number]: string }>({});

  // Mandatory Product Title / Name & Brand
  const [title, setTitle] = useState<string>('');
  const [brand, setBrand] = useState<string>('');

  // ==================== FORM 2: BASIC PRODUCT ATTRIBUTES ====================
  const [weightGrams, setWeightGrams] = useState<string>('240');
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Onyx Black', hex: '#111827' }
  ]);
  const [customColorName, setCustomColorName] = useState<string>('');
  const [customColorHex, setCustomColorHex] = useState<string>('#0A3A1E');
  
  const [fabricType, setFabricType] = useState<string>('100% French Terry Cotton');
  const [customFabricType, setCustomFabricType] = useState<string>('');
  
  const [fitShape, setFitShape] = useState<string>('Oversized / Boxy Fit');
  const [customFitShape, setCustomFitShape] = useState<string>('');
  
  const [genericName, setGenericName] = useState<string>('Oversized T-Shirt');
  const [netQuantity, setNetQuantity] = useState<string>('1 N (Single Piece)');
  
  const [neckStyle, setNeckStyle] = useState<string>('Round Crew Neck');
  const [customNeckStyle, setCustomNeckStyle] = useState<string>('');
  
  const [occasion, setOccasion] = useState<string>('Casual Streetwear');
  const [pattern, setPattern] = useState<string>('Graphic Print');
  const [printType, setPrintType] = useState<string>('High-Density Fade-Proof DTF Print');
  const [sleeveLength, setSleeveLength] = useState<string>('Drop-Shoulder Half Sleeve');

  // Sizes Checklist & Custom Size Chart
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [customSizeChart, setCustomSizeChart] = useState<SizeChartRow[]>(DEFAULT_TOP_SIZE_CHART);

  // ==================== FORM 3: PRICE, TAX & MANUFACTURING DETAILS ====================
  const [price, setPrice] = useState<string>('699');
  const [defectiveReturnsPrice, setDefectiveReturnsPrice] = useState<string>('669');
  const [originalPrice, setOriginalPrice] = useState<string>('1499');
  const [gstRate, setGstRate] = useState<string>('5%');
  const [hsnCode, setHsnCode] = useState<string>('61091000');
  
  // Legal Manufacturing Details
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>('India');
  const [manufacturerName, setManufacturerName] = useState<string>('AK Yadav Prints & Apparels LLP');
  const [manufacturerAddress, setManufacturerAddress] = useState<string>('Plot 42, Textile Industrial Hub, Sector 18');
  const [manufacturerCityState, setManufacturerCityState] = useState<string>('Gurugram, Haryana');
  const [manufacturerPincode, setManufacturerPincode] = useState<string>('122015');
  
  // Packer Details
  const [packerSameAsManufacturer, setPackerSameAsManufacturer] = useState<boolean>(true);
  const [packerName, setPackerName] = useState<string>('');
  const [packerAddress, setPackerAddress] = useState<string>('');
  const [packerCityState, setPackerCityState] = useState<string>('');
  const [packerPincode, setPackerPincode] = useState<string>('');

  // ==================== FORM 4: ADDITIONAL DETAILS & SKU SETUP ====================
  const [styleCode, setStyleCode] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('AK Yadav Streetwear');
  const [characterTheme, setCharacterTheme] = useState<string>('Streetwear & Typography');
  const [hemline, setHemline] = useState<string>('Straight Hem');
  const [garmentLength, setGarmentLength] = useState<string>('Regular Length');

  // Dynamic size-wise inventory rows & unique SKU ID generation
  const [sizeStock, setSizeStock] = useState<{ [size: string]: string }>({
    'S': '25',
    'M': '50',
    'L': '50',
    'XL': '35',
    'XXL': '20',
  });
  const [variantSkus, setVariantSkus] = useState<{ [size: string]: string }>({});

  // Additional Story & Highlights
  const [description, setDescription] = useState<string>('');
  const [highlights, setHighlights] = useState<string[]>([
    'Heavyweight 240 GSM French Terry looped cotton structure',
    'Reinforced Lycra crew collar ribbing for zero bacon-neck sag',
    'High-Density fade-proof DTF graphic with rich pigment depth',
    'Drop-shoulder boxy silhouette tailored for streetwear layering'
  ]);
  const [newHighlightText, setNewHighlightText] = useState<string>('');
  const [careInstructions, setCareInstructions] = useState<string>('Machine wash cold with like colors. Do not iron directly on print.');

  // ==================== FORM 5: FINAL REVIEW & PUBLISH ====================
  const [previewActiveImageIdx, setPreviewActiveImageIdx] = useState<number>(0);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);

  // Initialize Style Code and Variant SKUs if empty
  useEffect(() => {
    if (!styleCode) {
      const leafCode = (selectedCategoryNode?.leafCat || 'OVR')
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 3)
        .toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generated = `AKY-${randomNum}-${leafCode || 'CLS'}`;
      setStyleCode(generated);
    }
  }, [selectedCategoryNode]);

  // Keep Variant SKUs synced with selectedSizes
  useEffect(() => {
    const baseCode = styleCode || 'AKY-PROD';
    setVariantSkus((prev) => {
      const next = { ...prev };
      selectedSizes.forEach((sz) => {
        if (!next[sz]) {
          next[sz] = `${baseCode}-${sz}`;
        }
      });
      return next;
    });
  }, [selectedSizes, styleCode]);

  if (!isOpen) return null;

  // -------------------------------------------------------------------------
  // CAMERA & GALLERY FILE HANDLERS
  // -------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index: number) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (resultUrl) {
          setSlotImages((prev) => {
            let targetSlot = activeUploadSlot !== null ? activeUploadSlot + index : index;
            if (targetSlot > 4) targetSlot = 4;
            return {
              ...prev,
              [targetSlot]: resultUrl,
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setActiveUploadSlot(null);
  };

  const triggerGalleryUpload = (slotIndex?: number) => {
    setActiveUploadSlot(slotIndex !== undefined ? slotIndex : null);
    galleryInputRef.current?.click();
  };

  const triggerCameraCapture = (slotIndex?: number) => {
    setActiveUploadSlot(slotIndex !== undefined ? slotIndex : null);
    cameraInputRef.current?.click();
  };

  const handleRemoveSlotImage = (slotIndex: number) => {
    setSlotImages((prev) => {
      const updated = { ...prev };
      delete updated[slotIndex];
      return updated;
    });
  };

  const allUploadedImages: string[] = [0, 1, 2, 3, 4]
    .map((slotIdx) => slotImages[slotIdx])
    .filter(Boolean);

  // -------------------------------------------------------------------------
  // DYNAMIC CATEGORY TAXONOMY & CUSTOM CATEGORY CREATOR
  // -------------------------------------------------------------------------
  // Convert custom/stored Firestore categories into CategoryNodes
  const customCategoryNodes: CategoryNode[] = (categories || [])
    .filter((c) => c.isCustom || !CATEGORY_TAXONOMY.some((t) => t.leafCat.toLowerCase() === c.name.toLowerCase()))
    .map((c) => {
      const nameLower = c.name.toLowerCase();
      const isBottom = c.department === 'Bottomwear' || nameLower.includes('pant') || nameLower.includes('jean') || nameLower.includes('cargo') || nameLower.includes('short') || nameLower.includes('trouser');
      const isOuter = c.department === 'Outerwear' || nameLower.includes('hoodie') || nameLower.includes('jacket') || nameLower.includes('sweatshirt');
      const dept = c.department || (isBottom ? 'Bottomwear' : isOuter ? 'Outerwear' : 'Topwear');
      return {
        id: c.id,
        path: `Men Fashion > ${dept} > ${c.name}`,
        mainCat: 'Men Fashion',
        department: dept,
        leafCat: c.name,
        icon: typeof c.icon === 'string' && c.icon.length <= 4 ? c.icon : '🏷️',
        type: isBottom ? 'bottoms' : isOuter ? 'outerwear' : 'tops',
        recommendedSizes: isBottom ? ['28', '30', '32', '34', '36'] : ['S', 'M', 'L', 'XL', 'XXL'],
      };
    });

  const combinedTaxonomy: CategoryNode[] = [...customCategoryNodes, ...CATEGORY_TAXONOMY];

  const filteredCategories = combinedTaxonomy.filter((node) => {
    if (!categorySearchQuery.trim()) return true;
    const q = categorySearchQuery.toLowerCase();
    return node.path.toLowerCase().includes(q) || node.leafCat.toLowerCase().includes(q);
  });

  const handleSelectCategoryNode = (node: CategoryNode, isCustom: boolean = false) => {
    setSelectedCategoryNode(node);
    setSelectedCategoryPath(node.path);
    setSelectedCategoryName(node.leafCat);
    setIsCustomCategory(isCustom || customCategoryNodes.some((c) => c.id === node.id));
    setCustomCategoryInput('');
    setIsCategoryPickerOpen(false);

    if (node.type === 'bottoms') {
      setCustomSizeChart(DEFAULT_BOTTOM_SIZE_CHART);
      setSelectedSizes(['28', '30', '32', '34', '36']);
      setHsnCode('62034200');
      setGenericName(node.leafCat);
    } else {
      setCustomSizeChart(DEFAULT_TOP_SIZE_CHART);
      setSelectedSizes(['S', 'M', 'L', 'XL', 'XXL']);
      setHsnCode('61091000');
      setGenericName(node.leafCat);
    }
  };

  const handleCreateCustomCategory = async () => {
    const trimmed = customCatName.trim();
    if (!trimmed) {
      alert('Please enter a custom category name.');
      return;
    }
    setIsSavingCustomCat(true);
    try {
      const newCat = await createCustomCategoryInFirestore(
        trimmed,
        customCatDept,
        customCatIcon
      );
      if (onAddCategory) {
        onAddCategory(newCat);
      }
      const isBottom = customCatDept === 'Bottomwear';
      const isOuter = customCatDept === 'Outerwear';
      const node: CategoryNode = {
        id: newCat.id,
        path: `Men Fashion > ${customCatDept} > ${newCat.name}`,
        mainCat: 'Men Fashion',
        department: customCatDept,
        leafCat: newCat.name,
        icon: customCatIcon,
        type: isBottom ? 'bottoms' : isOuter ? 'outerwear' : 'tops',
        recommendedSizes: isBottom ? ['28', '30', '32', '34', '36'] : ['S', 'M', 'L', 'XL', 'XXL'],
      };
      handleSelectCategoryNode(node, true);
      setIsCreatingCustomCat(false);
      setCustomCatName('');
    } catch (err) {
      console.error('Failed to create custom category in Firebase:', err);
      alert('Failed to save category to Firebase. Please try again.');
    } finally {
      setIsSavingCustomCat(false);
    }
  };

  const handleApplyCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    const catName = customCategoryInput.trim();
    const path = customCategoryInput.includes('>')
      ? customCategoryInput.trim()
      : `Men Fashion > Topwear > ${catName}`;
    setSelectedCategoryPath(path);
    setSelectedCategoryName(catName);
    setIsCustomCategory(true);
    setSelectedCategoryNode(null);
    setIsCategoryPickerOpen(false);
  };

  // -------------------------------------------------------------------------
  // GRANULAR PLACEMENT & VISIBILITY CHANNEL TOGGLES
  // -------------------------------------------------------------------------
  const handleTogglePlacement = (channel: 'home' | 'deals' | 'catalogOnly') => {
    if (channel === 'home') {
      setPlacementShowOnHome((prev) => {
        const next = !prev;
        if (next) {
          setPlacementStandardCatalogOnly(false);
        }
        return next;
      });
    } else if (channel === 'deals') {
      setPlacementFeatureInDeals((prev) => !prev);
    } else if (channel === 'catalogOnly') {
      setPlacementStandardCatalogOnly((prev) => {
        const next = !prev;
        if (next) {
          setPlacementShowOnHome(false);
        }
        return next;
      });
    }
  };

  // -------------------------------------------------------------------------
  // ATTRIBUTE & SIZE HELPERS
  // -------------------------------------------------------------------------
  const handleToggleColor = (col: { name: string; hex: string }) => {
    setSelectedColors((prev) => {
      const exists = prev.find((c) => c.name === col.name);
      if (exists) {
        return prev.filter((c) => c.name !== col.name);
      }
      return [...prev, col];
    });
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const newCol = { name: customColorName.trim(), hex: customColorHex };
    setSelectedColors((prev) => [...prev, newCol]);
    setCustomColorName('');
  };

  const handleToggleSize = (sz: string) => {
    setSelectedSizes((prev) => {
      if (prev.includes(sz)) {
        const next = prev.filter((s) => s !== sz);
        setSizeStock((sPrev) => {
          const sCopy = { ...sPrev };
          delete sCopy[sz];
          return sCopy;
        });
        return next;
      }
      return [...prev, sz];
    });
  };

  const handleSizeStockChange = (sz: string, val: string) => {
    setSizeStock((prev) => ({
      ...prev,
      [sz]: val,
    }));
  };

  const handleVariantSkuChange = (sz: string, val: string) => {
    setVariantSkus((prev) => ({
      ...prev,
      [sz]: val,
    }));
  };

  const handleBulkStockFill = (count: number) => {
    const filled: { [s: string]: string } = {};
    selectedSizes.forEach((s) => {
      filled[s] = count.toString();
    });
    setSizeStock(filled);
  };

  const handleGenerateAllVariantSkus = () => {
    const base = styleCode.trim() || 'AKY-PROD';
    const nextSkus: { [s: string]: string } = {};
    selectedSizes.forEach((sz) => {
      nextSkus[sz] = `${base}-${sz}`;
    });
    setVariantSkus(nextSkus);
  };

  const handleGenerateStyleCode = () => {
    const leafCode = (selectedCategoryNode?.leafCat || customCategoryInput || 'APP')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newStyle = `AKY-${randomNum}-${leafCode || 'CLS'}`;
    setStyleCode(newStyle);
    
    // Also regenerate variant SKUs
    const nextSkus: { [s: string]: string } = {};
    selectedSizes.forEach((sz) => {
      nextSkus[sz] = `${newStyle}-${sz}`;
    });
    setVariantSkus(nextSkus);
  };

  const handleSizeChartChange = (index: number, field: keyof SizeChartRow, val: string) => {
    setCustomSizeChart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleAddHighlight = () => {
    if (!newHighlightText.trim()) return;
    setHighlights((prev) => [...prev, newHighlightText.trim()]);
    setNewHighlightText('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  // -------------------------------------------------------------------------
  // REAL-TIME PRICING & SETTLEMENT ENGINE
  // -------------------------------------------------------------------------
  const numPrice = Number(price) || 0;
  const numDefectivePrice = Number(defectiveReturnsPrice) || (numPrice > 30 ? numPrice - 30 : numPrice);
  const numOrig = Number(originalPrice) || 0;
  const discountPercent = numOrig > numPrice && numOrig > 0
    ? Math.round(((numOrig - numPrice) / numOrig) * 100)
    : 0;

  const gstPercentage = Number(gstRate.replace('%', '')) || 5;
  const gstAmount = Number(((numPrice * gstPercentage) / 100).toFixed(2));
  const pgFee = Number((numPrice * 0.02).toFixed(2));
  const netSettlementPayout = Number((numPrice - gstAmount - pgFee).toFixed(2));

  const totalStockCount: number = Object.values(sizeStock)
    .map((v) => Number(v) || 0)
    .reduce((a: number, b: number) => a + b, 0);

  // Auto-suggest Defective Return Price (e.g. 5% lower)
  const handleSuggestDefectivePrice = () => {
    if (numPrice > 50) {
      const suggested = Math.max(1, Math.round(numPrice * 0.95));
      setDefectiveReturnsPrice(suggested.toString());
    }
  };

  // -------------------------------------------------------------------------
  // STEP VALIDATIONS
  // -------------------------------------------------------------------------
  const handleNextStep = () => {
    // Form 1 Validation: Category, Title & at least 1 image
    if (currentStep === 1) {
      if (!selectedCategoryPath && !customCategoryInput.trim()) {
        alert('Please select an apparel category.');
        return;
      }
      if (!title.trim()) {
        alert('Please enter a mandatory Product Title / Name.');
        return;
      }
      if (allUploadedImages.length === 0) {
        alert('Please upload at least 1 photo for the Cover Image slot (Slot 1) using Camera or Gallery.');
        return;
      }
    }

    // Form 2 Validation: Attributes
    if (currentStep === 2) {
      const finalFabric = customFabricType.trim() || fabricType;
      if (!finalFabric) {
        alert('Please select or specify the Fabric Blend.');
        return;
      }
      if (selectedSizes.length === 0) {
        alert('Please check at least one size in the Size Checklist.');
        return;
      }
    }

    // Form 3 Validation: Price, Tax & Manufacturing Legal Details
    if (currentStep === 3) {
      if (numPrice <= 0) {
        alert('Please enter a valid customer selling price / Meesho price in ₹.');
        return;
      }
      if (numDefectivePrice <= 0) {
        alert('Please enter a valid defective return price in ₹.');
        return;
      }
      if (!manufacturerName.trim() || !manufacturerAddress.trim() || !manufacturerPincode.trim()) {
        alert('Please provide mandatory Manufacturer Name, Address, and Pincode as required by eCommerce legal regulations.');
        return;
      }
      if (!packerSameAsManufacturer && (!packerName.trim() || !packerAddress.trim() || !packerPincode.trim())) {
        alert('Please provide full Packer details or check "Same as Manufacturer Details".');
        return;
      }
    }

    // Form 4 Validation: Additional Details & SKUs
    if (currentStep === 4) {
      if (!styleCode.trim()) {
        alert('Please provide or generate a Style Code / Product ID.');
        return;
      }
      if (totalStockCount <= 0) {
        alert('Please allocate at least 1 unit of stock inventory across your size variants.');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // -------------------------------------------------------------------------
  // PUBLISH FINAL PRODUCT
  // -------------------------------------------------------------------------
  const handlePublish = async () => {
    if (!agreedTerms) {
      alert('Please accept the mandatory Legal Metrology & Tax Compliance declaration checkbox to publish.');
      return;
    }

    setIsPublishing(true);

    try {
      const finalLeafCategory = selectedCategoryName || selectedCategoryNode?.leafCat || customCategoryInput.trim() || 'Oversized';
      const finalFabric = customFabricType.trim() || fabricType || '100% Super-Combed French Terry Cotton';
      const finalFit = customFitShape.trim() || fitShape || 'Oversized / Boxy Fit';
      const finalNeck = customNeckStyle.trim() || neckStyle || 'Round Crew Neck';
      const finalBrand = brandName.trim() || brand.trim() || 'AK Yadav Prints';
      const finalSku = styleCode.trim() || `AKY-${Math.floor(1000 + Math.random() * 9000)}`;
      const finalWeight = weightGrams ? `${weightGrams}g` : '240g';

      const colorsFormatted: ProductColor[] = selectedColors.length > 0
        ? selectedColors.map((col, idx) => ({
            name: col.name,
            hex: col.hex,
            imageIndex: Math.min(idx, Math.max(0, allUploadedImages.length - 1)),
          }))
        : [{ name: 'Default Black', hex: '#111827', imageIndex: 0 }];

      const newProduct: Product = {
        id: finalSku,
        title: title.trim(),
        brand: finalBrand,
        category: finalLeafCategory,
        customCategoryName: isCustomCategory ? finalLeafCategory : undefined,
        // Granular Placement & Visibility Toggles
        showOnHome: placementShowOnHome,
        featureInBestDeals: placementFeatureInDeals,
        isStandardCatalogOnly: placementStandardCatalogOnly,
        price: numPrice,
        originalPrice: numOrig > 0 ? numOrig : numPrice,
        discountPercent: discountPercent,
        rating: 5.0,
        ratingCount: 1,
        reviewsCount: 0,
        isAssured: true,
        isTrending: true,
        isBestseller: true,
        inStock: totalStockCount > 0,
        stockCount: totalStockCount,
        fabric: `${finalFabric} • ${finalWeight} • ${finalNeck} • ${hemline} • ${garmentLength}`,
        gsm: finalWeight,
        fit: finalFit,
        careInstructions: careInstructions.trim() || 'Machine wash cold with like colors. Do not iron directly on print.',
        deliveryDays: 2,
        sizes: selectedSizes.filter((sz) => (Number(sizeStock[sz]) || 0) > 0).length > 0
          ? selectedSizes.filter((sz) => (Number(sizeStock[sz]) || 0) > 0)
          : selectedSizes,
        colors: colorsFormatted,
        images: allUploadedImages.length > 0
          ? allUploadedImages
          : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'],
        description: description.trim() || `${title} by ${finalBrand}. Crafted with ${finalFabric} (${finalWeight}) in a signature ${finalFit} with ${hemline} and ${characterTheme} styling.`,
        highlights: highlights.length > 0
          ? highlights
          : [
              `${finalFabric} (${finalWeight}) with durable ${hemline}`,
              `${finalFit} silhouette with reinforced ${finalNeck}`,
              `${printType} with ${characterTheme} aesthetic`,
              `Legal Metrology Compliant: Made in ${countryOfOrigin} by ${manufacturerName}`,
            ],
        offers: [
          `Special Price: ₹${numDefectivePrice} with defective-returns only pricing option`,
          `GST Tax Invoice included: HSN Code ${hsnCode} (${gstRate} GST)`,
          'Free Delivery: Express courier dispatch with live tracking',
        ],
        reviews: [],
      };

      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FFC107', '#0A3A1E', '#052610', '#FFD700'],
        });
      } catch (e) {
        // ignore
      }

      setTimeout(() => {
        onAddProduct(newProduct);
        setIsPublishing(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Publish error:', err);
      setIsPublishing(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Form 1: Category & Photos', short: 'Category & Photos' },
    { num: 2, title: 'Form 2: Product Attributes', short: 'Attributes & Specs' },
    { num: 3, title: 'Form 3: Price, Tax & Legal Details', short: 'Price, Tax & Legal' },
    { num: 4, title: 'Form 4: Style Details & Variant SKUs', short: 'Style & SKUs' },
    { num: 5, title: 'Form 5: Final Review & Publish', short: 'Review & Publish' },
  ];

  return (
    <div
      id="add-product-wizard-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      {/* Real Device Camera & Gallery File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* =========================================================================
            HEADER: WHATSAPP-GREEN TOP BAR
        ========================================================================= */}
        <div className="bg-[#0A3A1E] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#052610] flex items-center justify-center font-black shadow-inner">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Catalog Creation Wizard
                </h2>
                <span className="text-[10px] font-bold bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/40 px-2 py-0.5 rounded-full">
                  Step {currentStep} of 5
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                {stepsList[currentStep - 1].title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            STEPPER PROGRESS BAR
        ========================================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
              <div
                className="h-full bg-[#0A3A1E] transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />
            </div>

            {stepsList.map((st) => {
              const isCompleted = currentStep > st.num;
              const isCurrent = currentStep === st.num;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setCurrentStep(st.num)}
                  className="relative z-10 flex flex-col items-center group transition-all"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#0A3A1E] text-white ring-4 ring-[#FFC107]/30 shadow-md scale-110'
                        : isCompleted
                        ? 'bg-[#FFC107] text-[#052610] font-bold'
                        : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-3" /> : st.num}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-1 hidden sm:block transition-colors ${
                      isCurrent
                        ? 'text-[#0A3A1E]'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            WIZARD FORMS
        ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 space-y-6">

          {/* =====================================================================
              FORM 1: CATEGORY & PHOTOS
          ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Section Header Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Tag className="w-5 h-5 text-[#0A3A1E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-[#0A3A1E] uppercase tracking-wider">
                    Form 1 • Multi-Level Category, Photos &amp; Title
                  </h3>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Select your apparel category pathway, snap or pick high-res photos for all 5 visual angles, and enter the product name.
                  </p>
                </div>
              </div>

              {/* 1. Interactive Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>1. Category Pathway *</span>
                  {selectedCategoryPath && (
                    <span className="text-[11px] font-bold text-[#0A3A1E] bg-[#FFC107]/20 px-2 py-0.5 rounded-md border border-[#FFC107]/40 flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#0A3A1E]" />
                      Selected
                    </span>
                  )}
                </label>

                {/* Main Interactive Category Trigger Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedCategoryPath
                        ? 'border-[#0A3A1E] bg-emerald-50/50 text-slate-900 ring-2 ring-[#0A3A1E]/20'
                        : 'border-slate-300 bg-white hover:border-slate-400 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#0A3A1E]/10 text-[#0A3A1E] flex items-center justify-center font-bold text-sm shrink-0">
                        {selectedCategoryNode?.icon || '📂'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 block truncate">
                          {selectedCategoryPath || 'Click to Select Apparel Category...'}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {selectedCategoryNode ? `${selectedCategoryNode.department} • Recommended for ${selectedCategoryNode.leafCat}` : 'Browse Men Fashion, Topwear, Jeans, Cargos & Hoodies'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-[#0A3A1E] bg-white border border-[#0A3A1E]/20 px-2 py-1 rounded-lg">
                        {isCategoryPickerOpen ? 'Close' : 'Choose'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryPickerOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Clean Category Picker Dropdown */}
                  {isCategoryPickerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                      
                      {/* Top Bar: Search and "+ Add New Custom Category" Button */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={categorySearchQuery}
                            onChange={(e) => setCategorySearchQuery(e.target.value)}
                            placeholder="Search categories (e.g. T-shirts, Jeans, Cargo, Hoodie...)"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] outline-hidden bg-slate-50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCreatingCustomCat(!isCreatingCustomCat)}
                          className="px-3 py-2 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isCreatingCustomCat ? 'View Categories' : 'Add New Custom Category'}</span>
                        </button>
                      </div>

                      {/* DYNAMIC CUSTOM CATEGORY CREATOR PANEL */}
                      {isCreatingCustomCat ? (
                        <div className="p-3.5 bg-gradient-to-br from-amber-50/80 to-emerald-50/50 border-2 border-amber-300/80 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <h4 className="text-xs font-black text-slate-900">
                                Create New Custom Category (Syncs Live to Firebase)
                              </h4>
                            </div>
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                              Instant App Sync
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Custom categories immediately appear across store navigation, category filters, and product catalogs.
                          </p>

                          <div className="space-y-2">
                            <div>
                              <label className="text-[11px] font-extrabold text-slate-800 block mb-1">
                                Category Name *
                              </label>
                              <input
                                type="text"
                                value={customCatName}
                                onChange={(e) => setCustomCatName(e.target.value)}
                                placeholder="e.g. Linen Resort Shirts, Anime Oversized, Acid Wash Cargo..."
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#0A3A1E] outline-hidden"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-extrabold text-slate-800 block mb-1">
                                  Department *
                                </label>
                                <select
                                  value={customCatDept}
                                  onChange={(e) => setCustomCatDept(e.target.value)}
                                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#0A3A1E] outline-hidden"
                                >
                                  <option value="Topwear">Topwear (T-Shirts, Shirts, Polos)</option>
                                  <option value="Bottomwear">Bottomwear (Jeans, Cargos, Shorts)</option>
                                  <option value="Outerwear">Outerwear (Hoodies, Jackets)</option>
                                  <option value="Activewear">Activewear &amp; Gym</option>
                                  <option value="Accessories">Accessories &amp; Other</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-extrabold text-slate-800 block mb-1">
                                  Category Icon *
                                </label>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {['👕', '👔', '👖', '🩳', '🧥', '👟', '🏷️', '✨', '🎨', '⚡', '🔥', '🍙'].map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => setCustomCatIcon(emoji)}
                                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                                        customCatIcon === emoji
                                          ? 'bg-[#0A3A1E] text-white scale-110 shadow-xs'
                                          : 'bg-white hover:bg-slate-100 border border-slate-200'
                                      }`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsCreatingCustomCat(false)}
                                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={!customCatName.trim() || isSavingCustomCat}
                                onClick={handleCreateCustomCategory}
                                className="px-4 py-1.5 bg-[#0A3A1E] hover:bg-[#052610] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                              >
                                {isSavingCustomCat ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FFC107]" />
                                    <span>Saving to Firebase...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC107]" />
                                    <span>Create &amp; Select Category</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Category Options List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                        {filteredCategories.map((node) => {
                          const isSelected = selectedCategoryPath === node.path || selectedCategoryName === node.leafCat;
                          const isCustom = customCategoryNodes.some((c) => c.id === node.id);
                          return (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => handleSelectCategoryNode(node, isCustom)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                                isSelected
                                  ? 'border-[#0A3A1E] bg-emerald-50 text-[#0A3A1E] ring-2 ring-[#FFC107] font-bold'
                                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <span className="text-base shrink-0">{node.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black block truncate">{node.leafCat}</span>
                                  {isCustom && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-300 shrink-0">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {node.path}
                                </span>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0A3A1E] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Category Quick Entry (Alternative quick apply) */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="text"
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleApplyCustomCategory();
                          }}
                          placeholder="Or quickly type custom category name..."
                          className="flex-1 p-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomCategory}
                          className="px-3 py-2 bg-[#0A3A1E] hover:bg-[#052610] text-white rounded-xl text-xs font-bold shrink-0"
                        >
                          Apply
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* GRANULAR PLACEMENT & VISIBILITY CHANNELS (Flipkart-Style Distribution) */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl" id="product-placement-toggles-section">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0A3A1E]" />
                    <label className="text-xs font-extrabold text-slate-900">
                      Product Placement &amp; Visibility Toggles (Flipkart Distribution Channels)
                    </label>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    Granular Control
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select where this product will be shown once published. Changes filter dynamically on the storefront.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  
                  {/* Channel 1: Home Page Showcase */}
                  <div
                    onClick={() => handleTogglePlacement('home')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                      placementShowOnHome
                        ? 'border-[#0A3A1E] bg-emerald-50/60 ring-2 ring-[#0A3A1E]/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Home className={`w-4 h-4 ${placementShowOnHome ? 'text-[#0A3A1E]' : 'text-slate-400'}`} />
                          <span className="text-xs font-black text-slate-900">
                            Home Page Showcase
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={placementShowOnHome}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#0A3A1E] focus:ring-[#0A3A1E] cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Feature on main storefront home feed and recommended drops.
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block ${
                        placementShowOnHome
                          ? 'bg-[#0A3A1E] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {placementShowOnHome ? '✓ Active on Home' : 'Hidden from Home'}
                      </span>
                    </div>
                  </div>

                  {/* Channel 2: Best Deals / Flash Sale */}
                  <div
                    onClick={() => handleTogglePlacement('deals')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                      placementFeatureInDeals
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Zap className={`w-4 h-4 ${placementFeatureInDeals ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                          <span className="text-xs font-black text-slate-900">
                            Best Deals / Flash Sale
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={placementFeatureInDeals}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Feature in 24-Hour Flash Sale banner and Steal Deals carousel.
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block ${
                        placementFeatureInDeals
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {placementFeatureInDeals ? '⚡ Featured in Deals' : 'Standard Pricing'}
                      </span>
                    </div>
                  </div>

                  {/* Channel 3: Standard Catalog / Category Only */}
                  <div
                    onClick={() => handleTogglePlacement('catalogOnly')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                      placementStandardCatalogOnly
                        ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-400/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Tag className={`w-4 h-4 ${placementStandardCatalogOnly ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-xs font-black text-slate-900">
                            Standard Catalog Only
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={placementStandardCatalogOnly}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Keep off home showcase; visible only in its designated category &amp; search.
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block ${
                        placementStandardCatalogOnly
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {placementStandardCatalogOnly ? '📁 Category Only' : 'Multi-Channel'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. Multi-Angle Product Photos (5 Slots, Camera & Gallery Only) */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#0A3A1E]" />
                      <span>2. Multi-Angle Product Photos (5 Dedicated Slots) *</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Live camera capture &amp; gallery upload • {allUploadedImages.length}/5 uploaded
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQualityGuidelines(!showQualityGuidelines)}
                      className="px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#0A3A1E] text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Quality Guidelines</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerCameraCapture()}
                      className="px-3 py-1.5 bg-[#0A3A1E] hover:bg-[#052610] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#FFC107]" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerGalleryUpload()}
                      className="px-3 py-1.5 bg-[#FFC107] hover:bg-[#FFD700] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photos</span>
                    </button>
                  </div>
                </div>

                {/* Quality Guidelines Expandable Accordion */}
                {showQualityGuidelines && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Apparel Image Quality Guidelines for Higher Conversion:</span>
                    </div>
                    <ul className="text-[11px] text-amber-800 space-y-1 list-disc list-inside">
                      <li><strong>Front View (Cover):</strong> Ensure the garment is flat-laid or worn on model with pure white or neutral studio background.</li>
                      <li><strong>Lighting:</strong> Bright, even natural or studio lighting with no harsh shadows or phone flash glare.</li>
                      <li><strong>Resolution:</strong> Minimum 800 x 800 pixels; keep garment wrinkle-free.</li>
                      <li><strong>Close-Up Shot:</strong> Include at least 1 zoomed-in photo of the collar ribbing, DTF print texture, or denim wash.</li>
                    </ul>
                  </div>
                )}

                {/* 5 Distinct Image Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {IMAGE_SLOTS.map((slot) => {
                    const currentImg = slotImages[slot.id];
                    return (
                      <div
                        key={slot.id}
                        className={`relative rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-center p-2 text-center transition-all min-h-[195px] ${
                          currentImg
                            ? 'border-[#0A3A1E] bg-slate-900'
                            : 'border-dashed border-slate-300 bg-slate-50 hover:border-[#0A3A1E] hover:bg-emerald-50/30'
                        }`}
                      >
                        {currentImg ? (
                          <>
                            <img
                              src={currentImg}
                              alt={slot.label}
                              className="w-full h-32 object-cover rounded-xl"
                            />
                            <div className="w-full pt-1.5 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white truncate max-w-[85px]">
                                {slot.label.split(' ')[0]}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => triggerCameraCapture(slot.id)}
                                  className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white"
                                  title="Resnap photo"
                                >
                                  <Camera className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlotImage(slot.id)}
                                  className="p-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white"
                                  title="Remove photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {slot.id === 0 && (
                              <span className="absolute top-2 left-2 bg-[#0A3A1E] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                Cover
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 space-y-2">
                            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-xs">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-slate-800 block">
                                Slot {slot.id + 1}
                              </span>
                              <span className="text-[10px] font-bold text-[#0A3A1E] block">
                                {slot.label}
                              </span>
                              <span className="text-[9px] text-slate-400 block pt-0.5 leading-tight">
                                {slot.desc}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => triggerCameraCapture(slot.id)}
                                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#0A3A1E]"
                                title="Snap with camera"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerGalleryUpload(slot.id)}
                                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                                title="Pick from gallery"
                              >
                                <Upload className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Mandatory Product Title / Name */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>3. Mandatory Product Title / Name *</span>
                  <span className="text-[10px] text-slate-500">{title.length}/100 chars</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type product title (e.g. 240 GSM Acid Wash Oversized Graphic T-Shirt, Baggy 6-Pocket Utility Cargo Jeans...)"
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] outline-hidden bg-white"
                />
              </div>

              {/* Brand Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Brand / Studio Name</span>
                  <span className="text-[10px] text-slate-400">Leave blank for 'AK Yadav Prints'</span>
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Type custom brand or leave empty for default studio"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] outline-hidden bg-white"
                />
              </div>

            </div>
          )}

          {/* =====================================================================
              FORM 2: BASIC PRODUCT ATTRIBUTES
          ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Scissors className="w-5 h-5 text-[#0A3A1E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-[#0A3A1E] uppercase tracking-wider">
                    Form 2 • Apparel Attributes, Fabric &amp; Size Specs
                  </h3>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Specify fabric weight/GSM, color shades, weave blends, fit silhouette, neck styling, and available sizes.
                  </p>
                </div>
              </div>

              {/* 1. Garment Weight & GSM */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#0A3A1E]" />
                    <span>Garment Weight / GSM Selection *</span>
                  </span>
                  <span className="text-[11px] font-black text-[#0A3A1E] bg-[#FFC107]/20 px-2 py-0.5 rounded-md border border-[#FFC107]/40">
                    {weightGrams ? `${weightGrams} GSM / grams` : 'Select Weight'}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEIGHT_PRESETS.map((preset) => {
                    const isSelected = weightGrams === preset.grams.toString();
                    return (
                      <button
                        key={preset.grams}
                        type="button"
                        onClick={() => setWeightGrams(preset.grams.toString())}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#0A3A1E] bg-emerald-50 text-[#0A3A1E] ring-2 ring-[#FFC107] font-bold'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{preset.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#0A3A1E]" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Color Palette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[#0A3A1E]" />
                    <span>Color Shades ({selectedColors.length} Selected) *</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Pick all available color variations</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_PRESETS.map((col) => {
                    const isSelected = selectedColors.some((c) => c.name === col.name);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => handleToggleColor(col)}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-[#0A3A1E] bg-emerald-50 text-[#0A3A1E] ring-2 ring-[#FFC107] font-bold'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-xs"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-[11px] truncate">{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Fabric Blend & Fit Shape */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900">Fabric Composition *</label>
                  <select
                    value={fabricType}
                    onChange={(e) => setFabricType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                  >
                    <option value="">Select Fabric Blend</option>
                    {FABRIC_TYPES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900">Fit / Silhouette *</label>
                  <select
                    value={fitShape}
                    onChange={(e) => setFitShape(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                  >
                    <option value="">Select Fit Type</option>
                    {FIT_TYPES.map((ft) => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Neck Style & Sleeve Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900">Neck Style / Collar</label>
                  <select
                    value={neckStyle}
                    onChange={(e) => setNeckStyle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                  >
                    <option value="">Select Neck Construction</option>
                    {NECK_STYLES.map((ns) => (
                      <option key={ns} value={ns}>{ns}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900">Sleeve Length</label>
                  <select
                    value={sleeveLength}
                    onChange={(e) => setSleeveLength(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                  >
                    <option value="">Select Sleeve</option>
                    {SLEEVE_LENGTHS.map((sl) => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5. Size Checklist & Interactive Size Chart */}
              <div className="space-y-3 p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Size Checklist &amp; Interactive Size Chart *</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Check all active size offerings for this catalog
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSizeChartModal(!showSizeChartModal)}
                    className="px-3 py-1.5 rounded-xl bg-[#0A3A1E] hover:bg-[#052610] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Ruler className="w-3.5 h-3.5 text-[#FFC107]" />
                    <span>{showSizeChartModal ? 'Hide Size Chart' : 'Add / View Size Chart'}</span>
                  </button>
                </div>

                {/* Size Checkboxes */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(selectedCategoryNode?.recommendedSizes || ['S', 'M', 'L', 'XL', 'XXL', '3XL']).map((sz) => {
                    const isChecked = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={`w-11 h-11 rounded-xl font-black text-xs border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#0A3A1E] text-white border-[#0A3A1E] ring-2 ring-[#FFC107] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Size Chart Table */}
                {showSizeChartModal && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0A3A1E] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Interactive Garment Size Chart (Inches)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Editable measurements</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-2">Size</th>
                            <th className="p-2">{selectedCategoryNode?.type === 'bottoms' ? 'Waist (in)' : 'Chest (in)'}</th>
                            <th className="p-2">Length (in)</th>
                            <th className="p-2">{selectedCategoryNode?.type === 'bottoms' ? 'Hip (in)' : 'Shoulder (in)'}</th>
                            <th className="p-2">{selectedCategoryNode?.type === 'bottoms' ? 'Thigh (in)' : 'Sleeve (in)'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customSizeChart.map((row, idx) => (
                            <tr key={row.size} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-2 font-black text-[#0A3A1E]">{row.size}</td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={row.chest}
                                  onChange={(e) => handleSizeChartChange(idx, 'chest', e.target.value)}
                                  className="w-16 p-1 border rounded-md text-xs font-bold"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={row.length}
                                  onChange={(e) => handleSizeChartChange(idx, 'length', e.target.value)}
                                  className="w-16 p-1 border rounded-md text-xs font-bold"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={row.shoulder}
                                  onChange={(e) => handleSizeChartChange(idx, 'shoulder', e.target.value)}
                                  className="w-16 p-1 border rounded-md text-xs font-bold"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={row.sleeve}
                                  onChange={(e) => handleSizeChartChange(idx, 'sleeve', e.target.value)}
                                  className="w-16 p-1 border rounded-md text-xs font-bold"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* =====================================================================
              FORM 3: PRICE, TAX & MANUFACTURING DETAILS
          ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-[#0A3A1E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-[#0A3A1E] uppercase tracking-wider">
                    Form 3 • Price, Tax &amp; Manufacturing Legal Metrology
                  </h3>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Set your customer selling price, defective-return discount pricing, GST &amp; HSN classification, and statutory manufacturer details.
                  </p>
                </div>
              </div>

              {/* 1. Multi-tier Pricing Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Selling Price / Meesho Price */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Meesho / Selling Price *</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Standard Price</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 699"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-black text-base text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Price with standard 7-day all-reason customer return policy.
                  </p>
                </div>

                {/* Wrong / Defective Returns Only Price */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-900">
                      Defective Returns Price *
                    </label>
                    <button
                      type="button"
                      onClick={handleSuggestDefectivePrice}
                      className="text-[10px] font-bold text-[#0A3A1E] hover:underline"
                    >
                      Suggest 5% Off
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-[#0A3A1E]">₹</span>
                    <input
                      type="number"
                      required
                      value={defectiveReturnsPrice}
                      onChange={(e) => setDefectiveReturnsPrice(e.target.value)}
                      placeholder="e.g. 669"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-emerald-300 font-black text-base text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-800 leading-tight">
                    Lower price for customers who agree to return only if item is wrong or defective.
                  </p>
                </div>

                {/* Maximum Retail Price (MRP) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Original MRP (₹)</span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] text-rose-600 font-black">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 1499"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-black text-base text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Printed MRP label on garment tag.
                  </p>
                </div>

              </div>

              {/* 2. Real-Time Bank Settlement & Tax Breakdown Card */}
              <div className="p-4 rounded-2xl bg-[#0A3A1E]/5 border border-[#0A3A1E]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0A3A1E] text-white flex items-center justify-center font-bold">
                      <Percent className="w-4 h-4 text-[#FFC107]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0A3A1E] block">
                        Estimated Net Bank Payout (0% Commission Platform)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Zero seller marketplace fee • Daily automatic bank settlement
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-[#0A3A1E]">
                      ₹{numPrice > 0 ? netSettlementPayout : '0.00'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">/ unit sold</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#0A3A1E]/10 text-[11px]">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Selling Price</span>
                    <strong className="text-slate-800">₹{numPrice}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">GST Tax ({gstRate})</span>
                    <strong className="text-slate-800">₹{gstAmount}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Payment Gateway (2%)</span>
                    <strong className="text-slate-800">₹{pgFee}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Platform Fee</span>
                    <strong className="text-emerald-700">₹0.00 (Free)</strong>
                  </div>
                </div>
              </div>

              {/* 3. GST Rate & HSN Code Classification */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-[#0A3A1E]" />
                    <span>GST Tax Classification &amp; HSN Code *</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Government statutory compliance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Applicable GST Rate</span>
                    <div className="grid grid-cols-4 gap-2">
                      {GST_RATES.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setGstRate(rate)}
                          className={`p-2 rounded-xl text-xs font-extrabold border transition-all ${
                            gstRate === rate
                              ? 'bg-[#0A3A1E] text-white border-[#0A3A1E] ring-2 ring-[#FFC107]'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {rate}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">HSN Code (Harmonized System of Nomenclature)</span>
                    <select
                      value={hsnCode}
                      onChange={(e) => setHsnCode(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                    >
                      {COMMON_HSN_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} - {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Country of Origin & Legal Manufacturer Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0A3A1E]" />
                    <span className="text-xs font-extrabold text-slate-900">
                      Legal Metrology &amp; Manufacturer Information *
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Mandatory for all e-commerce listings</span>
                </div>

                {/* Country of Origin */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#0A3A1E]" />
                    <span>Country of Origin *</span>
                  </label>
                  <select
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="w-full sm:w-1/2 p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    {COUNTRIES_OF_ORIGIN.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Manufacturer Details Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-800 block">
                    Manufacturer Details (Factory / Facility)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Manufacturer Name</span>
                      <input
                        type="text"
                        value={manufacturerName}
                        onChange={(e) => setManufacturerName(e.target.value)}
                        placeholder="Company or Factory Name"
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Street / Plot Address</span>
                      <input
                        type="text"
                        value={manufacturerAddress}
                        onChange={(e) => setManufacturerAddress(e.target.value)}
                        placeholder="Plot number, industrial area"
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                      />
                    </div>
                    <div className="sm:col-span-1 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">City &amp; State</span>
                        <input
                          type="text"
                          value={manufacturerCityState}
                          onChange={(e) => setManufacturerCityState(e.target.value)}
                          placeholder="City, State"
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">Pincode</span>
                        <input
                          type="text"
                          value={manufacturerPincode}
                          onChange={(e) => setManufacturerPincode(e.target.value)}
                          placeholder="6-digit PIN"
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Packer Details */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-800 block">
                      Packer Details (Packaging &amp; Fulfillment Facility)
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={packerSameAsManufacturer}
                        onChange={(e) => setPackerSameAsManufacturer(e.target.checked)}
                        className="w-4 h-4 rounded-md text-[#0A3A1E] focus:ring-[#0A3A1E]"
                      />
                      <span className="text-xs font-bold text-[#0A3A1E]">
                        Same as Manufacturer Details
                      </span>
                    </label>
                  </div>

                  {!packerSameAsManufacturer && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 animate-in fade-in duration-150">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">Packer Name</span>
                        <input
                          type="text"
                          value={packerName}
                          onChange={(e) => setPackerName(e.target.value)}
                          placeholder="Packer Entity Name"
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">Packer Facility Address</span>
                        <input
                          type="text"
                          value={packerAddress}
                          onChange={(e) => setPackerAddress(e.target.value)}
                          placeholder="Warehouse Address"
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block mb-0.5">City &amp; State</span>
                          <input
                            type="text"
                            value={packerCityState}
                            onChange={(e) => setPackerCityState(e.target.value)}
                            placeholder="City, State"
                            className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block mb-0.5">Pincode</span>
                          <input
                            type="text"
                            value={packerPincode}
                            onChange={(e) => setPackerPincode(e.target.value)}
                            placeholder="PIN code"
                            className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* =====================================================================
              FORM 4: ADDITIONAL DETAILS & SKU SETUP
          ===================================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Box className="w-5 h-5 text-[#0A3A1E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-[#0A3A1E] uppercase tracking-wider">
                    Form 4 • Style Details &amp; Dynamic Variant SKUs
                  </h3>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Set Style Code/Product ID, brand identity, character/theme, hemline cut, length, and allocate stock units with unique variant SKUs.
                  </p>
                </div>
              </div>

              {/* 1. Style Code / Product ID & Brand Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Style Code / Product ID *</span>
                    <button
                      type="button"
                      onClick={handleGenerateStyleCode}
                      className="text-[11px] font-bold text-[#0A3A1E] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    value={styleCode}
                    onChange={(e) => setStyleCode(e.target.value)}
                    placeholder="e.g. AKY-SS25-OVR-01"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Master product reference code</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. AK Yadav Streetwear"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Brand tagged on product packaging</span>
                </div>
              </div>

              {/* 2. Character / Theme, Hemline & Length */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-1">Character / Theme</span>
                  <select
                    value={characterTheme}
                    onChange={(e) => setCharacterTheme(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                  >
                    {CHARACTER_THEMES.map((theme) => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-1">Hemline Construction</span>
                  <select
                    value={hemline}
                    onChange={(e) => setHemline(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                  >
                    {HEMLINES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-1">Garment Length</span>
                  <select
                    value={garmentLength}
                    onChange={(e) => setGarmentLength(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                  >
                    {LENGTH_TYPES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Dynamic Size-Wise Variant Matrix & SKU Setup */}
              <div className="space-y-3 p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Dynamic Size-Wise Variant SKU &amp; Stock Matrix *</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Total Allocated Inventory: <strong>{totalStockCount} units</strong> across {selectedSizes.length} size variants
                    </span>
                  </div>

                  {/* Bulk Fill Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleGenerateAllVariantSkus}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-[#0A3A1E] hover:bg-emerald-200 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate All SKUs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkStockFill(25)}
                      className="px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Fill 25/size
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkStockFill(50)}
                      className="px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Fill 50/size
                    </button>
                  </div>
                </div>

                {/* Variant Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Size Variant</th>
                        <th className="p-2.5">Stock Count (Units)</th>
                        <th className="p-2.5">Unique Variant SKU Code</th>
                        <th className="p-2.5">Inventory Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedSizes.map((sz) => {
                        const count = Number(sizeStock[sz]) || 0;
                        const currentVariantSku = variantSkus[sz] || `${styleCode || 'AKY-PROD'}-${sz}`;

                        return (
                          <tr key={sz} className="hover:bg-slate-50/80">
                            <td className="p-2.5 font-black text-[#0A3A1E]">
                              <span className="w-7 h-7 rounded-lg bg-[#0A3A1E]/10 border border-[#0A3A1E]/20 flex items-center justify-center text-xs">
                                {sz}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                value={sizeStock[sz] || ''}
                                onChange={(e) => handleSizeStockChange(sz, e.target.value)}
                                placeholder="0 units"
                                className="w-24 p-1.5 rounded-lg border border-slate-300 font-bold text-xs bg-white focus:ring-2 focus:ring-[#0A3A1E]"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={currentVariantSku}
                                onChange={(e) => handleVariantSkuChange(sz, e.target.value)}
                                placeholder={`${styleCode || 'AKY'}-${sz}`}
                                className="w-full max-w-[220px] p-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold text-slate-800 bg-slate-50"
                              />
                            </td>
                            <td className="p-2.5">
                              {count > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="w-3 h-3" />
                                  In Stock ({count})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                  Zero Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* 4. Product Story & Highlights */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Product Story &amp; Description (Manual Text)</span>
                    <span className="text-[10px] text-slate-400">Customer styling guide</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Type manual product story, styling tips, fit experience, and fabric feel..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#0A3A1E] outline-hidden leading-relaxed bg-white"
                  />
                </div>

                {/* Key Bullet Highlights */}
                <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Key Bullet Highlights ({highlights.length})</span>
                    <span className="text-[10px] text-slate-500">Feature points shown on product page</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newHighlightText}
                      onChange={(e) => setNewHighlightText(e.target.value)}
                      placeholder="e.g. 100% French Terry looped cotton (240 GSM)"
                      className="flex-1 p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-3 py-2 bg-[#0A3A1E] text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      + Add Point
                    </button>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {highlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="text-slate-800 font-medium">{hl}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =====================================================================
              FORM 5: FINAL REVIEW & PUBLISH
          ===================================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Eye className="w-5 h-5 text-[#0A3A1E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-[#0A3A1E] uppercase tracking-wider">
                    Form 5 • Final Review &amp; Catalog Publication
                  </h3>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Verify all catalog parameters across the 4 modules below before pushing the product live to the active store catalog.
                  </p>
                </div>
              </div>

              {/* Grouped Review Summary Blocks */}
              <div className="space-y-4">

                {/* BLOCK 1: Visual Media & Categorization */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-[#0A3A1E] flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      <span>1. Visual Angles &amp; Product Identification</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] font-bold text-[#0A3A1E] hover:underline"
                    >
                      Edit Form 1
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                      <img
                        src={allUploadedImages[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-black text-[#0A3A1E] bg-[#FFC107]/20 px-2 py-0.5 rounded-md border border-[#FFC107]/40 inline-block">
                        {selectedCategoryPath || 'Men Fashion > Topwear'}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        {title || 'Untitled Apparel Product'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Brand: <strong>{brandName || brand || 'AK Yadav Prints'}</strong> • Photos Uploaded: <strong>{allUploadedImages.length}/5 slots</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* BLOCK 2: Fabric & Technical Specs */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-[#0A3A1E] flex items-center gap-1.5">
                      <Scissors className="w-4 h-4" />
                      <span>2. Fabric Blend &amp; Technical Specifications</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] font-bold text-[#0A3A1E] hover:underline"
                    >
                      Edit Form 2
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Fabric Blend</span>
                      <strong className="text-slate-800 truncate block">{customFabricType || fabricType}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Weight / GSM</span>
                      <strong className="text-slate-800">{weightGrams} GSM</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Fit / Silhouette</span>
                      <strong className="text-slate-800 truncate block">{customFitShape || fitShape}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Neck Construction</span>
                      <strong className="text-slate-800 truncate block">{customNeckStyle || neckStyle}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Sleeve Length</span>
                      <strong className="text-slate-800">{sleeveLength}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Character / Theme</span>
                      <strong className="text-slate-800">{characterTheme}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Hemline Cut</span>
                      <strong className="text-slate-800">{hemline}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Garment Length</span>
                      <strong className="text-slate-800">{garmentLength}</strong>
                    </div>
                  </div>
                </div>

                {/* BLOCK 3: Pricing, Tax & Legal Metrology */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-[#0A3A1E] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>3. Pricing, GST Tax &amp; Manufacturer Details</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] font-bold text-[#0A3A1E] hover:underline"
                    >
                      Edit Form 3
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Meesho Selling Price</span>
                      <strong className="text-sm font-black text-slate-900">₹{numPrice}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Defective Return Price</span>
                      <strong className="text-sm font-black text-[#0A3A1E]">₹{numDefectivePrice}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Estimated Payout</span>
                      <strong className="text-sm font-black text-emerald-700">₹{netSettlementPayout}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">GST &amp; HSN</span>
                      <strong className="text-slate-800">{gstRate} • HSN {hsnCode}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    <span>Origin &amp; Manufacturer: </span>
                    <strong className="text-slate-900">{countryOfOrigin}</strong> by <strong>{manufacturerName}</strong> ({manufacturerAddress}, {manufacturerCityState} - {manufacturerPincode})
                  </div>
                </div>

                {/* BLOCK 4: Variant SKUs & Stock Allocation */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-[#0A3A1E] flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>4. Variant Matrix &amp; Allocated Stock ({totalStockCount} Total Units)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-[11px] font-bold text-[#0A3A1E] hover:underline"
                    >
                      Edit Form 4
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedSizes.map((sz) => (
                      <div key={sz} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center gap-2">
                        <span className="font-black text-[#0A3A1E]">Size {sz}:</span>
                        <span className="font-bold text-slate-800">{sizeStock[sz] || 0} pcs</span>
                        <span className="text-[10px] font-mono text-slate-400">({variantSkus[sz] || `${styleCode}-${sz}`})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BLOCK 5: Storefront Placement & Visibility Channels Review */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-[#0A3A1E] flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>5. Storefront Placement &amp; Visibility Distribution</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] font-bold text-[#0A3A1E] hover:underline"
                    >
                      Edit in Form 1
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div
                      onClick={() => handleTogglePlacement('home')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        placementShowOnHome
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#0A3A1E]" />
                        <span>Home Showcase</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        placementShowOnHome ? 'bg-[#0A3A1E] text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {placementShowOnHome ? 'Active' : 'Off'}
                      </span>
                    </div>

                    <div
                      onClick={() => handleTogglePlacement('deals')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        placementFeatureInDeals
                          ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>Best Deals / Flash</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        placementFeatureInDeals ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {placementFeatureInDeals ? 'Featured' : 'Off'}
                      </span>
                    </div>

                    <div
                      onClick={() => handleTogglePlacement('catalogOnly')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        placementStandardCatalogOnly
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-600" />
                        <span>Catalog Only</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        placementStandardCatalogOnly ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {placementStandardCatalogOnly ? 'Enabled' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Mandatory Legal & Metrology Terms Agreement */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-5 h-5 rounded-md text-[#0A3A1E] focus:ring-[#0A3A1E] mt-0.5 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-amber-950 block">
                      Mandatory Seller Legal Metrology &amp; Tax Declaration *
                    </span>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      I declare and certify that the product specifications, fabric composition, GST tax classification ({gstRate}), HSN code ({hsnCode}), MRP label, and manufacturer &amp; packer disclosures provided are authentic, accurate, and fully compliant with eCommerce regulations.
                    </p>
                  </div>
                </label>
              </div>

            </div>
          )}

        </div>

        {/* =========================================================================
            FOOTER: NAVIGATION BUTTONS
        ========================================================================= */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-[#0A3A1E] hover:bg-[#052610] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <span>Continue to {stepsList[currentStep].short}</span>
                <ArrowRight className="w-4 h-4 text-[#FFC107]" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isPublishing || !agreedTerms}
                onClick={handlePublish}
                className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all ${
                  agreedTerms
                    ? 'bg-[#FFC107] hover:bg-[#FFD700] text-slate-950 hover:shadow-xl cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Catalog...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4 stroke-3" />
                    <span>Publish Catalog Live</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
