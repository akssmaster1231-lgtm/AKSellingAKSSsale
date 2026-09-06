import React, { useState, useRef } from 'react';
import { Story, HeroBanner, Product, StorySlide, CreatorProfile, StoryComment } from '../../types';
import { 
  Sparkles, Plus, Trash2, Edit3, Eye, Heart, MessageCircle, 
  Share2, Video, Image as ImageIcon, CheckCircle2, 
  Zap, Play, Tag, ShieldCheck, Check, X, AlertCircle, 
  Flame, Music, Camera, Upload, Link as LinkIcon, Instagram,
  Globe, UserCheck, RefreshCw, BarChart3, TrendingUp, Sliders,
  ExternalLink, Layers
} from 'lucide-react';

interface StoryBannerManagerProps {
  stories: Story[];
  banners: HeroBanner[];
  products: Product[];
  creatorProfile?: CreatorProfile;
  onUpdateCreatorProfile?: (profile: CreatorProfile) => void;
  onAddStory: (story: Story) => void;
  onUpdateStory: (storyId: string, updates: Partial<Story>) => void;
  onDeleteStory: (storyId: string) => void;
  onAddBanner: (banner: HeroBanner) => void;
  onUpdateBanner: (bannerId: string, updates: Partial<HeroBanner>) => void;
  onDeleteBanner: (bannerId: string) => void;
  onPreviewStory?: (story: Story) => void;
}

const GRADIENT_PRESETS = [
  { label: 'Dark Tokyo Slate', value: 'from-slate-950 via-slate-900 to-indigo-950', accent: 'text-amber-400' },
  { label: 'Vintage Amber Stone', value: 'from-amber-950 via-zinc-900 to-stone-950', accent: 'text-amber-300' },
  { label: 'Emerald Forest Luxe', value: 'from-emerald-950 via-slate-900 to-teal-950', accent: 'text-emerald-300' },
  { label: 'Cyber Violet Neon', value: 'from-purple-950 via-slate-900 to-indigo-950', accent: 'text-purple-300' },
  { label: 'Crimson Street Flame', value: 'from-rose-950 via-zinc-900 to-red-950', accent: 'text-rose-300' },
  { label: 'Golden Sunset Luxe', value: 'from-amber-900 via-orange-950 to-stone-950', accent: 'text-amber-200' },
];

const CURATED_MEDIA_PRESETS = [
  {
    title: 'Cyberpunk Tokyo Nights (Video Reel)',
    type: 'video' as const,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80',
    sound: 'Trending Tokyo Phonk ⚡',
  },
  {
    title: 'Mineral Acid Wash Distress (Video Reel)',
    type: 'video' as const,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    mediaUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&auto=format&fit=crop&q=80',
    sound: 'Heavy 808 Bass Drip 🔥',
  },
  {
    title: 'Anime Puff Print Drop (Photo Drop)',
    type: 'image' as const,
    videoUrl: '',
    mediaUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80',
    sound: 'Lo-Fi Chill Beat 🎧',
  },
  {
    title: 'Luxe Waffle Knit Polo (Photo Drop)',
    type: 'image' as const,
    videoUrl: '',
    mediaUrl: 'https://images.unsplash.com/photo-1625910513413-5a022510fae0?w=1000&auto=format&fit=crop&q=80',
    sound: 'Aesthetic Summer Vibe 🌊',
  }
];

const CURATED_BANNER_IMAGE_PRESETS = [
  { label: 'Oversized Streetwear', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Acid Wash Charcoal', url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80' },
  { label: 'Anime Graphic Drop', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80' },
  { label: 'Heavy Knit Polo', url: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop&q=80' },
  { label: 'Vintage Tokyo Graphic', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80' },
];

const SOUND_PRESETS = [
  'Trending Tokyo Phonk ⚡',
  'Heavy 808 Bass Drip 🔥',
  'Lo-Fi Chill Beat 🎧',
  'Aesthetic Summer Vibe 🌊',
  'Speed Up Club Remix 🚀',
  'Original Audio (Live Mic) 🎙️',
  'No Audio / Mute 🔇'
];

export const StoryBannerManager: React.FC<StoryBannerManagerProps> = ({
  stories,
  banners,
  products,
  creatorProfile = {
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
  },
  onUpdateCreatorProfile,
  onAddStory,
  onUpdateStory,
  onDeleteStory,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  onPreviewStory,
}) => {
  // Navigation Tabs in Single Hub
  const [activeHubView, setActiveHubView] = useState<'upload_story' | 'upload_banner' | 'creator_profile'>('upload_story');
  const [activeFeedFilter, setActiveFeedFilter] = useState<'all' | 'stories' | 'banners'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState<CreatorProfile>(creatorProfile);

  // Story Form State
  const [storyForm, setStoryForm] = useState({
    title: '',
    category: 'New In',
    featuredProductId: products[0]?.id || 'prod-1',
    hasAudio: true,
    soundTrackTitle: SOUND_PRESETS[0],
    mediaType: 'video' as 'video' | 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    slideTitle: '',
    caption: '260 GSM Ultra-Heavyweight Bio-Washed French Terry Cotton. Relaxed Boxy Streetwear Cut.',
    durationMs: 7000,
  });

  // Banner Form State
  const [bannerForm, setBannerForm] = useState({
    headline: '',
    subheadline: '',
    badge: 'EXCLUSIVE DEALS',
    bgColor: GRADIENT_PRESETS[0].value,
    accentColor: GRADIENT_PRESETS[0].accent,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    category: 'Oversized',
    code: 'AKFEST20',
  });

  // Edit Modals State
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const bannerCameraInputRef = useRef<HTMLInputElement>(null);
  const editBannerFileInputRef = useRef<HTMLInputElement>(null);
  const editBannerCameraInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle File Upload for Banner
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setBannerForm((prev) => ({
      ...prev,
      image: objectUrl,
    }));
    showNotification('Banner photo loaded from device! 📸');
  };

  // Handle Edit Banner File Upload
  const handleEditBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBanner) return;

    const objectUrl = URL.createObjectURL(file);
    setEditingBanner((prev) => prev ? ({
      ...prev,
      image: objectUrl,
    }) : null);
    showNotification('Banner image updated from device! 📸');
  };

  // Handle File Upload for Story
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video');
    const objectUrl = URL.createObjectURL(file);

    if (isVid) {
      setStoryForm((prev) => ({
        ...prev,
        mediaType: 'video',
        videoUrl: objectUrl,
        mediaUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&auto=format&fit=crop&q=80',
      }));
      showNotification('Video loaded from device!');
    } else {
      setStoryForm((prev) => ({
        ...prev,
        mediaType: 'image',
        mediaUrl: objectUrl,
        videoUrl: '',
      }));
      showNotification('Photo loaded from device!');
    }
  };

  // Handle Profile Avatar File Upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setProfileForm((prev) => ({ ...prev, avatar: objectUrl }));
    showNotification('Profile avatar updated!');
  };

  // Save Creator Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.brandName.trim()) return;

    if (onUpdateCreatorProfile) {
      onUpdateCreatorProfile(profileForm);
    }
    setIsEditingProfile(false);
    showNotification('Instagram Creator Profile saved & linked to Storefront! ✨');
  };

  // Publish New Story
  const handlePublishStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title.trim()) {
      showNotification('Please enter a Story Drop Title!');
      return;
    }

    const newSlide: StorySlide = {
      id: `s-${Date.now()}-1`,
      mediaType: storyForm.mediaType,
      mediaUrl: storyForm.mediaUrl,
      videoUrl: storyForm.mediaType === 'video' ? storyForm.videoUrl : undefined,
      soundTrackTitle: storyForm.soundTrackTitle,
      title: storyForm.slideTitle || storyForm.title,
      caption: storyForm.caption,
      productTaggedId: storyForm.featuredProductId,
      durationMs: storyForm.durationMs,
    };

    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: storyForm.title,
      category: storyForm.category,
      author: profileForm.brandName || creatorProfile.brandName || 'AKSelling Official',
      authorHandle: profileForm.handle || creatorProfile.handle || '@akselling_official',
      avatar: profileForm.avatar || creatorProfile.avatar,
      isAuthorVerified: profileForm.isVerified,
      featuredProductId: storyForm.featuredProductId,
      hasAudio: storyForm.soundTrackTitle !== 'No Audio / Mute 🔇',
      soundTrackTitle: storyForm.soundTrackTitle,
      likesCount: 1,
      viewsCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isFollowed: true,
      createdAt: 'Just now',
      slides: [newSlide],
      comments: [
        {
          id: `c-init-${Date.now()}`,
          author: profileForm.brandName,
          text: `Official Drop: ${storyForm.title}. Tap 'Buy Now' or DM for size queries! 🔥`,
          createdAt: 'Just now',
          likesCount: 1,
        }
      ],
    };

    onAddStory(newStory);
    setStoryForm((prev) => ({
      ...prev,
      title: '',
      slideTitle: '',
    }));
    showNotification('🎉 Story Drop published live to Storefront!');
  };

  // Publish New Hero Banner
  const handlePublishBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.headline.trim()) {
      showNotification('Please enter a Banner Headline!');
      return;
    }

    const selectedPreset = GRADIENT_PRESETS.find((g) => g.value === bannerForm.bgColor) || GRADIENT_PRESETS[0];

    const newBanner: HeroBanner = {
      id: `b-${Date.now()}`,
      headline: bannerForm.headline,
      subheadline: bannerForm.subheadline,
      badge: bannerForm.badge,
      bgColor: bannerForm.bgColor,
      accentColor: selectedPreset.accent,
      image: bannerForm.image,
      category: bannerForm.category,
      code: bannerForm.code,
      isActive: true,
      clicksCount: 0,
      impressionsCount: 0,
    };

    onAddBanner(newBanner);
    setBannerForm((prev) => ({
      ...prev,
      headline: '',
      subheadline: '',
    }));
    showNotification('🎉 Promotional Banner added to Hero Carousel!');
  };

  // Quick Engagement Booster (Live Real-Time Demo)
  const handleBoostMetric = (storyId: string, metric: 'likes' | 'views' | 'shares' | 'comment') => {
    const target = stories.find((s) => s.id === storyId);
    if (!target) return;

    if (metric === 'likes') {
      onUpdateStory(storyId, { likesCount: (target.likesCount || 0) + 1 });
      showNotification(`+1 Like recorded for "${target.title}" ❤️`);
    } else if (metric === 'views') {
      onUpdateStory(storyId, { viewsCount: (target.viewsCount || 0) + 50 });
      showNotification(`+50 Views synced for "${target.title}" 👁️`);
    } else if (metric === 'shares') {
      onUpdateStory(storyId, { sharesCount: (target.sharesCount || 0) + 1 });
      showNotification(`+1 Share recorded for "${target.title}" ↗️`);
    } else if (metric === 'comment') {
      const newC: StoryComment = {
        id: `c-${Date.now()}`,
        author: 'Verified Buyer',
        text: 'Clean boxy fit! Love the heavyweight GSM 🔥',
        createdAt: 'Just now',
        likesCount: 2,
      };
      const updatedComments = [...(target.comments || []), newC];
      onUpdateStory(storyId, { 
        comments: updatedComments, 
        commentsCount: updatedComments.length 
      });
      showNotification(`New buyer comment added to "${target.title}" 💬`);
    }
  };

  // Save Story Edits
  const handleSaveStoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    onUpdateStory(editingStory.id, {
      title: editingStory.title,
      category: editingStory.category,
      featuredProductId: editingStory.featuredProductId,
      hasAudio: editingStory.hasAudio,
      soundTrackTitle: editingStory.soundTrackTitle,
      slides: editingStory.slides,
    });

    setEditingStory(null);
    showNotification('Story changes updated successfully! ✏️');
  };

  // Save Banner Edits
  const handleSaveBannerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    onUpdateBanner(editingBanner.id, {
      headline: editingBanner.headline,
      subheadline: editingBanner.subheadline,
      badge: editingBanner.badge,
      bgColor: editingBanner.bgColor,
      accentColor: editingBanner.accentColor,
      image: editingBanner.image,
      category: editingBanner.category,
      code: editingBanner.code,
      isActive: editingBanner.isActive,
    });

    setEditingBanner(null);
    showNotification('Hero Banner updated successfully! ✏️');
  };

  const selectedStoryProd = products.find((p) => p.id === storyForm.featuredProductId);
  const totalStoryViews = stories.reduce((acc, s) => acc + (s.viewsCount || 0), 0);
  const totalStoryLikes = stories.reduce((acc, s) => acc + (s.likesCount || 0), 0);
  const totalStoryShares = stories.reduce((acc, s) => acc + (s.sharesCount || 0), 0);
  const totalBannerClicks = banners.reduce((acc, b) => acc + (b.clicksCount || 0), 0);

  return (
    <div id="story-banner-manager-root" className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0A3A1E] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-300 font-bold text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#FFC107]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaFileChange}
        accept="image/*,video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleMediaFileChange}
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={profileAvatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={bannerFileInputRef}
        onChange={handleBannerFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={bannerCameraInputRef}
        onChange={handleBannerFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={editBannerFileInputRef}
        onChange={handleEditBannerFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={editBannerCameraInputRef}
        onChange={handleEditBannerFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 1. INSTAGRAM-STYLE CREATOR PROFILE SETUP & BRAND CARD */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#0A3A1E] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Creator Profile Info */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar with Instagram-style Story Gradient Ring */}
            <div className="relative shrink-0">
              <div className="p-1 rounded-full bg-gradient-to-tr from-[#0A3A1E] via-[#FFC107] to-amber-400 shadow-lg">
                <div className="p-0.5 bg-slate-950 rounded-full">
                  <img
                    src={profileForm.avatar}
                    alt={profileForm.brandName}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => profileAvatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 bg-[#FFC107] text-slate-950 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border-2 border-slate-950"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>{profileForm.brandName}</span>
                  {profileForm.isVerified && (
                    <span title="Verified Official Creator">
                      <CheckCircle2 className="w-5 h-5 text-[#FFC107] fill-[#FFC107]/20" />
                    </span>
                  )}
                </h2>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {profileForm.handle}
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  {profileForm.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {profileForm.bio}
              </p>

              {/* Follower Stats Bar */}
              <div className="flex items-center gap-4 text-xs font-semibold pt-1 text-slate-300 flex-wrap">
                <div>
                  <strong className="text-white font-mono">{stories.length + 68}</strong> Drops &amp; Stories
                </div>
                <div>
                  <strong className="text-white font-mono">{(profileForm.followersCount || 48200).toLocaleString()}</strong> Followers
                </div>
                <div>
                  <strong className="text-white font-mono">{(profileForm.followingCount || 142).toLocaleString()}</strong> Following
                </div>
                {profileForm.instagramUrl && (
                  <a
                    href={profileForm.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFC107] hover:underline flex items-center gap-1"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#FFC107]" />
              <span>{isEditingProfile ? 'Close Editor' : 'Edit Creator Profile'}</span>
            </button>
          </div>
        </div>

        {/* INLINE PROFILE EDITOR DRAWER */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs animate-in fade-in"
          >
            <div>
              <label className="font-bold text-slate-300 block mb-1">Official Brand Name *</label>
              <input
                type="text"
                required
                value={profileForm.brandName}
                onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-[#FFC107] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Instagram Handle *</label>
              <input
                type="text"
                required
                value={profileForm.handle}
                onChange={(e) => setProfileForm({ ...profileForm, handle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white font-mono focus:ring-1 focus:ring-[#FFC107] outline-none"
                placeholder="@yourbrand_official"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Category / Specialty</label>
              <input
                type="text"
                value={profileForm.category}
                onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-[#FFC107] outline-none"
                placeholder="Streetwear & Apparel Brand"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-300 block mb-1">Store Bio / Description</label>
              <input
                type="text"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-[#FFC107] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Instagram URL</label>
              <input
                type="url"
                value={profileForm.instagramUrl || ''}
                onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-[#FFC107] outline-none font-mono text-[11px]"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200 font-bold">
                <input
                  type="checkbox"
                  checked={profileForm.isVerified}
                  onChange={(e) => setProfileForm({ ...profileForm, isVerified: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FFC107] focus:ring-[#FFC107]"
                />
                <span>Show Verified Brand Badge on Stories &amp; Drops</span>
              </label>
            </div>

            <div className="sm:col-span-2 lg:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/10 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FFC107] hover:bg-[#FFD700] text-slate-950 font-black px-5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save &amp; Link Profile to Storefront</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SINGLE-PAGE UPLOAD HUB (TOP SECTION) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
        {/* Hub Mode Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFF8E1] text-[#0A3A1E] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFC107]" />
                Storefront Growth Engine
              </span>
              <span className="text-xs text-slate-500 font-bold">Live Single-Page Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Drop &amp; Banner Upload Hub
            </h1>
          </div>

          {/* Toggle Buttons for Upload Mode */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveHubView('upload_story')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeHubView === 'upload_story'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-rose-500" />
              <span>Story / Reel Drop</span>
            </button>

            <button
              onClick={() => setActiveHubView('upload_banner')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeHubView === 'upload_banner'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Hero Carousel Banner</span>
            </button>
          </div>
        </div>

        {/* 2A. STORY / REEL UPLOAD FORM */}
        {activeHubView === 'upload_story' && (
          <form onSubmit={handlePublishStory} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-8 space-y-4 text-xs">
                {/* Media Picker Toolbar */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Media Source &amp; Capture:</span>
                    <span className="text-[11px] text-slate-500">Supports HD Video (MP4) &amp; High-Res Photos</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#0A3A1E] hover:bg-emerald-50/40 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Upload File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#0A3A1E] hover:bg-emerald-50/40 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-rose-500" />
                      <span>Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryForm({ ...storyForm, mediaType: 'video' })}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        storyForm.mediaType === 'video'
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Reel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStoryForm({ ...storyForm, mediaType: 'image' })}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        storyForm.mediaType === 'image'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Photo Drop</span>
                    </button>
                  </div>

                  {/* Curated 1-Click Drop Presets */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Or pick from Curated Sample Reels:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {CURATED_MEDIA_PRESETS.map((p) => (
                        <button
                          key={p.title}
                          type="button"
                          onClick={() => {
                            setStoryForm((prev) => ({
                              ...prev,
                              title: p.title,
                              mediaType: p.type,
                              videoUrl: p.videoUrl,
                              mediaUrl: p.mediaUrl,
                              soundTrackTitle: p.sound,
                            }));
                            showNotification(`Applied preset: ${p.title}`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0A3A1E] text-slate-700 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Drop Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Story Drop Title *</label>
                    <input
                      type="text"
                      required
                      value={storyForm.title}
                      onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                      placeholder="e.g. Midnight Acid Wash Drop ⚡"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Category Tag</label>
                    <select
                      value={storyForm.category}
                      onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                    >
                      <option value="New In">New In 🔥</option>
                      <option value="Oversized">Oversized Heavyweight</option>
                      <option value="Vintage">Vintage Acid Wash</option>
                      <option value="Anime">Anime &amp; Gaming</option>
                      <option value="Flash Sale">Flash Sale 60%</option>
                      <option value="Gym & Active">Gym &amp; Active</option>
                      <option value="Cargo">Cargo &amp; Streetwear</option>
                    </select>
                  </div>
                </div>

                {/* Audio Track & Sound Vibe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-rose-500" />
                      <span>Audio / Sound Track</span>
                    </label>
                    <select
                      value={storyForm.soundTrackTitle}
                      onChange={(e) => setStoryForm({ ...storyForm, soundTrackTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                    >
                      {SOUND_PRESETS.map((snd) => (
                        <option key={snd} value={snd}>
                          {snd}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Tag Product from Catalog</label>
                    <select
                      value={storyForm.featuredProductId}
                      onChange={(e) => setStoryForm({ ...storyForm, featuredProductId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Media URL Input (if custom URL) */}
                {storyForm.mediaType === 'video' ? (
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Video Stream URL (MP4)</label>
                    <input
                      type="url"
                      value={storyForm.videoUrl}
                      onChange={(e) => setStoryForm({ ...storyForm, videoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-[11px] focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">High-Res Image URL</label>
                    <input
                      type="url"
                      value={storyForm.mediaUrl}
                      onChange={(e) => setStoryForm({ ...storyForm, mediaUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-[11px] focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                    />
                  </div>
                )}

                {/* Caption Description */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Story Caption &amp; Fit Details</label>
                  <textarea
                    rows={2}
                    value={storyForm.caption}
                    onChange={(e) => setStoryForm({ ...storyForm, caption: e.target.value })}
                    placeholder="Describe the GSM, wash texture, fit check..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-[#FFC107] hover:bg-[#FFD700] text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer text-xs"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>🚀 Publish Story Drop to Storefront</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Live Mobile Story Preview */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center">
                <div className="w-full max-w-[240px] aspect-9/16 bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between p-3 select-none">
                  {/* Media Background Preview */}
                  {storyForm.mediaType === 'video' && storyForm.videoUrl ? (
                    <video
                      src={storyForm.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <img
                      src={storyForm.mediaUrl || profileForm.avatar}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60 pointer-events-none"></div>

                  {/* Top Bar Preview */}
                  <div className="relative z-10 space-y-1.5">
                    {/* Story Progress Bar */}
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-2/3 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={profileForm.avatar}
                          alt="avatar"
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover border border-[#FFC107]"
                        />
                        <span className="text-[11px] font-bold text-white truncate max-w-[100px]">
                          {profileForm.brandName}
                        </span>
                        {profileForm.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-[#FFC107] fill-[#FFC107]/20" />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
                        PREVIEW
                      </span>
                    </div>

                    {storyForm.soundTrackTitle !== 'No Audio / Mute 🔇' && (
                      <div className="flex items-center gap-1 text-[9px] text-amber-300 font-mono bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full w-fit">
                        <Music className="w-2.5 h-2.5 animate-spin" />
                        <span className="truncate max-w-[120px]">{storyForm.soundTrackTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar Preview */}
                  <div className="relative z-10 space-y-2">
                    {selectedStoryProd && (
                      <div className="bg-white/95 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 shadow-lg">
                        <img
                          src={selectedStoryProd.images[0]}
                          alt={selectedStoryProd.title}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-[#0A3A1E] uppercase">Tagged Item</div>
                          <div className="text-[10px] font-bold text-slate-900 truncate">
                            {selectedStoryProd.title}
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-950">₹{selectedStoryProd.price}</span>
                      </div>
                    )}

                    <div className="text-white space-y-0.5">
                      <h4 className="text-xs font-black text-amber-300 truncate">
                        {storyForm.title || 'Untitled Drop'}
                      </h4>
                      <p className="text-[10px] text-white/80 line-clamp-1">
                        {storyForm.caption}
                      </p>
                    </div>

                    <div className="bg-[#FFC107] text-slate-950 text-center font-black py-1 rounded-xl text-[11px] shadow-sm">
                      ⚡ BUY NOW • ₹{selectedStoryProd?.price || 699}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* 2B. HERO BANNER UPLOAD FORM */}
        {activeHubView === 'upload_banner' && (
          <form onSubmit={handlePublishBanner} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Banner Inputs */}
              <div className="lg:col-span-7 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Banner Headline *</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.headline}
                    onChange={(e) => setBannerForm({ ...bannerForm, headline: e.target.value })}
                    placeholder="e.g. FLASH 60% OFF T-SHIRT FEST"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Subheadline / Description</label>
                  <input
                    type="text"
                    value={bannerForm.subheadline}
                    onChange={(e) => setBannerForm({ ...bannerForm, subheadline: e.target.value })}
                    placeholder="e.g. Buy Any 2 Heavyweight Graphic Tees at ₹1,199. Limited Stock."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={bannerForm.badge}
                      onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                      placeholder="EXCLUSIVE DEALS"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-bold focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Promo Coupon Code</label>
                    <input
                      type="text"
                      value={bannerForm.code}
                      onChange={(e) => setBannerForm({ ...bannerForm, code: e.target.value.toUpperCase() })}
                      placeholder="AKFEST20"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono font-bold focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                    />
                  </div>
                </div>

                {/* Gradient Presets */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Color Theme Preset</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, bgColor: p.value, accentColor: p.accent })}
                        className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                          bannerForm.bgColor === p.value
                            ? 'border-[#0A3A1E] ring-2 ring-emerald-300 bg-emerald-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${p.value} shrink-0`} />
                        <span className="font-bold text-[11px] truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Category & Image */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Target Category</label>
                  <select
                    value={bannerForm.category}
                    onChange={(e) => setBannerForm({ ...bannerForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white font-medium"
                  >
                    <option value="Oversized">Oversized</option>
                    <option value="Graphic">Graphic</option>
                    <option value="Acid Wash">Acid Wash</option>
                    <option value="Polo & Collared">Polo &amp; Collared</option>
                    <option value="Anime & Gaming">Anime &amp; Gaming</option>
                  </select>
                </div>

                {/* Interactive Camera & Gallery Image Uploader for Hero Banner */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Banner Product Image *</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#FFC107]" />
                      Direct Upload Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#0A3A1E] hover:bg-emerald-50/50 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Upload File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => bannerCameraInputRef.current?.click()}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-rose-500 hover:bg-rose-50/50 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-4 h-4 text-rose-500" />
                      <span>Camera</span>
                    </button>

                    <div className="col-span-2 sm:col-span-1 flex items-center justify-center bg-white px-2 py-1 rounded-xl border border-slate-200">
                      <img
                        src={bannerForm.image}
                        alt="Selected mockup"
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-lg object-cover border border-slate-300 mr-2 shrink-0"
                      />
                      <span className="text-[10px] text-slate-700 font-bold truncate">Live Image</span>
                    </div>
                  </div>

                  {/* Curated 1-Click Banner Image Presets */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      Or choose curated sample tee mockup:
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {CURATED_BANNER_IMAGE_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setBannerForm((prev) => ({ ...prev, image: p.url }));
                            showNotification(`Applied: ${p.label}`);
                          }}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                            bannerForm.image === p.url
                              ? 'bg-emerald-100/80 border-[#0A3A1E] text-[#0A3A1E] font-bold ring-1 ring-[#0A3A1E]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <img src={p.url} alt="" className="w-3.5 h-3.5 rounded object-cover" />
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL Fallback */}
                  <div>
                    <input
                      type="url"
                      value={bannerForm.image}
                      onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                      placeholder="Or paste custom image URL: https://..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-[10px] focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-[#0A3A1E] hover:bg-[#0A3A1E] text-white font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer text-xs"
                  >
                    <Tag className="w-4 h-4" />
                    <span>✨ Add Banner to Hero Carousel</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Live Banner Preview */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Live Carousel Preview
                  </span>
                  <div className={`bg-gradient-to-r ${bannerForm.bgColor} p-4 sm:p-5 rounded-2xl text-white shadow-xl min-h-[160px] flex items-center justify-between relative overflow-hidden border border-slate-800`}>
                    <div className="space-y-1.5 z-10 max-w-[65%]">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider text-amber-300">
                          {bannerForm.badge || 'EXCLUSIVE'}
                        </span>
                        {bannerForm.code && (
                          <span className="text-[10px] text-white/80 font-mono">Code: {bannerForm.code}</span>
                        )}
                      </div>
                      <h3 className={`text-base sm:text-lg font-black tracking-tight ${bannerForm.accentColor} font-serif`}>
                        {bannerForm.headline || 'Your Headline Here'}
                      </h3>
                      <p className="text-[11px] text-slate-200 line-clamp-2">
                        {bannerForm.subheadline || 'Promotional description goes here...'}
                      </p>
                    </div>

                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/20 shadow-md shrink-0 rotate-3">
                      <img
                        src={bannerForm.image}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE FEED & REAL-TIME CONTROL LIST (BOTTOM SECTION) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0A3A1E]" />
              <span>Active Feed &amp; Real-Time Control List</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage, edit, boost engagement, or delete published stories and banners instantly.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveFeedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFeedFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Items ({stories.length + banners.length})
            </button>
            <button
              onClick={() => setActiveFeedFilter('stories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeFeedFilter === 'stories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Video className="w-3 h-3 text-rose-500" />
              <span>Stories ({stories.length})</span>
            </button>
            <button
              onClick={() => setActiveFeedFilter('banners')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeFeedFilter === 'banners' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Tag className="w-3 h-3 text-amber-500" />
              <span>Banners ({banners.length})</span>
            </button>
          </div>
        </div>

        {/* FEED ITEMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* STORIES SECTION */}
          {(activeFeedFilter === 'all' || activeFeedFilter === 'stories') &&
            stories.map((s) => {
              const firstSlide = s.slides[0];
              const isVideo = firstSlide?.mediaType === 'video' || Boolean(firstSlide?.videoUrl);
              const taggedProd = products.find((p) => p.id === (firstSlide?.productTaggedId || s.featuredProductId));

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  {/* Media Thumbnail */}
                  <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                    <img
                      src={firstSlide?.mediaUrl || s.avatar}
                      alt={s.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40 pointer-events-none"></div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                        {s.category}
                      </span>
                      {isVideo ? (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Video className="w-3 h-3" />
                          <span>Video Reel</span>
                        </span>
                      ) : (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <ImageIcon className="w-3 h-3" />
                          <span>Photo Drop</span>
                        </span>
                      )}
                    </div>

                    {/* Overlay Play / Preview */}
                    {onPreviewStory && (
                      <button
                        onClick={() => onPreviewStory(s)}
                        className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-transform hover:scale-110 shadow-xl cursor-pointer"
                        title="Preview Story Overlay"
                      >
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </button>
                    )}

                    {/* Bottom Info */}
                    <div className="absolute bottom-2 inset-x-2.5 text-white z-10 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={s.avatar}
                          alt={s.author}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full object-cover border border-[#FFC107]"
                        />
                        <span className="text-[11px] font-bold truncate text-white">{s.author}</span>
                      </div>
                      <h4 className="text-xs font-black leading-tight truncate text-amber-300">
                        {s.title}
                      </h4>
                    </div>
                  </div>

                  {/* Card Content & Engagement Tracking */}
                  <div className="p-3.5 space-y-3 bg-white flex-1 flex flex-col justify-between">
                    {/* Tagged Product */}
                    {taggedProd && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2 text-xs">
                        <img
                          src={taggedProd.images[0]}
                          alt={taggedProd.title}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-[#0A3A1E] uppercase">Tagged Product</div>
                          <div className="text-xs font-bold text-slate-900 truncate">{taggedProd.title}</div>
                        </div>
                        <span className="text-xs font-mono font-black text-slate-900">₹{taggedProd.price}</span>
                      </div>
                    )}

                    {/* REAL-TIME LIVE ENGAGEMENT METRICS (Likes, Comments, Shares, Views) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>Live Engagement Metrics</span>
                        <span className="text-emerald-600 font-mono flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Real-Time
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 rounded-xl p-2 text-xs border border-slate-100">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-0.5 text-amber-600 font-mono font-bold text-[11px]">
                            <Eye className="w-3 h-3" />
                            <span>{(s.viewsCount || 0).toLocaleString()}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Views</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-0.5 text-rose-600 font-mono font-bold text-[11px]">
                            <Heart className="w-3 h-3 fill-rose-600" />
                            <span>{(s.likesCount || 0).toLocaleString()}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Likes</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-0.5 text-blue-600 font-mono font-bold text-[11px]">
                            <MessageCircle className="w-3 h-3" />
                            <span>{s.comments?.length || s.commentsCount || 0}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Comments</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-0.5 text-emerald-600 font-mono font-bold text-[11px]">
                            <Share2 className="w-3 h-3" />
                            <span>{(s.sharesCount || 0).toLocaleString()}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Shares</span>
                        </div>
                      </div>

                      {/* Quick Metric Booster Toolbar (Test Live Reaction Engine) */}
                      <div className="flex items-center justify-between pt-1 gap-1 text-[10px]">
                        <span className="text-slate-400 font-bold">Simulate:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleBoostMetric(s.id, 'likes')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                            title="+1 Like"
                          >
                            +❤️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBoostMetric(s.id, 'views')}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                            title="+50 Views"
                          >
                            +50👁️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBoostMetric(s.id, 'shares')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                            title="+1 Share"
                          >
                            +↗️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBoostMetric(s.id, 'comment')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                            title="+1 Comment"
                          >
                            +💬
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls: EDIT & DELETE BUTTONS */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {onPreviewStory && (
                        <button
                          type="button"
                          onClick={() => onPreviewStory(s)}
                          className="text-[#0A3A1E] hover:text-[#0A3A1E] font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#0A3A1E]" />
                          <span>Preview</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => setEditingStory(s)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Story"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete story "${s.title}"?`)) {
                              onDeleteStory(s.id);
                              showNotification('Story removed from storefront.');
                            }
                          }}
                          className="px-2 py-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* BANNERS SECTION */}
          {(activeFeedFilter === 'all' || activeFeedFilter === 'banners') &&
            banners.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Banner Visual Preview */}
                <div className={`bg-gradient-to-r ${b.bgColor} p-4 text-white min-h-[130px] flex items-center justify-between relative overflow-hidden`}>
                  <div className="space-y-1 z-10 max-w-[65%]">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider text-amber-300">
                        {b.badge}
                      </span>
                      {b.code && (
                        <span className="text-[10px] text-white/80 font-mono">Code: {b.code}</span>
                      )}
                    </div>
                    <h3 className={`text-sm sm:text-base font-black tracking-tight ${b.accentColor} font-serif`}>
                      {b.headline}
                    </h3>
                    <p className="text-[10px] text-slate-200 line-clamp-1">
                      {b.subheadline}
                    </p>
                  </div>

                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-md shrink-0 rotate-2">
                    <img
                      src={b.image}
                      alt={b.headline}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Banner Metrics & Actions */}
                <div className="p-3.5 bg-white space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                      {b.category}
                    </span>

                    <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                      <span>{(b.impressionsCount || 12400).toLocaleString()} Views</span>
                      <span>•</span>
                      <span className="text-[#0A3A1E] font-bold">{(b.clicksCount || 820).toLocaleString()} Clicks</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateBanner(b.id, { isActive: !b.isActive });
                        showNotification(b.isActive ? 'Banner deactivated' : 'Banner activated live in carousel');
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        b.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {b.isActive !== false ? '● Active' : '○ Disabled'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingBanner(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete banner "${b.headline}"?`)) {
                            onDeleteBanner(b.id);
                            showNotification('Banner deleted');
                          }
                        }}
                        className="px-2 py-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EDIT STORY MODAL */}
      {/* ========================================================================= */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Edit Story / Reel</h3>
                  <p className="text-[11px] text-slate-500">Update drop details &amp; tagged product</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStoryEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Story Drop Title *</label>
                <input
                  type="text"
                  required
                  value={editingStory.title}
                  onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Tag</label>
                  <select
                    value={editingStory.category}
                    onChange={(e) => setEditingStory({ ...editingStory, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                  >
                    <option value="New In">New In 🔥</option>
                    <option value="Oversized">Oversized</option>
                    <option value="Vintage">Vintage Acid Wash</option>
                    <option value="Anime">Anime Core</option>
                    <option value="Flash Sale">Flash Deals 60%</option>
                    <option value="Gym & Active">Gym &amp; Active</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sound Track</label>
                  <select
                    value={editingStory.soundTrackTitle || SOUND_PRESETS[0]}
                    onChange={(e) => setEditingStory({ ...editingStory, soundTrackTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                  >
                    {SOUND_PRESETS.map((snd) => (
                      <option key={snd} value={snd}>
                        {snd}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagged Product</label>
                <select
                  value={editingStory.featuredProductId || products[0]?.id}
                  onChange={(e) => setEditingStory({ ...editingStory, featuredProductId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Slide Caption</label>
                <textarea
                  rows={2}
                  value={editingStory.slides[0]?.caption || ''}
                  onChange={(e) => {
                    const newSlides = [...editingStory.slides];
                    if (newSlides[0]) {
                      newSlides[0].caption = e.target.value;
                    }
                    setEditingStory({ ...editingStory, slides: newSlides });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FFC107] hover:bg-[#FFD700] text-slate-950 font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EDIT BANNER MODAL */}
      {/* ========================================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Edit Hero Banner</h3>
                  <p className="text-[11px] text-slate-500">Update promotion copy and color theme</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBannerEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.headline}
                  onChange={(e) => setEditingBanner({ ...editingBanner, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subheadline Description</label>
                <input
                  type="text"
                  value={editingBanner.subheadline}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subheadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingBanner.badge}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-bold focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={editingBanner.code}
                    onChange={(e) => setEditingBanner({ ...editingBanner, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono font-bold focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Color Theme Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, bgColor: p.value, accentColor: p.accent })}
                      className={`p-2 rounded-xl text-left border flex items-center gap-2 ${
                        editingBanner.bgColor === p.value
                          ? 'border-[#0A3A1E] ring-2 ring-emerald-300 bg-emerald-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${p.value} shrink-0`} />
                      <span className="font-bold text-[11px] truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Camera & Gallery Image Uploader for Edit Banner Modal */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-xs">Banner Image *</label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Direct Upload Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => editBannerFileInputRef.current?.click()}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-[#0A3A1E] hover:bg-emerald-50 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#0A3A1E]" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editBannerCameraInputRef.current?.click()}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-rose-500 hover:bg-rose-50 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-500" />
                    <span>Camera</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={editingBanner.image}
                    alt="Editing Banner Preview"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-lg object-cover border border-slate-300 shrink-0"
                  />
                  <input
                    type="url"
                    value={editingBanner.image}
                    onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-[10px] focus:ring-1 focus:ring-[#0A3A1E] outline-none bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0A3A1E] hover:bg-[#0A3A1E] text-white font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Update Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
