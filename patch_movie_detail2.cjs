const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

const importRegex = /import \{([^}]+)\} from 'lucide-react';/;
code = code.replace(importRegex, "import {$1, Info, Play} from 'lucide-react';");

// We need to inject the logic to read and write 'classico_tv_state'
// Let's add useEffect to read it.
const stateRegex = /const \[episodes, setEpisodes\] = React\.useState<any\[\]>\(\[\]\);/;
const newState = `const [episodes, setEpisodes] = React.useState<any[]>([]);
  const [lastWatched, setLastWatched] = React.useState<{season: number, episode: number} | null>(null);

  React.useEffect(() => {
    if (movie.isTv) {
      try {
        const tvState = JSON.parse(localStorage.getItem("classico_tv_state") || "{}");
        if (tvState[movie.id]) {
          setLastWatched(tvState[movie.id]);
          if (!selectedSeason || movie.seasons?.length && selectedSeason === movie.seasons[0].season_number) {
            setSelectedSeason(tvState[movie.id].season);
          }
        }
      } catch (e) {}
    }
  }, [movie.id, movie.isTv]);`;
code = code.replace(stateRegex, newState);

const handlePlayRegex = /const handlePlayEpisode = \(seasonNum: number, episodeNum: number\) => \{[\s\S]*?onPlay.*?;\s*\};/m;
const newHandlePlay = `const handlePlayEpisode = (seasonNum: number, episodeNum: number) => {
    try {
      const tvState = JSON.parse(localStorage.getItem("classico_tv_state") || "{}");
      tvState[movie.id] = { season: seasonNum, episode: episodeNum };
      localStorage.setItem("classico_tv_state", JSON.stringify(tvState));
      setLastWatched({ season: seasonNum, episode: episodeNum });
    } catch (e) {}
    onPlay(movie.id + "-S" + seasonNum + "E" + episodeNum);
  };`;
code = code.replace(handlePlayRegex, newHandlePlay);

// Now update the main play button
const playBtnRegex = /<button\s*onClick=\{[^}]*onPlay\(movie\.id \+ "-S" \+ selectedSeason \+ "E1"\)[^}]*\}\s*className="inline-flex items-center gap-2.5 gold-button[^"]*"\s*>\s*<Play className="w-4 h-4 fill-current" \/>\s*PLAY S0\{selectedSeason\}E01\s*<\/button>/m;

const newPlayBtn = `<button
                    onClick={() => {
                      const s = lastWatched ? lastWatched.season : (selectedSeason || 1);
                      const e = lastWatched ? lastWatched.episode : 1;
                      handlePlayEpisode(s, e);
                    }}
                    className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {lastWatched ? \`PLAY S\${String(lastWatched.season).padStart(2, '0')}E\${String(lastWatched.episode).padStart(2, '0')}\` : \`PLAY S\${String(selectedSeason || 1).padStart(2, '0')}E01\`}
                  </button>`;
code = code.replace(playBtnRegex, newPlayBtn);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView play state.");
