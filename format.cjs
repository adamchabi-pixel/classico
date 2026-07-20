const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf8');

code = code.replace(
  '  const [expandedSection, setExpandedSection] = useState<"synopsis" | "casting" | "trailer" | null>("synopsis");',
  `  const formatDuration = (minutes: number) => {
    if (!minutes) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return \`\${h}h \${m > 0 ? m + 'm' : ''}\`;
    return \`\${m}m\`;
  };
  const [expandedSection, setExpandedSection] = useState<"synopsis" | "casting" | "trailer" | null>("synopsis");`
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code);
