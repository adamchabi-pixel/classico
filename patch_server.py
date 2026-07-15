import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_config = """function getJellyfinConfig() {
  const envUrl = process.env.JELLYFIN_URL;
  const envApiKey = process.env.JELLYFIN_API_KEY;

  if (envUrl && envApiKey) {
    // Clean trailing slashes
    let formattedUrl = envUrl.trim();
    if (formattedUrl.endsWith("/")) {
      formattedUrl = formattedUrl.substring(0, formattedUrl.length - 1);
    }
    return { url: formattedUrl, apiKey: envApiKey.trim() };
  }

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const content = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading Jellyfin config:", e);
    }
  }

  return null;
}"""

new_config = """function getJellyfinConfig() {
  const envUrl = process.env.JELLYFIN_URL;
  const envApiKey = process.env.JELLYFIN_API_KEY;

  if (envUrl && envApiKey) {
    // Clean trailing slashes
    let formattedUrl = envUrl.trim();
    if (formattedUrl.endsWith("/")) {
      formattedUrl = formattedUrl.substring(0, formattedUrl.length - 1);
    }
    return { url: formattedUrl, apiKey: envApiKey.trim() };
  }

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const content = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading Jellyfin config:", e);
    }
  }

  // DEFAULT FALLBACK TO PREVENT WHITE SCREENS FOR NEW VISITORS
  return { 
    url: "https://jellyfin-jacklumber00.siren.mygiga.cloud", 
    apiKey: "a2aac09e434e4bcc897c1b181ca197eb" 
  };
}"""

content = content.replace(old_config, new_config)

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
