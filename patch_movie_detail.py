import re

with open("src/components/MovieDetailView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add isComingSoon variable
content = content.replace(
    'const { movie, onClose, onPlay, isBookmarked, onToggleBookmark, scrollY } = props;',
    'const { movie, onClose, onPlay, isBookmarked, onToggleBookmark, scrollY } = props;\n  const isComingSoon = ["obsession", "devil-wears-prada-2", "backrooms", "michael", "the-matrix"].includes(movie.id);'
)

# Replace the first Play button block
old_play_block = """              {movie.isJellyfin ? (
              <button
                onClick={() => onPlay(movie.id)}
                className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
              >
                <Play className="w-4 h-4 fill-current" />
                Play
              </button>
            ) : (
              <div className="inline-flex items-center gap-2.5 bg-neutral-900/60 border border-zinc-800 text-zinc-500 px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase font-bold cursor-not-allowed">
                <span className="whitespace-nowrap">Non dispo sur Jellyfin</span>
              </div>
            )}"""

new_play_block = """              {movie.isJellyfin ? (
              <button
                onClick={() => onPlay(movie.id)}
                className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
              >
                <Play className="w-4 h-4 fill-current" />
                Play
              </button>
            ) : isComingSoon ? (
              <div className="inline-flex items-center gap-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase font-bold">
                <span className="whitespace-nowrap">Coming Soon</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2.5 bg-neutral-900/60 border border-zinc-800 text-zinc-500 px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase font-bold cursor-not-allowed">
                <span className="whitespace-nowrap">Non dispo sur Jellyfin</span>
              </div>
            )}"""

content = content.replace(old_play_block, new_play_block)


old_small_play_block = """                        {movie.isJellyfin ? (
                          <button
                            onClick={() => onPlay(movie.id)}
                            className="bg-zinc-900 hover:bg-[#f4ecd8] hover:text-black border border-zinc-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer"
                          >
                            Play Full Movie
                          </button>
                        ) : null}"""

new_small_play_block = """                        {movie.isJellyfin ? (
                          <button
                            onClick={() => onPlay(movie.id)}
                            className="bg-zinc-900 hover:bg-[#f4ecd8] hover:text-black border border-zinc-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer"
                          >
                            Play Full Movie
                          </button>
                        ) : isComingSoon ? (
                          <span className="text-amber-400 font-mono text-[10px] uppercase font-bold px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20">Coming Soon</span>
                        ) : null}"""

content = content.replace(old_small_play_block, new_small_play_block)

with open("src/components/MovieDetailView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("MovieDetailView patched")
