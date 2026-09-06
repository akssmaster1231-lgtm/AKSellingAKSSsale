import { 
  Product, Story, Order, Address, UserProfile, SellerBankDetails, SellerPickupAddress,
  PayoutRecord, ReturnRecord, ClaimRecord, DailySalesPoint, HeroBanner, CreatorProfile 
} from '../types';

export const INITIAL_CREATOR_PROFILE: CreatorProfile = {
  brandName: 'AKSelling Official',
  handle: '@akselling_official',
  avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
  bio: 'Heavyweight 240+ GSM French Terry & Streetwear Drip. Made in India. Express BlueDart Delivery ⚡',
  category: 'Streetwear & Apparel Brand',
  instagramUrl: 'https://instagram.com/akselling',
  websiteUrl: 'https://akselling.in',
  isVerified: true,
  followersCount: 48200,
  followingCount: 142,
  postsCount: 68,
};

export const MOCK_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'Drop 01 🔥',
    category: 'New In',
    author: 'AK Drops',
    avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
    featuredProductId: 'prod-1',
    hasAudio: true,
    likesCount: 1420,
    viewsCount: 12480,
    commentsCount: 89,
    sharesCount: 312,
    isLiked: false,
    isFollowed: true,
    createdAt: '2 hrs ago',
    comments: [
      { id: 'c1', author: 'Vikram Mehta', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', text: 'Insane 260 GSM fabric! Ordered the Tokyo black size XL 🔥', createdAt: '1h ago', likesCount: 14 },
      { id: 'c2', author: 'Pooja Rawat', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', text: 'Does this run oversized or standard fit?', createdAt: '45m ago', likesCount: 6 },
      { id: 'c3', author: 'AK Selling Support', avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100', text: '@Pooja It has a true relaxed streetwear boxy drop-shoulder cut! Go true to size 🚀', createdAt: '30m ago', likesCount: 18 }
    ],
    slides: [
      {
        id: 's1-1',
        mediaType: 'video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        mediaUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80',
        title: 'Cyberpunk Tokyo Nights ⚡ (Audio ON)',
        caption: '260 GSM Ultra-Heavyweight French Terry Cotton. Pure Streetwear perfection.',
        productTaggedId: 'prod-1',
        durationMs: 7000,
      },
      {
        id: 's1-2',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop&q=80',
        title: 'Drop-Shoulder Boxy Silhouette',
        caption: 'Engineered oversized cut. Seamless rib neckline that never sags.',
        productTaggedId: 'prod-1',
        durationMs: 5000,
      }
    ]
  },
  {
    id: 'story-2',
    title: 'Acid Wash 🧪',
    category: 'Vintage',
    author: 'Vintage Lab',
    avatar: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&auto=format&fit=crop&q=80',
    featuredProductId: 'prod-3',
    hasAudio: true,
    likesCount: 980,
    viewsCount: 8940,
    commentsCount: 42,
    sharesCount: 184,
    isLiked: false,
    isFollowed: false,
    createdAt: '4 hrs ago',
    comments: [
      { id: 'c4', author: 'Rohan Deshmukh', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', text: 'The mineral wash texture on this is fire 🔥', createdAt: '2h ago', likesCount: 9 }
    ],
    slides: [
      {
        id: 's2-1',
        mediaType: 'video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        mediaUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&auto=format&fit=crop&q=80',
        title: 'Mineral Acid Wash Tee (Live Reel)',
        caption: 'Custom artisanal wash technique. Each single piece has unique vintage distress pattern.',
        productTaggedId: 'prod-3',
        durationMs: 8000,
      }
    ]
  },
  {
    id: 'story-3',
    title: 'Anime Core 🍙',
    category: 'Anime',
    author: 'Otaku Vault',
    avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80',
    featuredProductId: 'prod-2',
    hasAudio: true,
    likesCount: 2310,
    viewsCount: 19400,
    commentsCount: 145,
    sharesCount: 520,
    isLiked: true,
    isFollowed: true,
    createdAt: '6 hrs ago',
    comments: [
      { id: 'c5', author: 'Arjun Sen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'The puff print quality is insane bro 🎌', createdAt: '3h ago', likesCount: 22 }
    ],
    slides: [
      {
        id: 's3-1',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80',
        title: 'Demon Shadow Limited Edition',
        caption: 'High-density puff screen print. Vibrant Japanese aesthetic.',
        productTaggedId: 'prod-2',
        durationMs: 5000,
      }
    ]
  },
  {
    id: 'story-4',
    title: 'Polo Luxe 👔',
    category: 'Classics',
    author: 'AK Classic',
    avatar: 'https://images.unsplash.com/photo-1625910513413-5a022510fae0?w=200&auto=format&fit=crop&q=80',
    featuredProductId: 'prod-5',
    hasAudio: false,
    likesCount: 640,
    viewsCount: 5120,
    commentsCount: 19,
    sharesCount: 88,
    isLiked: false,
    isFollowed: false,
    createdAt: '12 hrs ago',
    slides: [
      {
        id: 's4-1',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1625910513413-5a022510fae0?w=1000&auto=format&fit=crop&q=80',
        title: 'Textured Knit Waffle Polo',
        caption: 'Smart casual polo with ribbed collar and breathable premium weave.',
        productTaggedId: 'prod-5',
        durationMs: 5000,
      }
    ]
  },
  {
    id: 'story-5',
    title: 'Behind Stitches 🧵',
    category: 'Reels',
    author: 'AK Studios',
    avatar: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop&q=80',
    featuredProductId: 'prod-4',
    hasAudio: true,
    likesCount: 1890,
    viewsCount: 14750,
    commentsCount: 67,
    sharesCount: 410,
    isLiked: false,
    isFollowed: true,
    createdAt: '1 day ago',
    slides: [
      {
        id: 's5-1',
        mediaType: 'video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        mediaUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&auto=format&fit=crop&q=80',
        title: 'Precision 240 GSM Bio-Wash Craft',
        caption: 'Double-needle hem stitching and pre-shrunk combed yarn in action.',
        productTaggedId: 'prod-4',
        durationMs: 8000,
      }
    ]
  },
  {
    id: 'story-6',
    title: 'Deals 60% 🏷️',
    category: 'Flash Sale',
    author: 'AK Flash',
    avatar: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&auto=format&fit=crop&q=80',
    featuredProductId: 'prod-6',
    hasAudio: true,
    likesCount: 3120,
    viewsCount: 28400,
    commentsCount: 210,
    sharesCount: 890,
    isLiked: false,
    isFollowed: true,
    createdAt: '1 day ago',
    slides: [
      {
        id: 's6-1',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1000&auto=format&fit=crop&q=80',
        title: 'Mega T-Shirt Fest Is Live!',
        caption: 'Buy Any 2 Graphic Tees at ₹1,199. Limited stock countdown.',
        productTaggedId: 'prod-6',
        durationMs: 5000,
      }
    ]
  },
  {
    id: 'story-7',
    title: 'Fit Check 📸',
    category: 'Community',
    author: 'AK Crew',
    avatar: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&auto=format&fit=crop&q=80',
    featuredProductId: 'prod-7',
    hasAudio: true,
    likesCount: 1540,
    viewsCount: 11200,
    commentsCount: 78,
    sharesCount: 290,
    isLiked: true,
    isFollowed: false,
    createdAt: '2 days ago',
    slides: [
      {
        id: 's7-1',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1000&auto=format&fit=crop&q=80',
        title: 'Real Customers, Real Drip',
        caption: 'Tag @AKSelling on Instagram to get featured on our stories!',
        productTaggedId: 'prod-7',
        durationMs: 5000,
      }
    ]
  }
];

export const MOCK_BANNERS: HeroBanner[] = [
  {
    id: 'b1',
    headline: 'MEGA T-SHIRT FEST',
    subheadline: 'Up to 60% Off on Premium 240 GSM Oversized & Graphic Tees',
    badge: 'EXCLUSIVE DEALS',
    bgColor: 'from-slate-950 via-slate-900 to-indigo-950',
    accentColor: 'text-amber-400',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    category: 'Oversized',
    code: 'AKFEST15',
    isActive: true,
    clicksCount: 1420,
    impressionsCount: 18900,
  },
  {
    id: 'b2',
    headline: 'VINTAGE ACID WASH',
    subheadline: 'Artisanal Pumice Stone Wash with Heavyweight Drop-Shoulder Fit',
    badge: 'LIMITED DROP',
    bgColor: 'from-amber-950 via-zinc-900 to-stone-950',
    accentColor: 'text-amber-300',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    category: 'Acid Wash',
    code: 'VINTAGE10',
    isActive: true,
    clicksCount: 980,
    impressionsCount: 12400,
  },
  {
    id: 'b3',
    headline: 'LUXE WAFFLE POLOS',
    subheadline: 'Resort Camp Collar & 3D Breathable Micro-Knit Textures',
    badge: 'SMART CASUAL',
    bgColor: 'from-emerald-950 via-slate-900 to-teal-950',
    accentColor: 'text-emerald-300',
    image: 'https://images.unsplash.com/photo-1625910513413-5a022510fae0?w=800&auto=format&fit=crop&q=80',
    category: 'Polo & Collared',
    code: 'POLO15',
    isActive: true,
    clicksCount: 750,
    impressionsCount: 9800,
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Tokyo Cyberpunk Neon Graphic Oversized T-Shirt',
    brand: 'AK Originals',
    category: 'Oversized',
    price: 699,
    originalPrice: 1499,
    discountPercent: 53,
    rating: 4.5,
    ratingCount: 3840,
    reviewsCount: 620,
    isAssured: true,
    isBestseller: true,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Onyx Black', hex: '#18181b', imageIndex: 0 },
      { name: 'Smoke Grey', hex: '#64748b', imageIndex: 1 },
      { name: 'Vintage Olive', hex: '#3f4f3e', imageIndex: 2 }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    inStock: true,
    stockCount: 24,
    description: 'Elevate your streetwear statement with the Tokyo Cyberpunk Oversized Tee. Cut from ultra-dense 240 GSM combed cotton and treated with an eco bio-silicon wash for an ultra-soft handfeel. Features high-definition screen printing on the back with reflective chest typography.',
    highlights: [
      'Fit: Streetwear Baggy Drop-Shoulder Fit',
      'Fabric: 100% Super Combed Bio-Washed Cotton',
      'Weight: 240 GSM Heavyweight Premium Jersey',
      'Neckline: Lycra Ribbed Crew Neck (Anti-Sagging)',
      'Print: High-Density Crack-Proof Plastisol & HD Foil'
    ],
    fabric: '100% Combed Cotton',
    gsm: '240 GSM Heavyweight',
    fit: 'Relaxed Oversized Boxy Fit',
    careInstructions: 'Machine wash cold inside out with similar colors. Do not iron directly on print.',
    deliveryDays: 2,
    offers: [
      'Bank Offer: Flat ₹100 instant discount on HDFC/ICICI Credit Cards',
      'Special Price: Get extra 10% off on purchase of 2 or more T-shirts',
      'Free Delivery: Standard express delivery on all orders above ₹499',
      'Partner Offer: Free 1-month Spotify Premium code on checkout'
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Rohit Sharma',
        rating: 5,
        date: '28 Aug 2026',
        title: 'Insane quality! Fabric is super thick and premium',
        comment: 'I was hesitant at first but when I opened the package the 240 GSM weight is real! The oversized cut fits like Balenciaga or Yeezy tees. Will order 2 more colors.',
        verifiedPurchase: true,
        helpfulCount: 42
      },
      {
        id: 'r2',
        author: 'Arjun K.',
        rating: 4,
        date: '22 Aug 2026',
        title: 'Great graphic print and comfortable fit',
        comment: 'The print colors pop vibrantly even after 3 machine washes. If you are 5\'10 like me, Size L gives the perfect drop-shoulder aesthetic.',
        verifiedPurchase: true,
        helpfulCount: 19
      }
    ]
  },
  {
    id: 'prod-2',
    title: 'Demon Shadow Anime High-Density Graphic Tee',
    brand: 'AK Anime X',
    category: 'Anime & Gaming',
    price: 649,
    originalPrice: 1399,
    discountPercent: 54,
    rating: 4.7,
    ratingCount: 2190,
    reviewsCount: 412,
    isAssured: true,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Charcoal Wash', hex: '#27272a', imageIndex: 0 },
      { name: 'Crimson Red', hex: '#991b1b', imageIndex: 1 },
      { name: 'Off White', hex: '#f4f4f5', imageIndex: 2 }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 15,
    description: 'Custom Japanese dark fantasy typography with layered puff-print graphics. Crafted with precision for true anime connoisseurs and streetwear collectors.',
    highlights: [
      'High-Density Japanese Anime Character Back Graphic',
      '220 GSM 100% Breathable Ringspun Cotton',
      'Pre-shrunk to avoid shrinkage after washing',
      'Reinforced shoulder-to-shoulder tape stitching'
    ],
    fabric: '100% Ringspun Cotton',
    gsm: '220 GSM',
    fit: 'Regular to Relaxed Fit',
    careInstructions: 'Gentle cycle, cold water, hang dry recommended.',
    deliveryDays: 1,
    offers: [
      'SuperDeal: Flat 54% Off during Launch Fest',
      'No Cost EMI available on major credit cards',
      'Buy 2 Anime Tees & get a free Anime sticker pack'
    ],
    reviews: [
      {
        id: 'r3',
        author: 'Varun Patel',
        rating: 5,
        date: '15 Aug 2026',
        title: 'A must-have for anime fans!',
        comment: 'The back artwork is crystal sharp. Looks ten times more expensive than ₹649.',
        verifiedPurchase: true,
        helpfulCount: 28
      }
    ]
  },
  {
    id: 'prod-3',
    title: 'Vintage Mineral Acid-Wash Heavyweight T-Shirt',
    brand: 'AK Vintage',
    category: 'Acid Wash',
    price: 799,
    originalPrice: 1799,
    discountPercent: 55,
    rating: 4.6,
    ratingCount: 1520,
    reviewsCount: 290,
    isAssured: true,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Acid Washed Black', hex: '#3f3f46', imageIndex: 0 },
      { name: 'Vintage Rust Brown', hex: '#78350f', imageIndex: 1 },
      { name: 'Washed Moss Green', hex: '#365314', imageIndex: 2 }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 9,
    description: 'Each piece undergoes a specialized pumice stone and mineral wash that yields a 90s vintage distressed character. Thick, drape-heavy fabric that sits flatteringly on all body types.',
    highlights: [
      'Authentic Hand-treated Acid Wash Texture',
      'Heavy 260 GSM Structured Jersey',
      'Boxy retro 90s collar and sleeve proportion',
      'Unisex silhouette designed for effortless layering'
    ],
    fabric: '100% Combed Cotton',
    gsm: '260 GSM',
    fit: 'Boxy Heavyweight Fit',
    careInstructions: 'Wash separately on first 2 cycles to preserve mineral patina.',
    deliveryDays: 2,
    offers: [
      'Special Price: Flat ₹1,000 off on MRP',
      'Free 7-Day Hassle Free Return & Exchange'
    ],
    reviews: [
      {
        id: 'r4',
        author: 'Kunal M.',
        rating: 5,
        date: '10 Aug 2026',
        title: 'The texture is insane',
        comment: 'Vintage wash has just the right amount of distress. It feels like a ₹3,000 designer streetwear drop.',
        verifiedPurchase: true,
        helpfulCount: 35
      }
    ]
  },
  {
    id: 'prod-4',
    title: 'Essential Heavy Pima Cotton Minimalist Plain Tee',
    brand: 'AK Studio Basics',
    category: 'Plain Basics',
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    rating: 4.4,
    ratingCount: 4620,
    reviewsCount: 880,
    isAssured: true,
    isDealOfDay: true,
    dealEndsInHours: 6,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Crisp White', hex: '#fafafa', imageIndex: 0 },
      { name: 'Pitch Black', hex: '#09090b', imageIndex: 1 },
      { name: 'Navy Blue', hex: '#1e3a8a', imageIndex: 2 },
      { name: 'Sage Green', hex: '#065f46', imageIndex: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 60,
    description: 'The definitive daily wardrobe staple. Made with long-staple combed cotton yarns for unbeatable softness, luster, and resistance to pilling. Perfect for solo wear or understated luxury layering under jackets.',
    highlights: [
      'Ultra-Soft Long-Staple Combed Cotton',
      '200 GSM Mid-Heavy Weight - Opaque & Zero Sheerness',
      'Stay-Flat Ribbed Neck Collar with Double Stitch',
      'Colorlock Technology prevents fading over 50+ washes'
    ],
    fabric: '100% Pima Grade Combed Cotton',
    gsm: '200 GSM',
    fit: 'Tailored Regular Fit',
    careInstructions: 'Machine wash warm, tumble dry low.',
    deliveryDays: 1,
    offers: [
      'Deal of the Day: Under ₹500 Flash Price',
      'Pack of 3 Special: Add any 3 basics for ₹1,299 only'
    ],
    reviews: [
      {
        id: 'r5',
        author: 'Siddharth Rao',
        rating: 5,
        date: '02 Aug 2026',
        title: 'Perfect white tee that is NOT transparent!',
        comment: 'Most white tees in India are see-through thin. This one is thick, solid, and holds its collar shape throughout the day.',
        verifiedPurchase: true,
        helpfulCount: 52
      }
    ]
  },
  {
    id: 'prod-5',
    title: 'Textured Waffle-Knit Resort Collar Polo T-Shirt',
    brand: 'AK Club',
    category: 'Polo & Collared',
    price: 849,
    originalPrice: 1899,
    discountPercent: 55,
    rating: 4.8,
    ratingCount: 940,
    reviewsCount: 180,
    isAssured: true,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1625910513413-5a022510fae0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Almond Beige', hex: '#d6c7b2', imageIndex: 0 },
      { name: 'Midnight Blue', hex: '#0f172a', imageIndex: 1 },
      { name: 'Emerald Forest', hex: '#064e3b', imageIndex: 2 }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 18,
    description: 'A sophisticated crossover between upscale resort polo and streetwear comfort. Intricate micro-waffle jacquard knit brings breathable airflow and tactile elegance.',
    highlights: [
      'Resort Camp Collar with Clean French Placket',
      'Textured 3D Waffle Jacquard Knit',
      'Micro-stretch flex for all-day easy movement',
      'Premium Mother of Pearl look button trims'
    ],
    fabric: '95% Cotton, 5% Elastane Waffle Knit',
    gsm: '230 GSM',
    fit: 'Modern Smart Fit',
    careInstructions: 'Gentle wash inside out. Dry flat to maintain structural knit.',
    deliveryDays: 2,
    offers: [
      'Premium Club Offer: Extra 15% off using code POLO15',
      'Assured 24-hr dispatch from nearest fulfillment hub'
    ],
    reviews: [
      {
        id: 'r6',
        author: 'Ananya Deshmukh',
        rating: 5,
        date: '25 Jul 2026',
        title: 'Gifted to my brother, he loved the texture',
        comment: 'Looks super stylish paired with chinos or linen pants. The collar looks very classy.',
        verifiedPurchase: true,
        helpfulCount: 16
      }
    ]
  },
  {
    id: 'prod-6',
    title: 'Retro 80s Sunset Surf Wave Graphic Tee',
    brand: 'AK Originals',
    category: 'Graphic',
    price: 549,
    originalPrice: 1299,
    discountPercent: 58,
    rating: 4.3,
    ratingCount: 1880,
    reviewsCount: 310,
    isAssured: true,
    isBestseller: true,
    images: [
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Vintage Cream', hex: '#fef3c7', imageIndex: 0 },
      { name: 'Coral Terracotta', hex: '#9a3412', imageIndex: 1 },
      { name: 'Washed Indigo', hex: '#1e3a8a', imageIndex: 2 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockCount: 30,
    description: 'Vibrant California coastal sunset artwork with distressed typography. Breathable 100% cotton with feather-soft peach finish.',
    highlights: [
      'Distressed Vintage Screen Graphic',
      '210 GSM Combed Bio-Polished Cotton',
      'Soft-touch Peach Finish',
      'Double needle stitched hem and cuffs'
    ],
    fabric: '100% Bio-Polished Cotton',
    gsm: '210 GSM',
    fit: 'Standard Regular Fit',
    careInstructions: 'Machine wash cold with like colors.',
    deliveryDays: 2,
    offers: [
      'Combo: Buy 2 Graphic Tees at ₹999 flat',
      'Instant UPI Cashback of ₹50 on PhonePe/GPay'
    ],
    reviews: [
      {
        id: 'r7',
        author: 'Rishi V.',
        rating: 4,
        date: '18 Jul 2026',
        title: 'Vibrant colors and comfortable for summer',
        comment: 'Nice soft fabric and pleasant vintage vibe. Great everyday wear tee.',
        verifiedPurchase: true,
        helpfulCount: 11
      }
    ]
  },
  {
    id: 'prod-7',
    title: 'Aesthetic Butterfly Illusion Oversized Boxy Tee',
    brand: 'AK Streetwear',
    category: 'Oversized',
    price: 729,
    originalPrice: 1599,
    discountPercent: 54,
    rating: 4.6,
    ratingCount: 1250,
    reviewsCount: 220,
    isAssured: true,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Lavender Mist', hex: '#e9d5ff', imageIndex: 0 },
      { name: 'Pitch Black', hex: '#18181b', imageIndex: 1 },
      { name: 'Chalk White', hex: '#f8fafc', imageIndex: 2 }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 12,
    description: 'Surrealist optical illusion butterfly print rendered in neon pastel hues across the back shoulder plane. Distinctive baggy streetwear drop-sleeve design.',
    highlights: [
      'Exclusive Hand-drawn Butterfly Distortion Graphic',
      '240 GSM Super Combed Cotton Jersey',
      'Wide Ribbed Crewneck for structured drape',
      'Anti-pilling enzyme treated'
    ],
    fabric: '100% Combed Cotton',
    gsm: '240 GSM',
    fit: 'Oversized Boxy Fit',
    careInstructions: 'Wash inside out in cold water. Flat dry.',
    deliveryDays: 1,
    offers: [
      'Street Fest: Extra ₹150 off on cart value above ₹1,499',
      'Assured Next-Day Delivery available for select pincodes'
    ],
    reviews: [
      {
        id: 'r8',
        author: 'Tanmay S.',
        rating: 5,
        date: '05 Jul 2026',
        title: 'Stunning graphic and top notch quality',
        comment: 'Everyone at college asked where I got this from. The lavender shade is unique and looks very aesthetic.',
        verifiedPurchase: true,
        helpfulCount: 24
      }
    ]
  },
  {
    id: 'prod-8',
    title: 'Dri-Flex Pro Athletic Breathable Training Tee',
    brand: 'AK Performance',
    category: 'Gym & Active',
    price: 499,
    originalPrice: 1199,
    discountPercent: 58,
    rating: 4.7,
    ratingCount: 3120,
    reviewsCount: 540,
    isAssured: true,
    isDealOfDay: true,
    dealEndsInHours: 4,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Stealth Black', hex: '#111827', imageIndex: 0 },
      { name: 'Electric Teal', hex: '#0f766e', imageIndex: 1 },
      { name: 'Cobalt Blue', hex: '#1d4ed8', imageIndex: 2 }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 45,
    description: 'Engineered for high-intensity training, running, and fitness. Featherlight micro-perforated polyester with 4-way mechanical stretch and rapid moisture-wicking technology.',
    highlights: [
      'Hydro-Wick Moisture Evaporation Tech',
      '160 GSM Featherlight Micro-Mesh',
      'Flatlock Anti-Chafe Ergonomic Seams',
      'Reflective Safety accents for night workouts'
    ],
    fabric: '88% Polyester, 12% Spandex Micro-Mesh',
    gsm: '160 GSM Light',
    fit: 'Athletic Muscle Fit',
    careInstructions: 'Machine wash cold, quick dry, do not iron.',
    deliveryDays: 1,
    offers: [
      'Fitness Bundle: Buy 2 Athletic Tees for ₹899',
      'Free AK Sweatband on checkout today'
    ],
    reviews: [
      {
        id: 'r9',
        author: 'Gaurav K.',
        rating: 5,
        date: '20 Jun 2026',
        title: 'Best gym t-shirt I have owned',
        comment: 'Dries super fast during heavy cardio and doesn’t cling or smell. Quality matches Nike or UnderArmour.',
        verifiedPurchase: true,
        helpfulCount: 31
      }
    ]
  }
];

export const MOCK_CATEGORIES = [
  {
    id: 'cat-all',
    name: 'All Tees',
    count: '8 Products',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-oversized',
    name: 'Oversized',
    count: '240+ GSM Drops',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-graphic',
    name: 'Graphic',
    count: 'Retro & Pop Art',
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-acid',
    name: 'Acid Wash',
    count: 'Vintage Minerals',
    icon: 'Palette',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-anime',
    name: 'Anime & Gaming',
    count: 'Dark Manga Drops',
    icon: 'Tv',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-polo',
    name: 'Polo & Collared',
    count: 'Resort Waffle Knit',
    icon: 'Crown',
    image: 'https://images.unsplash.com/photo-1625910513413-5a022510fae0?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-plain',
    name: 'Plain Basics',
    count: 'Pima Cotton Staple',
    icon: 'Layers',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-gym',
    name: 'Gym & Active',
    count: 'Dri-Fit Performance',
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-jeans',
    name: 'Jeans & Denim',
    count: 'Baggy & Straight Fit',
    icon: 'Scissors',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-cargos',
    name: 'Cargo Pants',
    count: '6-Pocket Utility',
    icon: 'Layers',
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-hoodies',
    name: 'Hoodies & Sweats',
    count: 'Heavyweight Fleece',
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-shirts',
    name: 'Shirts & Trousers',
    count: 'Resort & Linen Fits',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Anoj Kumar',
  email: 'anojkumar4907@gmail.com',
  phone: '+91 98765 43210',
  gender: 'Male',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  memberTier: 'AK PLUS GOLD VIP',
  superCoins: 520,
};

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'Anoj Kumar',
    phone: '9876543210',
    house: 'B-402, Skyline Residency',
    street: 'Cyber Hub Road, Sector 24',
    landmark: 'Opposite Cyber City Tower 10',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    type: 'Home',
    isDefault: true,
  },
  {
    id: 'addr-2',
    name: 'Anoj Kumar (Office)',
    phone: '9876543210',
    house: 'Level 7, Infinity Tech Park',
    street: 'Golf Course Extension Road',
    landmark: 'Near Rapid Metro Station Sector 55',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122011',
    type: 'Work',
    isDefault: false,
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_SELLER_PICKUP_ADDRESS: SellerPickupAddress = {
  storeName: 'AKSelling Apparel Studio & Dispatch Hub',
  contactPerson: 'Anoj Kumar Yadav (Dispatch Manager)',
  phone: '+91 98765 43210',
  alternatePhone: '+91 91234 56780',
  email: 'akyadavprintaksellig@gmail.com',
  houseOrBuilding: 'Plot 104, Royal Horizon Hub, Commercial Zone, AB Road',
  streetArea: 'South Tukoganj, Near Chhappan Dukan Food Street',
  landmark: 'Opposite Madhya Pradesh High Court Bench / Near Apollo Tower',
  city: 'Indore',
  district: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '452001',
  operatingHours: '10:00 AM - 08:30 PM (Mon - Sat)',
  dispatchTime: 'Daily Courier Pickup Window: 04:30 PM - 07:00 PM',
  gstin: '23AABCA1234F1Z8',
  instructionsForRider: 'Enter via Ground Floor Dispatch Dock; Ask for Warehouse Manager Anoj Yadav at Gate 2.',
  isVerified: true,
};

export const INITIAL_SELLER_BANK_DETAILS: SellerBankDetails = {
  accountHolderName: 'AKSELLING MERCHANTS PVT LTD',
  bankName: 'HDFC Bank Ltd.',
  accountNumber: '50200084920194',
  ifscCode: 'HDFC0001024',
  upiId: 'akselling.pay@hdfcbank',
  gstin: '23AABCA1234F1Z8',
  pickupAddress: 'Plot 104, Royal Horizon Hub, Commercial Zone, AB Road, South Tukoganj, Near Chhappan Dukan Food Street, Indore, Madhya Pradesh - 452001',
  pickupAddressDetails: INITIAL_SELLER_PICKUP_ADDRESS,
  sellerName: 'AKSelling Studio Official (Indore Hub)',
};

export const INITIAL_PAYOUTS: PayoutRecord[] = [];

export const INITIAL_RETURNS: ReturnRecord[] = [];

export const INITIAL_CLAIMS: ClaimRecord[] = [];

export const INITIAL_DAILY_SALES: DailySalesPoint[] = [
  { date: '27 Aug', dayLabel: 'Wed', sales: 0, orders: 0, views: 0 },
  { date: '28 Aug', dayLabel: 'Thu', sales: 0, orders: 0, views: 0 },
  { date: '29 Aug', dayLabel: 'Fri', sales: 0, orders: 0, views: 0 },
  { date: '30 Aug', dayLabel: 'Sat', sales: 0, orders: 0, views: 0 },
  { date: '31 Aug', dayLabel: 'Sun', sales: 0, orders: 0, views: 0 },
  { date: '01 Sep', dayLabel: 'Mon', sales: 0, orders: 0, views: 0 },
  { date: '02 Sep', dayLabel: 'Tue', sales: 0, orders: 0, views: 0 },
];

