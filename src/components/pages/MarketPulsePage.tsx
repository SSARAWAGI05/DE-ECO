// src/pages/MarketPulsePage.tsx

import React, { useMemo, useState, useEffect } from "react";
import {
  Play,
  Filter,
  Instagram,
  ExternalLink, Mail, Phone, MapPin, Clock, Linkedin,
  Search as SearchIcon,
  X,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeColors } from "../../styles/colors";
import { supabase } from "../../lib/supabaseClient";

/* ================= TYPES ================= */
interface MarketReel {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reel_url: string;
  thumbnail_url: string | null;
  platform: 'instagram' | 'youtube' | 'x';
  duration_seconds: number | null;
  view_count: number;
  published_at: string;
  is_active: boolean;
  tag: string | null;  // ✅ Single tag column
}

/* ================= COMPONENT ================= */
const MarketPulsePage: React.FC = () => {
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  
  // Database state
  const [reels, setReels] = useState<MarketReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const FALLBACK_THUMBNAIL = "/logo/De-Eco-logo.png";

  // Fetch reels from database
  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('market_reels')
          .select('*')
          .eq('is_active', true)
          .order('published_at', { ascending: false });

        if (fetchError) {
          console.error('Supabase error details:', fetchError);
          throw fetchError;
        }

        setReels(data || []);
      } catch (err) {
        console.error('Error fetching reels:', err);
        setError('Failed to load reels');
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Get all unique tags from reels
  const TAGS = useMemo(() => {
    const tagSet = new Set<string>();
    reels.forEach(reel => {
      if (reel.tag) {
        tagSet.add(reel.tag);
      }
    });
    return ["All", ...Array.from(tagSet)];
  }, [reels]);

  // Filter and sort reels
  const filteredReels = useMemo(() => {
    let list = reels.filter((r) => {
      const matchesSearch =
        `${r.title} ${r.description || ''}`
          .toLowerCase()
          .includes(query.toLowerCase().trim());

      const matchesTag =
      !activeTag || 
      activeTag === "All" || 
      r.tag === activeTag;

      return matchesSearch && matchesTag;
    });

    // Sort reels
    if (sortBy === "recent") {
      list.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    } else {
      list.sort((a, b) => b.view_count - a.view_count);
    }

    return list;
  }, [query, activeTag, sortBy, reels]);

  // Format duration from seconds to "XXs" or "Xm XXs"
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "N/A";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace("#", "");
    const bigint = parseInt(
      h.length === 3 ? h.split("").map(c => c + c).join("") : h,
      16
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: themeColors.background.lightGray }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36 pb-12">

        {/* HERO */}
        <section
          className="rounded-3xl p-8 sm:p-10 lg:p-12 mb-10 relative overflow-hidden"
          style={{
            backgroundColor: themeColors.background.white,
            border: `1px solid ${themeColors.primary.lightGray}`,
            boxShadow: `0 6px 18px ${hexToRgba(themeColors.primary.lightGray, 0.06)}`,
          }}
          aria-labelledby="market-pulse-hero"
        >
          <div
            aria-hidden
            className={`absolute top-0 left-0 right-0 h-2 rounded-t-3xl bg-gradient-to-r ${themeColors.accent.blueLight}`}
            style={{ opacity: 0.12 }}
          />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <h1
                  id="market-pulse-hero"
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight"
                  style={{ color: themeColors.text.primary }}
                >
                  Market{" "}
                  <span style={{ color: themeColors.accent.blue }}>
                    Pulse
                  </span>
                </h1>

                <p
                  className="text-xs sm:text-base lg:text-lg italic leading-relaxed mb-2"
                  style={{ color: themeColors.text.secondary }}
                >
                  Your daily market pulse—fast, focused, and easy to digest.
                  Breaking down global economics into insights you’ll enjoy learning.
                </p>
              </div>

              <aside className="lg:w-64 w-full">
                <div
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: themeColors.accent.blue,
                    color: themeColors.text.primary,
                  }}
                > {/*HI*/}
                  <h3 className="font-bold text-lg mb-3" style={{ color: themeColors.text.primary }}>
                    Latest Pulse
                  </h3>
                  <p className="text-sm" style={{ color: themeColors.text.muted }}>
                    {reels.length > 0 ? reels[0].title : "No reels yet"}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* SEARCH + SORT */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: themeColors.text.muted }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reels..."
              className="w-full pl-12 pr-12 py-3 rounded-xl border"
              style={{
                backgroundColor: themeColors.background.white,
                borderColor: themeColors.card.border,
                color: themeColors.text.primary,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "popular")}
            className="px-6 py-3 rounded-xl border"
            style={{
              backgroundColor: themeColors.background.white,
              borderColor: themeColors.card.border,
              color: themeColors.text.primary,
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* TAG FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {TAGS.map((tag) => {
            const isActive =
              (tag === "All" && !activeTag) || activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() =>
                  tag === "All"
                    ? setActiveTag(null)
                    : setActiveTag(isActive ? null : tag)
                }
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive
                    ? themeColors.accent.blue
                    : themeColors.background.white,
                  color: isActive
                    ? themeColors.text.white
                    : themeColors.text.primary,
                  border: `1px solid ${
                    isActive ? themeColors.accent.blue : themeColors.card.border
                  }`,
                }}
              >
                {tag === "All" ? "All" : `#${tag}`}
              </button>
            );
          })}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 
              className="w-12 h-12 animate-spin" 
              style={{ color: themeColors.accent.blue }}
            />
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="text-center py-20">
            <p style={{ color: themeColors.text.muted }}>{error}</p>
          </div>
        )}

        {/* REELS GRID */}
        {!loading && !error && (
          <section aria-live="polite">
            {filteredReels.length === 0 ? (
              <div className="text-center py-20">
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: themeColors.accent.blueLight }}
                >
                  <Filter
                    className="w-10 h-10"
                    style={{ color: themeColors.text.primary }}
                  />
                </div>

                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: themeColors.text.primary }}
                >
                  No reels found
                </h3>

                <p
                  className="max-w-md mx-auto mb-8"
                  style={{ color: themeColors.text.muted }}
                >
                  {reels.length === 0 
                    ? "No reels available yet. Check back soon!"
                    : "Try changing the search or selected tag."}
                </p>

                {reels.length > 0 && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setActiveTag(null);
                    }}
                    className="px-6 py-3 rounded-xl font-semibold"
                    style={{
                      backgroundColor: themeColors.accent.yellowBright,
                      color: themeColors.text.white,
                    }}
                  >
                    View all reels
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredReels.map((reel) => (
                    <a
                      key={reel.id}
                      href={reel.reel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl overflow-hidden transition hover:shadow-2xl hover:-translate-y-1 cursor-pointer border active:scale-95 block"
                      onClick={() => {
                        // fire-and-forget (DO NOT await)
                        supabase.rpc('increment_market_reel_views', {
                          p_reel_id: reel.id,
                        });
                      }}
                      style={{
                        borderColor: themeColors.card.border,
                        backgroundColor: themeColors.card.bg,
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                      }}
                    >

                    {/* Thumbnail */}
                    <div
                      className="relative h-64 overflow-hidden"
                      style={{
                        backgroundColor: themeColors.background.offWhite,
                      }}
                    >
                      <img
                        src={reel.thumbnail_url || "/logo/De-Eco-logo.png"}
                        onError={(e) => {
                          e.currentTarget.src = "/logo/De-Eco-logo.png";
                        }}
                        alt={reel.title}
                        loading="lazy"
                        className={
                          reel.thumbnail_url
                            ? "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            : "w-full h-full object-contain bg-white p-6"
                        }
                      />

                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: themeColors.background.white,
                          }}
                        >
                          <Play
                            className="w-6 h-6"
                            style={{ color: themeColors.text.primary }}
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        {reel.tag && (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.7)",
                              color: themeColors.text.white,
                            }}
                          >
                            {reel.tag}
                          </span>
                        )}
                        {reel.duration_seconds && (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.7)",
                              color: themeColors.text.white,
                            }}
                          >
                            <Clock className="w-3 h-3" />
                            {formatDuration(reel.duration_seconds)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className="p-5"
                      style={{ backgroundColor: themeColors.background.white }}
                    >
                      <h3
                        className="font-semibold text-lg mb-2 line-clamp-2"
                        style={{ color: themeColors.text.primary }}
                      >
                        {reel.title}
                      </h3>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <span
                          className="flex items-center gap-2"
                          style={{ color: themeColors.text.muted }}
                        >
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(reel.published_at)}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between pt-3 border-t"
                        style={{
                          borderColor: themeColors.primary.lightGray,
                        }}
                      >
                        <span
                          className="flex items-center gap-2 text-sm"
                          style={{ color: themeColors.text.muted }}
                        >
                          <Instagram
                            className="w-4 h-4"
                            style={{ color: themeColors.accent.pink }}
                          />
                          Watch on {reel.platform.charAt(0).toUpperCase() + reel.platform.slice(1)}
                        </span>

                        <div
                          className="flex items-center gap-2 text-sm"
                          style={{ color: themeColors.accent.blue }}
                        >
                          <span className="font-medium">Watch now</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FOOTER NOTE */}
        <div
          className="mt-12 text-center text-sm"
          style={{ color: themeColors.text.muted }}
        >
          Follow us on{" "}
          <a
            href="https://instagram.com/deeco.official"
            target="_blank"
            rel="noreferrer"
            className="font-semibold"
            style={{ color: themeColors.accent.pink }}
          >
            Instagram
          </a>{" "}
          for real-time posts.
        </div>
      </div>
    </div>
  );
};

export default MarketPulsePage;