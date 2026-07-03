import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Silence specific benign console warnings and errors (such as WebSocket/HMR disconnects or subtitle resource 404s)
if (typeof window !== "undefined") {
  // Global fetch interceptor to automatically route /api requests to absolute backend when on production or Netlify
  const originalFetch = window.fetch;
  const customFetch = function (input: RequestInfo | URL, init?: RequestInit) {
    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof input === "object" && "url" in input) {
      url = (input as any).url;
    }

    const isProduction = !!(import.meta as any).env?.PROD || (typeof process !== "undefined" && process?.env?.NODE_ENV === "production");
    const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));

    // The user explicitly requested to NOT use the ais-dev link in production.
    // However, on Netlify, there is no backend server. We must intercept the API calls
    // and make them directly to the true Jellyfin server!
    if (isNetlify && url.startsWith("/api/jellyfin/")) {
      const serverUrl = localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud";
      const apiKey = localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb";

      const formatItem = (item: any) => {
        const ticksToMinutes = (ticks: number) => {
          if (!ticks) return "0 min";
          const minutes = Math.round(ticks / 10000000 / 60);
          return `${minutes} min`;
        };
        return {
          id: item.Id,
          title: item.Name || "Film Sans Titre",
          originalTitle: item.OriginalTitle || "",
          providerIds: item.ProviderIds || {},
          studios: item.Studios?.map((s: any) => s.Name) || [],
          year: item.ProductionYear || new Date().getFullYear(),
          duration: ticksToMinutes(item.RunTimeTicks),
          rating: item.CommunityRating ? item.CommunityRating.toFixed(1) : "N/A",
          genre: item.Genres || [],
          description: item.Overview || "Aucun synopsis disponible pour ce titre sur Jellyfin.",
          director: item.People?.find((p: any) => p.Type === "Director")?.Name || "Réalisateur Inconnu",
          cast: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 4).map((p: any) => p.Name) || [],
          castDetails: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 8).map((p: any) => ({
            id: p.Id,
            name: p.Name,
            role: p.Role || "",
            imageUrl: p.PrimaryImageTag ? `${serverUrl}/Items/${p.Id}/Images/Primary?tag=${p.PrimaryImageTag}&quality=90&fillWidth=300&fillHeight=450` : undefined
          })) || [],
          posterUrl: `${serverUrl}/Items/${item.Id}/Images/Primary?fillHeight=600&fillWidth=400&quality=80`,
          backdropUrl: `${serverUrl}/Items/${item.Id}/Images/Backdrop?fillHeight=1080&fillWidth=1920&quality=90`,
          streamUrl: `${serverUrl}/Videos/${item.Id}/stream.mp4?Static=true&api_key=${apiKey}`,
          tagline: item.Taglines && item.Taglines.length > 0 ? item.Taglines[0] : "Disponible sur votre serveur",
          symbol: "📡🎬",
          accentColor: "text-[#ca8a04] border-[#ca8a04]/30 bg-[#ca8a04]/5",
          accentHex: "#ca8a04"
        };
      };

      if (url.includes("/api/jellyfin/movies")) {
        return (async () => {
          try {
            const libraryUrl = `${serverUrl}/Items?recursive=true&includeItemTypes=Movie&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=300&api_key=${apiKey}`;
            const res = await originalFetch(libraryUrl);
            const data = await res.json();
            const healthyMovies = (data.Items || []).filter((item: any) => {
              const p = (item.Path || "").toLowerCase();
              return !p.includes("movies_jellyfin_web");
            });
            const formatted = healthyMovies.map(formatItem);
            return new Response(JSON.stringify({ success: true, movies: formatted }), { status: 200 });
          } catch (e: any) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
          }
        })();
      }

      if (url.includes("/api/jellyfin/hero")) {
        return (async () => {
          try {
            const userRes = await originalFetch(`${serverUrl}/Users?api_key=${apiKey}`);
            const users = await userRes.json();
            if (!users || users.length === 0) throw new Error("No users");
            const userId = users[0].Id;
            
            const heroUrl = `${serverUrl}/Users/${userId}/Items/Latest?includeItemTypes=Movie&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=5&api_key=${apiKey}`;
            const res = await originalFetch(heroUrl);
            const data = await res.json();
            const healthyMovies = (data || []).filter((item: any) => {
              const p = (item.Path || "").toLowerCase();
              return !p.includes("movies_jellyfin_web");
            });
            const formatted = healthyMovies.map((item: any) => {
              const base = formatItem(item);
              return {
                ...base,
                hasLogo: item.ImageTags && item.ImageTags.Logo,
                logoUrl: item.ImageTags && item.ImageTags.Logo ? `${serverUrl}/Items/${item.Id}/Images/Logo?fillWidth=600&quality=90` : null,
                gradient: "from-zinc-950 via-neutral-900 to-[#ca8a04]/20",
                isJellyfin: true
              };
            });
            return new Response(JSON.stringify({ success: true, heroes: formatted, hero: formatted[0] }), { status: 200 });
          } catch (e: any) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
          }
        })();
      }
      
      if (url.includes("/api/jellyfin/config")) {
        return Promise.resolve(new Response(JSON.stringify({ success: true, url: serverUrl }), { status: 200 }));
      }
      
      if (url.includes("/api/jellyfin/recalculate")) {
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }
      
      if (url.startsWith("/api/playback/")) {
        return (async () => {
          try {
            const parts = url.split("/api/playback/");
            const movieId = parts[1]?.split("?")[0];
            const streamUrl = `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&api_key=${apiKey}&MediaSourceId=${movieId}`;
            
            return new Response(JSON.stringify({
                id: movieId,
                streamUrl: streamUrl,
                duration: 0,
                container: "m3u8",
                title: "Film",
                isDirect: false,
                videoCodec: "h264",
                audioCodec: "aac",
                chosenPath: "Netlify Intercept Bypass",
                subtitles: [],
                audios: []
            }), { status: 200 });
          } catch (e: any) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
          }
        })();
      }
    } else if (isNetlify && url.startsWith("/api/playback/")) {
      const serverUrl = localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud";
      const apiKey = localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb";
      
      return (async () => {
        try {
          const parts = url.split("/api/playback/");
          const movieId = parts[1]?.split("?")[0];
          const streamUrl = `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&api_key=${apiKey}&MediaSourceId=${movieId}`;
          
          return new Response(JSON.stringify({
              id: movieId,
              streamUrl: streamUrl,
              duration: 0,
              container: "m3u8",
              title: "Film",
              isDirect: false,
              videoCodec: "h264",
              audioCodec: "aac",
              chosenPath: "Netlify Intercept Bypass",
              subtitles: [],
              audios: []
          }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    }

    // Fetch calls will use relative paths or whatever is configured elsewhere.
    return originalFetch.call(window, input, init);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (err) {
    console.warn("Could not override window.fetch with defineProperty:", err);
    try {
      // Fallback: try to assign directly if defineProperty fails
      (window as any).fetch = customFetch;
    } catch (fallbackErr) {
      console.error("Critical: Could not intercept window.fetch:", fallbackErr);
    }
  }

  const ignorePatterns = [
    "websocket",
    "hmr",
    "vite",
    "subtitles",
    "failed to connect to websocket",
    "websocket connection to"
  ];

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.map(arg => String(arg)).join(" ");
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.map(arg => String(arg)).join(" ");
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  window.addEventListener("error", (event) => {
    const message = event.message || "";
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = String(event.reason || "");
    if (ignorePatterns.some(pattern => reason.toLowerCase().includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Patch window.WebSocket prototype safely to intercept Vite's HMR WebSocket close/error events
  if (typeof window !== "undefined" && window.WebSocket) {
    try {
      const originalAddEventListener = window.WebSocket.prototype.addEventListener;
      window.WebSocket.prototype.addEventListener = function(type: string, listener: any, options?: any) {
        if (type === "close" || type === "error") {
          const url = (this as any).url || "";
          const isViteWS = String(url).includes("vite") || String(url).includes("/ws");
          if (isViteWS) {
            const wrappedListener = function(event: any) {
              console.warn(`[WS RESILIENCE] Intercepted Vite WS event '${type}' to prevent unrequested page reloads.`);
              if (event && typeof event.preventDefault === "function") {
                event.preventDefault();
              }
              if (event && typeof event.stopPropagation === "function") {
                event.stopPropagation();
              }
            };
            return originalAddEventListener.call(this, type, wrappedListener, options);
          }
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    } catch (e) {
      console.warn("[WS RESILIENCE] Could not patch WebSocket prototype safely:", e);
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Une interruption est survenue dans l'application Classico">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

