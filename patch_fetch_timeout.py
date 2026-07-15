import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Insert fetchWithTimeout
fetch_timeout_code = """
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs: number = 4500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}
"""
content = content.replace("const apiCache = new Map<string, CacheEntry>();", fetch_timeout_code + "const apiCache = new Map<string, CacheEntry>();")

content = content.replace("await fetch(testUrl", "await fetchWithTimeout(testUrl")
content = content.replace("await fetch(`${config.url}/Users?api_key=${config.apiKey}`)", "await fetchWithTimeout(`${config.url}/Users?api_key=${config.apiKey}`)")
content = content.replace("await fetch(libraryUrl)", "await fetchWithTimeout(libraryUrl)")
content = content.replace("await fetch(usersUrl", "await fetchWithTimeout(usersUrl")
content = content.replace("await fetch(latestUrl)", "await fetchWithTimeout(latestUrl)")
content = content.replace("await fetch(jellyfinImageUrl", "await fetchWithTimeout(jellyfinImageUrl")
content = content.replace("await fetch(searchUrl)", "await fetchWithTimeout(searchUrl)")
content = content.replace("await fetch(pbUrl", "await fetchWithTimeout(pbUrl")
content = content.replace("await fetch(itemUrl)", "await fetchWithTimeout(itemUrl)")
# do not replace the stream proxy one

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
