import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import https from "https";
import http from "http";
import { Transform } from "stream";

// Bypass strict SSL verification for personal Jellyfin connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Persistent Keep-Alive agents to drastically speed up video chunk loading and prevent buffering
const keepAliveHttpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 15000,
  maxSockets: 256,
  maxFreeSockets: 256,
});

const keepAliveHttpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 15000,
  maxSockets: 256,
  maxFreeSockets: 256,
  rejectUnauthorized: false,
});

import { importedMoviesData } from './src/data/imported_movies';
let globalImportedMovies = [...importedMoviesData];
function getGlobalImportedMovies() {
    const dbPath = path.join(process.cwd(), "imported_movies.json");
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        } catch (e) {
            console.error("Error reading imported_movies.json:", e);
        }
    }
    return [...importedMoviesData];
}


const app = express();
const PORT = 3000;
const CONFIG_PATH = path.join(process.cwd(), "jellyfin-config.json");

app.use(express.json());

// Content Security Policy && CORS middleware to ensure maximum security, CORS, and player compatibility
app.use((req, res, next) => {
  const config = getJellyfinConfig();
  let jellyfinOrigin = "";
  if (config && config.url) {
    try {
      jellyfinOrigin = new URL(config.url).origin;
    } catch (e) {
      // ignore
    }
  }

  // 1. CONTENT SECURITY POLICY (CSP)
  const scriptSrcs = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "blob:"
  ];
  if (jellyfinOrigin) {
    scriptSrcs.push(jellyfinOrigin);
  }

  const connectSrcs = [
    "'self'",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "blob:",
    "data:",
    "wss:",
    "ws:",
    "*"
  ];
  if (jellyfinOrigin) {
    connectSrcs.push(jellyfinOrigin);
  }

  const mediaSrcs = [
    "'self'",
    "blob:",
    "data:",
    "*"
  ];
  if (jellyfinOrigin) {
    mediaSrcs.push(jellyfinOrigin);
  }

  const imgSrcs = [
    "'self'",
    "data:",
    "blob:",
    "*"
  ];

  const styleSrcs = [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com"
  ];

  const fontSrcs = [
    "'self'",
    "data:",
    "https://fonts.gstatic.com"
  ];

  const frameAncestors = [
    "'self'",
    "https://*.google.com",
    "https://*.studio",
    "https://ai.studio",
    "https://*.run.app",
    "https://*.run.app:*",
    "https://ais-dev-eiu2arnymz2ba6xsvlwpuk-16665057717.us-west2.run.app",
    "https://ais-pre-eiu2arnymz2ba6xsvlwpuk-16665057717.us-west2.run.app"
  ];

  // Dynamically allow referer and origin in frame-ancestors to avoid any iframe sandbox block
  const refererHeader = req.headers.referer;
  if (refererHeader) {
    try {
      const parsedRef = new URL(refererHeader).origin;
      if (parsedRef && !frameAncestors.includes(parsedRef)) {
        frameAncestors.push(parsedRef);
      }
    } catch (e) {
      // ignore
    }
  }
  const originHeader = req.headers.origin;
  if (originHeader) {
    try {
      const parsedOrig = new URL(originHeader).origin;
      if (parsedOrig && !frameAncestors.includes(parsedOrig)) {
        frameAncestors.push(parsedOrig);
      }
    } catch (e) {
      // ignore
    }
  }

  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self' * data: blob: 'unsafe-inline' 'unsafe-eval'",
      `script-src ${scriptSrcs.join(" ")}`,
      `connect-src ${connectSrcs.join(" ")}`,
      `media-src ${mediaSrcs.join(" ")}`,
      `img-src ${imgSrcs.join(" ")}`,
      `style-src ${styleSrcs.join(" ")}`,
      `font-src ${fontSrcs.join(" ")}`,
      "worker-src 'self' blob:",
      `frame-ancestors ${frameAncestors.join(" ")}`
    ].join("; ")
  );

  // 2. CORS CONFIGURATION (Fix CORS && ERR_BLOCKED_BY_RESPONSE with ultimate credentials/origin support)
  let origin = req.headers.origin;
  if (!origin && req.headers.referer) {
    try {
      origin = new URL(req.headers.referer).origin;
    } catch (e) {
      // ignore
    }
  }
  if (!origin) {
    origin = "*";
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges, Content-Type");
  if (origin !== "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  
  // 3. CROSS ORIGIN RESOURCE / EMBEDDER POLICIES (Bypasses browser sandboxed iframe CORS restrictions)
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy-Report-Only", "require-corp");

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // 5. DEBUG MODE - Logs backend requests with thorough header profiling

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Helper to get Jellyfin config if it exists
function getJellyfinConfig() {
  return null;
}

// ------------------------------------------------------------------
// JELLYFIN SECURE BACKEND API ENDPOINTS
// ------------------------------------------------------------------

// 1. Get current connection status (Without leaking the sensitive API key!)
app.get("/api/jellyfin/config", (req, res) => {
  const config = getJellyfinConfig();
  if (config) {
    res.json({
      configured: true,
      url: config.url
    });
  } else {
    res.json({
      configured: false
    });
  }
});

// 2. Disconnect Jellyfin (Delete the local secure JSON file)
app.post("/api/disconnect", (req, res) => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Recalculate categories (Clear server-side query caches)
app.post("/api/recalculate", (req, res) => {
  try {
    apiCache.clear();
    if (fs.existsSync(MOVIES_CACHE_PATH)) {
      try { fs.unlinkSync(MOVIES_CACHE_PATH); } catch (e) {}
    }
    if (fs.existsSync(HERO_CACHE_PATH)) {
      try { fs.unlinkSync(HERO_CACHE_PATH); } catch (e) {}
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Save configuration && Test connection
app.post("/api/config", async (req, res) => {
  const { url, apiKey } = req.body;

  if (!url || !apiKey) {
    res.status(400).json({ success: false, error: "Veuillez fournir l'URL et la Clé API." });
    return;
  }

  // Clean trailing slashes
  let formattedUrl = url.trim();
  if (formattedUrl.endsWith("/")) {
    formattedUrl = formattedUrl.substring(0, formattedUrl.length - 1);
  }

  // Check if configuration is identical to avoid wiping caches and re-testing
  let isSameConfig = false;
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const oldConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      if (oldConfig.url === formattedUrl && oldConfig.apiKey === apiKey) {
        isSameConfig = true;
      }
    } catch (e) {}
  }

  if (isSameConfig) {
    res.json({
      success: true,
      url: formattedUrl
    });
    return;
  }

  try {
    // Attempt standard Jellyfin connection using System Info endpoint
    const testUrl = `${formattedUrl}/System/Info?api_key=${apiKey}`;
    const testResponse = await fetch(testUrl, {
      signal: AbortSignal.timeout(6000) // 6s timeout so server doesn't hang
    });

    if (!testResponse.ok) {
      res.status(400).json({ 
        success: false, 
        error: `Connexion refusée par le serveur (Code ${testResponse.status}). Vérifiez vos informations.` 
        });
      return;
    }

    // Save configurations securely on development/containered server disk
    try { fs.writeFileSync(CONFIG_PATH, JSON.stringify({ url: formattedUrl, apiKey }, null, 2));

     } catch (e) { console.warn("Could not write cache:", e.message); }
// Reset all old server caches immediately
    apiCache.clear();
    playbackCache.clear();
    cachedUserId = null;
    if (fs.existsSync(MOVIES_CACHE_PATH)) {
      try { fs.unlinkSync(MOVIES_CACHE_PATH); } catch (e) {}
    }
    if (fs.existsSync(HERO_CACHE_PATH)) {
      try { fs.unlinkSync(HERO_CACHE_PATH); } catch (e) {}
    }

    res.json({
      success: true,
      url: formattedUrl
    });
  } catch (err: any) {
    console.error("Jellyfin connection error:", err);
    res.status(500).json({ 
      success: false, 
      error: `Impossible de contacter le serveur à l'adresse fournie. Détail : ${err.message}` 
    });
  }
});

// --- IN-MEMORY CACHE FOR JELLYFIN METADATA ---
interface CacheEntry {
  data: any;
  expiry: number;
}
let cachedUserId: string | null = null;
const apiCache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
  const entry = apiCache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data;
  }
  return null;
}

function setCached(key: string, data: any, ttlMs: number) {
  apiCache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}

// Ensure local directory for poster images cache exists on disks
const IMAGE_CACHE_DIR = path.join(process.cwd(), ".image-cache");
if (!fs.existsSync(IMAGE_CACHE_DIR)) {
  try { fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
 } catch (e) { }}

// Format Jellyfin raw metadata with secure, cached proxy URLs instead of exposing the secret api key
function formatJellyfinItem(item: any, serverUrl: string, apiKey: string) {
  const ticksToMinutes = (ticks: number) => {
    if (!ticks) return "0 min";
    // 1 tick = 100ns = 1e-7 seconds
    const minutes = Math.round(ticks / 10000000 / 60);
    return `${minutes} min`;
  };

  return {
    isCatalog: true,
    id: item.Id,
    title: item.Name || "Untitled Movie",
    originalTitle: item.OriginalTitle || "",
    providerIds: item.ProviderIds || {},
    studios: item.Studios?.map((s: any) => s.Name) || [],
    year: item.ProductionYear || new Date().getFullYear(),
    duration: ticksToMinutes(item.RunTimeTicks),
    rating: item.CommunityRating ? item.CommunityRating.toFixed(1) : "N/A",
    genre: item.Genres || [],
    description: item.Overview || "No synopsis available for this title on Jellyfin.",
    director: item.People?.find((p: any) => p.Type === "Director")?.Name || "Unknown Director",
    cast: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 4).map((p: any) => p.Name) || [],
    // Secure proxy routes with automatic size optimization and browser long-term cache headers
    posterUrl: `/api/jellyfin/image/${item.Id}/Primary`,
    backdropUrl: `/api/jellyfin/image/${item.Id}/Backdrop`,
    // Proxy stream route
    streamUrl: `${serverUrl}/Videos/${item.Id}/stream.mp4?Static=true&api_key=${apiKey}`,
    tagline: item.Taglines && item.Taglines.length > 0 ? item.Taglines[0] : "Available on your server",
    symbol: "📡🎬",
    accentColor: "text-[#ca8a04] border-[#ca8a04]/30 bg-[#ca8a04]/5",
    accentHex: "#ca8a04"
  };
}

// Background image pre-warmer to populate .image-cache with WebP posters and backdrops asynchronously
async function prewarmImageCache(movies: any[]) {
  if (!movies || movies.length === 0) return;
  
  const config = getJellyfinConfig();
  if (!config) return;

  // Use a tiny pool to fetch images concurrently in the background without blocking the node event loop
  const limit = 3;
  let index = 0;

  async function worker() {
    while (index < movies.length) {
      const movie = movies[index++];
      if (!movie || !movie.id) continue;

      // 1. Primary Poster
      const primaryKey = `${movie.id}-Primary.webp`;
      const primaryPath = path.join(IMAGE_CACHE_DIR, primaryKey);
      if (!fs.existsSync(primaryPath)) {
        try {
          const url = `${config.url}/Items/${movie.id}/Images/Primary?maxWidth=340&quality=80&format=webp&api_key=${config.apiKey}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
          if (res.ok) {
            const buffer = Buffer.from(await res.arrayBuffer());
            await fs.promises.writeFile(primaryPath, buffer);
          }
        } catch (e: any) {
          // silent ignore
        }
      }
    }
  }

  for (let i = 0; i < limit; i++) {
    worker();
  }
}

// Persistent JSON file cache paths for immediate loading upon startup
const MOVIES_CACHE_PATH = path.join(process.cwd(), "jellyfin-movies-cache.json");
const HERO_CACHE_PATH = path.join(process.cwd(), "jellyfin-hero-cache.json");
const USERID_CACHE_PATH = path.join(process.cwd(), "jellyfin-userid-cache.json");

// Background fetch lock variables to avoid duplicate API requests
let isFetchingMovies = false;
let isFetchingHero = false;

// Background fetch for movies library
async function backgroundFetchMovies(config: any) {
  if (isFetchingMovies) return;
  isFetchingMovies = true;
  try {
    const formattedMovies = await fetchAndCacheMovies(config);
    // Update in-memory cache
    setCached("movies-list", formattedMovies, 3600000); // 1 hour fresh
    // Write to persistent disk cache
    try { fs.writeFileSync(MOVIES_CACHE_PATH, JSON.stringify(formattedMovies, null, 2), "utf-8");
    
     } catch (e) { console.warn("Could not write cache:", e.message); }
// Start asynchronous image cache pre-warming
    prewarmImageCache(formattedMovies);
  } catch (err: any) {
    console.error("[BG FETCH] Background fetch for movies failed:", err);
  } finally {
    isFetchingMovies = false;
  }
}

// Background fetch for hero banner collection
async function backgroundFetchHero(config: any) {
  if (isFetchingHero) return;
  isFetchingHero = true;
  try {
    const formattedHeroes = await fetchAndCacheHero(config);
    // Update in-memory cache
    setCached("hero-list", formattedHeroes, 3600000); // 1 hour fresh
    // Write to persistent disk cache
    try { fs.writeFileSync(HERO_CACHE_PATH, JSON.stringify(formattedHeroes, null, 2), "utf-8");
    
     } catch (e) { console.warn("Could not write cache:", e.message); }
// Start asynchronous image cache pre-warming
    prewarmImageCache(formattedHeroes);
  } catch (err: any) {
    console.error("[BG FETCH] Background fetch for hero failed:", err);
  } finally {
    isFetchingHero = false;
  }
}

// Helper to resolve current UserId from Jellyfin config
async function resolveUserId(config: any): Promise<string> {
  if (!config) return "";

  if (cachedUserId) return cachedUserId;

  if (fs.existsSync(USERID_CACHE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(USERID_CACHE_PATH, "utf-8"));
      if (data.userId && data.url === config.url && data.apiKey === config.apiKey) {
        cachedUserId = data.userId;
        return cachedUserId;
      }
    } catch (e) {}
  }
  
  // 1. Try /Users/me which works for both admin and non-admin users with their token!
  try {
    const meResp = await fetch(`${config.url}/Users/me`, {
      headers: {
        "X-Emby-Token": config.apiKey,
        "Accept": "application/json"
      }
    });
    if (meResp.ok) {
      const meData = await meResp.json();
      if (meData && meData.Id) {
        cachedUserId = meData.Id;
        try { try { fs.writeFileSync(USERID_CACHE_PATH, JSON.stringify({ userId: meData.Id, url: config.url, apiKey: config.apiKey }));  } catch (e) { console.warn("Could not write cache:", e.message); }} catch (e) {}
        return meData.Id;
      }
    } else {
    }
  } catch (err: any) {
  }

  // 2. If not found, try /Users list as fallback
  try {
    const usersResp = await fetch(`${config.url}/Users`, {
      headers: {
        "X-Emby-Token": config.apiKey,
        "Accept": "application/json"
      }
    });
    if (usersResp.ok) {
      const usersData = await usersResp.json();
      if (usersData && usersData.length > 0 && usersData[0].Id) {
        return usersData[0].Id;
      }
    } else {
    }
  } catch (err: any) {
  }

  return "";
}

// Helper to fetch and format movie library items
async function fetchAndCacheMovies(config: any, isFastMode: boolean = false): Promise<any[]> {
  const userId = await resolveUserId(config);

  const fields = isFastMode
    ? "Overview,Genres,CommunityRating,ProductionYear,RunTimeTicks,OriginalTitle,Studios"
    : "Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios";

  const libraryUrl = userId 
    ? `${config.url}/Users/${userId}/Items?recursive=true&includeItemTypes=Movie,Series&fields=${fields}&limit=3000&api_key=${config.apiKey}`
    : `${config.url}/Items?recursive=true&includeItemTypes=Movie,Series&fields=${fields}&limit=3000&api_key=${config.apiKey}`;
    
  const response = await fetch(libraryUrl, {
    headers: {
      "X-Emby-Token": config.apiKey,
      "Accept": "application/json"
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Impossible de lire la bibliothèque de médias. Status: ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 200)}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Le serveur Jellyfin a renvoyé une réponse invalide (HTML au lieu de JSON).");
  }

  const data: any = await response.json();
  const rawMovies = data.Items || [];

  const formatted = rawMovies.map((item: any) => formatJellyfinItem(item, config.url, config.apiKey));
  return await enrichWithTmdb(formatted, !isFastMode);
}


const TMDB_CACHE_PATH = path.join(process.cwd(), ".data", "tmdb_cache.json");

async function enrichWithTmdb(movies: any[], fetchMissing: boolean = false): Promise<any[]> {
  let tmdbCache: Record<string, any> = {};
  if (fs.existsSync(TMDB_CACHE_PATH)) {
    try { tmdbCache = JSON.parse(fs.readFileSync(TMDB_CACHE_PATH, "utf-8")); } catch(e) {}
  }
  
  let cacheModified = false;
  const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
  
  if (fetchMissing) {
    const missingTmdbIds = movies.filter(m => m.providerIds?.Tmdb && !tmdbCache[m.providerIds.Tmdb]).map(m => m.providerIds.Tmdb);
    if (missingTmdbIds.length > 0) {
      console.log(`[TMDB] Fetching data for ${missingTmdbIds.length} new movies...`);
      for (let i = 0; i < missingTmdbIds.length; i += 10) {
        const batch = missingTmdbIds.slice(i, i + 10);
        await Promise.all(batch.map(async (tmdbId) => {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=en-US`, {
              headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
            });
            if (res.ok) {
              tmdbCache[tmdbId] = await res.json();
              cacheModified = true;
            }
          } catch(e) {}
        }));
        if (i + 10 < missingTmdbIds.length) await new Promise(r => setTimeout(r, 200));
      }
      if (cacheModified) {
        if (!fs.existsSync(path.dirname(TMDB_CACHE_PATH))) try { fs.mkdirSync(path.dirname(TMDB_CACHE_PATH), { recursive: true });
         } catch (e) { }try { fs.writeFileSync(TMDB_CACHE_PATH, JSON.stringify(tmdbCache), "utf-8");
       } catch (e) { console.warn("Could not write cache:", e.message); }}
    }
  }

  return movies.map(m => {
    const tmdbId = m.providerIds?.Tmdb;
    const t = tmdbId ? tmdbCache[tmdbId] : null;
    if (t) {
      const logoObj = t.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || t.images?.logos?.[0];
      return { 
        ...m, 
        posterUrl: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : m.posterUrl, 
        backdropUrl: t.backdrop_path ? `https://image.tmdb.org/t/p/original${t.backdrop_path}` : m.backdropUrl, 
        description: t.overview || m.description, 
        year: t.release_date ? parseInt(t.release_date.substring(0, 4)) : m.year, 
        releaseDate: t.release_date || m.releaseDate, 
        genre: t.genres?.map((g: any) => g.name) || m.genre, 
        rating: t.vote_average ? t.vote_average.toFixed(1) : m.rating,
        hasLogo: !!logoObj || m.hasLogo,
        logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : m.logoUrl,
        tmdbId: tmdbId
      };
    }
    return m;
  });
}

// Helper to fetch and format hero banner items
async function fetchAndCacheHero(config: any): Promise<any[]> {
  const userId = await resolveUserId(config);

  if (!userId) {
    throw new Error("Impossible de récupérer l'ID utilisateur auprès de Jellyfin.");
  }

  const latestUrl = `${config.url}/Users/${userId}/Items/Latest?IncludeItemTypes=Movie,Series&Language=en&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ImageTags&limit=25&api_key=${config.apiKey}`;
  const latestResponse = await fetch(latestUrl, {
    headers: {
      "X-Emby-Token": config.apiKey,
      "Accept": "application/json"
    }
  });
  
  if (!latestResponse.ok) {
    const errorText = await latestResponse.text().catch(() => "");
    throw new Error(`Impossible de récupérer les nouveautés de Jellyfin. Status: ${latestResponse.status}. ${errorText.substring(0, 200)}`);
  }

  const latestData: any = await latestResponse.json();
  const items = latestData || [];
  if (items.length === 0) {
    throw new Error("Aucun film valide trouvé dans vos nouveautés.");
  }

  const ticksToMinutes = (ticks: number) => {
    if (!ticks) return "0 min";
    const minutes = Math.round(ticks / 10000000 / 60);
    return `${minutes} min`;
  };

  const topItems = items.slice(0, 6);
  const formattedHeroes = topItems.map((heroItem: any) => {
    const hasLogo = !!(heroItem.ImageTags && heroItem.ImageTags.Logo);
    return {
      id: heroItem.Id,
      title: heroItem.Name || "Untitled Movie",
      year: heroItem.ProductionYear || new Date().getFullYear(),
      duration: ticksToMinutes(heroItem.RunTimeTicks),
      rating: heroItem.CommunityRating ? heroItem.CommunityRating.toFixed(1) : "N/A",
      genre: heroItem.Genres || [],
      description: heroItem.Overview || "No synopsis available for this title on Jellyfin.",
      director: heroItem.People?.find((p: any) => p.Type === "Director")?.Name || "Unknown Director",
      cast: heroItem.People?.filter((p: any) => p.Type === "Actor").slice(0, 4).map((p: any) => p.Name) || [],
      posterUrl: `/api/jellyfin/image/${heroItem.Id}/Primary`,
      backdropUrl: `/api/jellyfin/image/${heroItem.Id}/Backdrop`,
      streamUrl: `${config.url}/Videos/${heroItem.Id}/stream.mp4?Static=true&api_key=${config.apiKey}`,
      tagline: heroItem.Taglines && heroItem.Taglines.length > 0 ? heroItem.Taglines[0] : "Available on your server",
      hasLogo,
      logoUrl: hasLogo ? `/api/jellyfin/image/${heroItem.Id}/Logo` : null,
      symbol: "📡🎬",
      accentColor: "text-[#ca8a04] border-[#ca8a04]/30 bg-[#ca8a04]/5",
      accentHex: "#ca8a04",
      gradient: "from-zinc-950 via-neutral-900 to-[#ca8a04]/20",
      isCatalog: true
    };
  });
  return await enrichWithTmdb(formattedHeroes, true);
}

// Test route for Odyssey TMDb automated import

app.post("/api/admin/movies/add", express.json(), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ success: false, error: "Paramètre ids manquant." });
    }

    const TMDB_API_KEY = "a46ab41a292facadfd7e85f0ff213109";
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";

    const idList = ids.split(",").map(id => id.trim()).filter(id => id.length > 0);
    const addedMovies = [];

    for (const rawId of idList) {
      let tmdbId = rawId;
      let imdbId = "";

      // Si c'est un IMDb ID, on cherche le TMDb ID d'abord
      if (rawId.startsWith("tt")) {
        imdbId = rawId;
        const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`;
        const findRes = await fetch(findUrl, {
          headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
        });
        if (findRes.ok) {
          const findData = await findRes.json();
          if (findData.movie_results && findData.movie_results.length > 0) {
            tmdbId = findData.movie_results[0].id;
          }
        }
      }

      // Fetch movie details from TMDb
      const movieUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=en-US`;
      const movieRes = await fetch(movieUrl, {
        headers: { "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`, "Accept": "application/json" }
      });
      
      if (movieRes.ok) {
        const movieData = await movieRes.json();
        
        // Si on n'avait pas l'imdb_id, on le récupère maintenant
        if (!imdbId && movieData.imdb_id) {
          imdbId = movieData.imdb_id;
        }

        const directorObj = movieData.credits?.crew?.find(c => c.job === 'Director');
        const director = directorObj ? directorObj.name : "Inconnu";
        const cast = movieData.credits?.cast?.slice(0, 10).map(c => c.name) || [];
        const genres = movieData.genres?.map((g: any) => g.name) || [];
        
        const logoObj = movieData.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || movieData.images?.logos?.[0];

        const finalId = imdbId || String(tmdbId); // Prefer IMDb for iframe

        const newFiche = {
          hasLogo: !!logoObj,
          logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : null,
          id: finalId,
          tmdbId: tmdbId,
          imdbId: imdbId,
          title: movieData.title,
          originalTitle: movieData.original_title,
          description: movieData.overview,
          posterUrl: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : "",
          backdropUrl: movieData.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : "",
          year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
          releaseDate: movieData.release_date,
          duration: movieData.runtime ? `${movieData.runtime} min` : "0 min",
          voteAverage: movieData.vote_average,
          rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
          language: movieData.original_language,
          status: movieData.status,
          genre: genres,
          director: director,
          cast: cast,
          isIframeEmbed: true,
          iframeSrc: imdbId ? `https://player.videasy.net/movie/${imdbId}?color=FFD700&overlay=true` : `https://player.videasy.net/movie/${tmdbId}?color=FFD700&overlay=true`
        };

        addedMovies.push(newFiche);
      }
    }

    // Sauvegarde dans imported_movies.json
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
    let existingMovies = [];
    if (fs.existsSync(DB_PATH)) {
      try {
        existingMovies = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      } catch (e) {}
    }

    // Filter out duplicates before merging
    for (const newM of addedMovies) {
      existingMovies = existingMovies.filter(m => m.id !== newM.id);
      existingMovies.unshift(newM);
    }

    try { fs.writeFileSync(DB_PATH, JSON.stringify(existingMovies, null, 2));
    } catch (e) { console.warn("Could not write cache:", e.message); }

    try {
      const TS_PATH = path.join(process.cwd(), "src/data/imported_movies.ts");
      fs.writeFileSync(TS_PATH, "export const importedMoviesData = " + JSON.stringify(existingMovies, null, 2) + ";", "utf-8");
    } catch (e) { console.warn("Could not write TS file:", e.message); }

    // Clear the memory cache so the next GET /api/jellyfin/movies will reload
    setCached("movies-list", null, 0);

    return res.json({ success: true, count: addedMovies.length, added: addedMovies });
  } catch (err) {
    console.error("Erreur bulk import:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/movies/test-odyssey", async (req, res) => {
  try {
    const TMDB_API_KEY = "a46ab41a292facadfd7e85f0ff213109";
    const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
    const imdbId = "tt33764258";

    // 1. Interroger TMDb /find pour récupérer le tmdbId
    const findUrl = `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`;
    const findRes = await fetch(findUrl, {
      headers: {
        "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`,
        "Accept": "application/json"
      }
    });

    if (!findRes.ok) {
      return res.status(500).json({ success: false, error: "Erreur lors de la recherche TMDb find" });
    }

    const findData = await findRes.json();
    if (!findData.movie_results || findData.movie_results.length === 0) {
      return res.status(404).json({ success: false, error: "Film non trouvé sur TMDb" });
    }

    const tmdbId = findData.movie_results[0].id;

    // 2. Interroger TMDb /movie pour récupérer les détails
    const movieUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,images&include_image_language=en,null&language=en-US`;
    const movieRes = await fetch(movieUrl, {
      headers: {
        "Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`,
        "Accept": "application/json"
      }
    });

    if (!movieRes.ok) {
      return res.status(500).json({ success: false, error: "Erreur lors de la récupération des détails TMDb" });
    }

    const movieData = await movieRes.json();

    // 3. Extraire et structurer les données
    const directorObj = movieData.credits?.crew?.find((c: any) => c.job === 'Director');
    const director = directorObj ? directorObj.name : "Inconnu";
    const cast = movieData.credits?.cast?.slice(0, 10).map((c: any) => c.name) || [];
    const genres = movieData.genres?.map((g: any) => g.name) || [];

    const logoObj = movieData.images?.logos?.find((l: any) => l.iso_639_1 === 'en') || movieData.images?.logos?.[0];

    const newFiche = {
      hasLogo: !!logoObj,
      logoUrl: logoObj ? `https://image.tmdb.org/t/p/w500${logoObj.file_path}` : null,
      id: imdbId, // On utilise l'imdbId comme ID unique
      tmdbId: tmdbId,
      imdbId: imdbId,
      title: movieData.title,
      originalTitle: movieData.original_title,
      description: movieData.overview,
      posterUrl: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : "",
      backdropUrl: movieData.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : "",
      year: movieData.release_date ? parseInt(movieData.release_date.substring(0, 4)) : new Date().getFullYear(),
      releaseDate: movieData.release_date,
      duration: movieData.runtime ? `${movieData.runtime} min` : "0 min",
      voteAverage: movieData.vote_average,
      rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A",
      language: movieData.original_language,
      status: movieData.status,
      genre: genres,
      director: director,
      cast: cast,
      isIframeEmbed: true,
      iframeSrc: `https://player.videasy.net/movie/${imdbId}?color=FFD700&overlay=true`
    };

    // 4. Sauvegarder dans le cache pour que le frontend puisse l'afficher
    // On met à jour imported_movies
    const DB_PATH = path.join(process.cwd(), "imported_movies.json");
    let existingMovies = [];
    if (fs.existsSync(DB_PATH)) {
      try {
        existingMovies = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      } catch (e) {}
    }

    existingMovies = existingMovies.filter((m: any) => m.id !== imdbId);
    existingMovies.unshift(newFiche);

    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(existingMovies, null, 2));
    } catch (e) { console.warn("Could not write cache:", e.message); }

    try {
      const TS_PATH = path.join(process.cwd(), "src/data/imported_movies.ts");
      fs.writeFileSync(TS_PATH, "export const importedMoviesData = " + JSON.stringify(existingMovies, null, 2) + ";", "utf-8");
    } catch (e) { console.warn("Could not write TS file:", e.message); }

    const cacheKey = "movies-list";
    setCached(cacheKey, null, 0); // clear cache so it re-reads

    return res.json({ success: true, movie: newFiche });

  } catch (err: any) {
    console.error("Erreur test odyssey:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. List library movies from connected Jellyfin with persistent file and memory cache (SWR model)
app.get("/api/movies", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  let importedMovies = getGlobalImportedMovies();
  res.json({ success: true, movies: importedMovies });
});

// 4ab. Fetch dynamic Jellyfin Hero banner data with SWR caching model
app.get("/api/hero", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  let importedMovies = getGlobalImportedMovies();
  const allHeroes = [...importedMovies].reverse().slice(0, 5);
  res.json({ success: true, heroes: allHeroes, hero: allHeroes[0] });
});

// 4b. Clear Jellyfin cache on demand when config is saved or manually triggered
app.post("/api/jellyfin/cache/clear", (req, res) => {
  apiCache.clear();
  playbackCache.clear();
  cachedUserId = null;
  
  if (fs.existsSync(MOVIES_CACHE_PATH)) {
    try { fs.unlinkSync(MOVIES_CACHE_PATH); } catch (e) {}
  }
  if (fs.existsSync(HERO_CACHE_PATH)) {
    try { fs.unlinkSync(HERO_CACHE_PATH); } catch (e) {}
  }

  // Clear file-system images cache
  try {
    const files = fs.readdirSync(IMAGE_CACHE_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(IMAGE_CACHE_DIR, file));
    }
  } catch (e) {
    console.error("Erreur de vidage du cache des images :", e);
  }
  res.json({ success: true, message: "Tous les caches ont été vidés." });
});

// 4c. Secure high-performance optimized image proxy with local disk cache
app.get("/api/jellyfin/image/:id/:type", async (req, res) => {
  const { id, type } = req.params;
  const config = getJellyfinConfig();
  if (!config) {
    res.status(401).send("Serveur non configuré.");
    return;
  }

  const cacheKey = `${id}-${type}.webp`;
  const cachePath = path.join(IMAGE_CACHE_DIR, cacheKey);

  // Instruct client-side browsers and intermediate CDNs / proxies to cache long-term
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  if (fs.existsSync(cachePath)) {
    res.setHeader("Content-Type", "image/webp");
    fs.createReadStream(cachePath).pipe(res);
    return;
  }

  try {
    const isPrimary = type === "Primary";
    const isLogo = type === "Logo";
    // Scale on Jellyfin level before fetching to reduce network overhead and processing latency!
    // 340px width is perfect for display cards, 600px for logos, 1280px is perfect for background banners
    const width = isPrimary ? 340 : (isLogo ? 600 : 1280);
    const quality = 80;

    const jellyfinImageUrl = type === "Backdrop"
      ? `${config.url}/Items/${id}/Images/${type}?api_key=${config.apiKey}`
      : `${config.url}/Items/${id}/Images/${type}?maxWidth=${width}&quality=${quality}&format=webp&api_key=${config.apiKey}`;
    
    const response = await fetch(jellyfinImageUrl, {
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    if (!response.ok) {
      // Fallback or skip
      res.status(response.status).send(`Image fetch failed: ${response.statusText}`);
      return;
    }

    const contentType = response.headers.get("content-type") || "image/webp";
    res.setHeader("Content-Type", contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save asynchronously to local disk cache for instant future hits
    fs.writeFile(cachePath, buffer, (err) => {
      if (err) console.error("[CACHE ERROR] Impossible d'écrire l'image au cache disk:", err.message);
    });

    res.send(buffer);
  } catch (err: any) {
    console.error("[IMAGE PROXY ERROR] Image retrieve failure:", err.message);
    if (!res.headersSent) {
      res.status(500).send("Erreur de chargement d'image");
    }
  }
});

// 5. Autonomic search inside Jellyfin
app.get("/api/jellyfin/search", async (req, res) => {
  const config = getJellyfinConfig();
  if (!config) {
    res.status(401).json({ success: false, error: "Serveur non configuré." });
    return;
  }

  const { title } = req.query;
  if (!title) {
    res.status(400).json({ success: false, error: "Veuillez fournir un titre de recherche." });
    return;
  }

  const cacheKey = `search-${String(title).toLowerCase()}`;
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    res.json({
      success: true,
      movies: cachedData
    });
    return;
  }

  try {
    // Resolve user for consistent access
    const userId = await resolveUserId(config);
    const searchUrl = userId
      ? `${config.url}/Users/${userId}/Items?recursive=true&includeItemTypes=Movie,Series&searchTerm=${encodeURIComponent(String(title))}&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path&api_key=${config.apiKey}`
      : `${config.url}/Items?recursive=true&includeItemTypes=Movie,Series&searchTerm=${encodeURIComponent(String(title))}&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path&api_key=${config.apiKey}`;
    const response = await fetch(searchUrl, {
      headers: {
        "X-Emby-Token": config.apiKey,
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      res.status(response.status).json({ success: false, error: "Recherche de médias en échec." });
      return;
    }

    const data: any = await response.json();
    const rawMovies = data.Items || [];

    const formattedMovies = rawMovies.map((item: any) => formatJellyfinItem(item, config.url, config.apiKey));

    // Cache search results for 30 seconds
    setCached(cacheKey, formattedMovies, 30000);

    res.json({
      success: true,
      movies: formattedMovies
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to perform HTTP GET requests while following standard redirects (301/302)
function getWithRedirects(
  targetUrl: string,
  requestOptions: any,
  onResponse: (response: http.IncomingMessage) => void,
  onError: (err: any) => void,
  maxRedirects = 5,
  currentReqRef?: { current: http.ClientRequest | null }
): http.ClientRequest {
  const client = targetUrl.startsWith("https") ? https : http;
  const currentOptions = { ...requestOptions };
  
  currentOptions.agent = targetUrl.startsWith("https") ? keepAliveHttpsAgent : keepAliveHttpAgent;
  if (targetUrl.startsWith("https")) {
    currentOptions.rejectUnauthorized = false;
  }

  const req = client.get(targetUrl, currentOptions, (response) => {
    const statusCode = response.statusCode || 200;
    if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
      response.resume(); // FREE THE SOCKET by consuming the body!
      if (maxRedirects <= 0) {
        onResponse(response);
        return;
      }
      let redirectUrl = response.headers.location;
      // Handle relative paths
      if (!redirectUrl.startsWith("http")) {
        try {
          const parsedUrl = new URL(targetUrl);
          redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        } catch (e) {
          onResponse(response);
          return;
        }
      }
      getWithRedirects(redirectUrl, requestOptions, onResponse, onError, maxRedirects - 1, currentReqRef);
    } else {
      onResponse(response);
    }
  });

  if (currentReqRef) {
    currentReqRef.current = req;
  }

  req.on("error", onError);
  return req;
}

const playbackCache = new Map<string, { data: any; timestamp: number }>();
const PLAYBACK_CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache

// 6. Secure proxy stream to circumvent CORS and force browser-playable AAC stereo audio + H264 video
async function getPlaybackData(id: string, forceTranscode?: boolean, lowQuality?: boolean, forceJellyfin?: boolean) {
  const iframeResult = {
    id: id,
    streamUrl: `https://player.videasy.net/movie/${id}?color=FFD700&overlay=true`,
    duration: 0,
    container: "iframe",
    title: "Film (Embed)",
    isDirect: true,
    isIframeEmbed: true,
    iframeSrc: `https://player.videasy.net/movie/${id}?color=FFD700&overlay=true`,
    subtitles: [],
    audios: [],
    videoCodec: "",
    audioCodec: "",
    chosenPath: ""
  };
  return iframeResult;
}
// Single central playback route
app.get("/api/playback/:id", async (req, res) => {
  const { id } = req.params;
  const forceTranscode = req.query.forceTranscode === "true";
  const lowQuality = req.query.lowQuality === "true";
  const forceJellyfin = req.query.forceJellyfin === "true";
  try {
    const data = await getPlaybackData(id, forceTranscode, lowQuality, forceJellyfin);
    res.json({
      id: data.id,
      streamUrl: data.streamUrl,
      duration: data.duration,
      container: data.container,
      title: data.title,
      isDirect: data.isDirect,
      videoCodec: data.videoCodec,
      audioCodec: data.audioCodec,
      chosenPath: data.chosenPath,
      isIframeEmbed: data.isIframeEmbed,
      iframeSrc: data.iframeSrc,
      subtitles: data.subtitles || [],
      audios: data.audios || []
    });
  } catch (err: any) {
    console.error("Playback route fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Playback error logger for remote diagnostics
app.post("/api/playback-error", express.json(), (req, res) => {
  const { movieId, error, context, url, mode, videoCodec, audioCodec, details } = req.body;
  console.error(`[CRITICAL CLIENT PLAYBACK ERROR] FilmID: ${movieId} | Erreur: ${error} | Contexte: ${context} | URL: ${url} | Mode: ${mode} | VideoCodec: ${videoCodec} | AudioCodec: ${audioCodec} | Details: ${JSON.stringify(details || {})}`);
  res.json({ success: true });
});

let latestStreamDebug = {
  timestamp: Date.now(),
  requestRange: "None",
  targetUrl: "",
  statusCode: 0,
  responseHeaders: {} as any,
  startTimeTicks: "0",
  jellyfinResponseRange: "None"
};

app.get("/api/playback-stream-debug", (req, res) => {
  res.json(latestStreamDebug);
});

// Secure proxy stream acting as a transparent tunnel SANS modification
app.get(["/api/jellyfin/proxy/stream", "/api/jellyfin/proxy/*", "/stream", "/master.m3u8"], async (req, res) => {
  const wildcardPath = (req.params as any)[0];
  const isWildcardPath = wildcardPath && wildcardPath !== "stream";

  if (!req.query.id && !req.query.path && !isWildcardPath) {
    console.error("[PROXY BLOCKED] Missing id and path", {
      url: req.url,
      query: req.query
    });

    return res.status(400).send("Missing id or path for stream proxy");
  }

  const perfId = Math.random().toString(36).substring(7);
  const reqStartTimestamp = Date.now();

  const config = getJellyfinConfig();
  if (!config) {
    res.status(401).send("Serveur non configuré.");
    return;
  }

  // 3. Ajouter un log backend pour afficher la requête exacte reçue par /api/jellyfin/proxy/stream
  if (req.url.includes(".ts") || req.url.includes(".m3u8")) {
  } else {
  }

  let targetPath = "";
  
  if (isWildcardPath) {
    targetPath = "/" + wildcardPath;
  } else if (req.path === "/stream" || req.path === "/master.m3u8" || req.path.endsWith("/stream") || req.path.endsWith(".m3u8")) {
    const { path: chosenPath, id } = req.query;
    targetPath = chosenPath ? String(chosenPath) : "";
    if (!targetPath && id) {
      const timerPlayback = setTimeout(() => {
      }, 5000);
      try {
        const pbData = await getPlaybackData(String(id));
        clearTimeout(timerPlayback);
        targetPath = pbData.chosenPath;
      } catch (e: any) {
        clearTimeout(timerPlayback);
        targetPath = `/Videos/${id}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&`;
      }
    }
  } else if (wildcardPath && wildcardPath !== "stream") {
    targetPath = "/" + wildcardPath;
  } else {
    const { path: chosenPath, id } = req.query;
    targetPath = chosenPath ? String(chosenPath) : "";
    if (!targetPath && id) {
      const timerPlayback = setTimeout(() => {
      }, 5000);
      try {
        const pbData = await getPlaybackData(String(id));
        clearTimeout(timerPlayback);
        targetPath = pbData.chosenPath;
      } catch (e: any) {
        clearTimeout(timerPlayback);
        targetPath = `/Videos/${id}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&`;
      }
    }
  }


  // 2. Vérifier que le paramètre path encodé est correct et n'est pas corrompu

  if (!targetPath) {
    res.status(400).send("Paramètre de chemin (path) ou ID manquant.");
    return;
  }

  let targetUrl = "";
  if (targetPath.startsWith("http")) {
    targetUrl = targetPath;
  } else {
    targetUrl = `${config.url}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;
  }

  // 5. S'assurer que le serveur ne transforme pas ou ne coupe pas la query string (très important)
  // Nous lisons directement la query string brute depuis req.url pour ne rater aucun paramètre
  try {
    const urlObj = new URL(targetUrl);
    const incomingUrl = new URL(req.url, "http://localhost");

    // Fusionner tous les paramètres reçus du navigateur sans exception
    incomingUrl.searchParams.forEach((value, key) => {
      if (key !== "path" && key !== "id" && value !== undefined) {
        urlObj.searchParams.set(key, value);
      }
    });

    // Éliminer les clés d'URL locales (path et id) de la cible finale
    urlObj.searchParams.delete("path");
    urlObj.searchParams.delete("id");

    // 1. Vérifier que le backend Jellyfin proxy reçoit bien un MediaSourceId valide
    // Si MediaSourceId est absent, on essaie de le déduire de l'ID du film
    let itemId = String(req.query.id || "");
    if (!itemId) {
      const itemMatch = req.path.match(/\/Videos\/([a-zA-Z0-9\-]+)/i) || targetPath.match(/\/Videos\/([a-zA-Z0-9\-]+)/i);
      if (itemMatch) {
        itemId = itemMatch[1];
      }
    }
    
    if (itemId && !urlObj.searchParams.has("MediaSourceId")) {
      urlObj.searchParams.set("MediaSourceId", itemId);
    }

    // Supprimer la version minuscule mediaSourceId pour empêcher les conflits/doublons d'arguments (Erreur 400)
    urlObj.searchParams.delete("mediaSourceId");

    if (!urlObj.searchParams.has("api_key")) {
      urlObj.searchParams.set("api_key", config.apiKey);
    }
    targetUrl = urlObj.toString();
  } catch (e: any) {
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "path" && key !== "id" && value !== undefined) {
        if (!targetUrl.includes(`${key}=`)) {
          targetUrl += `${targetUrl.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(String(value))}`;
        }
      }
    }
    if (!targetUrl.includes("api_key=")) {
      targetUrl += `${targetUrl.includes("?") ? "&" : "?"}api_key=${config.apiKey}`;
    }
  }

  // 6. Tester avec une URL directe Jellyfin pour confirmer que le problème vient bien du proxy
  // Nous l'affichons clairement dans les logs backend

  let startTimeTicks = "0";
  try {
    const parsedUrl = new URL(targetUrl);
    startTimeTicks = parsedUrl.searchParams.get("StartTimeTicks") || parsedUrl.searchParams.get("startTimeTicks") || "0";
  } catch (e) {
    const match = targetUrl.match(/[?]starttimeticks=([0-9]+)/i);
    if (match) startTimeTicks = match[1];
  }


  latestStreamDebug = {
    timestamp: Date.now(),
    requestRange: req.headers.range || "None",
    targetUrl: targetUrl,
    statusCode: 0,
    responseHeaders: {} as any,
    startTimeTicks: startTimeTicks,
    jellyfinResponseRange: "None"
  };

  // Support HTTP RANGE. On forwarde les headers de range du client vers Jellyfin
  const headers: Record<string, string> = {
    "X-Emby-Token": config.apiKey
  };
  if (req.headers.range) {
    headers["Range"] = req.headers.range;
  }
  if (req.headers["user-agent"]) {
    headers["user-agent"] = req.headers["user-agent"] as string;
  }

  const requestOptions: any = {
    headers,
  };

  const currentReqRef = { current: null as http.ClientRequest | null };

  // 4. Si Jellyfin retourne une erreur, ajouter un fallback automatique vers un stream direct Jellyfin sans proxy
  const redirectToDirectStream = (reason: string) => {
    if (!res.headersSent) {
      const sanitizedUrlForLogs = targetUrl.replace(config.apiKey, "SECRET_API_KEY");
      res.redirect(307, targetUrl);
    }
  };

  const onError = (err: any) => {
    console.error("Stream proxy fetch backend error:", err);
    redirectToDirectStream(`Erreur proxy réseau (${err.message})`);
  };

  const onResponse = (response: http.IncomingMessage) => {
    const ttfb = Date.now() - reqStartTimestamp;
    
    const statusCode = response.statusCode || 200;

    latestStreamDebug.statusCode = statusCode;
    latestStreamDebug.responseHeaders = response.headers;
    latestStreamDebug.jellyfinResponseRange = String(response.headers["content-range"] || "None");

    // 6. TEST DEBUG : journaliser l'état Jellyfin et les headers envoyés / reçus

    if (statusCode >= 400) {
      redirectToDirectStream(`Code erreur Jellyfin ${statusCode}`);
      return;
    }

    // Resolve origin dynamically to support credentials or fall back to *
    let proxyOrigin = req.headers.origin;
    if (!proxyOrigin && req.headers.referer) {
      try {
        proxyOrigin = new URL(req.headers.referer).origin;
      } catch (e) {
        // ignore
      }
    }
    if (!proxyOrigin) {
      proxyOrigin = "*";
    }

    // Assembly of response headers to guarantee robust seekability (HTTP Range Requests)
    const responseHeaders: Record<string, string> = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": proxyOrigin,
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges, Content-Type",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "X-Accel-Buffering": "no"
    };

    if (proxyOrigin !== "*") {
      responseHeaders["Access-Control-Allow-Credentials"] = "true";
    }

    // 4. Headers obligatoires / Content-Type correct
    if (response.headers["content-type"]) {
      responseHeaders["Content-Type"] = response.headers["content-type"];
    } else if (req.path.endsWith(".m3u8") || targetPath.includes(".m3u8")) {
      responseHeaders["Content-Type"] = "application/vnd.apple.mpegurl";
    } else if (req.path.endsWith(".ts") || targetPath.includes(".ts")) {
      responseHeaders["Content-Type"] = "video/mp2t";
    } else {
      responseHeaders["Content-Type"] = "video/mp4";
    }

    if (response.headers["content-range"]) {
      responseHeaders["Content-Range"] = response.headers["content-range"];
    }

    if (response.headers["content-length"]) {
      responseHeaders["Content-Length"] = response.headers["content-length"];
    }

    if (response.headers["connection"]) {
      responseHeaders["Connection"] = response.headers["connection"];
    }

    // Forward exact 206 status code for Range or 200/other
    res.writeHead(response.statusCode || 200, responseHeaders);
    res.flushHeaders();

    let totalBytesStreamed = 0;
    let lastLogTime = Date.now();
    let firstChunkReceived = false;

    response.on("data", (chunk) => {
      if (!firstChunkReceived) {
        firstChunkReceived = true;
        const ttfbFirstOctet = Date.now() - reqStartTimestamp;
      }
      totalBytesStreamed += chunk.length;
      const now = Date.now();
      if (now - lastLogTime > 4000) {
        lastLogTime = now;
      }
    });

    response.on("end", () => {
      const timeTotal = Date.now() - reqStartTimestamp;
    });

    response.on("error", (err) => {
    });

    response.pipe(res);
  };

  const timeToProxyStart = Date.now() - reqStartTimestamp;
  getWithRedirects(targetUrl, requestOptions, onResponse, onError, 5, currentReqRef);

  req.on("close", () => {
    if (currentReqRef.current) {
      currentReqRef.current.destroy();
    }
  });
});


// Helper function to convert any subtitle format (srt, ass, WebVTT with commas) to valid WebVTT format
function convertToWebVTT(rawText: string): string {
  // Remove UTF-8 Byte Order Mark (BOM) if present
  let text = rawText.replace(/^\uFEFF/, "").trim();
  
  // Normalize line endings to LF
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Check if it's already WebVTT
  if (/^WEBVTT/i.test(text)) {
    // It's WebVTT. Let's ensure all timestamps use dots (.) instead of commas (,) for standard compliance
    const lines = text.split("\n");
    const resultLines: string[] = [];
    
    // Ensure the first line is exactly WEBVTT
    resultLines.push("WEBVTT");
    resultLines.push(""); // Force a blank line directly after the header
    
    // Find where real content restarts
    let startIdx = 1;
    while (startIdx < lines.length && lines[startIdx].trim() === "") {
      startIdx++;
    }
    
    for (let idx = startIdx; idx < lines.length; idx++) {
      let line = lines[idx];
      if (line.includes("-->")) {
        // Replace commas with periods in the timestamp line
        line = line.replace(/,/g, ".");
      }
      resultLines.push(line);
    }
    return resultLines.join("\n");
  }

  // Check if it's ASS / SSA format
  if (text.includes("[Script Info]") || text.includes("Dialogue:")) {
    const lines = text.split("\n");
    const vttCues: string[] = ["WEBVTT", ""];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith("dialogue:")) {
        try {
          const content = trimmed.substring(9).trim();
          // Parse: Dialogue: Layer, Start, End, Style, Actor, MarginL, MarginR, MarginV, Effect, Text
          const commaParts = content.split(",");
          if (commaParts.length >= 9) {
            const startStr = commaParts[1].trim();
            const endStr = commaParts[2].trim();
            const textStr = commaParts.slice(9).join(",").trim();

            const formatAssTime = (timeStr: string): string => {
              const parts = timeStr.split(":");
              let h = "00";
              let m = "00";
              let s = "00.000";
              if (parts.length === 3) {
                h = parts[0].padStart(2, "0");
                m = parts[1].padStart(2, "0");
                const sParts = parts[2].split(".");
                const sec = sParts[0].padStart(2, "0");
                const ms = ((sParts[1] || "00") + "0").substring(0, 3);
                s = `${sec}.${ms}`;
              } else if (parts.length === 2) {
                m = parts[0].padStart(2, "0");
                const sParts = parts[1].split(".");
                const sec = sParts[0].padStart(2, "0");
                const ms = ((sParts[1] || "00") + "0").substring(0, 3);
                s = `${sec}.${ms}`;
              }
              return `${h}:${m}:${s}`;
            };

            const startVtt = formatAssTime(startStr);
            const endVtt = formatAssTime(endStr);
            const cleanText = textStr
              .replace(/\{[^}]+\}/g, "") // remove formatting blocks like {\an8}
              .replace(/\\N/gi, "\n")    // change ASS newline marker to real newline
              .replace(/\\n/gi, "\n")
              .trim();

            if (cleanText) {
              vttCues.push(`${startVtt} --> ${endVtt}`);
              vttCues.push(cleanText);
              vttCues.push("");
            }
          }
        } catch (e) {
          // parse line fail, ignore
        }
      }
    }
    if (vttCues.length > 2) {
      return vttCues.join("\n");
    }
  }

  // Treat as SRT / SubRip or general line-based format and convert to WebVTT
  const lines = text.split("\n");
  const vttCues: string[] = ["WEBVTT", ""];
  let i = 0;
  
  while (i < lines.length) {
    let line = lines[i].trim();
    if (line.includes("-->")) {
      const vttTimestampLine = line.replace(/,/g, ".");
      const textLines: string[] = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (nextLine === "") {
          break;
        }
        if (nextLine.includes("-->")) {
          i--;
          break;
        }
        if (/^\d+$/.test(nextLine) && i + 1 < lines.length && lines[i + 1].trim().includes("-->")) {
          break;
        }
        textLines.push(lines[i]);
        i++;
      }
      if (textLines.length > 0) {
        vttCues.push(vttTimestampLine);
        vttCues.push(textLines.join("\n"));
        vttCues.push("");
      }
    }
    i++;
  }

  return vttCues.join("\n");
}

// Proxy transparent pour obtenir les sous-titres au format WebVTT/SRT depuis Jellyfin
app.get("/api/jellyfin/subtitles/:itemId/:mediaSourceId/:index.vtt", async (req, res) => {
  const config = getJellyfinConfig();
  if (!config) {
    res.status(401).send("Serveur non configuré.");
    return;
  }
  const { itemId, mediaSourceId, index } = req.params;
  
  // Essayer à la fois le format .vtt et .srt pour chaque URL potentielle de Jellyfin, avec ou sans extensions et paramètres de format
  const urlsToTry: string[] = [];
  const formats = ["vtt", "srt"];
  for (const fmt of formats) {
    urlsToTry.push(
      `${config.url}/Videos/${itemId}/${mediaSourceId}/Subtitles/${index}/Stream.${fmt}?api_key=${config.apiKey}`,
      `${config.url}/Videos/${itemId}/${mediaSourceId}/Subtitles/${index}/Stream?format=${fmt}&api_key=${config.apiKey}`,
      `${config.url}/Videos/${itemId}/${mediaSourceId}/Subtitles/${index}/0/Stream.${fmt}?api_key=${config.apiKey}`,
      `${config.url}/Videos/${itemId}/${mediaSourceId}/Subtitles/${index}/0/Stream?format=${fmt}&api_key=${config.apiKey}`,
      `${config.url}/Videos/${itemId}/Subtitles/${index}/Stream.${fmt}?api_key=${config.apiKey}`,
      `${config.url}/Videos/${itemId}/Subtitles/${index}/Stream?format=${fmt}&api_key=${config.apiKey}`,
      `${config.url}/Videos/${itemId}/Subtitles/${index}/0/Stream.${fmt}?api_key=${config.apiKey}`,
      `${config.url}/Videos/${itemId}/Subtitles/${index}/0/Stream?format=${fmt}&api_key=${config.apiKey}`
    );
  }
  urlsToTry.push(
    `${config.url}/Videos/${itemId}/${mediaSourceId}/Subtitles/${index}/Stream?api_key=${config.apiKey}`,
    `${config.url}/Videos/${itemId}/Subtitles/${index}/Stream?api_key=${config.apiKey}`
  );


  let lastError: any = null;
  for (const targetUrl of urlsToTry) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "X-MediaBrowser-Token": config.apiKey,
          "Authorization": `MediaBrowser Client="CinemaApp", Device="Web", DeviceId="CinemaAppClient", Version="1.0.0", Token="${config.apiKey}"`,
          "Accept": "text/vtt,text/srt,application/x-subrip,*/*"
        }
      });
      if (response.ok) {
        const text = await response.text();
        // S'assurer que le contenu n'est pas une page d'erreur HTML ou vide
        if (text && !text.trim().startsWith("<!DOCTYPE")) {
          
          // CONVERSION GARANTIE AU FORMAT WEBVTT PROPRE
          const webVttContent = convertToWebVTT(text);
          
          // Resolve origin dynamically to support credentials or fall back to *
          let subtitleOrigin = req.headers.origin;
          if (!subtitleOrigin && req.headers.referer) {
            try {
              subtitleOrigin = new URL(req.headers.referer).origin;
            } catch (e) {
              // ignore
            }
          }
          if (!subtitleOrigin) {
            subtitleOrigin = "*";
          }

          res.setHeader("Content-Type", "text/vtt; charset=utf-8");
          res.setHeader("Access-Control-Allow-Origin", subtitleOrigin);
          res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "*");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
          if (subtitleOrigin !== "*") {
            res.setHeader("Access-Control-Allow-Credentials", "true");
          }
          res.send(webVttContent);
          return;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  // Si on arrive ici, tous les essais ont échoué
  let subtitleOriginFallback = req.headers.origin;
  if (!subtitleOriginFallback && req.headers.referer) {
    try {
      subtitleOriginFallback = new URL(req.headers.referer).origin;
    } catch (e) {
      // ignore
    }
  }
  if (!subtitleOriginFallback) {
    subtitleOriginFallback = "*";
  }

  res.setHeader("Content-Type", "text/vtt; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", subtitleOriginFallback);
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  if (subtitleOriginFallback !== "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.send("WEBVTT\n\n");
});


// ------------------------------------------------------------------
// DEVELOPMENT && PRODUCTION ASSETS ROUTING (VITE INTEGRATION)
// ------------------------------------------------------------------

async function startServer() {
  let serverInstance: any = app;

  if (process.env.NODE_ENV !== "production") {
    // Create an HTTP server so Vite can attach to it for WebSockets / WSS
    const httpServer = http.createServer(app);
    serverInstance = httpServer;

    // Create Vite server on top of Express and bind to HTTP server to handle HMR WebSocket upgrade
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: httpServer, // Pass HTTP server to handle HMR WebSocket upgrade
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use("/src", express.static(path.join(process.cwd(), "src")));
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  serverInstance.listen(PORT, "0.0.0.0", () => {
    // Delete local caches on boot to ensure fresh posters
    try {
      if (fs.existsSync(MOVIES_CACHE_PATH)) fs.unlinkSync(MOVIES_CACHE_PATH);
      if (fs.existsSync(HERO_CACHE_PATH)) fs.unlinkSync(HERO_CACHE_PATH);
      const TMDB_CACHE_PATH = path.join(process.cwd(), ".data", "tmdb_cache.json");
      if (fs.existsSync(TMDB_CACHE_PATH)) fs.unlinkSync(TMDB_CACHE_PATH);
    } catch(e) {}
    
    // Pre-warm caches immediately on server boot
    const startupConfig = getJellyfinConfig();
    if (startupConfig) {
      backgroundFetchMovies(startupConfig);
      backgroundFetchHero(startupConfig);
    }
  });
}

startServer();
