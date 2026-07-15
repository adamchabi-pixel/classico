import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_match = """  // Star Wars specific match
  if (isStarWarsEpisodeMatch(title1, title2)) {
    return true;
  }

  // James Bond specific match
  if (isBondMovieMatch(title1, title2)) {
    return true;
  }"""

new_match = """  // Star Wars specific match
  if (t1.includes("star") || t1.includes("wars") || t1.includes("jedi") || t1.includes("sith") || t1.includes("empire")) {
    if (isStarWarsEpisodeMatch(title1, title2)) return true;
  }

  // James Bond specific match
  if (t1.includes("bond") || t1.includes("007") || t1.includes("casino") || t1.includes("no time")) {
    if (isBondMovieMatch(title1, title2)) return true;
  }"""

content = content.replace(old_match, new_match)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
