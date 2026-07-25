const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `        Object.keys(parsed).forEach(k => {
           if (typeof parsed[k] === 'number') newProgressData[k] = parsed[k];
           else if (parsed[k] && parsed[k].currentTime !== undefined) {
             const duration = parsed[k].duration || 0;
             newProgressData[k] = duration > 0 ? (parsed[k].currentTime / duration) : (parsed[k].currentTime > 0 ? 0.5 : 0);
           } else if (parsed[k] && parsed[k].duration) {
             newProgressData[k] = parsed[k].currentTime / parsed[k].duration;
           }
        });`;

const replacement1 = `        Object.keys(parsed).forEach(k => {
           if (typeof parsed[k] === 'number') newProgressData[k] = parsed[k];
           else if (parsed[k] && parsed[k].type === "tv" && parsed[k].show_progress) {
             const s = parsed[k].last_season_watched || 1;
             const e = parsed[k].last_episode_watched || 1;
             const epProg = parsed[k].show_progress[\`s\${s}e\${e}\`];
             if (epProg && epProg.progress) {
                 const duration = epProg.progress.duration || 0;
                 newProgressData[k] = duration > 0 ? (epProg.progress.watched / duration) : (epProg.progress.watched > 0 ? 0.5 : 0);
             }
           }
           else if (parsed[k] && parsed[k].currentTime !== undefined) {
             const duration = parsed[k].duration || 0;
             newProgressData[k] = duration > 0 ? (parsed[k].currentTime / duration) : (parsed[k].currentTime > 0 ? 0.5 : 0);
           } else if (parsed[k] && parsed[k].duration) {
             newProgressData[k] = parsed[k].currentTime / parsed[k].duration;
           }
        });`;

content = content.replace(target1, replacement1);
content = content.replace(target1, replacement1); // Replace the second instance as well

// Fix history ordering
const historyTarget = `  const handleAddToHistory = (movieID: string) => {
    if (!history.includes(movieID)) {
      const updated = [movieID, ...history].slice(0, 10); // Keep last 10
      setHistory(updated);
      localStorage.setItem("classico_history", JSON.stringify(updated));
    }
  };`;
const historyReplacement = `  const handleAddToHistory = (movieID: string) => {
    const updated = [movieID, ...history.filter(id => id !== movieID)].slice(0, 15);
    setHistory(updated);
    localStorage.setItem("classico_history", JSON.stringify(updated));
  };`;

content = content.replace(historyTarget, historyReplacement);
fs.writeFileSync('src/App.tsx', content);

console.log('done progress');
