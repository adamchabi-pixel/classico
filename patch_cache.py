import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_cache = """const apiCache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
  const entry = apiCache.get(key);
  if (entry && entry.expiry > Date.now()) {
    console.log(`[CACHE LOG] Serveur: Succès cache mémoire pour la clé: "${key}"`);
    return entry.data;
  }
  return null;
}

function setCached(key: string, data: any, ttlMs: number) {
  apiCache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}"""

new_cache = """const apiCache = new Map<string, CacheEntry>();
const CACHE_FILE = path.join(process.cwd(), ".json-cache.json");

function loadDiskCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const fileData = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      for (const [k, v] of Object.entries(parsed)) {
        apiCache.set(k, v as CacheEntry);
      }
    } catch (e) {}
  }
}
loadDiskCache();

function saveDiskCache() {
  try {
    const obj = Object.fromEntries(apiCache.entries());
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), 'utf-8');
  } catch (e) {}
}

function getCached(key: string): any | null {
  const entry = apiCache.get(key);
  if (entry && entry.expiry > Date.now()) {
    console.log(`[CACHE LOG] Serveur: Succès cache pour la clé: "${key}"`);
    return entry.data;
  }
  return null;
}

function setCached(key: string, data: any, ttlMs: number) {
  apiCache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
  saveDiskCache();
}"""

content = content.replace(old_cache, new_cache)

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
