import sys
import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace handleConnectJellyfin
target_connect = r'const handleConnectJellyfin = async \(e: React\.FormEvent\) => \{.*?\};'
replacement_connect = """const handleConnectJellyfin = async (e: React.FormEvent) => {
    e.preventDefault();
  };"""
content = re.sub(target_connect, replacement_connect, content, flags=re.DOTALL)

# Replace handleDisconnectJellyfin
target_disconnect = r'const handleDisconnectJellyfin = async \(\) => \{.*?\};'
replacement_disconnect = """const handleDisconnectJellyfin = async () => {
  };"""
content = re.sub(target_disconnect, replacement_disconnect, content, flags=re.DOTALL)

# Replace checkJellyfinSetup
target_check = r'const checkJellyfinSetup = async \(\) => \{.*?checkJellyfinSetup\(\);\n  \}, \[\]\);'

replacement_check = """const checkJellyfinSetup = async () => {
      setIsJellyfinLoading(true);
      try {
        const [libRes, heroRes] = await Promise.all([
          fetch("/api/movies"),
          fetch("/api/hero")
        ]);
        const libData = await libRes.json();
        const heroData = await heroRes.json();
        if (libData.success) {
          setJellyfinMovies(libData.movies || []);
        }
        if (heroData.success) {
          setJellyfinHeroMovies(heroData.heroes || []);
        }
        setJellyfinConfig({ configured: true, url: "local" });
      } catch (err) {
        console.error(err);
      } finally {
        setIsJellyfinLoading(false);
        setIsJellyfinHeroLoading(false);
      }
    };
    checkJellyfinSetup();
  }, []);"""
content = re.sub(target_check, replacement_check, content, flags=re.DOTALL)

# Replace fetch calls in loadJellyfinLibrary and loadJellyfinHeroMovie
content = content.replace('fetch("/api/jellyfin/movies")', 'fetch("/api/movies")')
content = content.replace('fetch("/api/jellyfin/movies?revalidate=true")', 'fetch("/api/movies")')
content = content.replace('fetch("/api/jellyfin/hero")', 'fetch("/api/hero")')

# Remove settings UI part that talks about Jellyfin server connection
target_settings = r'\{/\* Server Connection Configuration \*/\}.*?\{/\* Media Actions \*/\}'
replacement_settings = "{/* Media Actions */}"
content = re.sub(target_settings, replacement_settings, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Patched successfully")
