const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";

const inject = `    } else if (isNetlify && url.startsWith("/api/trending")) {
      return (async () => {
        try {
          const u = new URL(url, window.location.origin);
          const page = u.searchParams.get("page") || "1";
          const res = await fetch(\`https://api.themoviedb.org/3/trending/all/day?language=en-US&page=\${page}\`, {
            headers: { "Authorization": \`Bearer ${TMDB_TOKEN}\`, "Accept": "application/json" }
          });
          if (!res.ok) throw new Error("TMDB failed");
          const data = await res.json();
          const valid = (data.results || []).filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
          const enriched = valid.map((m: any) => ({
            id: String(m.id) + (m.media_type === "tv" ? "-tv" : ""),
            tmdbId: String(m.id),
            isTv: m.media_type === "tv",
            title: m.media_type === "tv" ? m.name : m.title,
            originalTitle: m.media_type === "tv" ? m.original_name : m.original_title,
            description: m.overview,
            posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
            backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : "",
            year: (m.media_type === "tv" ? m.first_air_date : m.release_date) ? parseInt((m.media_type === "tv" ? m.first_air_date : m.release_date).substring(0, 4)) : new Date().getFullYear(),
            voteAverage: m.vote_average,
            director: "Unknown",
            cast: [],
            genre: [],
            isIframeEmbed: true,
            iframeSrc: m.media_type === "tv" ? "" : \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
          }));
          return new Response(JSON.stringify({ success: true, results: enriched }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/search")) {
      return (async () => {
        try {
          const u = new URL(url, window.location.origin);
          const query = u.searchParams.get("query");
          if (!query) return new Response(JSON.stringify({ success: true, results: [] }), { status: 200 });
          const [r1, r2] = await Promise.all([
            fetch(\`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(query)}&language=en-US&page=1\`, { headers: { "Authorization": \`Bearer ${TMDB_TOKEN}\`, "Accept": "application/json" } }),
            fetch(\`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(query)}&language=en-US&page=2\`, { headers: { "Authorization": \`Bearer ${TMDB_TOKEN}\`, "Accept": "application/json" } })
          ]);
          const d1 = await r1.json();
          const d2 = r2.ok ? await r2.json() : { results: [] };
          const combined = [...(d1.results || []), ...(d2.results || [])];
          const valid = combined.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
          
          const lowerQuery = query.toLowerCase().trim();
          valid.sort((a: any, b: any) => {
            const aTitle = (a.name || a.title || "").toLowerCase();
            const bTitle = (b.name || b.title || "").toLowerCase();
            const aExact = aTitle === lowerQuery;
            const bExact = bTitle === lowerQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return (b.popularity || 0) - (a.popularity || 0);
          });
          
          const topResults = valid.slice(0, 40);
          const enriched = topResults.map((m: any) => ({
            id: String(m.id) + (m.media_type === "tv" ? "-tv" : ""),
            tmdbId: String(m.id),
            isTv: m.media_type === "tv",
            title: m.media_type === "tv" ? m.name : m.title,
            originalTitle: m.media_type === "tv" ? m.original_name : m.original_title,
            description: m.overview,
            posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
            backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/w780\${m.backdrop_path}\` : "",
            year: (m.media_type === "tv" ? m.first_air_date : m.release_date) ? parseInt((m.media_type === "tv" ? m.first_air_date : m.release_date).substring(0, 4)) : new Date().getFullYear(),
            voteAverage: m.vote_average,
            director: "Unknown",
            cast: [],
            genre: [],
            isIframeEmbed: true,
            iframeSrc: m.media_type === "tv" ? "" : \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
          }));
          return new Response(JSON.stringify({ success: true, results: enriched }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/movie/")) {
      return (async () => {
        try {
          const parts = url.split("/api/movie/");
          const id = parts[1]?.split("?")[0];
          const isTv = id.endsWith('-tv');
          const actualId = isTv ? id.replace('-tv', '') : id;
          const u = isTv 
             ? \`https://api.themoviedb.org/3/tv/\${actualId}?append_to_response=credits,videos,similar&language=en-US\`
            : \`https://api.themoviedb.org/3/movie/\${actualId}?append_to_response=credits,videos,similar&language=en-US\`;
          const res = await fetch(u, { headers: { "Authorization": \`Bearer ${TMDB_TOKEN}\`, "Accept": "application/json" } });
          if (!res.ok) throw new Error("TMDB failed");
          const m = await res.json();
          const releaseDate = isTv ? m.first_air_date : m.release_date;
          
          let seasons = [];
          if (isTv && m.seasons) {
            seasons = m.seasons.filter((s: any) => s.season_number > 0).map((s: any) => ({
              season_number: s.season_number,
              name: s.name,
              episode_count: s.episode_count,
              air_date: s.air_date,
              poster_path: s.poster_path ? \`https://image.tmdb.org/t/p/w500\${s.poster_path}\` : "",
              episodes: []
            }));
          }
          
          const movieData = {
            id: id,
            tmdbId: String(m.id),
            imdbId: m.imdb_id || String(m.id),
            isTv,
            tagline: m.tagline || "",
            title: isTv ? m.name : m.title,
            originalTitle: isTv ? m.original_name : m.original_title,
            originalLanguage: m.original_language || "en",
            description: m.overview,
            posterUrl: m.poster_path ? \`https://image.tmdb.org/t/p/w500\${m.poster_path}\` : "",
            backdropUrl: m.backdrop_path ? \`https://image.tmdb.org/t/p/original\${m.backdrop_path}\` : "",
            year: releaseDate ? parseInt(releaseDate.substring(0, 4)) : new Date().getFullYear(),
            duration: isTv ? (m.episode_run_time?.[0] || 45) : (m.runtime || 120),
            director: "Unknown",
            cast: m.credits?.cast?.slice(0, 4).map((c: any) => c.name) || [],
            genre: m.genres ? m.genres.map((g: any) => g.name) : (isTv ? ["TV Series"] : ["Movie"]),
            voteAverage: m.vote_average,
            isIframeEmbed: true,
            seasons: seasons,
            iframeSrc: isTv ? "" : \`https://player.videasy.net/movie/\${m.id}?color=FFD700&overlay=true\`
          };
          return new Response(JSON.stringify({ success: true, movie: movieData }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/tv/")) {
      return (async () => {
        try {
          const parts = url.split("/api/tv/");
          const rest = parts[1]?.split("?")[0];
          const [id, seasonPart, seasonNumber] = rest.split("/");
          const cleanId = id.replace("-tv", "");
          const u = \`https://api.themoviedb.org/3/tv/\${cleanId}/season/\${seasonNumber}?language=en-US\`;
          const res = await fetch(u, { headers: { "Authorization": \`Bearer ${TMDB_TOKEN}\`, "Accept": "application/json" } });
          if (!res.ok) throw new Error("TMDB failed");
          const seasonData = await res.json();
          const episodes = seasonData.episodes.map((ep: any) => ({
            id: ep.id,
            episode_number: ep.episode_number,
            name: ep.name,
            overview: ep.overview,
            stillUrl: ep.still_path ? \`https://image.tmdb.org/t/p/w500\${ep.still_path}\` : "",
            air_date: ep.air_date,
            runtime: ep.runtime
          }));
          return new Response(JSON.stringify({ success: true, episodes }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();`;

code = code.replace(/    } else if \(isNetlify && url\.startsWith\("\/api\/playback\/"\)\) \{/, inject + "\n    } else if (isNetlify && url.startsWith(\"/api/playback/\")) {");

fs.writeFileSync('src/main.tsx', code, 'utf-8');
console.log("Mocked API endpoints in main.tsx");
