import React from 'react';
import { Story } from '../types';
import { Sparkles, ChevronLeft, ChevronRight, Video, Volume2 } from 'lucide-react';

interface StoriesBarProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  viewedStoryIds: Set<string>;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStory,
  viewedStoryIds
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 260;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-white border-b border-slate-200/90 py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFC107] animate-ping"></span>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-sans">
              <span>Status &amp; Trending Drops</span>
              <span className="text-[10px] bg-[#FFC107]/20 text-[#052610] font-black px-2 py-0.2 rounded-full border border-[#FFC107]/30">
                NEW RELEASES
              </span>
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Tap circles for 360° video previews &amp; fit checks
          </span>
        </div>

        {/* Scroll Buttons for Desktop */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 mt-2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all -translate-y-1/2"
          aria-label="Scroll stories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 mt-2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all -translate-y-1/2"
          aria-label="Scroll stories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Horizontal Scrolling Stories Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          id="stories-scroll-bar"
        >
          {/* Stories loop */}
          {stories.map((story) => {
            const isViewed = viewedStoryIds.has(story.id);

            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
                className="flex flex-col items-center gap-1.5 focus:outline-none group shrink-0 select-none"
                id={`story-ring-${story.id}`}
              >
                {/* Story Gradient Ring */}
                <div
                  className={`p-[2.5px] rounded-full transition-all duration-300 transform group-hover:scale-105 ${
                    isViewed
                      ? 'bg-slate-300'
                      : 'bg-gradient-to-tr from-[#0A3A1E] via-[#FFC107] to-[#FFD700] shadow-sm shadow-amber-500/20'
                  }`}
                >
                  <div className="p-0.5 bg-white rounded-full">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-slate-100">
                      <img
                        src={story.avatar}
                        alt={story.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="eager"
                      />
                      {story.slides.some((s) => s.mediaType === 'video' || s.videoUrl) && (
                        <div className="absolute top-1 right-1 bg-rose-600/90 text-white p-0.5 rounded-full ring-1 ring-white shadow-xs">
                          <Video className="w-2.5 h-2.5" />
                        </div>
                      )}
                      {story.isLive && (
                        <div className="absolute bottom-0 inset-x-0 bg-[#0A3A1E] text-[8px] font-black text-[#FFC107] text-center py-0.2 tracking-wider">
                          LIVE
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Story Title & Badge */}
                <div className="text-center w-18 sm:w-20">
                  <span
                    className={`block text-[11px] sm:text-xs truncate font-bold leading-tight ${
                      isViewed ? 'text-slate-500 font-medium' : 'text-slate-900 group-hover:text-[#0A3A1E]'
                    }`}
                  >
                    {story.title}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-medium tracking-tight truncate">
                    {story.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

