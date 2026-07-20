const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/async function getPlaybackData\(id: string, forceTranscode\?: boolean, lowQuality\?: boolean\) \{/, 'async function getPlaybackData(id: string, forceTranscode?: boolean, lowQuality?: boolean, forceJellyfin?: boolean) {');
code = code.replace(/const cacheKey = `\$\{id\}-\$\{forceTranscode \|\| false\}-\$\{lowQuality \|\| false\}`;/, 'const cacheKey = `${id}-${forceTranscode || false}-${lowQuality || false}-${forceJellyfin || false}`;');
code = code.replace(/if \(id === "tt33764258" \|\| id\.startsWith\("tt"\) \|\| isNumeric\) \{/, 'if (!forceJellyfin && (id === "tt33764258" || id.startsWith("tt") || isNumeric)) {');
code = code.replace(/if \(itemData\.ProviderIds\) \{/, 'if (!forceJellyfin && itemData.ProviderIds) {');

code = code.replace(/app\.get\("\/api\/playback\/:id", async \(req, res\) => \{[\s\S]*?try \{[\s\S]*?const data = await getPlaybackData\(id, forceTranscode, lowQuality\);/, `app.get("/api/playback/:id", async (req, res) => {
  const { id } = req.params;
  const forceTranscode = req.query.forceTranscode === "true";
  const lowQuality = req.query.lowQuality === "true";
  const forceJellyfin = req.query.forceJellyfin === "true";
  try {
    const data = await getPlaybackData(id, forceTranscode, lowQuality, forceJellyfin);`);

fs.writeFileSync('server.ts', code);
