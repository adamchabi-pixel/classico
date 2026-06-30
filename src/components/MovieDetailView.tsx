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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 relative z-30">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-400 hover:text-amber-400 group py-2.5 px-4 bg-black/60 rounded-full border border-zinc-900 hover:border-amber-500/25 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors transform group-hover:-translate-x-0.5" />
          RETOUR AU CATALOGUE
        </button>
      </div>

      {/* 2. SPECTACULAR NETFLIX-STYLE HERO SECTION */}
      <div className="relative w-full h-[55vh] md:h-[65vh] bg-black overflow-hidden flex items-end -mt-16">
        
        {/* Blurry panoramic backdrop with absolute dark mask */}
        <div className="absolute inset-0 z-0">
          <img
            src={backdrop}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 pointer-events-none filter blur-sm brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/50 to-transparent" />
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-8 sm:pb-12 flex flex-col md:flex-row items-end gap-6 md:gap-10 text-left">
          
          {/* Movie Poster Thumbnail Cover (Left side, only on larger viewports to keep minimalist aesthetics clean) */}
          {poster && (
            <div className="hidden md:block w-48 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 transform hover:scale-102 transition-transform duration-300">
              <img
                src={poster}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover aspect-[2/3]"
              />
            </div>
          )}

          {/* Core Text & CTAs Details Box */}
          <div className="flex-grow space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 text-[10px] font-mono tracking-widest font-extrabold uppercase rounded-full">
                <Award className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
                CULTISSIME SELECTION
              </span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] font-mono">
                {movie.year}
              </span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] font-mono">
                {movie.duration}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-forum font-bold tracking-wider text-white uppercase drop-shadow-md">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-[#f4ecd8] font-signature text-2xl sm:text-3xl md:text-4xl leading-relaxed select-none filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
                « {movie.tagline} »
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-300 pt-1">
              <span className="text-[#f4ecd8] font-extrabold flex items-center gap-1.5 bg-zinc-900/60 border border-[#f4ecd8]/40 px-2.5 py-1 rounded shadow-md">
                <Star className="w-3.5 h-3.5 fill-current text-[#f4ecd8]" />
                {movie.rating} / 10
              </span>
              <span>•</span>
              <span>RÉALISATEUR : {movie.director.toUpperCase()}</span>
              <span>•</span>
              <span className="text-zinc-400">{movie.genre.join(", ")}</span>
            </div>

            {/* Main Interactive CTA Button Area */}
            <div className="flex items-center gap-3.5 pt-4">
              <button
                onClick={() => onPlay(movie.id)}
                className="inline-flex items-center gap-2.5 gold-button px-8 py-4 rounded-xl text-sm tracking-wider uppercase transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Lire le film
              </button>

              <button
                onClick={onToggleBookmark}
                className={`inline-flex items-center justify-center p-4 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                  isBookmarked
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                    : "bg-neutral-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-white"
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
