import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_unmatched = """  const unmatchedMovies = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];
    
    const inCollections = new Set<string>();
    mappedCollections.forEach(c => c.movies.forEach(m => inCollections.add(m.id)));

    return jellyfinMovies.filter(m => {
      if (inCollections.has(m.id)) return false;
      return true;
    });
  }, [jellyfinMovies, mappedCollections]);"""

# Wait, let's do a more robust string replacement

pattern = r"const unmatchedMovies = React\.useMemo\(\(\) => \{.*?return jellyfinMovies\.filter\(m => \{.*?\n    \}\);\n  \}, \[jellyfinMovies, mappedCollections\]\);"

new_unmatched = """  const unmatchedMovies = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];
    
    const inCollections = new Set<string>();
    mappedCollections.forEach(c => c.movies.forEach(m => inCollections.add(m.id)));

    return jellyfinMovies.filter(m => {
      if (inCollections.has(m.id)) return false;
      const t = m.title.toLowerCase();
      if (t.includes("john wick")) return false;
      if (t.includes("batman begins")) return false;
      if (t.includes("fast and furious") || t.includes("fast & furious") || t.includes("furious 7") || t.includes("fast 5") || t.includes("fast x")) return false;
      if (t.includes("devil wears prada 2") || t.includes("le diable s'habille en prada 2")) return false;
      if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;
      return true;
    });
  }, [jellyfinMovies, mappedCollections]);"""

text = re.sub(pattern, new_unmatched, text, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(text)
