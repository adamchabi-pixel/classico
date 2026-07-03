import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Add Airplay import
if "Airplay" not in content:
    content = content.replace("Captions, Lock", "Captions, Lock, Airplay")

# Add x-webkit-airplay="allow" to video element
target_video = """<video
            ref={videoRef}
            playsInline"""
replacement_video = """<video
            ref={videoRef}
            x-webkit-airplay="allow"
            playsInline"""
if target_video in content:
    content = content.replace(target_video, replacement_video)
    print("Patched <video> element")

# Replace Subtitle button
target_subtitle = """                  <Captions className="w-5 h-5" />
                  <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">Sous-titres</span>"""
replacement_subtitle = """                  <Captions className="w-5 h-5" />"""
if target_subtitle in content:
    content = content.replace(target_subtitle, replacement_subtitle)
    print("Patched Subtitle button")

# Replace Audio button
target_audio = """                <Languages className="w-5 h-5" />
                <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider hidden sm:inline">Audio</span>"""
replacement_audio = """                <Languages className="w-5 h-5" />"""
if target_audio in content:
    content = content.replace(target_audio, replacement_audio)
    print("Patched Audio button")

# Find the place to insert the Airplay button, right next to Audio button
# Let's locate the div containing these buttons.
target_div = """              </button>

              {/* Audio dropdown/popover */}"""
# Wait, this is the end of Audio button. Let's find exactly the end of audio button.
# Let's add it right before the fullscreen button, or right after subtitle.
# Let's search for "Fullscreen" or "Maximize2"
target_fullscreen = """            {/* Fullscreen control */}
            <button
              onClick={(e) => {"""

replacement_fullscreen = """            {/* AirPlay Control */}
            {typeof window !== "undefined" && (window as any).WebKitPlaybackTargetAvailabilityEvent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current && (videoRef.current as any).webkitShowPlaybackTargetPicker) {
                    (videoRef.current as any).webkitShowPlaybackTargetPicker();
                  }
                }}
                className="text-white/60 hover:text-white p-1.5 active:scale-90 transition-all duration-150 cursor-pointer"
                title="AirPlay"
              >
                <Airplay className="w-5 h-5" />
              </button>
            )}

            {/* Fullscreen control */}
            <button
              onClick={(e) => {"""

if target_fullscreen in content:
    content = content.replace(target_fullscreen, replacement_fullscreen)
    print("Patched Airplay button")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
