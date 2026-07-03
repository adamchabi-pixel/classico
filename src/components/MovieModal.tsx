import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Play, Star, Clock, User, Film, Info, 
  Volume2, VolumeX, Pause, RotateCcw, Captions,
  Maximize2, Check, Plus, AlertCircle, Sparkles, ArrowLeft
} from "lucide-react";
import { Movie } from "../data";
import VideoPlayer from "./VideoPlayer";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  startAsPlaying?: boolean;
}

export default function MovieModal({ 
  movie, 
  onClose, 
  isBookmarked, 
  onToggleBookmark,
  startAsPlaying = false 
}: MovieModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [jellyfinStreamUrl, setJellyfinStreamUrl] = useState<string | null>(null);
  const [checkingJellyfin, setCheckingJellyfin] = useState(false);

  // Sync Jellyfin connection matching to local curated items
  useEffect(() => {
    if (!movie) return;
    
    // Reset play and checking states
    setIsPlaying(startAsPlaying);
    setJellyfinStreamUrl(null);
    setCheckingJellyfin(false);

    // If movie already has a direct streamUrl (comes from our library section)
    if (movie.streamUrl) {
      setJellyfinStreamUrl(movie.streamUrl);
      return;
    }

    // Search Jellyfin matching titles in background
    const searchMatchInJellyfin = async () => {
      setCheckingJellyfin(true);
      try {
        const configRes = await fetch("/api/jellyfin/config");
        if (!configRes.ok) return;
        const configData = await configRes.json();
        
        if (configData.configured) {
          const searchRes = await fetch(`/api/jellyfin/search?title=${encodeURIComponent(movie.title)}`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.success && searchData.movies && searchData.movies.length > 0) {
              // Get the top matched result
              const firstMatch = searchData.movies[0];
              setJellyfinStreamUrl(firstMatch.streamUrl);
            }
          }
        }
      } catch (err) {
        console.error("Jellyfin match background error:", err);
      } finally {
        setCheckingJellyfin(false);
      }
    };

    searchMatchInJellyfin();
  }, [movie, startAsPlaying]);

  if (!movie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Dark Cinematic Backdrop Mask */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Outer Container */}
        <motion.div
          layoutId={`card-container-${movie.id}`}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`relative w-full max-w-4xl bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 max-h-[92vh] flex flex-col z-10`}
        >
          {/* Top Back Button */}
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-40 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white hover:text-amber-400 p-2.5 rounded-full border border-neutral-800/50 hover:border-amber-400/50 transition-all duration-200 active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {!isPlaying ? (
            /* ========================================================== */
            /* VIEW 1: MOVIE DESCRIPTION & METADATA                        */
            /* ========================================================== */
            <div className="overflow-y-auto custom-scrollbar flex-grow">
              {/* Grand Banner Backdrop of the Movie */}
              <div id={`modal-banner-${movie.id}`} className={`relative h-[280px] sm:h-[400px] w-full bg-gradient-to-r ${movie.gradient} flex items-end p-6 sm:p-10 overflow-hidden`}>
                
                {/* Decorative glowing spotlight lines */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
                <div className="absolute inset-0 banner-overlay-bottom z-10" />
                <div className="absolute inset-0 banner-overlay-side z-10" />

                {/* Big Floating Symbol Emblem */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl sm:text-9xl opacity-15 filter blur-xs select-none pointer-events-none">
                  {movie.symbol}
                </div>

                <div className="relative z-20 max-w-2xl space-y-3">
                  
                  {/* Mega Metallic Title */}
                  <h1 className="text-3xl sm:text-5xl font-forum font-bold text-white uppercase tracking-wider leading-none drop-shadow-md">
                    {movie.title}
                  </h1>

                  {/* Ligne de Métadonnées Unique et Propre */}
                  <div className="flex flex-row items-center gap-3 text-zinc-300 font-sans text-xs sm:text-sm font-medium pt-1">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{movie.rating}/10</span>
                    </div>
                    <span className="opacity-40">•</span>
                    <span>{movie.year}</span>
                    <span className="opacity-40">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{movie.duration}</span>
                    </div>
                  </div>

                  {/* Petit Bouton de Lecture Doré et Liste */}
                  <div className="flex flex-row items-center gap-3 pt-2">
                    <button
                      id="play-movie-trigger"
                      onClick={() => {
                        (window as any).moviePlayClickTime = performance.now();
                        setIsPlaying(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 gold-button px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play
                    </button>

                    <button
                      id="toggle-watchlist-trigger"
                      onClick={onToggleBookmark}
                      className={`inline-flex items-center justify-center p-2.5 rounded-full border transition-all duration-200 active:scale-95 ${
                        isBookmarked
                          ? "bg-amber-400/10 border-amber-400/50 text-amber-400"
                          : "bg-black/40 border-white/20 hover:bg-black/60 text-zinc-300 hover:text-white"
                      }`}
                      title={isBookmarked ? "In My Watchlist" : "Add to Watchlist"}
                    >
                      {isBookmarked ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Movie Details Block */}
              <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left bg-stone-950">
                
                {/* Left Column: Description */}
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-forum font-bold text-[#f4ecd8] tracking-wide uppercase flex items-center gap-1.5 border-b border-zinc-800/80 pb-2">
                      <Info className="w-4 h-4 text-[#f4ecd8] shadow-[0_0_8px_rgba(244,236,216,0.3)]" />
                      Synopsis
                    </h3>
                    <p className="text-zinc-300 text-base leading-relaxed font-sans first-letter:text-3xl first-letter:font-bold first-letter:text-[#f4ecd8] first-letter:mr-2 first-letter:float-left">
                      {movie.description}
                    </p>
                  </div>

                  {/* Cast Card Grid */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-[#f4ecd8] font-bold">
                      Cast principale
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {movie.cast.map((actor, idx) => (
                        <div key={idx} className="bg-neutral-900/60 border border-zinc-800/40 rounded-lg p-3 text-center hover:bg-neutral-900 transition-colors duration-200">
                          <User className="w-4 h-4 text-zinc-500 mx-auto mb-1.5" />
                          <p className="text-xs text-white font-medium truncate">{actor}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Key Role</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Spec Sheet */}
                <div className="space-y-6 bg-neutral-900/40 p-5 sm:p-6 rounded-xl border border-neutral-800/60">
                  <h3 className="text-lg font-forum font-bold text-white tracking-wide uppercase pb-2 border-b border-zinc-800/50">
                    Fiche Technique
                  </h3>

                  <div className="space-y-4 text-sm">
                    {/* Rating Banner */}
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-medium">Classico Rating</span>
                      <span className="flex items-center gap-1.5 font-mono text-white text-base font-bold bg-[#f4ecd8]/10 px-2.5 py-1 rounded-md border border-[#f4ecd8]/30 shadow-md">
                        <Star className="w-4 h-4 text-[#f4ecd8] fill-[#f4ecd8]" />
                        {movie.rating} <span className="text-zinc-500 text-xs">/10</span>
                      </span>
                    </div>

                    {/* Director */}
                    <div className="space-y-1 py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 block text-xs">Director</span>
                      <span className="text-white font-semibold font-display text-base">{movie.director}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Duration</span>
                      <span className="flex items-center gap-1.5 text-zinc-200 font-mono">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {movie.duration}
                      </span>
                    </div>

                    {/* Year */}
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Release Year</span>
                      <span className="text-zinc-200 font-semibold font-mono">{movie.year}</span>
                    </div>

                    {/* Genre Tags */}
                    <div className="space-y-2 pt-1">
                      <span className="text-zinc-400 block text-xs">Genres</span>
                      <div className="flex overflow-x-auto no-scrollbar flex-nowrap md:flex-wrap gap-1.5 pb-1 md:pb-0">
                        {movie.genre.map((g, idx) => (
                          <span key={idx} className="whitespace-nowrap bg-zinc-800/60 text-zinc-300 text-[11px] font-mono px-2 py-1 md:px-2.5 md:py-1 rounded-md border border-zinc-700/30">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <VideoPlayer
              streamUrl={jellyfinStreamUrl}
              movieTitle={movie.title}
              movieSymbol={movie.symbol}
              movieGradient={movie.gradient}
              movieDuration={movie.duration}
              onCloseView={() => setIsPlaying(false)}
              movieId={movie.id}
              isJellyfinMovie={!!jellyfinStreamUrl || !!movie.isJellyfin}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
