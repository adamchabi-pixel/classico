import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

target_fullscreen = """            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-1.5 text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Plein écran"
            >"""

replacement_fullscreen = """            {/* AirPlay Control */}
            {typeof window !== "undefined" && (window as any).WebKitPlaybackTargetAvailabilityEvent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current && (videoRef.current as any).webkitShowPlaybackTargetPicker) {
                    (videoRef.current as any).webkitShowPlaybackTargetPicker();
                  }
                }}
                className="p-1.5 text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="AirPlay"
              >
                <Airplay className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-1.5 text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Plein écran"
            >"""

if target_fullscreen in content:
    content = content.replace(target_fullscreen, replacement_fullscreen)
    print("Patched Airplay button")
else:
    print("Airplay button target not found")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
