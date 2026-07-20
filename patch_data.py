import sys

with open("src/data.ts", "r") as f:
    content = f.read()

target = """export interface Movie {
  id: string;"""

replacement = """export interface Movie {
  id: string;
  isIframeEmbed?: boolean;
  iframeSrc?: string;
  hasLogo?: boolean;
  logoUrl?: string | null;
  tmdbId?: string;
  imdbId?: string;
  voteAverage?: number;
  status?: string;"""

content = content.replace(target, replacement)

with open("src/data.ts", "w") as f:
    f.write(content)
