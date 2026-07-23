const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  'import CinemaPlayerView from "./components/CinemaPlayerView";',
  'const CinemaPlayerView = React.lazy(() => import("./components/CinemaPlayerView"));'
);

code = code.replace(
  'import MovieModal from "./components/MovieModal";',
  'const MovieModal = React.lazy(() => import("./components/MovieModal"));'
);

code = code.replace(
  '<MovieModal ',
  '<React.Suspense fallback={<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"><p className="text-amber-400 font-mono text-sm animate-pulse">Loading Interface...</p></div>}><MovieModal '
);

code = code.replace(
  '          onClose={() => handleCloseMovie()}',
  '          onClose={() => handleCloseMovie()}\\n        /></React.Suspense>'
);

// We need to wrap CinemaPlayerView as well
// Let's find it
const oldCinema = `<CinemaPlayerView
          movieId={pId}
          onClose={() => navigateTo("/movie/" + pId)}
          forceJellyfin={false}
        />`;

const newCinema = `<React.Suspense fallback={<div className="fixed inset-0 z-50 bg-black flex items-center justify-center"><p className="text-amber-400 font-mono text-sm animate-pulse">Initializing Player...</p></div>}>
          <CinemaPlayerView
            movieId={pId}
            onClose={() => navigateTo("/movie/" + pId)}
            forceJellyfin={false}
          />
        </React.Suspense>`;

code = code.replace(oldCinema, newCinema);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched lazy loading in App.tsx");
