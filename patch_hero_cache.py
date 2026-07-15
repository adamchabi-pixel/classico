import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_hero = """app.get("/api/jellyfin/hero", async (req, res) => {
  const config = getJellyfinConfig();
  if (!config) {
    res.json({ success: false, error: "Serveur non configuré." });
    return;
  }

  try {"""
new_hero = """app.get("/api/jellyfin/hero", async (req, res) => {
  const config = getJellyfinConfig();
  if (!config) {
    res.json({ success: false, error: "Serveur non configuré." });
    return;
  }

  const cacheKey = "hero-data";
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    res.json({
      success: true,
      heroes: cachedData,
      hero: cachedData[0]
    });
    return;
  }

  try {"""
content = content.replace(old_hero, new_hero)

old_hero_save = """    res.json({
      success: true,
      heroes: formattedHeroes,
      hero: formattedHeroes[0]
    });"""
new_hero_save = """    setCached("hero-data", formattedHeroes, 300000);
    res.json({
      success: true,
      heroes: formattedHeroes,
      hero: formattedHeroes[0]
    });"""
content = content.replace(old_hero_save, new_hero_save)

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
