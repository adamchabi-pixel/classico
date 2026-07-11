with open('server.ts', 'r') as f:
    text = f.read()

replacement = """  let mediaSources = pbData.MediaSources || [];
  if (mediaSources.length === 0) {
    throw new Error("Aucune source média trouvée pour ce film.");
  }

  // GLOBAL PIPELINE: Prioritize Web-Friendly Formats (1080p H264 over 4K HEVC) to avoid buffering
  mediaSources.sort((a: any, b: any) => {
    const getScore = (src: any) => {
      const video = (src.MediaStreams || []).find((s: any) => s.Type === "Video");
      const codec = (video?.Codec || "").toLowerCase();
      const width = video?.Width || 0;
      let score = 0;
      if (codec === "h264") score += 10;
      if (width > 0 && width < 3840) score += 5;
      if (codec === "hevc" || codec === "h265") score -= 10;
      if (width >= 3840) score -= 10;
      return score;
    };
    return getScore(b) - getScore(a);
  });
"""

text = text.replace('  let mediaSources = pbData.MediaSources || [];\n  if (mediaSources.length === 0) {\n    throw new Error("Aucune source média trouvée pour ce film.");\n  }', replacement)

with open('server.ts', 'w') as f:
    f.write(text)
