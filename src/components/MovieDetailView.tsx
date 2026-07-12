import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, ChevronDown, Award, Users, Film, ArrowLeft, Star, Clock, Heart } from "lucide-react";
import { Movie } from "../data";

interface MovieDetailViewProps {
  movie: Movie;
  onBack: () => void;
  onPlay: (movieId: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function MovieDetailView({
  movie,
  onBack,
  onPlay,
  isBookmarked,
  onToggleBookmark,
}: MovieDetailViewProps) {
  const [expandedSection, setExpandedSection] = useState<"synopsis" | "casting" | "trailer" | null>("synopsis");

  const toggleSection = (section: "synopsis" | "casting" | "trailer") => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Safe backdrop selection
  const backdrop = movie.backdropUrl || "/src/assets/images/classico_hero_backdrop_1781395618793.jpg";
  const poster = movie.posterUrl || "";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased pb-20">
      
      {/* 1. TOP SECURE HEADER & NAVIGATION BREADCRUMB */}
      <div className="absolute top-20 md:top-24 left-4 sm:left-8 z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center p-2.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SPECTACULAR NETFLIX-STYLE HERO SECTION */}
      <div className="relative w-full h-[55vh] md:h-[75vh] min-h-[500px] [@media(max-height:500px)_and_(orientation:landscape)]:min-h-0 [@media(max-height:500px)_and_(orientation:landscape)]:h-[100vh] bg-black overflow-hidden flex items-end [@media(max-height:500px)_and_(orientation:landscape)]:items-center [@media(max-height:500px)_and_(orientation:landscape)]:pt-10">
        
        {/* Blurry panoramic backdrop with absolute dark mask */}
        <div className="absolute inset-0 z-0">
          <img
            src={backdrop}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#0c0a09_0%,#0c0a09_10%,rgba(12,10,9,0.9)_30%,rgba(12,10,9,0.4)_60%,transparent_100%)] md:!bg-[linear-gradient(to_top,#0c0a09_0%,#0c0a09_10%,rgba(12,10,9,0.95)_25%,rgba(12,10,9,0.6)_50%,transparent_100%)] [@media(max-height:500px)_and_(orientation:landscape)]:bg-stone-950/80" />
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 max-w-[2000px] mx-auto w-full px-4 sm:px-8 pb-10 sm:pb-16 [@media(max-height:500px)_and_(orientation:landscape)]:pb-2 flex flex-col [@media(max-height:500px)_and_(orientation:landscape)]:flex-row items-start [@media(max-height:500px)_and_(orientation:landscape)]:items-center gap-4 sm:gap-6 [@media(max-height:500px)_and_(orientation:landscape)]:gap-6 text-left [@media(max-height:500px)_and_(orientation:landscape)]:h-auto">
          
          <img src={poster} alt={movie.title} className="hidden [@media(max-height:500px)_and_(orientation:landscape)]:block h-[80vh] max-h-[280px] w-auto object-contain rounded-lg shadow-2xl shrink-0" />

          {/* Core Text & CTAs Details Box */}
          <div className="flex flex-col items-start max-w-3xl space-y-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:space-y-2 [@media(max-height:500px)_and_(orientation:landscape)]:h-[80vh] [@media(max-height:500px)_and_(orientation:landscape)]:max-h-[280px] [@media(max-height:500px)_and_(orientation:landscape)]:overflow-y-auto [@media(max-height:500px)_and_(orientation:landscape)]:pr-2 no-scrollbar">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-zinc-900/80 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded text-[11px] font-mono tracking-widest uppercase shadow-sm">
                {movie.year}
              </span>
              <span className="bg-zinc-900/80 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded text-[11px] font-mono tracking-widest uppercase shadow-sm">
                {movie.duration}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl [@media(max-height:500px)_and_(orientation:landscape)]:text-3xl font-forum font-bold tracking-wider text-white uppercase drop-shadow-xl leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-zinc-300 font-sans text-sm md:text-base leading-relaxed max-w-xl italic font-light opacity-90">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono tracking-widest text-zinc-300 pt-1 uppercase">
              <span className="text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                {movie.rating}
              </span>
              <span>•</span>
              <span>De {movie.director}</span>
              <span>•</span>
              <span className="text-zinc-400">{movie.genre.join(", ")}</span>
            </div>

            {/* Main Interactive CTA Button Area */}
            <div className="flex items-center gap-3.5 pt-3 [@media(max-height:500px)_and_(orientation:landscape)]:pt-1">
              <button
                onClick={() => onPlay(movie.id)}
                className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
              >
                <Play className="w-4 h-4 fill-current" />
                Play
              </button>

              <button
                onClick={onToggleBookmark}
                className={`inline-flex items-center justify-center p-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:p-2 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer shadow-lg backdrop-blur-sm ${
                  isBookmarked
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
                title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <Heart className={`w-5 h-5 [@media(max-height:500px)_and_(orientation:landscape)]:w-4 [@media(max-height:500px)_and_(orientation:landscape)]:h-4 ${isBookmarked ? "fill-current text-rose-500" : ""}`} />
              </button>
            </div>

            {/* Synopsis for landscape mode */}
            <p className="hidden [@media(max-height:500px)_and_(orientation:landscape)]:block text-zinc-300 text-[11px] leading-relaxed font-sans font-light pt-2">
              {movie.description}
            </p>
          </div>

        </div>
      </div>
      {/* 3. MINIMALIST COLLAPSIBLE ACCORDION PANELS */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-12 space-y-4 text-left">
        
        {/* Accordion List */}
        <div className="border border-zinc-900 bg-neutral-950/40 rounded-2xl overflow-hidden divide-y divide-zinc-900">
          
          {/* SECTION A: SYNOPSIS */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection("synopsis")}
              className="flex items-center justify-between p-5 text-left w-full hover:bg-neutral-900/40 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-3 font-forum text-base sm:text-lg font-bold uppercase tracking-wider text-[#f4ecd8] group-hover:text-white transition-colors duration-250">
                <Film className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)] animate-pulse" />
                Synopsis
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 group-hover:text-[#f4ecd8] transition-transform duration-300 ${
                  expandedSection === "synopsis" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "synopsis" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-sm sm:text-base text-zinc-300 leading-relaxed font-sans font-light">
                    {movie.description}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

                    {/* SECTION B: CASTING */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection("casting")}
              className="flex items-center justify-between p-5 text-left w-full hover:bg-neutral-900/40 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-3 font-forum text-base sm:text-lg font-bold uppercase tracking-wider text-[#D4AF37] group-hover:text-[#e8ce7a] transition-colors duration-250">
                <Users className="w-5 h-5 text-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
                Cast
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 group-hover:text-[#D4AF37] transition-transform duration-300 ${
                  expandedSection === "casting" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "casting" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 space-y-4">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#D4AF37]">Main Cast:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {movie.cast.map((actor, idx) => (
                        <div
                          key={`${actor}-${idx}`}
                          className="flex items-center gap-3 bg-neutral-900/60 border border-[#D4AF37]/20 p-3.5 rounded-xl text-zinc-300 text-sm font-sans"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-xs font-mono font-bold text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm">
                            {actor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium tracking-wide text-zinc-200">{actor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SECTION C: TRAILER */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection("trailer")}
              className="flex items-center justify-between p-5 text-left w-full hover:bg-neutral-900/40 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-3 font-forum text-base sm:text-lg font-bold uppercase tracking-wider text-[#f4ecd8] group-hover:text-white transition-colors duration-250">
                <Film className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
                Trailer
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 group-hover:text-[#f4ecd8] transition-transform duration-300 ${
                  expandedSection === "trailer" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "trailer" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 space-y-4">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-900 bg-black flex items-center justify-center">
                      
                      {/* Premium Ambient Loop Animation or static image */}
                      <div className="absolute inset-0 z-0">
                        <img
                          src={backdrop}
                          alt="Trailer Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-30 animate-pulse pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                      </div>

                       {/* Animated Play Symbol representing modern cinema player placeholder */}
                      <div className="relative z-10 text-center space-y-3.5 p-4">
                        <div className="w-16 h-16 rounded-full bg-[#f4ecd8]/10 border border-[#f4ecd8]/30 flex items-center justify-center mx-auto animate-bounce duration-1000">
                          <Play className="w-6 h-6 text-[#f4ecd8] fill-current ml-0.5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-mono uppercase tracking-[3px] text-[#f4ecd8] font-bold">QUICK CINEMATIC PREVIEW</p>
                          <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto leading-normal">
                            Official high-definition trailer prepared by the studio. Click the main button to play the full movie.
                          </p>
                        </div>
                        <button
                          onClick={() => onPlay(movie.id)}
                          className="bg-zinc-900 hover:bg-[#f4ecd8] hover:text-black border border-zinc-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          Play Full Movie
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
