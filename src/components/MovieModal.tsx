import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Play, Star, Clock, User, Film, Info, 
  Volume2, VolumeX, Pause, RotateCcw, Captions,
  Maximize2, Check, Plus, AlertCircle, Sparkles, ArrowLeft, Loader2
} from "lucide-react";
import { Movie } from "../data";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  startAsPlaying?: boolean;
  onPlay: (id: string) => void;
}

export default function MovieModal({ 
  movie, 
  onClose, 
   
  
  startAsPlaying = false,
  onPlay 
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
            onClick={onClose}
            className="absolute top-4 left-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Top Hero Section */}
          <div className="relative w-full h-64 sm:h-96 md:h-[400px]">
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            {/* Title & Play Button Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <motion.h2 
                  layoutId={`title-${movie.id}`}
                  className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                >
                  {movie.title}
                </motion.h2>
                <p className="text-amber-400 font-mono text-sm tracking-widest drop-shadow-md">
                  {movie.director ? movie.director : "Unknown Director"} &bull; {movie.year}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay(movie.id)}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-bold font-display uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {checkingJellyfin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                      Loading
                    </>
                  ) : (
                    "Play Now"
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
                      Main Cast
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
                    Technical Sheet
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
                      <span className="text-white font-semibold font-display text-base">{movie.director || "Unknown Director"}</span>
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
                        {(Array.isArray(movie.genre) ? movie.genre : []).map((g, idx) => (
                          <span key={idx} className="whitespace-nowrap bg-zinc-800/60 text-zinc-300 text-[11px] font-mono px-2 py-1 md:px-2.5 md:py-1 rounded-md border border-zinc-700/30">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
