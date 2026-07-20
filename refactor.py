import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace Jellyfin references
content = re.sub(r'jellyfinMovies', 'catalogMovies', content)
content = re.sub(r'setJellyfinMovies', 'setCatalogMovies', content)
content = re.sub(r'isJellyfinLoading', 'isCatalogLoading', content)
content = re.sub(r'setIsJellyfinLoading', 'setIsCatalogLoading', content)
content = re.sub(r'isJellyfinError', 'isCatalogError', content)
content = re.sub(r'setIsJellyfinError', 'setIsCatalogError', content)
content = re.sub(r'loadJellyfinLibrary', 'loadCatalogLibrary', content)

content = re.sub(r'jellyfinHeroMovies', 'heroMovies', content)
content = re.sub(r'setJellyfinHeroMovies', 'setHeroMovies', content)
content = re.sub(r'isJellyfinHeroLoading', 'isHeroLoading', content)
content = re.sub(r'setIsJellyfinHeroLoading', 'setIsHeroLoading', content)
content = re.sub(r'loadJellyfinHeroMovie', 'loadHeroMovie', content)
content = re.sub(r'useTextTitleForJellyfinHero', 'useTextTitleForHero', content)
content = re.sub(r'setUseTextTitleForJellyfinHero', 'setUseTextTitleForHero', content)

content = re.sub(r'isJellyfin:', 'isCatalog:', content)
content = re.sub(r'jellyfinSearchQuery', 'searchQuery', content)
content = re.sub(r'setJellyfinSearchQuery', 'setSearchQuery', content)

content = content.replace('/api/jellyfin/movies', '/api/movies')
content = content.replace('/api/jellyfin/hero', '/api/hero')

# Remove Jellyfin Config state and logic
content = re.sub(r'const \[jellyfinConfig[\s\S]*?;\n', '', content)
content = re.sub(r'const \[jellyfinInputUrl[\s\S]*?;\n', '', content)
content = re.sub(r'const \[jellyfinInputApiKey[\s\S]*?;\n', '', content)

content = re.sub(r'const handleConnectJellyfin = async \(e: React.FormEvent\) => \{[\s\S]*?\}\s*};\n', '', content)
content = re.sub(r'const handleDisconnectJellyfin = async \(\) => \{[\s\S]*?\}\s*};\n', '', content)

content = re.sub(r'// Check Jellyfin server configuration status[\s\S]*?checkJellyfinSetup\(\);\n', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

