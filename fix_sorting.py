import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix sorting of Star Wars
old_sort = """      if (/\\b(episode\\s*3|episode\\s*iii\\b|revanche\\s*des\\s*sith|revenge\\s*of\\s*the\\s*sith)/i.test(s)) return 3;
      if (/\\brogue\\s*one\\b/i.test(s)) return 4;
      if (/\\b(episode\\s*4|episode\\s*iv\\b|un\\s*nouvel\\s*espoir|new\\s*hope)/i.test(s)) return 5;"""

new_sort = """      if (/\\b(episode\\s*3|episode\\s*iii\\b|revanche\\s*des\\s*sith|revenge\\s*of\\s*the\\s*sith)/i.test(s)) return 3;
      if (/\\b(episode\\s*4|episode\\s*iv\\b|un\\s*nouvel\\s*espoir|new\\s*hope)/i.test(s)) return 4;
      if (/\\brogue\\s*one\\b/i.test(s)) return 4.5;"""

content = content.replace(old_sort, new_sort)

# Fix alias for Godfather
alias_regex = re.compile(r'const aliasGroups = \[')
if alias_regex.search(content):
    content = content.replace('const aliasGroups = [', 'const aliasGroups = [\n    ["the godfather", "le parrain", "godfather 1", "godfather part 1", "le parrain 1"],\n    ["the godfather part ii", "le parrain 2", "godfather 2", "le parrain 2e partie", "le parrain 2e partie", "the godfather part 2"],\n    ["the godfather part iii", "le parrain 3", "godfather 3", "le parrain 3e partie", "the godfather part 3"],\n    ["the irishman", "irishman"],\n    ["american gangster", "american gangster (2007)", "american gangster (version longue)"],\n    ["the batman", "batman"],\n    ["the batman", "batman begins", "the dark knight", "the dark knight rises"],\n    ["star wars episode i", "la menace fantome", "star wars: episode i", "star wars 1"],\n    ["star wars episode ii", "attaque des clones", "star wars: episode ii", "star wars 2"],\n    ["star wars episode iii", "revanche des sith", "star wars: episode iii", "star wars 3"],\n    ["star wars episode iv", "un nouvel espoir", "star wars: episode iv", "star wars 4", "guerre des etoiles", "star wars"],\n    ["star wars episode v", "empire contre attaque", "star wars: episode v", "star wars 5"],\n    ["star wars episode vi", "retour du jedi", "star wars: episode vi", "star wars 6"],')

# Fix "other bangers" logic to exclude Star Wars
# Actually I will just exclude it directly in unmatchedMovies calculation
unmatched_target = """  const unmatchedMovies = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];
    
    const inCollections = new Set<string>();
    mappedCollections.forEach(c => c.movies.forEach(m => inCollections.add(m.id)));

    return jellyfinMovies.filter(m => !inCollections.has(m.id));
  }, [jellyfinMovies, mappedCollections]);"""

unmatched_replace = """  const unmatchedMovies = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];
    
    const inCollections = new Set<string>();
    mappedCollections.forEach(c => c.movies.forEach(m => inCollections.add(m.id)));

    return jellyfinMovies.filter(m => {
        if (inCollections.has(m.id)) return false;
        const lower = m.title.toLowerCase();
        if (lower.includes("star wars") || lower.includes("guerre des etoiles")) return false;
        return true;
    });
  }, [jellyfinMovies, mappedCollections]);"""

content = content.replace(unmatched_target, unmatched_replace)

with open("src/App.tsx", "w") as f:
    f.write(content)

