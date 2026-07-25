const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const navigateTo = (path: string) => {
    if (path === "/" || path.startsWith("/movie/")) {
      loadProgress();
    }`;
const replacement = `  const loadProgress = () => {
    const savedProgress = localStorage.getItem("classico_progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        const newProgressData: Record<string, number> = {};
        Object.keys(parsed).forEach(k => {
           let pct = 0;
           if (typeof parsed[k] === 'number') pct = parsed[k];
           else if (parsed[k] && parsed[k].type === "tv" && parsed[k].show_progress) {
             const s = parsed[k].last_season_watched || 1;
             const e = parsed[k].last_episode_watched || 1;
             const epProg = parsed[k].show_progress[\`s\${s}e\${e}\`];
             if (epProg && epProg.progress) {
                 const duration = epProg.progress.duration || 0;
                 pct = duration > 0 ? (epProg.progress.watched / duration) : (epProg.progress.watched > 0 ? 0.5 : 0);
             }
           }
           else if (parsed[k] && parsed[k].currentTime !== undefined) {
             const duration = parsed[k].duration || 0;
             pct = duration > 0 ? (parsed[k].currentTime / duration) : (parsed[k].currentTime > 0 ? 0.5 : 0);
           } else if (parsed[k] && parsed[k].duration) {
             pct = parsed[k].currentTime / parsed[k].duration;
           }
           
           newProgressData[k] = pct;
           if (!k.endsWith("-tv")) {
               newProgressData[k + "-tv"] = pct;
           }
           if (k.endsWith("-tv")) {
               newProgressData[k.replace("-tv", "")] = pct;
           }
        });
        setProgressData(newProgressData);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const navigateTo = (path: string) => {
    if (path === "/" || path.startsWith("/movie/")) {
      loadProgress();
    }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('done load progress');
