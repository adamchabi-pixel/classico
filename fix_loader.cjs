const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target1 = `        {/* Unified High-End Loader Overlay */}
        {(isLoading || isStreamLoading || isBuffering) && !videoError && adClicks >= 2 && (`;

const replacement1 = `        {/* Unified High-End Loader Overlay */}
        {(isLoading || isStreamLoading || isBuffering) && !videoError && adClicks >= 2 && !playbackInfo?.isIframeEmbed && (`;

const target2 = `  // 4. SYNC PLAY ACTIONS WITH HTML5 VIDEO ELEMENT (For subsequent user play/pause button actions)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;`;

const replacement2 = `  // 4. SYNC PLAY ACTIONS WITH HTML5 VIDEO ELEMENT (For subsequent user play/pause button actions)
  useEffect(() => {
    if (playbackInfo?.isIframeEmbed) return;
    const video = videoRef.current;
    if (!video) return;`;

const target3 = `      {/* AD WALL OVERLAY */}
      <AnimatePresence>
        {adClicks < 2 && (`;

const replacement3 = `      {/* AD WALL OVERLAY */}
      <AnimatePresence>
        {adClicks < 2 && !playbackInfo?.isIframeEmbed && (`;

if (code.includes(target1)) code = code.replace(target1, replacement1);
if (code.includes(target2)) code = code.replace(target2, replacement2);
if (code.includes(target3)) code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code);
