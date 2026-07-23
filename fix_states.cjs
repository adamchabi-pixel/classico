const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const statesToInject = `
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [routeScrollPositions, setRouteScrollPositions] = useState<Record<string, number>>({});
  const [tmdbCache, setTmdbCache] = useState<any[]>([]);
  
  const jellyfinMovies: any[] = [];
  const jellyfinHeroMovies: any[] = [];
  const jellyfinHeroMovie: any = null;
  const useTextTitleForJellyfinHero = false;
  const setUseTextTitleForJellyfinHero = () => {};
  const isJellyfinLoading = false;
  const jellyfinConfig = null;

  const navigateTo = (path: string) => {
    setRouteScrollPositions(prev => ({ ...prev, [activeTab]: window.scrollY }));
    window.history.pushState({}, "", path);
    setRoutePath(path);
    if (path === "/") setActiveTab("accueil");
    else if (path === "/collections") setActiveTab("collections");
    else if (path === "/profil") setActiveTab("profil");
    else if (path.startsWith("/collection/")) {
      setSelectedCollectionId(path.split("/")[2]);
      setActiveTab("collection-detail");
    }
    else if (path.startsWith("/player/")) {
      setActiveTab("player");
    }
    else if (path.startsWith("/movie/")) {
      setActiveTab("movie");
    }
    window.scrollTo(0, 0);
  };
`;

code = code.replace(/const \[isScrolled, setIsScrolled\] = useState\(false\);/, 'const [isScrolled, setIsScrolled] = useState(false);\n' + statesToInject);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Restored states");
