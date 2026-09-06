export interface ProductColor {
  name: string;
  hex: string;
  imageIndex: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  images?: string[];
}

export interface AppCategory {
  id: string;
  name: string;
  count?: string;
  icon?: string;
  image?: string;
  department?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 
    | 'Oversized' 
    | 'Graphic' 
    | 'Acid Wash' 
    | 'Plain Basics' 
    | 'Polo & Collared' 
    | 'Anime & Gaming' 
    | 'Gym & Active'
    | 'Jeans & Denim'
    | 'Cargo Pants'
    | 'Hoodies & Sweats'
    | 'Shirts & Trousers'
    | 'Men Fashion'
    | string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  reviewsCount: number;
  viewsCount?: number;
  isAssured: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  isDealOfDay?: boolean;
  dealEndsInHours?: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  inStock: boolean;
  stockCount: number;
  description: string;
  highlights: string[];
  fabric: string;
  gsm: string;
  fit: string;
  careInstructions: string;
  deliveryDays: number;
  offers: string[];
  reviews: Review[];
  // Granular Placement & Visibility Toggles
  showOnHome?: boolean;              // [ ] Show on Home Page Showcase
  featureInBestDeals?: boolean;      // [ ] Feature in Best Deals / Flash Sale
  isStandardCatalogOnly?: boolean;   // [ ] Standard Catalog / Category Only
  customCategoryName?: string;
}

export interface StoryComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string;
  likesCount?: number;
}

export interface CreatorProfile {
  brandName: string;
  handle: string;
  avatar: string;
  bio: string;
  category: string;
  instagramUrl?: string;
  websiteUrl?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface StorySlide {
  id: string;
  mediaType?: 'image' | 'video';
  mediaUrl: string;
  videoUrl?: string;
  audioUrl?: string;
  soundTrackTitle?: string;
  title: string;
  caption: string;
  productTaggedId?: string;
  durationMs?: number;
}

export interface Story {
  id: string;
  title: string;
  category: string;
  author: string;
  authorHandle?: string;
  avatar: string;
  isAuthorVerified?: boolean;
  slides: StorySlide[];
  isLive?: boolean;
  hasViewed?: boolean;
  featuredProductId?: string;
  hasAudio?: boolean;
  soundTrackTitle?: string;
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLiked?: boolean;
  isFollowed?: boolean;
  comments?: StoryComment[];
  createdAt?: string;
}

export interface HeroBanner {
  id: string;
  headline: string;
  subheadline: string;
  badge: string;
  bgColor: string;
  accentColor: string;
  image: string;
  category: string;
  code: string;
  isActive?: boolean;
  clicksCount?: number;
  impressionsCount?: number;
}

export interface DeliveryZoneInfo {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  deliveryDays: number;
  estimatedDate: string;
  courierPartner: string;
  zone: 'Metro Express (24-48 hrs)' | 'Tier-2 Express (2-3 days)' | 'Standard Delivery (3-5 days)';
  isCodAvailable: boolean;
  isServiceable: boolean;
  shippingCharge: number;
}

export interface CartItem {
  id: string; // unique item id (productId + size + color)
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
}

export type TabType = 'home' | 'category' | 'deals' | 'cart' | 'account' | 'orders' | 'support';
export type SellerTabType = 'home' | 'orders' | 'returns' | 'inventory' | 'menu';

export interface SupportTicket {
  id: string;
  orderId?: string;
  category: 'Order Status' | 'Damaged Item' | 'Size Exchange' | 'Refund/Cancellation' | 'Payment Issue' | 'General Query';
  name: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
  userId?: string;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  subOrderId: string;
  productTitle: string;
  productImage: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  customerName: string;
  customerCity: string;
  reason: string;
  returnType: 'Customer Return' | 'Courier RTO';
  status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Claim Raised' | 'Claim Approved' | 'Claim Rejected';
  createdDate: string;
  expectedDeliveryDate: string;
  awbNumber: string;
  courierPartner: string;
  refundAmount: number;
  claimAmount?: number;
  claimStatus?: 'Pending' | 'Approved' | 'Rejected';
  claimNotes?: string;
}

export interface ClaimRecord {
  id: string;
  returnId: string;
  sku: string;
  productTitle: string;
  reason: string;
  claimAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  raisedDate: string;
  resolutionDate?: string;
  awbNumber: string;
  notes?: string;
}

export interface DailySalesPoint {
  date: string;
  dayLabel: string;
  sales: number;
  orders: number;
  views: number;
}

export interface LiveStoreMetrics {
  activeVisitorsCount: number;
  totalCatalogViews: number;
  totalProductClicks: number;
  totalOrdersPlaced: number;
  totalRevenue: number;
  todayVisitorsCount: number;
  todayViewsCount: number;
  conversionRatePercent: number;
  lastActiveAt?: string;
  updatedAt?: any;
}

export interface SellerPickupAddress {
  storeName: string;
  contactPerson: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  houseOrBuilding: string; // Line 1: House/Plot/Building No.
  streetArea: string; // Line 2: Street/Road/Sector/Area
  landmark: string;
  city: string; // e.g. "Indore"
  district?: string; // "Indore"
  state: string; // "Madhya Pradesh"
  pincode: string; // "452001"
  operatingHours?: string;
  dispatchTime?: string;
  gstin?: string;
  instructionsForRider?: string;
  isVerified?: boolean;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  house: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  avatar: string;
  memberTier: string;
  superCoins: number;
}

export interface OrderTimelineStep {
  status: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Confirmed' | 'Cancelled';
  trackingStep: number;
  estimatedDelivery: string;
  address: string;
  addressObj?: Address;
  pickupAddressDetails?: SellerPickupAddress;
  pickupAddress?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  courierPartner?: string;
  deliveryAgent?: {
    name: string;
    phone: string;
    otp: string;
  };
  timeline?: OrderTimelineStep[];
  transactionId?: string;
  paymentGateway?: string;
  utrNumber?: string;
  paymentStatus?: 'SUCCESS' | 'PENDING' | 'FAILED';
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  logisticsProvider?: 'Shiprocket' | 'NimbusPost' | 'Direct Courier';
  shipmentId?: string;
  pickupScheduledDate?: string;
  pickupTimeSlot?: string;
  pickupToken?: string;
  shippingLabelGenerated?: boolean;
  isPartialAdvanceCod?: boolean;
  advancePercentage?: number;
  originalOrderTotal?: number;
  advancePaidAmount?: number;
  balanceDueOnDelivery?: number;
  totalDueAtDelivery?: number;
  advancePaymentId?: string;
  advancePaymentGateway?: string;
  antiRtoVerified?: boolean;
  emailNotificationsSent?: {
    customerEmail?: string;
    sellerEmail?: string;
    sentAt: string;
    customerEmailStatus: 'Sent' | 'Delivered' | 'Pending';
    sellerEmailStatus: 'Sent' | 'Delivered' | 'Pending';
  };
}

export interface LogisticsCourier {
  id: string;
  name: string;
  provider: 'Shiprocket' | 'NimbusPost';
  rate: number;
  estimatedDeliveryDays: number;
  trackingType: 'Real-time GPS' | 'Air Surface' | 'Standard Express';
  recommended?: boolean;
  minWeightKg: number;
  codAvailable: boolean;
}

export interface EmailNotificationRecord {
  id: string;
  orderId: string;
  customerEmail: string;
  sellerEmail: string;
  sentAt: string;
  subject: string;
  orderTotal: number;
  itemsCount: number;
  status: 'Sent' | 'Delivered' | 'Queued';
  customerHtmlPreview: string;
  sellerHtmlPreview: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentMethod?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  upiVpa?: string;
  utr?: string;
  timestamp?: any;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface SellerBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  gstin?: string;
  pickupAddress?: string;
  pickupAddressDetails?: SellerPickupAddress;
  sellerName?: string;
}

export interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  status: 'Settled' | 'Processing' | 'Initiated' | 'Failed';
  utrNumber: string;
  razorpaySettlementId: string;
  bankAccountLast4: string;
  ordersCount: number;
  type: 'Automated Cycle' | 'Instant On-Demand';
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi';
    vpa?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
      close: () => void;
    };
  }
}

export interface LogisticsConfig {
  shiprocketEmail: string;
  shiprocketToken: string;
  shiprocketStatus: 'CONNECTED' | 'CONNECTING' | 'CONFIG_REQUIRED';
  shiprocketAutoLabel: boolean;
  nimbusPostApiKey: string;
  nimbusPostToken: string;
  nimbusPostStatus: 'READY_TO_CONNECT' | 'CONNECTED' | 'AWAITING_KEY';
  nimbusPostAutoLabel: boolean;
  defaultProvider: 'Shiprocket' | 'NimbusPost';
  pickupAddress: SellerPickupAddress;
  lastVerifiedAt?: string;
  source?: 'firestore' | 'env' | 'server_env' | 'default';
  updatedAt?: any;
}

export interface InAppChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  text: string;
  timestamp: string;
  orderId?: string;
  category?: string;
  actionButton?: {
    label: string;
    actionType: 'track_order' | 'open_whatsapp' | 'call_support';
    data?: any;
  };
}

export interface InAppChatSession {
  id: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  messages: InAppChatMessage[];
  lastMessage: string;
  status: 'active' | 'resolved';
  updatedAt?: any;
}


