import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_catch = """          } catch (libErr) {
            console.warn("Failed to load library movies on check:", libErr);
            setIsJellyfinError("Unable to connect to Jellyfin.");
          } finally {"""

new_catch = """          } catch (libErr) {
            console.warn("Failed to load library movies on check:", libErr);
            setIsJellyfinError("Unable to connect to Jellyfin.");
            setJellyfinConfig({ configured: true, url: targetUrl });
          } finally {"""

content = content.replace(old_catch, new_catch)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
