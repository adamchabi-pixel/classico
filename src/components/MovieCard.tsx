import React from "react";
import { Star, Play, Clock } from "lucide-react";
import { Movie } from "../data";

interface MovieCardProps {
  key?: string;
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  layoutId?: string;
  progressPercent?: number; // Optional progress (0-1)
  trendingIndex?: number;
}

export default function MovieCard({ movie, onSelect, onPlay, progressPercent, trendingIndex }: MovieCardProps) {
  return (
    <div
      id={`movie-card-${movie.id}`}
      style={{
        "--hover-glow": `${movie.accentHex || "#e5e7eb"}40`
      } as React.CSSProperties}
      className="relative w-full h-full cursor-pointer group transition-all duration-300 ease-out will-change-transform hover:scale-[1.03]"
      onClick={() => onSelect(movie)}
    >
      {/* Poster Container */}
      <div className="absolute inset-0 z-10 bg-neutral-900 border border-neutral-800/80 rounded-xl overflow-hidden group-hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8),0_0_15px_2px_var(--hover-glow)]">
        {/* Cinematic Poster Image or Gradient Placeholder */}
        <div className="absolute inset-0 select-none">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          
          <div className={`absolute inset-0 bg-gradient-to-br ${movie.gradient || 'from-zinc-900 to-neutral-950'} p-4 flex flex-col justify-between ${movie.posterUrl ? 'bg-black/40 backdrop-blur-3xs bg-opacity-40 hover:bg-opacity-10' : ''}`} style={movie.posterUrl ? { background: 'linear-gradient(to top, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)' } : {}}>
            <div className="flex justify-end items-start">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400/80 bg-black/40 px-2 py-0.5 rounded-full border border-zinc-800/50">
                {movie.year}
              </span>
            </div>
            {!movie.posterUrl && (
              <div className="flex flex-col items-center justify-center flex-grow py-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-black/30 border border-white/5 group-hover:border-white/20 transition-all duration-300 shadow-inner">
                  <span className="text-xl font-bold tracking-tighter text-white/40 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-300">C</span>
                </div>
              </div>
            )}
            {movie.posterUrl && <div className="flex-grow" />}
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest font-extrabold bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {movie.director && movie.director !== "Unknown" ? movie.director.split(' ').pop() : (movie.year || 'Film')}
              </p>
              <h3 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-tight text-white leading-tight line-clamp-2 drop-shadow-lg">
                {movie.title}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Glossy Reflection Overlay */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Shine effect (Glass reflection) */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute top-0 left-[-150%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transition-all duration-[800ms] ease-in-out group-hover:left-[200%]" />
        </div>
        
        {/* Progress Bar */}
        {typeof progressPercent === 'number' && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-zinc-800 z-30">
            <div 
              className="h-full bg-amber-500 rounded-r-sm"
              style={{ width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Trending Number Indicator - positioned ON TOP of the right edge */}
      {trendingIndex !== undefined && (
        <div className={`absolute -bottom-1 sm:-bottom-2 ${trendingIndex === 1 ? "-right-6 sm:-right-10" : "-right-8 sm:-right-12"} z-50 font-cinzel font-black italic gold-metallic-text text-transparent bg-clip-text select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300 origin-bottom-right pr-3 pb-2`}
             style={{ 
               fontSize: "clamp(5.5rem, 8vw, 9rem)", 
               lineHeight: "0.8"
             }}>
          {trendingIndex}
        </div>
      )}
    </div>
  );
}
