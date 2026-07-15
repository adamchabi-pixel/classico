import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add cache for cleanTitle
old_clean_title = """function cleanTitle(title: string): string {
  if (!title) return "";
  let t = title.toLowerCase();"""
new_clean_title = """const _cleanTitleCache = new Map<string, string>();
function cleanTitle(title: string): string {
  if (!title) return "";
  if (_cleanTitleCache.has(title)) return _cleanTitleCache.get(title)!;
  let t = title.toLowerCase();"""

content = content.replace(old_clean_title, new_clean_title)

old_clean_return = """    .replace(/\\s+/g, " ")           // collapse spaces
    .trim();
}"""
new_clean_return = """    .replace(/\\s+/g, " ")           // collapse spaces
    .trim();
  _cleanTitleCache.set(title, t);
  return t;
}"""
content = content.replace(old_clean_return, new_clean_return)


# 2. Lift aliasGroups
old_alias = """  const aliasGroups = [
    ["the godfather", "le parrain", "godfather 1", "godfather part 1", "le parrain 1"],"""

# Find the end of aliasGroups
import_end = content.find("];", content.find("const aliasGroups = [")) + 2
alias_block = content[content.find("const aliasGroups = [") : import_end]

# Extract it and put it before function isMovieMatch
content = content.replace(alias_block, "")
new_alias_block = alias_block + "\n\nconst _cleanedAliasGroups = aliasGroups.map(group => group.map(a => cleanTitle(a)));\n\n"

content = content.replace("function isMovieMatch(title1: string, title2: string): boolean {", new_alias_block + "function isMovieMatch(title1: string, title2: string): boolean {")

# 3. Update the loop
old_loop = """  for (const group of aliasGroups) {
    const hasT1 = group.some(alias => t1 === alias || cleanTitle(alias) === t1);
    const hasT2 = group.some(alias => t2 === alias || cleanTitle(alias) === t2);
    if (hasT1 && hasT2) return true;
  }"""
new_loop = """  for (const group of _cleanedAliasGroups) {
    const hasT1 = group.includes(t1);
    const hasT2 = group.includes(t2);
    if (hasT1 && hasT2) return true;
  }"""
content = content.replace(old_loop, new_loop)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
