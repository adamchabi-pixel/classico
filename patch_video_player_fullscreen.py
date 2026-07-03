import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

# Replace Subtitle button
target_subtitle = """                >
                  <Captions className="w-4.5 h-4.5" />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Sous-titres</span>"""
replacement_subtitle = """                >
                  <Captions className="w-4.5 h-4.5" />"""
if target_subtitle in content:
    content = content.replace(target_subtitle, replacement_subtitle)
    print("Patched Subtitle text in VideoPlayer")

# Replace Audio button
target_audio = """                >
                  <Volume2 className="w-4.5 h-4.5" />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Audio</span>"""
replacement_audio = """                >
                  <Volume2 className="w-4.5 h-4.5" />"""
if target_audio in content:
    content = content.replace(target_audio, replacement_audio)
    print("Patched Audio text in VideoPlayer")

target_fullscreen = """            {/* Fullscreen Button */}
            <button
              id="player-fullscreen-btn"
              type="button"
              onClick={handleFullscreenToggle}
              className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer touch-manipulation z-50 relative"
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
                className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer touch-manipulation z-50 relative"
                title="AirPlay"
              >
                <Airplay className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              id="player-fullscreen-btn"
              type="button"
              onClick={handleFullscreenToggle}
              className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer touch-manipulation z-50 relative"
              title="Plein écran"
            >"""

if target_fullscreen in content:
    content = content.replace(target_fullscreen, replacement_fullscreen)
    print("Patched Airplay button in VideoPlayer")
else:
    print("Airplay button target not found in VideoPlayer")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
