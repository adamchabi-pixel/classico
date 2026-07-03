import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

# Add Airplay import
if "Airplay" not in content:
    content = content.replace("Captions,", "Captions, Airplay,")

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
    print("Patched <video> element in VideoPlayer")

# Replace Subtitle button
target_subtitle = """                  <MessageSquare className="w-4.5 h-4.5" />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Sous-titres</span>"""
replacement_subtitle = """                  <MessageSquare className="w-4.5 h-4.5" />"""
if target_subtitle in content:
    content = content.replace(target_subtitle, replacement_subtitle)
    print("Patched Subtitle button in VideoPlayer")
else:
    target_subtitle2 = """<Captions className="w-4.5 h-4.5" />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Sous-titres</span>"""
    replacement_subtitle2 = """<Captions className="w-4.5 h-4.5" />"""
    if target_subtitle2 in content:
        content = content.replace(target_subtitle2, replacement_subtitle2)
        print("Patched Subtitle button (Captions) in VideoPlayer")

# Replace Audio button
target_audio = """                  <Volume2 className="w-4.5 h-4.5" />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Audio</span>"""
replacement_audio = """                  <Volume2 className="w-4.5 h-4.5" />"""
if target_audio in content:
    content = content.replace(target_audio, replacement_audio)
    print("Patched Audio button in VideoPlayer")
else:
    target_audio2 = """<Languages className="w-4.5 h-4.5" />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Audio</span>"""
    replacement_audio2 = """<Languages className="w-4.5 h-4.5" />"""
    if target_audio2 in content:
        content = content.replace(target_audio2, replacement_audio2)
        print("Patched Audio button (Languages) in VideoPlayer")

# Insert the Airplay button right next to Audio button
target_fullscreen = """            <button
              onClick={() => toggleFullscreen(playerContainerRef.current!)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="AirPlay"
              >
                <Airplay className="w-4.5 h-4.5" />
              </button>
            )}

            <button
              onClick={() => toggleFullscreen(playerContainerRef.current!)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Plein écran"
            >"""

if target_fullscreen in content:
    content = content.replace(target_fullscreen, replacement_fullscreen)
    print("Patched Airplay button in VideoPlayer")
else:
    print("Airplay button target not found in VideoPlayer")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
