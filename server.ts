import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { importedMoviesData } from './src/data/imported_movies';

const app = express();
const PORT = 3000;

app.get("/api/movies", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.json({ success: true, movies: importedMoviesData });
});

app.get("/api/hero", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  // Use the last 5 movies added (reverse chronological)
  const heroes = [...importedMoviesData].reverse().slice(0, 5);
  res.json({ success: true, heroes });
});

app.get("/api/playback/:id", (req, res) => {
  const movie = importedMoviesData.find(m => m.id === req.params.id);
  if (movie && movie.isIframeEmbed) {
    res.json({
      success: true,
      isIframeEmbed: true,
      iframeSrc: movie.iframeSrc
    });
  } else {
    res.status(404).json({ success: false, error: "Movie source not found." });
  }
});

// Remove old bulk import API since user wants manual imports from now on
// But let's return a simple structure just in case they click something by accident

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use("/src", express.static(path.join(process.cwd(), "src")));
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
