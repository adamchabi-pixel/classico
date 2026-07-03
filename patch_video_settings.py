import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

# 1. Add lucide icons
if "Menu, Cast" not in content:
    content = content.replace("Captions, Airplay, Maximize2", "Captions, Airplay, Maximize2, Menu, Cast, Settings")

# 2. Update states
state_target = """  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);"""
state_replacement = """  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showAudioMenu, setShowAudioMenu] = useState(false);"""
if state_target in content:
    content = content.replace(state_target, state_replacement)
else:
    print("State target not found in VideoPlayer")

# 3. Add closing menu when controls hide
effect_target = """    if (!videoState.showControls) {
      if (typeof window !== "undefined") {
        window.document.body.style.cursor = "none";
      }
    }"""
effect_replacement = """    if (!videoState.showControls) {
      setShowSettingsMenu(false);
      if (typeof window !== "undefined") {
        window.document.body.style.cursor = "none";
      }
    }"""
if effect_target in content:
    content = content.replace(effect_target, effect_replacement)
else:
    print("Effect target not found in VideoPlayer")

# Add click outside logic
click_outside_target = """  useEffect(() => {
    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);"""
click_outside_replacement = """  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#player-settings-btn") && !target.closest("#player-settings-menu")) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      if (syncInterval.current) clearInterval(syncInterval.current);"""
if click_outside_target in content:
    content = content.replace(click_outside_target, click_outside_replacement)
else:
    print("Click outside target not found in VideoPlayer")

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
