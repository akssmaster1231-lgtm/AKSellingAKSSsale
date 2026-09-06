import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Story, Product, ProductColor, StoryComment } from '../types';
import { 
  X, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, 
  Sparkles, Heart, Zap, Video, Music, MessageCircle, Share2, 
  MoreVertical, Eye, Check, Copy, Send, Bookmark, ExternalLink,
  Flame, UserPlus, UserCheck, CheckCircle2
} from 'lucide-react';

interface StoryModalProps {
  story: Story | null;
  allStories: Story[];
  onClose: () => void;
  onSelectStory: (story: Story) => void;
  onOpenProduct: (product: Product) => void;
  onBuyNow?: (product: Product, size: string, color: ProductColor, quantity: number) => void;
  onUpdateStoryInteractions?: (storyId: string, updates: Partial<Story>) => void;
  products: Product[];
}

export const StoryModal: React.FC<StoryModalProps> = ({
  story,
  allStories,
  onClose,
  onSelectStory,
  onOpenProduct,
  onBuyNow,
  onUpdateStoryInteractions,
  products,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteractedWithAudio, setHasUserInteractedWithAudio] = useState(false);
  
  // Interactive Story State
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  
  // Drawers / Popups
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<StoryComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [copyToast, setCopyToast] = useState(false);
  const [likeHeartBurst, setLikeHeartBurst] = useState(false);

  const [dragOffsetDisplay, setDragOffsetDisplay] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchCurrentYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const SLIDE_DURATION = 6500; // 6.5s per slide
  const INTERVAL_MS = 50;

  // Initialize and synchronize story interaction state when active story changes
  useEffect(() => {
    if (story) {
      setCurrentSlideIndex(0);
      setProgress(0);
      setIsLiked(Boolean(story.isLiked));
      setLikesCount(story.likesCount || 1240);
      setViewsCount((story.viewsCount || 8500) + 1);
      setIsFollowed(Boolean(story.isFollowed));
      setCommentsList(story.comments || [
        { id: 'c-def-1', author: 'Streetwear India', text: 'Clean aesthetic drop! Best 240 GSM in the market 🔥', createdAt: '10m ago', likesCount: 12 },
        { id: 'c-def-2', author: 'Rahul Verma', text: 'Is next day delivery available for Mumbai?', createdAt: '5m ago', likesCount: 4 }
      ]);
      setIsCommentsOpen(false);
      setIsShareMenuOpen(false);
    }
  }, [story?.id]);

  const handleNextSlide = useCallback(() => {
    if (!story) return;
    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      const currentIndex = allStories.findIndex((s) => s.id === story.id);
      if (currentIndex < allStories.length - 1) {
        onSelectStory(allStories[currentIndex + 1]);
      } else {
        onClose();
      }
    }
  }, [story, currentSlideIndex, allStories, onSelectStory, onClose]);

  const handlePrevSlide = useCallback(() => {
    if (!story) return;
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      const currentIndex = allStories.findIndex((s) => s.id === story.id);
      if (currentIndex > 0) {
        onSelectStory(allStories[currentIndex - 1]);
      }
    }
  }, [story, currentSlideIndex, allStories, onSelectStory]);

  // Clean trigger when progress hits 100%
  useEffect(() => {
    if (progress >= 100) {
      handleNextSlide();
    }
  }, [progress, handleNextSlide]);

  const currentSlide = story?.slides[currentSlideIndex] || story?.slides[0];
  const isVideoSlide = Boolean(currentSlide?.mediaType === 'video' || currentSlide?.videoUrl);

  // Audio/Video control
  useEffect(() => {
    if (!isVideoSlide || !videoRef.current) return;

    const videoEl = videoRef.current;
    videoEl.muted = isMuted;

    if (isPaused || isCommentsOpen || isShareMenuOpen) {
      videoEl.pause();
    } else {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback: mute temporarily if browser blocked unmuted autoplay
          videoEl.muted = true;
          setIsMuted(true);
          videoEl.play().catch(() => {});
        });
      }
    }
  }, [isVideoSlide, currentSlideIndex, isPaused, isMuted, isCommentsOpen, isShareMenuOpen]);

  // Sound toggle handler
  const handleToggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHasUserInteractedWithAudio(true);
    setIsMuted((prev) => {
      const nextState = !prev;
      if (videoRef.current) {
        videoRef.current.muted = nextState;
        if (!nextState) {
          videoRef.current.play().catch(() => {});
        }
      }
      return nextState;
    });
  };

  // Timer loop for slide progress
  useEffect(() => {
    if (!story || isPaused || isCommentsOpen || isShareMenuOpen || isVideoSlide) return;

    const duration = currentSlide?.durationMs || SLIDE_DURATION;
    const increment = (INTERVAL_MS / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [story, isPaused, isCommentsOpen, isShareMenuOpen, isVideoSlide, currentSlide?.durationMs]);

  // Video time-update sync with progress bar
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (total > 0) {
        const pct = (current / total) * 100;
        setProgress(pct >= 100 ? 100 : pct);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCommentsOpen) setIsCommentsOpen(false);
        else if (isShareMenuOpen) setIsShareMenuOpen(false);
        else onClose();
      }
      if (!isCommentsOpen && !isShareMenuOpen) {
        if (e.key === 'ArrowRight') handleNextSlide();
        if (e.key === 'ArrowLeft') handlePrevSlide();
        if (e.key === ' ') {
          e.preventDefault();
          setIsPaused((p) => !p);
        }
        if (e.key === 'm' || e.key === 'M') {
          handleToggleSound();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNextSlide, handlePrevSlide, isCommentsOpen, isShareMenuOpen]);

  // Like Toggle
  const handleToggleLike = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (nextLiked) {
      setLikeHeartBurst(true);
      setTimeout(() => setLikeHeartBurst(false), 900);
    }
    if (story && onUpdateStoryInteractions) {
      onUpdateStoryInteractions(story.id, {
        isLiked: nextLiked,
        likesCount: nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1),
      });
    }
  };

  // Follow Toggle
  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextFollow = !isFollowed;
    setIsFollowed(nextFollow);
    if (story && onUpdateStoryInteractions) {
      onUpdateStoryInteractions(story.id, { isFollowed: nextFollow });
    }
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: StoryComment = {
      id: `c-${Date.now()}`,
      author: 'You',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text: newCommentText.trim(),
      createdAt: 'Just now',
      likesCount: 0,
    };

    const updated = [newComment, ...commentsList];
    setCommentsList(updated);
    setNewCommentText('');
    if (story && onUpdateStoryInteractions) {
      onUpdateStoryInteractions(story.id, {
        comments: updated,
        commentsCount: (story.commentsCount || 0) + 1,
      });
    }
  };

  // Share Actions
  const storyShareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?story=${story?.id || ''}` : 'https://akselling.com';
  const shareText = `Check out this viral drop on AKSelling: ${story?.title || 'Exclusive Streetwear Drop'}!`;

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${storyShareUrl}`)}`;
    window.open(waUrl, '_blank');
    setIsShareMenuOpen(false);
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyShareUrl)}`;
    window.open(fbUrl, '_blank');
    setIsShareMenuOpen(false);
  };

  const handleShareTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyShareUrl)}`;
    window.open(twUrl, '_blank');
    setIsShareMenuOpen(false);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(storyShareUrl);
      }
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
      setIsShareMenuOpen(false);
    } catch {
      // Fallback
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: story?.title || 'AKSelling Story',
          text: shareText,
          url: storyShareUrl,
        });
        setIsShareMenuOpen(false);
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink(e);
    }
  };

  // Touch handlers for swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchCurrentYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartYRef.current || !isDraggingRef.current) return;
    const currentY = e.touches[0].clientY;
    touchCurrentYRef.current = currentY;
    const deltaY = currentY - touchStartYRef.current;
    if (deltaY > 0) {
      setDragOffsetDisplay(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartYRef.current !== null && touchCurrentYRef.current !== null) {
      const deltaY = touchCurrentYRef.current - touchStartYRef.current;
      if (deltaY > 80) {
        onClose();
        return;
      }
    }
    touchStartYRef.current = null;
    touchCurrentYRef.current = null;
    isDraggingRef.current = false;
    setDragOffsetDisplay(0);
  };

  if (!story) return null;

  const taggedProduct = products.find(
    (p) => p.id === (currentSlide?.productTaggedId || story.featuredProductId)
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Toast Notification for Link Copy */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 z-60 bg-emerald-500 text-slate-950 px-4 py-2 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-300"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Story Link Copied to Clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Arrows for Desktop */}
      <button
        onClick={handlePrevSlide}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all z-20 backdrop-blur-xs shadow-xl"
        aria-label="Previous story"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      <button
        onClick={handleNextSlide}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all z-20 backdrop-blur-xs shadow-xl"
        aria-label="Next story"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Main Story Container with Framer Motion Drag-to-Dismiss Gestures */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.8 }}
        onDragStart={() => setIsPaused(true)}
        onDragEnd={(_, info) => {
          setIsPaused(false);
          setDragOffsetDisplay(0);
          if (info.offset.y > 90 || info.velocity.y > 400) {
            onClose();
          }
        }}
        onDrag={(_, info) => {
          if (info.offset.y > 0) {
            setDragOffsetDisplay(info.offset.y);
          }
        }}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 350 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full h-full sm:h-[90vh] sm:max-w-md sm:rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing will-change-transform"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        id="instagram-story-viewer-modal"
        style={{
          transform: dragOffsetDisplay > 0 ? `translateY(${dragOffsetDisplay * 0.7}px) scale(${Math.max(0.85, 1 - dragOffsetDisplay / 1000)})` : undefined,
          transition: dragOffsetDisplay === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {/* Top Instagram Swipe Down Handle Pill */}
        <div className="absolute top-2 inset-x-0 z-30 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-1.5 bg-white/50 hover:bg-white/80 rounded-full shadow-sm" />
          <span className="text-[9px] font-bold text-white/60 tracking-wider uppercase mt-0.5 drop-shadow-xs">
            Swipe down to close
          </span>
        </div>

        {/* Floating Heart Animation on Like */}
        <AnimatePresence>
          {likeHeartBurst && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1.4 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-2xl animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Layer: Full Video or Image Reel */}
        <div 
          className="absolute inset-0 bg-slate-950 overflow-hidden"
          onDoubleClick={handleToggleLike}
        >
          {isVideoSlide ? (
            <video
              ref={videoRef}
              src={currentSlide.videoUrl || currentSlide.mediaUrl}
              poster={currentSlide.mediaUrl}
              playsInline
              autoPlay
              muted={isMuted}
              loop
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleNextSlide}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentSlide.mediaUrl}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          )}

          {/* Vignette Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/95 pointer-events-none"></div>
        </div>

        {/* Tap areas for Left (Previous) and Right (Next) slide navigation */}
        <div className="absolute inset-0 grid grid-cols-2 z-10 pointer-events-auto">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrevSlide();
            }}
            className="h-full cursor-pointer"
            title="Tap left for previous slide"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNextSlide();
            }}
            className="h-full cursor-pointer"
            title="Tap right for next slide"
          />
        </div>

        {/* Top Story Header: Segmented Progress Bars & Author Details */}
        <div className="relative z-20 p-4 pt-6 space-y-3 pointer-events-auto">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {story.slides.map((s, idx) => {
              let fillWidth = '0%';
              if (idx < currentSlideIndex) fillWidth = '100%';
              else if (idx === currentSlideIndex) fillWidth = `${progress}%`;

              return (
                <div
                  key={s.id}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author info & Sound/Pause Controls */}
          <div className="flex items-center justify-between text-white gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={story.avatar}
                  alt={story.author}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#FFC107] shadow-sm"
                />
                {isVideoSlide && (
                  <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-0.5 rounded-full ring-1 ring-white">
                    <Video className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold tracking-tight text-white drop-shadow-sm truncate">
                    {story.author}
                  </span>
                  {(story.isAuthorVerified !== false) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC107] fill-[#FFC107]/20 shrink-0" />
                  )}
                  {story.authorHandle && (
                    <span className="text-[10px] text-white/70 font-mono hidden sm:inline">
                      {story.authorHandle}
                    </span>
                  )}
                  
                  {/* Follow Button */}
                  <button
                    onClick={handleToggleFollow}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-0.5 ${
                      isFollowed
                        ? 'bg-white/20 text-white/90 border border-white/30'
                        : 'bg-[#FFC107] text-[#052610] font-black shadow-xs hover:scale-105'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-2.5 h-2.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-white/80 flex items-center gap-1.5 flex-wrap">
                  <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                    <Eye className="w-3 h-3" />
                    {viewsCount.toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>{story.createdAt || 'Active Now'}</span>
                  <span>•</span>
                  <span className="bg-white/20 px-1 rounded text-[9px] uppercase font-bold text-white">
                    {story.category}
                  </span>
                  {(story.soundTrackTitle || currentSlide?.soundTrackTitle) && (
                    <span className="text-amber-200 text-[9px] flex items-center gap-0.5 bg-black/40 px-1.5 py-0.2 rounded-full truncate max-w-[110px]">
                      <Music className="w-2 h-2" />
                      <span className="truncate">{story.soundTrackTitle || currentSlide?.soundTrackTitle}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right Story Actions (Sound, Pause, 3-Dot Menu, Close) */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Visible Sound/Mute Toggle */}
              <button
                onClick={handleToggleSound}
                className={`px-2 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold transition-all backdrop-blur-md shadow-md ${
                  !isMuted 
                    ? 'bg-[#FFC107] text-[#052610] ring-2 ring-[#FFD700]' 
                    : 'bg-black/50 text-white/90 hover:bg-black/70'
                }`}
                title={isMuted ? 'Unmute Audio (Sound ON)' : 'Mute Audio'}
                aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                id="story-sound-toggle-btn"
              >
                {!isMuted ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="text-[9px] uppercase font-mono font-black hidden xs:inline">Sound ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase font-mono text-white/80 hidden xs:inline">Muted</span>
                  </>
                )}
              </button>

              {/* 3-Dot Share & Options Menu */}
              <button
                onClick={() => setIsShareMenuOpen((o) => !o)}
                className="p-1.5 text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs transition-colors"
                title="Share & Options"
                aria-label="Story Options"
                id="story-3dot-options-btn"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Pause / Resume Button */}
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="p-1.5 text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs transition-colors"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* Dismiss / Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs transition-colors"
                aria-label="Close story"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Unmute Hint Prompt if muted initially */}
        {isMuted && !hasUserInteractedWithAudio && isVideoSlide && (
          <div 
            onClick={handleToggleSound}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-black/85 hover:bg-black text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/20 shadow-xl cursor-pointer backdrop-blur-md animate-bounce"
          >
            <Volume2 className="w-4 h-4 text-[#FFC107]" />
            <span>Tap to Enable Sound</span>
          </div>
        )}

        {/* Bottom Story Content & Tagged Product Card */}
        <div className="relative z-20 p-4 space-y-3 pb-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          {/* Slide Text */}
          <div className="space-y-1">
            <h3 className="text-white font-black text-lg leading-snug drop-shadow-md flex items-center gap-2">
              <span>{currentSlide.title}</span>
              {isVideoSlide && (
                <span className="text-[10px] font-bold bg-rose-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Music className="w-2.5 h-2.5" />
                  AUDIO
                </span>
              )}
            </h3>
            <p className="text-white/90 text-xs font-normal leading-relaxed drop-shadow-sm">
              {currentSlide.caption}
            </p>
          </div>

          {/* Tagged Product Link Banner with Direct Buy Now Option */}
          {taggedProduct && (
            <div className="space-y-2">
              <div
                onClick={() => {
                  onClose();
                  onOpenProduct(taggedProduct);
                }}
                id={`story-tagged-product-${taggedProduct.id}`}
                className="bg-white/95 hover:bg-white text-slate-900 rounded-2xl p-2.5 shadow-xl border border-white/40 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.01] backdrop-blur-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={taggedProduct.images[0]}
                    alt={taggedProduct.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded uppercase">
                        Featured Tee
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">
                        {taggedProduct.discountPercent}% OFF
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {taggedProduct.title}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-black text-slate-950 font-mono">
                        ₹{taggedProduct.price}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        ₹{taggedProduct.originalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="bg-[#0A3A1E] text-[#FFC107] p-2 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs">
                    View
                  </div>
                </div>
              </div>

              {/* Prominent Direct 'BUY NOW' Bar inside Story Overlay */}
              <div className="bg-slate-950/90 backdrop-blur-md rounded-2xl p-2.5 border border-amber-400/40 shadow-xl flex items-center gap-2">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
                  {taggedProduct.sizes.slice(0, 4).map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={`text-[10px] font-bold font-mono px-2 py-1.5 rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    if (onBuyNow) {
                      onBuyNow(taggedProduct, selectedSize, taggedProduct.colors[0], 1);
                    } else {
                      onOpenProduct(taggedProduct);
                    }
                  }}
                  id="story-direct-buy-now-btn"
                  className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>BUY NOW (₹{taggedProduct.price})</span>
                </button>
              </div>
            </div>
          )}

          {/* Real-Time Story Interaction Bar: Likes, Comments, Share */}
          <div className="flex items-center gap-2 pt-1">
            {/* Quick Comment Trigger Input */}
            <div 
              onClick={() => {
                setIsPaused(true);
                setIsCommentsOpen(true);
              }}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-4 py-2.5 text-xs text-white/90 placeholder:text-white/60 border border-white/20 flex items-center justify-between cursor-pointer transition-colors"
            >
              <span className="truncate">Send comment to {story.author}...</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            </div>

            {/* Like Button with live Counter */}
            <button
              onClick={handleToggleLike}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 ${
                isLiked ? 'bg-rose-500 text-white scale-105' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Like story"
              aria-label="Like story"
              id="story-like-btn"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              <span className="text-[10px] font-bold font-mono">
                {likesCount > 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
              </span>
            </button>

            {/* Comments Drawer Trigger Button */}
            <button
              onClick={() => {
                setIsPaused(true);
                setIsCommentsOpen(true);
              }}
              className="p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all flex items-center gap-1.5"
              title="View Comments"
              aria-label="View Comments"
              id="story-comments-btn"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold font-mono">
                {commentsList.length}
              </span>
            </button>

            {/* Direct Share Button */}
            <button
              onClick={() => setIsShareMenuOpen(true)}
              className="p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all"
              title="Share Story"
              aria-label="Share Story"
              id="story-share-btn"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-DOT SHARE & OPTIONS DRAWER / POPUP */}
        <AnimatePresence>
          {isShareMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/98 backdrop-blur-xl border-t border-white/20 rounded-t-3xl p-5 text-white space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#FFC107]" />
                  <span className="font-black text-sm">Share This Story</span>
                </div>
                <button
                  onClick={() => setIsShareMenuOpen(false)}
                  className="p-1 rounded-full text-white/60 hover:text-white bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share Channels Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0A3A1E] text-[#FFC107] border border-[#FFC107]/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 fill-[#FFC107]" />
                  </div>
                  <span className="text-[11px] font-bold text-white/90">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleShareFacebook}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="font-black text-xl">f</span>
                  </div>
                  <span className="text-[11px] font-bold text-white/90">Facebook</span>
                </button>

                {/* Twitter / X */}
                <button
                  onClick={handleShareTwitter}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-black text-white border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="font-black text-lg">𝕏</span>
                  </div>
                  <span className="text-[11px] font-bold text-white/90">X / Post</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Copy className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white/90">Copy Link</span>
                </button>
              </div>

              {/* Native Share & Direct URL Bar */}
              <div className="bg-black/40 rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs text-white/70 font-mono truncate">
                  {storyShareUrl}
                </span>
                <button
                  onClick={handleNativeShare}
                  className="bg-[#FFC107] text-[#052610] font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INTERACTIVE COMMENTS DRAWER */}
        <AnimatePresence>
          {isCommentsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 200 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 200 }}
              className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/98 backdrop-blur-xl border-t border-white/20 rounded-t-3xl p-4 text-white flex flex-col max-h-[65vh] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Comments Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-300" />
                  <span className="font-black text-sm">Story Comments ({commentsList.length})</span>
                </div>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-full text-white/60 hover:text-white bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Scrollable Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar max-h-64">
                {commentsList.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={comm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={comm.author}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0 bg-white/10 rounded-2xl p-2.5 border border-white/10">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-white text-[11px] truncate">
                          {comm.author}
                        </span>
                        <span className="text-[9px] text-white/50">{comm.createdAt}</span>
                      </div>
                      <p className="text-white/90 leading-relaxed break-words">{comm.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-black/40 text-white placeholder:text-white/50 border border-white/20 rounded-full px-3.5 py-2 text-xs outline-none focus:border-[#FFC107]"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="bg-[#FFC107] disabled:opacity-40 text-[#052610] p-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
