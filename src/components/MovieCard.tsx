import React from "react";
import { Star, Play, Clock } from "lucide-react";
import { Movie } from "../data";

interface MovieCardProps {
  key?: string;
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  layoutId?: string;
}

export default function MovieCard({ movie, onSelect, onPlay }: MovieCardProps) {
  return (
    <div
      id={`movie-card-${movie.id}`}
      style={{
        "--hover-glow": `${movie.accentHex || "#e5e7eb"}40`
      } as React.CSSProperties}
      className="relative flex-none w-[170px] sm:w-[210px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-neutral-900 border border-neutral-800/80 transition-[transform,box-shadow,opacity] duration-300 ease-out will-change-transform hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.8),0_0_15px_2px_var(--hover-glow)]"
      onClick={() => onSelect(movie)}
    >
      {/* Cinematic Poster Image or Gradient Placeholder */}
      <div className="absolute inset-0 select-none">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fail-safe fallback if image load fails
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        
        {/* Fallback & overlay styling wrapper */}
        <div className={`absolute inset-0 bg-gradient-to-br ${movie.gradient || 'from-zinc-900 to-neutral-950'} p-4 flex flex-col justify-between ${movie.posterUrl ? 'bg-black/40 backdrop-blur-3xs bg-opacity-40 hover:bg-opacity-10' : ''}`} style={movie.posterUrl ? { background: 'linear-gradient(to top, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)' } : {}}>
          {/* Top Vignette Accent and Symbol */}
          <div className="flex justify-end items-start">
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400/80 bg-black/40 px-2 py-0.5 rounded-full border border-zinc-800/50">
              {movie.year}
            </span>
          </div>

          {/* Poster Visual Content Placeholder (only show if no real poster image loaded) */}
          {!movie.posterUrl && (
            <div className="flex flex-col items-center justify-center flex-grow py-4 text-center">
              {/* Faux Poster Artwork Emblem */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-black/30 border border-white/5 group-hover:border-white/20 transition-all duration-300 shadow-inner">
                <span className="text-xl font-bold tracking-tighter text-white/40 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-300">C</span>
              </div>
            </div>
          )}
          {movie.posterUrl && <div className="flex-grow" />}

          {/* Movie Title & Bottom Info */}
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-widest font-extrabold bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {movie.director ? movie.director.split(' ').pop() : 'Direct'}
            </p>
            <h3 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-tight text-white leading-tight line-clamp-2 drop-shadow-lg">
              {movie.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Glossy Reflection Overlay */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity duration-300" />

      {/* Elegant Hover Overlay with Extra Info */}
      <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 z-20">
        <div>
          <h4 className="text-sm sm:text-base font-display font-extrabold text-white uppercase tracking-tight leading-snug line-clamp-3 mt-1">
            {movie.title}
          </h4>
          <p className="text-[11px] font-mono mt-1.5 font-bold bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent">{movie.director}</p>
          <p className="text-xs text-zinc-300 line-clamp-3 sm:line-clamp-4 mt-3 leading-relaxed text-left font-sans italic">
            "{movie.tagline || movie.description}"
          </p>
        </div>

        <div className="space-y-3">
          {/* Specs Row */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-3">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <strong className="text-white font-bold">{movie.rating}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {movie.duration}
            </span>
          </div>

          {/* Quick Play Action */}
          <button
            id={`quick-play-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie);
            }}
            className="w-full flex items-center justify-center gap-2 gold-button py-2 rounded-lg text-xs transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Lancer
          </button>
        </div>
      </div>
    </div>
  );
}
