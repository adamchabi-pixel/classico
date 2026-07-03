import re

with open("src/App.tsx", "r") as f:
    content = f.read()

vp_target = """          <VideoPlayer
            streamUrl={activeMovie.streamUrl || null}
            movieTitle={activeMovie.title}
            movieSymbol={activeMovie.symbol}
            movieGradient={activeMovie.gradient}
            movieDuration={activeMovie.duration}
            onCloseView={() => navigateTo("/")}
            movieId={activeMovie.id}
            isJellyfinMovie={activeMovie.isJellyfin}
          />"""

vp_replacement = """          <VideoPlayer
            streamUrl={activeMovie.streamUrl || null}
            movieTitle={activeMovie.title}
            movieSymbol={activeMovie.symbol}
            movieGradient={activeMovie.gradient}
            movieDuration={activeMovie.duration}
            onCloseView={() => navigateTo("/")}
            movieId={activeMovie.id}
            isJellyfinMovie={activeMovie.isJellyfin}
            moviePoster={activeMovie.posterUrl || activeMovie.poster}
          />"""
content = content.replace(vp_target, vp_replacement)

cp_target = """        <CinemaPlayerView
          movieId={pId}
          movieTitle={activeMovie?.title || "Film de Culte"}
          movieDuration={activeMovie?.duration}
          onClose={() => navigateTo("/movie/" + pId)}
        />"""

cp_replacement = """        <CinemaPlayerView
          movieId={pId}
          movieTitle={activeMovie?.title || "Film de Culte"}
          movieDuration={activeMovie?.duration}
          moviePoster={activeMovie?.posterUrl || activeMovie?.poster}
          onClose={() => navigateTo("/movie/" + pId)}
        />"""
content = content.replace(cp_target, cp_replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Patched App.tsx props")
