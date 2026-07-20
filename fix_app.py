import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove duplicate searchQuery
content = re.sub(r'const \[searchQuery, setSearchQuery\] = useState\(""\);\n', '', content, count=1)

# Fix isHeroLoading redeclaration and jellyfinConfig
content = re.sub(r'const isHeroLoading =[\s\S]*?;\n', '', content)

content = re.sub(r'// Load Jellyfin Hero whenever config status updates[\s\S]*?}, \[jellyfinConfig\?\.configured\]\);\n', '''// Load Catalog and Hero on mount
  useEffect(() => {
    loadHeroMovie();
    loadCatalogLibrary();
  }, []);
''', content)

# Remove jellyfinConfig check in the JSX
content = re.sub(r'\) : jellyfinConfig\?\.configured && heroMovies\.length > 0 && jellyfinHeroMovie \? \(', ') : heroMovies.length > 0 && jellyfinHeroMovie ? (', content)
content = re.sub(r'jellyfinHeroMovie', 'heroMovie', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
