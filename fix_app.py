import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """  // Intercept and return the standalone full-screen cinema view with zero overlay UI
  if (activeTab === "player") {
    const pId = routePath.startsWith("/player/") ? routePath.slice("/player/".length) : "";
    return (
      <ErrorBoundary 
        fallbackTitle="Interruption de la lecture du film"
        onReset={() => navigateTo("/movie/" + pId)}
      >
        <CinemaPlayerView
          movieId={pId}
          movieTitle={activeMovie?.title || "Film de Culte"}
          movieDuration={activeMovie?.duration}
          onClose={() => navigateTo("/movie/" + pId)}
        />
      </ErrorBoundary>
    );
  }"""

replacement = """  // Intercept and return the standalone full-screen cinema view with zero overlay UI
  if (activeTab === "player") {
    const pId = routePath.startsWith("/player/") ? routePath.slice("/player/".length) : "";
    
    if (activeMovie && !activeMovie.isJellyfin) {
      return (
        <div className="fixed inset-0 z-50 bg-black w-screen h-screen flex flex-col">
          <VideoPlayer
            streamUrl={activeMovie.streamUrl || null}
            movieTitle={activeMovie.title}
            movieSymbol={activeMovie.symbol}
            movieGradient={activeMovie.gradient}
            movieDuration={activeMovie.duration}
            onCloseView={() => navigateTo("/movie/" + pId)}
            movieId={pId}
            isJellyfinMovie={false}
          />
        </div>
      );
    }
    
    return (
      <ErrorBoundary 
        fallbackTitle="Interruption de la lecture du film"
        onReset={() => navigateTo("/movie/" + pId)}
      >
        <CinemaPlayerView
          movieId={pId}
          movieTitle={activeMovie?.title || "Film de Culte"}
          movieDuration={activeMovie?.duration}
          onClose={() => navigateTo("/movie/" + pId)}
        />
      </ErrorBoundary>
    );
  }"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("TARGET NOT FOUND IN APP.TSX")

# also need to import VideoPlayer
if "import VideoPlayer" not in content:
    content = content.replace("import CinemaPlayerView from \"./components/CinemaPlayerView\";", "import CinemaPlayerView from \"./components/CinemaPlayerView\";\nimport VideoPlayer from \"./components/VideoPlayer\";")

with open("src/App.tsx", "w") as f:
    f.write(content)
