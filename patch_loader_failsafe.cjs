const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Add an independent fail-safe timeout effect
const searchEffect = '  // 5. VIDEO SOURCE TRANSITION MANAGER WITH SEAMLESS HLS.JS INTEGRATION';
const failsafeEffect = `  // FAIL-SAFE LOADER CLEAR
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsStreamLoading(false);
      setIsIframeLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [movieId]);

  // 5. VIDEO SOURCE TRANSITION MANAGER WITH SEAMLESS HLS.JS INTEGRATION`;

code = code.replace(searchEffect, failsafeEffect);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched loader fail-safe");
