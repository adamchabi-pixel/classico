import re

def patch_component(filepath, var_name):
    with open(filepath, "r") as f:
        content = f.read()

    # Find the top of the component
    # We will inject a useEffect that checks localStorage on mount
    
    inject = f"""
  // 4. REPRISE DE LA LECTURE: Inject saved progress on mount
  useEffect(() => {{
    if (movieId) {{
      try {{
        const saved = JSON.parse(localStorage.getItem("classico_progress") || "{{}}");
        if (saved[movieId] && saved[movieId].currentTime > 0) {{
           {var_name}.current = saved[movieId].currentTime;
           console.log("[RESUME PLAYBACK] Found saved progress for " + movieId + ": " + {var_name}.current + "s");
        }}
      }} catch(e) {{}}
    }}
  }}, [movieId]);
"""
    # Insert right before the first useEffect
    target = "  useEffect(() => {"
    if target in content:
        content = content.replace(target, inject + target, 1)
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Patched {filepath}")
    else:
        print(f"Could not find useEffect in {filepath}")

patch_component("src/components/VideoPlayer.tsx", "savedRestoreTime")
patch_component("src/components/CinemaPlayerView.tsx", "savedRestoreTimeRef")

