import sys

with open("server.ts", "r") as f:
    content = f.read()

# 1. Fix /api/jellyfin/movies to return imported movies when !config
target_movies_config = """  const config = getJellyfinConfig();
  if (!config) {
    res.status(401).json({ success: false, error: "Serveur non configuré." });
    return;
  }"""
replacement_movies_config = """  const config = getJellyfinConfig();
  if (!config) {
    res.json({ success: true, movies: getGlobalImportedMovies() });
    return;
  }"""
content = content.replace(target_movies_config, replacement_movies_config)

# 2. Fix /api/jellyfin/hero to return imported movies when !config
target_hero_config = """  const config = getJellyfinConfig();
  if (!config) {
    res.status(401).json({ success: false, error: "Serveur non configuré." });
    return;
  }"""
replacement_hero_config = """  const config = getJellyfinConfig();
  if (!config) {
    res.json({ success: true, heroes: getGlobalImportedMovies().reverse().slice(0, 5) });
    return;
  }"""
content = content.replace(target_hero_config, replacement_hero_config)

# 3. Remove Jellyfin posters entirely from fetchAndCacheMovies
target_poster = """      posterUrl: `${config.url}/Items/${item.Id}/Images/Primary?fillHeight=720&fillWidth=480&quality=96`,
      backdropUrl: `${config.url}/Items/${item.Id}/Images/Backdrop?fillHeight=1080&fillWidth=1920&quality=96`,"""
replacement_poster = """      posterUrl: "", // Jellyfin posters removed per user request
      backdropUrl: "","""
content = content.replace(target_poster, replacement_poster)

target_logo = """      hasLogo: item.ImageTags && item.ImageTags.Logo ? true : false,
      logoUrl: item.ImageTags && item.ImageTags.Logo ? `${config.url}/Items/${item.Id}/Images/Logo?fillHeight=200&fillWidth=400&quality=96` : null,"""
replacement_logo = """      hasLogo: false,
      logoUrl: null,"""
content = content.replace(target_logo, replacement_logo)

with open("server.ts", "w") as f:
    f.write(content)
