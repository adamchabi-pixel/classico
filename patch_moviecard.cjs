const fs = require('fs');
let content = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');

if (!content.includes('import { CheckCircle }')) {
    content = content.replace('import { Star, Play, Clock } from "lucide-react";', 'import { Star, Play, Clock, CheckCircle } from "lucide-react";');
}

const isWatchedHook = `
  const isWatched = React.useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
      const baseId = movie.id ? movie.id.replace(/-tv$/, "").replace(/-S\\d+E\\d+$/, "") : null;
      if (baseId && saved[baseId]) {
         if (movie.isTv) {
            // Only show checkmark on series if ALL episodes are watched or it's a series card. Let's just say if it's watched at all.
            return !!saved[baseId].last_season_watched;
         } else {
            // For movies
            return saved[baseId].progress > 300 || saved[baseId].progress > 0; // If they started it, consider it 'vu' as requested.
         }
      }
    } catch(e) {}
    return false;
  }, [movie.id, movie.isTv]);
`;

// Insert the hook inside the component
if (!content.includes('const isWatched = React.useMemo')) {
    content = content.replace(/const getSubtitle = \(\) => \{/, isWatchedHook + '\n  const getSubtitle = () => {');
}

// Add the green icon to the UI
const iconHtml = `
          {isWatched && (
             <div className="absolute top-2 right-2 z-30 bg-black/60 rounded-full p-1 backdrop-blur-sm border border-green-500/30">
               <CheckCircle className="w-4 h-4 text-green-500" />
             </div>
          )}
`;

if (!content.includes('text-green-500')) {
    content = content.replace(/\{movie\.posterUrl \? \(/, iconHtml + '\n          {movie.posterUrl ? (');
}

fs.writeFileSync('src/components/MovieCard.tsx', content);
