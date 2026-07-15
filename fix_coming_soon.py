import re

with open("src/components/MovieDetailView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'const [expandedSection, setExpandedSection] = useState<"synopsis" | "casting" | "trailer" | null>("synopsis");',
    'const [expandedSection, setExpandedSection] = useState<"synopsis" | "casting" | "trailer" | null>("synopsis");\n  const isComingSoon = ["obsession", "devil-wears-prada-2", "backrooms", "michael", "the-matrix"].includes(movie.id);'
)

with open("src/components/MovieDetailView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

