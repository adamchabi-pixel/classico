const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const target = `  if (!userId) {
    throw new Error("Impossible d'obtenir un UserId valide auprès de Jellyfin.");
  }`;

const replacement = `  if (!userId) {
    throw new Error("Impossible d'obtenir un UserId valide auprès de Jellyfin.");
  }

  // NEW: Fetch item directly to get ProviderIds and bypass Jellyfin streaming logic entirely
  try {
    const itemRes = await fetch(\`\${config.url}/Users/\${userId}/Items/\${activeId}?api_key=\${config.apiKey}\`);
    if (itemRes.ok) {
      const itemData = await itemRes.json();
      if (itemData && itemData.ProviderIds) {
        const tmdb = itemData.ProviderIds.Tmdb;
        const imdb = itemData.ProviderIds.Imdb;
        if (tmdb || imdb) {
          const providerId = tmdb || imdb;
          const iframeResult = {
            id: activeId,
            streamUrl: \`https://vidsrc.sbs/embed/movie/\${providerId}\`,
            duration: Math.round((itemData.RunTimeTicks || 0) / 10000000),
            container: "iframe",
            title: itemData.Name || "Film (Embed)",
            isDirect: true,
            isIframeEmbed: true,
            iframeSrc: \`https://vidsrc.sbs/embed/movie/\${providerId}\`,
            subtitles: [],
            audios: []
          };
          playbackCache.set(cacheKey, { data: iframeResult, timestamp: Date.now() });
          return iframeResult;
        }
      }
    }
  } catch (err) {
    console.error("Error fetching item data for provider IDs:", err);
  }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Successfully patched server.ts");
} else {
  console.log("Target not found in server.ts");
}
