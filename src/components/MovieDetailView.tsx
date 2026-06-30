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
      <div className="absolute top-6 left-4 sm:left-8 z-40">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center p-2.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SPECTACULAR NETFLIX-STYLE HERO SECTION */}
      <div className="relative w-full h-[55vh] md:h-[75vh] min-h-[500px] bg-black overflow-hidden flex items-end">
        
        {/* Blurry panoramic backdrop with absolute dark mask */}
        <div className="absolute inset-0 z-0">
          <img
            src={backdrop}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-black/50 to-transparent md:!bg-[linear-gradient(to_top,#0c0a09_0%,rgba(12,10,9,0.95)_15%,rgba(12,10,9,0.75)_40%,rgba(12,10,9,0.2)_75%,transparent_100%)]" />
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-10 sm:pb-16 flex flex-col items-start gap-4 sm:gap-6 text-left">
          
          {/* Core Text & CTAs Details Box */}
          <div className="flex flex-col items-start max-w-3xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-zinc-900/80 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded text-[11px] font-mono tracking-widest uppercase shadow-sm">
                {movie.year}
              </span>
              <span className="bg-zinc-900/80 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded text-[11px] font-mono tracking-widest uppercase shadow-sm">
                {movie.duration}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-forum font-bold tracking-wider text-white uppercase drop-shadow-xl leading-tight">
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
            <div className="flex items-center gap-3.5 pt-3">
              <button
                onClick={() => onPlay(movie.id)}
                className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
              >
                <Play className="w-4 h-4 fill-current" />
                Regarder
              </button>

              <button
                onClick={onToggleBookmark}
                className={`inline-flex items-center justify-center p-3.5 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer shadow-lg backdrop-blur-sm ${
                  isBookmarked
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
                title={isBookmarked ? "Retirer de Ma Liste" : "Ajouter à Ma Liste"}
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? "fill-current text-rose-500" : ""}`} />
              </button>
            </div>
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
              <span className="flex items-center gap-3 font-forum text-base sm:text-lg font-bold uppercase tracking-wider text-[#f4ecd8] group-hover:text-white transition-colors duration-250">
                <Users className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
                Casting du film
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 group-hover:text-[#f4ecd8] transition-transform duration-300 ${
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
                    <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Acteurs principaux :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {movie.cast.map((actor, idx) => (
                        <div
                          key={`${actor}-${idx}`}
                          className="flex items-center gap-3 bg-neutral-900/60 border border-zinc-900 p-3.5 rounded-xl text-zinc-300 text-sm font-sans"
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-[#f4ecd8] border border-[#f4ecd8]/20 bg-[#f4ecd8]/5 shadow-sm">
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

          {/* SECTION C: BANDE ANNONCE */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection("trailer")}
              className="flex items-center justify-between p-5 text-left w-full hover:bg-neutral-900/40 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-3 font-forum text-base sm:text-lg font-bold uppercase tracking-wider text-[#f4ecd8] group-hover:text-white transition-colors duration-250">
                <Film className="w-5 h-5 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
                Bande annonce
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
                          <p className="text-xs font-mono uppercase tracking-[3px] text-[#f4ecd8] font-bold">APERÇU CINÉMATOGRAPHIQUE RAPIDE</p>
                          <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto leading-normal">
                            Bande annonce en haute définition préparée par le studio distributeur officiel. Cliquez sur le bouton principal pour lancer la lecture intégrale.
                          </p>
                        </div>
                        <button
                          onClick={() => onPlay(movie.id)}
                          className="bg-zinc-900 hover:bg-[#f4ecd8] hover:text-black border border-zinc-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          Lancer la lecture intégrale
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
