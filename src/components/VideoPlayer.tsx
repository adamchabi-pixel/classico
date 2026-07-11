import { useState, useEffect, useRef, useMemo } from "react";
import Hls from "hls.js";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Captions, Airplay, Maximize2, Menu, PictureInPicture, Cast, Settings2, Info, Sparkles, AlertCircle, Rewind, FastForward, ChevronRight, ChevronLeft
} from "lucide-react";

const logChrono = (step: string) => {
  const clickTime = (window as any).moviePlayClickTime;
  const now = performance.now();
  const elapsed = clickTime ? ((now - clickTime) / 1000).toFixed(3) : "N/A (mount reference)";
  console.log(`%c[CHRONO LECTEUR] %c${step} : %c+${elapsed}s%c (Timestamp: ${new Date().toISOString().slice(11, 23)})`, 
    "color: #a855f7; font-weight: bold;", 
    "color: #ffffff; font-weight: bold;", 
    "color: #10b981; font-weight: bold; font-size: 13px;", 
    "color: #6b7280; font-style: italic;"
  );
};

const isTextSubtitle = (codec: string) => {
  const c = (codec || "").toLowerCase();
  return !["pgs", "hdmv_pgs_subtitle", "vobsub", "dvdsub", "dvd_subtitle"].includes(c);
};

interface VideoPlayerProps {
  streamUrl: string | null;
  movieTitle: string;
  movieSymbol: string;
  movieGradient: string;
  movieDuration: string;
  onCloseView: () => void;
  movieId?: string;
  isJellyfinMovie?: boolean;
  moviePoster?: string;
}

const SIMULATED_SUBTITLES = [
  { time: 2, text: "[Musique orchestrale introductive dramatique]" },
  { time: 5, text: "PRÉSENTÉ PAR LA CINÉMATHÈQUE CLASSICO" },
  { time: 8, text: "[Bruits de pas lourds qui résonnent dans l'ombre]" },
  { time: 11, text: "« Certains considèrent cela comme la fin d'une époque... »" },
  { time: 15, text: "« ...mais pour nous, ce n'est que le commencement. »" },
  { time: 19, text: "[Un coup d'œil mystérieux sous un chapeau légendaire]" },
  { time: 23, text: "« Préparez-vous à entrer dans la légende du cinéma. »" },
  { time: 27, text: "[Explosion retentissante au loin et vrombissement de moteur]" },
  { time: 31, text: "« ...Je crois bien que je suis de retour. »" },
  { time: 35, text: "[Thème musical triomphal de fin et applaudissements]" }
];

const detectHlsOrDash = (url: string | null): boolean => {
  if (!url) return false;
  const lowercase = url.toLowerCase();
  return (
    lowercase.includes(".m3u8") ||
    lowercase.includes(".mpd") ||
    lowercase.includes("/hls/") ||
    lowercase.includes("stream.m3u8") ||
    lowercase.includes("/dash/")
  );
};

const fetchHLSDuration = async (url: string): Promise<number | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    
    // Check if it's a master playlist pointing to another playlist
    if (text.includes("#EXT-X-STREAM-INF")) {
      const lines = text.split("\n");
      const firstStreamLine = lines.find((line, idx) => {
        const prevLine = lines[idx - 1];
        return prevLine && prevLine.includes("#EXT-X-STREAM-INF") && line.trim().length > 0;
      });
      if (firstStreamLine) {
        let subUrl = firstStreamLine.trim();
        if (!subUrl.startsWith("http") && !subUrl.startsWith("/")) {
          const base = url.substring(0, url.lastIndexOf("/") + 1);
          subUrl = base + subUrl;
        } else if (subUrl.startsWith("/")) {
          const urlObj = new URL(url);
          subUrl = `${urlObj.origin}${subUrl}`;
        }
        return fetchHLSDuration(subUrl);
      }
    }
    
    // Sum segment durations e.g., #EXTINF:3.003
    const matches = [...text.matchAll(/#EXTINF:([0-9.]+)/g)];
    if (matches.length > 0) {
      return matches.reduce((sum, match) => sum + parseFloat(match[1]), 0);
    }
  } catch (err) {
    console.error("Error fetching or parsing HLS playlist:", err);
  }
  return null;
};

const fetchDASHDuration = async (url: string): Promise<number | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    const durationMatch = text.match(/mediaPresentationDuration="PT([^"]+)"/);
    if (durationMatch) {
      const durationStr = durationMatch[1];
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      
      const hrMatch = durationStr.match(/(\d+)H/);
      const minMatch = durationStr.match(/(\d+)M/);
      const secMatch = durationStr.match(/([\d.]+)S/);
      
      if (hrMatch) hours = parseInt(hrMatch[1], 10);
      if (minMatch) minutes = parseInt(minMatch[1], 10);
      if (secMatch) seconds = parseFloat(secMatch[1]);
      
      return (hours * 3600) + (minutes * 60) + seconds;
    }
  } catch (err) {
    console.error("Error fetching or parsing DASH MPD:", err);
  }
  return null;
};

const getStreamUrlWithSeek = (baseStreamUrl: string | null, offsetSeconds: number): string | null => {
  if (!baseStreamUrl) return null;
  if (offsetSeconds <= 0) return baseStreamUrl;

  try {
    const baseOrigin = "http://localhost:3000";
    const urlObj = new URL(baseStreamUrl, baseOrigin);
    const pathParam = urlObj.searchParams.get("path");
    if (pathParam) {
      const ticks = Math.round(offsetSeconds * 10000000);
      let newPathParam = pathParam;
      
      // Remove any existing StartTimeTicks and startTimeTicks parameters to be safe
      newPathParam = newPathParam.replace(/[?&]StartTimeTicks=[^&]+/gi, "");
      newPathParam = newPathParam.replace(/[?&]startTimeTicks=[^&]+/gi, "");
      
      // Append both versions of StartTimeTicks to be absolutely bulletproof
      newPathParam += `${newPathParam.includes("?") ? "&" : "?"}StartTimeTicks=${ticks}&startTimeTicks=${ticks}`;
      
      urlObj.searchParams.set("path", newPathParam);
      
      if (baseStreamUrl.startsWith("/")) {
        return urlObj.pathname + urlObj.search;
      }
      return urlObj.toString();
    }
  } catch (e) {
    console.error("Error creating stream URL with seek offset:", e);
  }
  return baseStreamUrl;
};


const TrackName = ({ track }: { track: any }) => {
  const code = (track.language || "").toLowerCase();
  const lbl = (track.label || "").toLowerCase();
  let flagCode: string | null = null;
  let name = track.language || track.label || "Inconnu";

  if (code.includes("fr") || lbl.includes("french") || lbl.includes("français") || lbl.includes("fre")) { flagCode = "fr"; name = "Français"; }
  else if (code.includes("en") || lbl.includes("english") || lbl.includes("eng")) { flagCode = "us"; name = "English"; }
  else if (code.includes("es") || lbl.includes("spanish") || lbl.includes("español") || lbl.includes("spa")) { flagCode = "es"; name = "Español"; }
  else if (code.includes("de") || lbl.includes("german") || lbl.includes("deutsch") || lbl.includes("ger")) { flagCode = "de"; name = "Deutsch"; }
  else if (code.includes("it") || lbl.includes("italian") || lbl.includes("italiano") || lbl.includes("ita")) { flagCode = "it"; name = "Italiano"; }
  else if (code.includes("ja") || lbl.includes("japanese") || lbl.includes("japonais") || lbl.includes("jpn")) { flagCode = "jp"; name = "日本語"; }
  else if (code.includes("zh") || lbl.includes("chinese") || lbl.includes("chinois") || lbl.includes("chi") || lbl.includes("zho")) { flagCode = "cn"; name = "中文"; }
  else if (code.includes("ko") || lbl.includes("korean") || lbl.includes("coréen") || lbl.includes("kor")) { flagCode = "kr"; name = "한국어"; }
  else if (code.includes("pt") || lbl.includes("portuguese") || lbl.includes("portugais") || lbl.includes("por")) { flagCode = "pt"; name = "Português"; }
  else if (code.includes("ru") || lbl.includes("russian") || lbl.includes("russe") || lbl.includes("rus")) { flagCode = "ru"; name = "Русский"; }
  else if (code.includes("ar") || lbl.includes("arabic") || lbl.includes("arabe") || lbl.includes("ara")) { flagCode = "sa"; name = "العربية"; }
  
  else if (code.includes("nl") || lbl.includes("dutch") || lbl.includes("néerlandais") || lbl.includes("dut") || lbl.includes("nld")) { flagCode = "nl"; name = "Nederlands"; }
  else if (code.includes("pl") || lbl.includes("polish") || lbl.includes("polonais") || lbl.includes("pol")) { flagCode = "pl"; name = "Polski"; }
  else if (code.includes("tr") || lbl.includes("turkish") || lbl.includes("turc") || lbl.includes("tur")) { flagCode = "tr"; name = "Türkçe"; }
  else if (code.includes("sv") || lbl.includes("swedish") || lbl.includes("suédois") || lbl.includes("swe")) { flagCode = "se"; name = "Svenska"; }
  else if (code.includes("da") || lbl.includes("danish") || lbl.includes("danois") || lbl.includes("dan")) { flagCode = "dk"; name = "Dansk"; }
  else if (code.includes("no") || lbl.includes("norwegian") || lbl.includes("norvégien") || lbl.includes("nor")) { flagCode = "no"; name = "Norsk"; }
  else if (code.includes("fi") || lbl.includes("finnish") || lbl.includes("finnois") || lbl.includes("fin")) { flagCode = "fi"; name = "Suomi"; }
  else if (code.includes("cs") || lbl.includes("czech") || lbl.includes("tchèque") || lbl.includes("cze") || lbl.includes("ces")) { flagCode = "cz"; name = "Čeština"; }
  else if (code.includes("hu") || lbl.includes("hungarian") || lbl.includes("hongrois") || lbl.includes("hun")) { flagCode = "hu"; name = "Magyar"; }
  else if (code.includes("ro") || lbl.includes("romanian") || lbl.includes("roumain") || lbl.includes("rum") || lbl.includes("ron")) { flagCode = "ro"; name = "Română"; }
  else if (code.includes("el") || lbl.includes("greek") || lbl.includes("grec") || lbl.includes("gre") || lbl.includes("ell")) { flagCode = "gr"; name = "Ελληνικά"; }
  else if (code.includes("hi") || lbl.includes("hindi") || lbl.includes("hin")) { flagCode = "in"; name = "हिन्दी"; }
  else if (code.includes("th") || lbl.includes("thai") || lbl.includes("thaï") || lbl.includes("tha")) { flagCode = "th"; name = "ไทย"; }
  else if (code.includes("id") || lbl.includes("indonesian") || lbl.includes("indonésien") || lbl.includes("ind")) { flagCode = "id"; name = "Bahasa Indonesia"; }
  else if (code.includes("vi") || lbl.includes("vietnamese") || lbl.includes("vietnamien") || lbl.includes("vie")) { flagCode = "vn"; name = "Tiếng Việt"; }
  else if (code.includes("he") || lbl.includes("hebrew") || lbl.includes("hébreu") || lbl.includes("heb")) { flagCode = "il"; name = "עברית"; }
  else if (code.includes("und") || lbl.includes("und") || code === "") { 
     flagCode = null; 
     name = (track.label && track.label.length > 3 && !track.label.toLowerCase().includes("und")) ? track.label : "Inconnu"; 
  }
  else if (track.label) {
     name = track.label;
  }
  
  return (
    <span className="flex items-center gap-1.5 truncate">
      {flagCode ? (
        <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt="" className="w-4 h-[11px] object-cover rounded-[1px] opacity-90" />
      ) : (
        <span className="text-[11px] leading-none opacity-80">🏳️</span>
      )}
      <span className="truncate">{name}</span>
    </span>
  );
};

export default function VideoPlayer({
  streamUrl,
  movieTitle,
  movieSymbol,
  movieGradient,
  movieDuration,
  onCloseView,
  movieId,
  isJellyfinMovie = false,
  moviePoster
}: VideoPlayerProps) {
  const resolvedTargetId = (movieId === "rocky-3" || movieId === "09d878060e061360dd6ba1a6f81fca03")
    ? "8db5a60d8317cdd9ca66b81e52cad247"
    : movieId;

  const [videoState, setVideoState] = useState<{
    playing: boolean;
    progress: number;
    volume: number;
    muted: boolean;
    duration: number;
    subtitlesOn: boolean;
    fullscreen: boolean;
    objectFit: "contain" | "cover";
  }>({
    playing: true,
    progress: 0,
    volume: 80,
    muted: false,
    duration: 0,
    subtitlesOn: true,
    fullscreen: false,
    objectFit: "cover",
  });

  const [videoError, setVideoError] = useState<string | null>(null);
  const [playbackInfo, setPlaybackInfo] = useState<{
    id: string;
    streamUrl: string;
    duration: number;
    container: string;
    title: string;
    isDirect: boolean;
    videoCodec?: string;
    audioCodec?: string;
    subtitles?: {
      index: number;
      language: string;
      label: string;
      isDefault: boolean;
      isForced: boolean;
      codec: string;
      deliveryMethod: string;
      url: string;
    }[];
    audios?: {
      index: number;
      language: string;
      label: string;
      isDefault: boolean;
      codec: string;
    }[];
  } | null>(null);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsView, setSettingsView] = useState<"main" | "audio" | "subtitles">("main");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const [subtitlesTrackStateDebug, setSubtitlesTrackStateDebug] = useState<{ label: string; mode: string }[]>([]);
  const [subtitlesDiagnostic, setSubtitlesDiagnostic] = useState<{
    readyState: number;
    currentTime: number;
    duration: number;
    hasWebkitTextTracks: boolean;
    tracks: {
      index: number;
      label: string;
      language: string;
      kind: string;
      mode: string;
      cuesCount: number | null;
      criticalWarning: string | null;
    }[];
    verdict: "OK" | "BROKEN" | "TIMING_ISSUE" | "RENDER_BLOCKED" | "DISCONNECTED" | "UNKNOWN";
    verdictDetails: string;
  } | null>(null);
  const subtitleActivatedAtRef = useRef<number | null>(null);
  const [isLoadingStreams, setIsLoadingStreams] = useState(false);
  const [streamMode, setStreamMode] = useState<"proxy" | "direct">("proxy");
  const [forceTranscode, setForceTranscode] = useState(false);
  const [playbackAttempts, setPlaybackAttempts] = useState(0);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [isCanPlay, setIsCanPlay] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const [isLowQuality, setIsLowQuality] = useState(false);
  const [estimatedBitrate, setEstimatedBitrate] = useState<number | null>(null);

  const isIOS = useMemo(() => {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
           /CriOS/i.test(navigator.userAgent) || 
           /FxiOS/i.test(navigator.userAgent);
  }, []);
  const [initialBufferingTime, setInitialBufferingTime] = useState<number | null>(null);
  const [isAutoDowngraded, setIsAutoDowngraded] = useState(false);
  const streamLoadStartRef = useRef<number | null>(null);
  const isStreamReady = isMetadataLoaded && isCanPlay;
  const [isWaiting, setIsWaiting] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [seekOffset, setSeekOffset] = useState<number>(0);
  const [requestedSeekTime, setRequestedSeekTime] = useState<number | null>(null);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const [lastSeekLog, setLastSeekLog] = useState<{
    requestedTime: number;
    ticksSent: string;
    timeAfterLoaded: string;
    timeAfter2s: string;
    timeAfter5s: string;
  } | null>(null);

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);

  const resetControlsTimeout = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      // Only hide controls if the video is playing
      if (videoRef.current && !videoRef.current.paused) {
        setIsControlsVisible(false);
        setShowSettingsMenu(false);
        setTimeout(() => setSettingsView("main"), 200);
      }
    }, 5000);
  };


  // 4. REPRISE DE LA LECTURE: Inject saved progress on mount
  useEffect(() => {
    if (movieId) {
      try {
        const saved = JSON.parse(localStorage.getItem("classico_progress") || "{}");
        if (saved[movieId] && saved[movieId].currentTime > 0) {
           savedRestoreTime.current = saved[movieId].currentTime;
           console.log("[RESUME PLAYBACK] Found saved progress for " + movieId + ": " + savedRestoreTime.current + "s");
        }
      } catch(e) {}
    }
  }, [movieId]);
  useEffect(() => {
    resetControlsTimeout();
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#player-settings-btn") && !target.closest("#player-settings-menu")) {
        setShowSettingsMenu(false);
        setTimeout(() => setSettingsView("main"), 200);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (videoState.playing) {
      resetControlsTimeout();
    } else {
      setIsControlsVisible(true); // Always show controls when paused
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
  }, [videoState.playing]);

  const [serverStreamDebug, setServerStreamDebug] = useState<{
    requestRange: string;
    targetUrl: string;
    statusCode: number;
    startTimeTicks: string;
    jellyfinResponseRange: string;
  } | null>(null);

  const seekTimestampRef = useRef<number | null>(null);
  const bypassRestoreRef = useRef<boolean>(false);

  // USER REQUIREMENTS REAL-TIME DIAGNOSTIC LOOPS
  const [clickLog, setClickLog] = useState<{
    title: string;
    idSent: string;
    isOverridden: boolean;
    mediaSourceId: string;
    path: string;
  } | null>(null);

  const [networkLog, setNetworkLog] = useState<{
    streamUrl: string;
    httpStatus: string;
    statusCode: number;
    exactResponse: string;
  } | null>(null);

  const [cacheLog, setCacheLog] = useState<string[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false); // Hidden by default, toggled via administrator button
  const [playTimeoutMessage, setPlayTimeoutMessage] = useState<string | null>(null);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerViewportRef = useRef<HTMLDivElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const savedRestoreTime = useRef<number>(0);
  const firstFrameLoggedRef = useRef<boolean>(false);
  const lastLoadedUrlRef = useRef<string | null>(null);
  const lastFetchedMovieIdRef = useRef<string | null>(null);
  const lastFetchedParamsRef = useRef<{
    movieId: string | null;
    forceTranscode: boolean;
    playbackAttempts: number;
    isLowQuality: boolean;
  }>({ movieId: null, forceTranscode: false, playbackAttempts: 0, isLowQuality: false });

  const eventsTrackerRef = useRef<{
    loadedmetadata: { fired: boolean; time: number | null };
    loadeddata: { fired: boolean; time: number | null };
    canplay: { fired: boolean; time: number | null };
    play: { fired: boolean; time: number | null };
    firstFrame: { fired: boolean; time: number | null };
  }>({
    loadedmetadata: { fired: false, time: null },
    loadeddata: { fired: false, time: null },
    canplay: { fired: false, time: null },
    play: { fired: false, time: null },
    firstFrame: { fired: false, time: null },
  });

  const trackEventFired = (key: "loadedmetadata" | "loadeddata" | "canplay" | "play" | "firstFrame", stepName: string) => {
    if (!eventsTrackerRef.current[key].fired) {
      eventsTrackerRef.current[key] = { fired: true, time: performance.now() };
      logChrono(stepName);
    }
  };

  const logMissingEvents = (reason: string) => {
    const clickTime = (window as any).moviePlayClickTime;
    const now = performance.now();
    const elapsed = clickTime ? ((now - clickTime) / 1000).toFixed(3) : "N/A";
    
    const events = [
      { key: "loadedmetadata" as const, name: "loadedmetadata" },
      { key: "loadeddata" as const, name: "loadeddata" },
      { key: "canplay" as const, name: "canplay" },
      { key: "play" as const, name: "play" },
      { key: "firstFrame" as const, name: "première frame affichée" },
    ];

    events.forEach(evt => {
      if (!eventsTrackerRef.current[evt.key].fired) {
        console.log(
          `%c[CHRONO INFOS] Événement "${evt.name}" NON RÉALISÉ : %c${reason} %c(Temps écoulé: +${elapsed}s, Timestamp: ${new Date().toISOString().slice(11, 23)})`,
          "color: #ef4444; font-weight: bold;",
          "color: #fca5a5; font-style: italic;",
          "color: #9ca3af;"
        );
      }
    });
  };

  // Set moviePlayClickTime on mount if it was accessed directly / not set
  useEffect(() => {
    if (!(window as any).moviePlayClickTime) {
      (window as any).moviePlayClickTime = performance.now();
      console.log("%c[CHRONO LECTEUR] Aucun click initial détecté, initialisation du temps de référence au montage : 0.000s", "color: #eab308; font-style: italic;");
    }
    return () => {
      logMissingEvents("Rechargement du composant ou fermeture du lecteur");
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Reset first frame logged when activeSrc changes
  useEffect(() => {
    firstFrameLoggedRef.current = false;
  }, [activeSrc]);

  // Reset events tracker on source replacement or new attempts
  useEffect(() => {
    if (eventsTrackerRef.current.loadedmetadata.fired || eventsTrackerRef.current.play.fired) {
      logMissingEvents("Source vidéo remplacée ou nouvelle tentative de lecture");
    }
    eventsTrackerRef.current = {
      loadedmetadata: { fired: false, time: null },
      loadeddata: { fired: false, time: null },
      canplay: { fired: false, time: null },
      play: { fired: false, time: null },
      firstFrame: { fired: false, time: null },
    };
  }, [movieId, playbackAttempts]);

  // Check if active subtitle requires transcoding - disabled to prevent transcoding/reloads on subtitle change
  const subtitleRequiresTranscode = false;

  // Compute isTranscoded dynamically from the playbackInfo or custom forceTranscode status
  const isTranscoded = playbackInfo ? (!playbackInfo.isDirect || forceTranscode || subtitleRequiresTranscode) : true;

  // Log on mount
  useEffect(() => {
    const isOverridden = movieId === "rocky-3" || movieId === "09d878060e061360dd6ba1a6f81fca03";
    console.log("==================================================");
    console.log("[DIAGNOSTIC UNISSON] CLICK TRIGGER ENREGISTRÉ :");
    console.log(`- TITRE DU FILM: ${movieTitle}`);
    console.log(`- ID ENVOYÉ AU LECTEUR: ${movieId}`);
    console.log(`- ROCKY III OVERRIDE DE SÉCURITÉ: ${isOverridden ? "ACTIF (FORCAGE SUR ID 8db5a60d8317cdd9ca66b81e52cad247)" : "INACTIF"}`);
    console.log("==================================================");
  }, [movieId, movieTitle]);

  // Reset retry state when movie ID changes
  useEffect(() => {
    setPlaybackAttempts(0);
    setForceTranscode(false);
  }, [movieId]);

  // Fetch PlaybackInfo from central API route
  useEffect(() => {
    if (!isJellyfinMovie || !movieId) return;

    const lastOpts = lastFetchedParamsRef.current;
    if (
      playbackInfo &&
      lastOpts.movieId === movieId &&
      lastOpts.forceTranscode === forceTranscode &&
      lastOpts.playbackAttempts === playbackAttempts &&
      lastOpts.isLowQuality === isLowQuality
    ) {
      console.log("[PLAYBACK BLOCK] Playback metadata already loaded with same parameters. Preventing re-fetch.");
      return;
    }

    // Set seekOffset to 0 only on initial load (not on retries)
    if (playbackAttempts === 0) {
      setSeekOffset(0);
      setRequestedSeekTime(null);
    }

    const loadPlaybackInfoAndConfig = async () => {
      logChrono("Récupération des métadonnées (Début)");
      console.trace("[PLAYER STATE CHANGE]", {
        action: "setIsLoadingStreams(true) - loadPlaybackInfoAndConfig",
        streamUrl: finalStreamUrl,
        playbackState: videoState,
        isLoading: true,
        isStreamLoading,
        readyState: videoRef.current?.readyState,
        networkState: videoRef.current?.networkState
      });
      setIsLoadingStreams(true);
      setVideoError(null);
      setIsMetadataLoaded(false);

      // FORCE OVERRIDE DERBY ROCKY III
      let activeTargetId = movieId;
      const isOverridden = movieId === "rocky-3" || movieId === "09d878060e061360dd6ba1a6f81fca03";
      if (isOverridden) {
        activeTargetId = "8db5a60d8317cdd9ca66b81e52cad247";
      }

      // 1. Diagnostics d'accès aux caches
      const reports: string[] = [];
      try {
        const keys = Object.keys(localStorage);
        const movieKeys = keys.filter(k => k.toLowerCase().includes("jelly") || k.toLowerCase().includes("movie") || k.toLowerCase().includes("cache"));
        if (movieKeys.length > 0) {
          reports.push(`localStorage: ${movieKeys.length} clé(s) trouvée(s) (${movieKeys.join(", ")})`);
          movieKeys.forEach(k => {
            reports.push(`  -> ${k}: ${String(localStorage.getItem(k)).slice(0, 100)}`);
          });
        } else {
          reports.push("localStorage: Aucun cache actif pour les films.");
        }
      } catch (e: any) {
        reports.push(`localStorage Error: ${e.message}`);
      }

      try {
        const keys = Object.keys(sessionStorage);
        const movieKeys = keys.filter(k => k.toLowerCase().includes("jelly") || k.toLowerCase().includes("movie") || k.toLowerCase().includes("cache"));
        if (movieKeys.length > 0) {
          reports.push(`sessionStorage: ${movieKeys.length} clé(s) trouvée(s) (${movieKeys.join(", ")})`);
          movieKeys.forEach(k => {
            reports.push(`  -> ${k}: ${String(sessionStorage.getItem(k)).slice(0, 100)}`);
          });
        } else {
          reports.push("sessionStorage: Aucun cache actif.");
        }
      } catch (e: any) {
        reports.push(`sessionStorage Error: ${e.message}`);
      }

      // Check Cache API
      try {
        if (window.caches) {
          const cacheNames = await window.caches.keys();
          if (cacheNames.length > 0) {
            reports.push(`Cache API (Service Workers): ${cacheNames.length} caches trouvés (${cacheNames.join(", ")})`);
          } else {
            reports.push("Cache API (Service Workers): Vide ou aucun cache d'API enregistré.");
          }
        }
      } catch (e: any) {
        reports.push(`Cache API Error: ${e.message}`);
      }

      setCacheLog(reports);

      try {
        if (!activeTargetId || activeTargetId === "undefined") {
          throw new Error("Aucun ID de film n'a été spécifié pour la lecture.");
        }

        const prefetches = (window as any).playbackPrefetches || {};
        let pbData: any;

        if (prefetches[activeTargetId] && !forceTranscode && playbackAttempts === 0) {
          console.log("[PLAYBACK CACHE] Serving metadata from click prefetch for movie in VideoPlayer: " + activeTargetId);
          pbData = await prefetches[activeTargetId];
          setTimeout(() => {
            delete prefetches[activeTargetId];
          }, 5000);
        }

        if (!pbData) {
          const needsTranscodeParam = forceTranscode || playbackAttempts > 0 || isLowQuality;
          let url = `/api/playback/${encodeURIComponent(activeTargetId)}?`;
          const params = new URLSearchParams();
          if (needsTranscodeParam) params.set("forceTranscode", "true");
          if (isLowQuality) params.set("lowQuality", "true");
          url += params.toString();
          
          console.log(`[NET TESTING] Requête réseau API Playback: ${url}`);
          const pbRes = await fetch(url);
          
          console.log(`[NET TESTING] Code HTTP reçu de l'API Playback: ${pbRes.status}`);
          
          if (!pbRes.ok) {
            throw new Error(`Échec de récupération de la lecture (Status ${pbRes.status})`);
          }
          
          pbData = await pbRes.json();
        }

        logChrono("Récupération des métadonnées terminée");
        logChrono("Récupération de l'URL de stream : " + pbData.streamUrl);
        setPlaybackInfo(pbData);
        lastFetchedMovieIdRef.current = movieId;
        lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality };
        if (pbData && pbData.duration && pbData.duration > 0) {
          setVideoState(prev => ({ ...prev, duration: pbData.duration }));
        }

        // Auto-select subtitle track configured as default on Jellyfin
        const tracks = pbData.subtitles || [];
        const defaultTrack = tracks.find((t: any) => t.isDefault && isTextSubtitle(t.codec));
        if (defaultTrack) {
          setActiveSubtitleIndex(defaultTrack.index);
          setVideoState(prev => ({ ...prev, subtitlesOn: true }));
          console.log(`[SUBTITLE AUTOSELECTOR] Default subtitle found and applied: Index ${defaultTrack.index} (${defaultTrack.label})`);
        } else {
          setActiveSubtitleIndex(null);
          setVideoState(prev => ({ ...prev, subtitlesOn: false }));
        }

        // Auto-select audio track configured as default on Jellyfin
        const audioTracks = pbData.audios || [];
        const enAudioTrack = audioTracks.find((t: any) => {
          const lang = (t.language || "").toLowerCase();
          const lbl = (t.label || "").toLowerCase();
          return lang.includes("en") || lang.includes("eng") || lbl.includes("english") || lbl.includes("eng");
        });
        const defaultAudioTrack = enAudioTrack || audioTracks.find((t: any) => t.isDefault) || audioTracks[0];
        if (defaultAudioTrack) {
          setActiveAudioIndex(defaultAudioTrack.index);
          console.log(`[AUDIO AUTOSELECTOR] Default audio track found and applied: Index ${defaultAudioTrack.index} (${defaultAudioTrack.label})`);
        } else {
          setActiveAudioIndex(null);
        }

        // Enregistrer le log du clic
        setClickLog({
          title: movieTitle,
          idSent: movieId,
          isOverridden: isOverridden,
          mediaSourceId: pbData.id || "Inconnu",
          path: pbData.chosenPath || "Transcodé / Dynamique"
        });

        // Instant direct load logging
        setNetworkLog({
          streamUrl: pbData.streamUrl,
          httpStatus: "CHARGEMENT IMMÉDIAT (DIRECT)",
          statusCode: 200,
          exactResponse: "Streaming immédiat activé pour accélérer le démarrage."
        });

      } catch (err: any) {
        console.error("Jellyfin PlaybackInfo error:", err);
        if (playbackAttempts < 3) {
          const nextAttempt = playbackAttempts + 1;
          console.warn(`[PLAYER METADATA RETRY] Attempt ${playbackAttempts} failed. Retrying with attempt ${nextAttempt}...`);
          setPlaybackAttempts(nextAttempt);
          if (nextAttempt === 1) {
            setForceTranscode(true);
          } else if (nextAttempt === 2) {
            setIsLowQuality(true);
          }
        } else {
          console.error("[PLAYER METADATA FALLBACK] All metadata fetching attempts failed. Emitting safe fallback source.");
          const fallbackPath = `/Videos/${activeTargetId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1`;
          const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
          const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
          const apiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : "";
          const fallbackData = {
            id: activeTargetId,
            streamUrl: isNetlify ? `${serverUrl}${fallbackPath}&api_key=${apiKey}&DeviceId=CinemaAppClient&MediaSourceId=${activeTargetId}` : `/api/jellyfin/proxy/stream?id=${activeTargetId}`,
            duration: 0,
            container: "m3u8",
            title: movieTitle,
            isDirect: false,
            chosenPath: fallbackPath,
            videoCodec: "h264",
            audioCodec: "aac",
            subtitles: [],
            audios: []
          };
          setPlaybackInfo(fallbackData as any);
          lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality };
          setVideoError(null);
        }
      } finally {
        console.trace("[PLAYER STATE CHANGE]", {
          action: "setIsLoadingStreams(false) - loadPlaybackInfoAndConfig complete",
          streamUrl: finalStreamUrl,
          playbackState: videoState,
          isLoading: false,
          isStreamLoading,
          readyState: videoRef.current?.readyState,
          networkState: videoRef.current?.networkState
        });
        setIsLoadingStreams(false);
      }
    };

    loadPlaybackInfoAndConfig();
  }, [movieId, isJellyfinMovie, forceTranscode, playbackAttempts, isLowQuality]);

  // Fallback handler when stream fails
  const handleFallbackAndReload = async () => {
    console.warn("[DEBUG PLAYER] Fallback retry disabled to guarantee stream stability.");
    setVideoError("Video failed to load");
  };

  const handleMetadataLoaded = (duration: number) => {
    console.log(`Metadata loaded. Duration is ${duration}s.`);
    setVideoState(prev => ({
      ...prev,
      duration
    }));
    setIsMetadataLoaded(true);
  };

  // Resolve standard active stream URL or fallbacks
  const baseStreamUrl = isJellyfinMovie
    ? (playbackInfo 
        ? (isTranscoded
            ? getStreamUrlWithSeek(playbackInfo.streamUrl, seekOffset)
            : playbackInfo.streamUrl
          )
        : null)
    : streamUrl;

  const getParameterizedStreamUrl = (
    url: string | null,
    subOn: boolean,
    subIndex: number | null,
    audioIndex: number | null
  ): string | null => {
    if (!url) return null;
    if (!isJellyfinMovie || !playbackInfo) return url;

    try {
      let isForcedTranscoding = false;
      let workingUrl = url;

      // Check if we need to force transcoding from Direct Play
      if (playbackInfo.isDirect) {
         let needsTranscodeForSub = false;
         if (subOn && subIndex !== null && playbackInfo.subtitles) {
            const activeSub = playbackInfo.subtitles.find((s: any) => s.index === subIndex);
            if (activeSub && !isTextSubtitle(activeSub.codec)) {
               needsTranscodeForSub = true;
            }
         }
         
         const defaultAudio = playbackInfo.audios.find((a: any) => a.isDefault) || playbackInfo.audios[0];
         const isChangingAudio = audioIndex !== null && (!defaultAudio || audioIndex !== defaultAudio.index);
         
         if (isChangingAudio || needsTranscodeForSub) {
             console.log("[STREAM CONVERSION] Converting DirectPlay to Transcoding for Audio/Subtitle.");
             isForcedTranscoding = true;
             
             // Construct Transcode URL
             const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
             const currentApiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : "";
             const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
             const hlsParams = `Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
             
             if (isNetlify) {
                 workingUrl = `${serverUrl}/Videos/${playbackInfo.id}/master.m3u8?${hlsParams}&api_key=${currentApiKey}&DeviceId=ClassicoWebClient&MediaSourceId=${playbackInfo.id}&PlaySessionId=${playbackInfo?.id || Date.now()}`;
             } else {
                 // For internal API, append api_key and deviceId so they are proxied correctly if needed
                 workingUrl = `/api/jellyfin/proxy/videos/${playbackInfo.id}/master.m3u8?${hlsParams}&DeviceId=ClassicoWebClient&PlaySessionId=${playbackInfo?.id || Date.now()}`;
             }
             
             // IMPORTANT: We must also update the playbackInfo so that downstream effects know it's no longer direct play!
             // However, modifying state inside this pure function is dangerous, but we can set a flag that triggers it if needed.
             // Actually, for VideoPlayer, the downstream HLS initialization checks `finalStreamUrl.includes(".m3u8")` rather than `isDirect`!
             // Let's verify that. Yes! `const isHls = finalStreamUrl.toLowerCase().includes(".m3u8");`
             // So just changing the URL is enough for VideoPlayer!
         }
      }

      const baseOrigin = "http://localhost:3000";
      const urlObj = new URL(workingUrl, baseOrigin);

      // Remove existing values to avoid duplication
      urlObj.searchParams.delete("SubtitleStreamIndex");
      urlObj.searchParams.delete("SubtitleMethod");
      urlObj.searchParams.delete("AudioStreamIndex");

      // Set Audio Track if specified
      if (audioIndex !== null) {
        urlObj.searchParams.set("AudioStreamIndex", audioIndex.toString());
        urlObj.searchParams.set("PlaySessionId", playbackInfo?.id || Date.now().toString());
      }
      
      // Determine if the subtitle needs to be burned in (non-text codec)
      if (subOn && subIndex !== null && playbackInfo && playbackInfo.subtitles) {
        const activeSub = playbackInfo.subtitles.find((s: any) => s.index === subIndex);
        if (activeSub) {
          const codec = (activeSub.codec || "").toLowerCase();
          const isText = !["pgs", "hdmv_pgs_subtitle", "vobsub", "dvdsub", "dvd_subtitle"].includes(codec);
          if (!isText) {
             urlObj.searchParams.set("SubtitleStreamIndex", subIndex.toString());
             urlObj.searchParams.set("SubtitleMethod", "Encode");
          }
        }
      }

      // Ensure HLS segments are short (3s) and prebuffering is minimal (1 segment) for instant start
      if (url.includes(".m3u8") || url.includes("hls")) {
        urlObj.searchParams.set("SegmentLength", "3");
        urlObj.searchParams.set("MinSegments", "1");
      }

      if (url.startsWith("/")) {
        return urlObj.pathname + urlObj.search;
      }
      return urlObj.toString();
    } catch (e) {
      console.error("Error creating parameterized stream URL:", e);
    }
    return url;
  };

  const finalStreamUrl = getParameterizedStreamUrl(
    baseStreamUrl,
    videoState.subtitlesOn,
    activeSubtitleIndex,
    activeAudioIndex
  );

  // Real-time console diagnostics logger
  useEffect(() => {
    if (playbackInfo && finalStreamUrl) {
      console.log(`%c[DIAGNOSTIC LECTEUR CLIENT] DEBUT DES INFORMATIONS DE FLUX`, "color: #f59e0b; font-weight: bold; font-size: 12px;");
      console.log(`%cURL exacte du flux : %c${finalStreamUrl}`, "color: #9ca3af;", "color: #38bdf8; font-family: monospace;");
      console.log(`%cMode de lecture : %c${playbackInfo.isDirect ? "DirectPlay (Flux brut d'origine)" : "Transcoding (Conversion HLS)"}`, "color: #9ca3af;", "color: #10b981; font-weight: bold;");
      console.log(`%cCodec Vidéo Détecté : %c${playbackInfo.videoCodec || "Inconnu"}`, "color: #9ca3af;", "color: #a78bfa; font-family: monospace;");
      console.log(`%cCodec Audio Détecté : %c${playbackInfo.audioCodec || "Inconnu"}`, "color: #9ca3af;", "color: #a78bfa; font-family: monospace;");
      console.log(`%cConteneur : %c${playbackInfo.container || "Inconnu"}`, "color: #9ca3af;", "color: #f472b6; font-family: monospace;");
      console.log(`%c[DIAGNOSTIC LECTEUR CLIENT] FIN DES INFORMATIONS DE FLUX`, "color: #f59e0b; font-weight: bold; font-size: 12px;");
    }
  }, [playbackInfo, finalStreamUrl]);

  // 5. 10-second canplay fallback UI timer
  useEffect(() => {
    if (!isStreamLoading || isCanPlay || !finalStreamUrl) return;

    const timer = setTimeout(() => {
      if (!isCanPlay) {
        console.warn("[DEBUG PLAYER] Timeout 10s: No canplay event received.");
        setVideoError("Video failed to load");
        setIsStreamLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isStreamLoading, isCanPlay, finalStreamUrl]);

  // Estimate connection speed if navigator.connection is available
  useEffect(() => {
    const updateConnectionSpeed = () => {
      const conn = (navigator as any).connection;
      if (conn && conn.downlink) {
        setEstimatedBitrate(conn.downlink * 1000000);
      }
    };

    updateConnectionSpeed();
    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener("change", updateConnectionSpeed);
      return () => conn.removeEventListener("change", updateConnectionSpeed);
    }
  }, []);

  // Monitor buffering / waiting duration to trigger auto-downgrade (waiting > 5s)
  useEffect(() => {
    // Disabled to prevent quality auto-downgrade or reload during buffering
    return;
  }, [isWaiting, isStreamLoading, finalStreamUrl, isLowQuality]);

  // Measure initial buffering time before playback starts
  useEffect(() => {
    if (activeSrc) {
      streamLoadStartRef.current = performance.now();
      setInitialBufferingTime(null);
    }
  }, [activeSrc]);

  useEffect(() => {
    if (isStreamReady && streamLoadStartRef.current !== null) {
      const durationMs = performance.now() - streamLoadStartRef.current;
      setInitialBufferingTime(durationMs / 1000);
      streamLoadStartRef.current = null;
      console.log(`[DEBUG PLAYER] Initial buffering took ${(durationMs / 1000).toFixed(2)} seconds.`);
    }
  }, [isStreamReady]);

  // Trigger video.load() when activeSrc is set
  useEffect(() => {
    if (videoRef.current && activeSrc) {
      console.trace("[PLAYER STATE CHANGE]", {
        action: "activeSrc changed (triggering load())",
        streamUrl: finalStreamUrl,
        playbackState: videoState,
        isLoading: isLoadingStreams,
        isStreamLoading,
        readyState: videoRef.current?.readyState,
        networkState: videoRef.current?.networkState
      });
      console.log("[DEBUG PLAYER] activeSrc changed, calling video.load(). Source:", activeSrc);
      videoRef.current.load();
    }
  }, [activeSrc]);

  // Whenever the final stream URL changes (e.g. toggling transcoding), reload the video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!finalStreamUrl) {
      console.log("[DEBUG PLAYER] No stream URL provided. Cleaning up.");
      lastLoadedUrlRef.current = null;
      video.pause();
      video.removeAttribute("src");
      if (hlsRef.current) {
        console.trace("[PLAYER STATE CHANGE]", {
          action: "hls.destroy() - clean up empty URL",
          streamUrl: finalStreamUrl,
          playbackState: videoState,
          isLoading: isLoadingStreams,
          isStreamLoading,
          readyState: videoRef.current?.readyState,
          networkState: videoRef.current?.networkState
        });
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      try {
        video.load();
      } catch (e) {}
      setIsMetadataLoaded(false);
      setIsCanPlay(false);
      console.trace("[PLAYER STATE CHANGE]", {
        action: "setIsStreamLoading(false) - clean up empty URL",
        streamUrl: finalStreamUrl,
        playbackState: videoState,
        isLoading: isLoadingStreams,
        isStreamLoading,
        readyState: videoRef.current?.readyState,
        networkState: videoRef.current?.networkState
      });
      setIsStreamLoading(false);
      setActiveSrc(null);
      return;
    }

    // IMPORTANT: empêcher les reloads multiples du même stream
    if (lastLoadedUrlRef.current === finalStreamUrl) {
      console.log("[VIDEO PLAYER] Ignoring duplicate stream load");
      return;
    }

    lastLoadedUrlRef.current = finalStreamUrl;

    // 4. Securing stream load: do not change source if same URL is already loading
    if (activeSrc === finalStreamUrl && isStreamLoading) {
      console.log("[DEBUG PLAYER] Stream is already loading for this URL. Ignoring redundant change.");
      return;
    }

    // 4. If a new stream is requested, clean up the previous one properly (pause + remove src)
    console.log("[DEBUG PLAYER] Stopping previous stream: calling pause + remove src.");
    video.pause();
    video.removeAttribute("src");
    if (hlsRef.current) {
      console.trace("[PLAYER STATE CHANGE]", {
        action: "hls.destroy() - stopping previous stream",
        streamUrl: finalStreamUrl,
        playbackState: videoState,
        isLoading: isLoadingStreams,
        isStreamLoading,
        readyState: videoRef.current?.readyState,
        networkState: videoRef.current?.networkState
      });
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    try {
      video.load();
    } catch (e) {
      console.warn("[DEBUG PLAYER] Error during cleanup load():", e);
    }

    setIsMetadataLoaded(false);
    setIsCanPlay(false);
    console.trace("[PLAYER STATE CHANGE]", {
      action: "setIsStreamLoading(true) - stream load triggered",
      streamUrl: finalStreamUrl,
      playbackState: videoState,
      isLoading: isLoadingStreams,
      isStreamLoading,
      readyState: videoRef.current?.readyState,
      networkState: videoRef.current?.networkState
    });
    setIsStreamLoading(true);

    if (bypassRestoreRef.current) {
      savedRestoreTime.current = 0;
      console.log(`[RESTORE SYSTEM] Seek event: bypass playhead restore enabled.`);
      bypassRestoreRef.current = false;
    } else if (video.currentTime > 0) {
      savedRestoreTime.current = video.currentTime;
      console.log(`[RESTORE SYSTEM] Guarding position: ${savedRestoreTime.current}s for subsequent stream switch.`);
    } else {
      savedRestoreTime.current = 0;
    }

    // Set the source and call load to start the native HTML5 player load process
    console.log(`[URL DEBUG LOG] [VIDEO PLAYER] finalStreamUrl: "${finalStreamUrl}" | Contains id: ${finalStreamUrl.includes("id=")} | Contains path: ${finalStreamUrl.includes("path=")}`);
    console.log("[DEBUG PLAYER] Source (src) defined to:", finalStreamUrl);
    logChrono("Attribution du src vidéo");

    if (video.src === finalStreamUrl) return;

    const isHls = finalStreamUrl.toLowerCase().includes(".m3u8") || finalStreamUrl.toLowerCase().includes("hls");
    if (isHls && Hls.isSupported()) {
      console.trace("[PLAYER STATE CHANGE]", {
        action: "new Hls() - initializing player instance",
        streamUrl: finalStreamUrl,
        playbackState: videoState,
        isLoading: isLoadingStreams,
        isStreamLoading,
        readyState: videoRef.current?.readyState,
        networkState: videoRef.current?.networkState
      });
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 1000,
      });
      console.log(`[URL DEBUG LOG] [VIDEO PLAYER HLS] Loading HLS stream via loadSource: "${finalStreamUrl}"`);
      if (video.src === finalStreamUrl) return;
      console.trace("[PLAYER STATE CHANGE]", {
        action: "hls.loadSource() - loading manifest URL",
        streamUrl: finalStreamUrl,
        playbackState: videoState,
        isLoading: isLoadingStreams,
        isStreamLoading,
        readyState: videoRef.current?.readyState,
        networkState: videoRef.current?.networkState
      });
      hls.loadSource(finalStreamUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsMetadataLoaded(true);
        if (videoState.playing && videoRef.current && videoRef.current.paused) {
           videoRef.current.play().catch(e => console.warn("Restore play prevented:", e));
        }
        console.trace("[PLAYER STATE CHANGE]", {
          action: "setIsStreamLoading(false) - manifest parsed successfully",
          streamUrl: finalStreamUrl,
          playbackState: videoState,
          isLoading: isLoadingStreams,
          isStreamLoading,
          readyState: videoRef.current?.readyState,
          networkState: videoRef.current?.networkState
        });
        setIsStreamLoading(false);
        setIsCanPlay(true);
        if (savedRestoreTime.current > 0) {
          video.currentTime = savedRestoreTime.current;
          savedRestoreTime.current = 0;
        }

        if (hls.audioTracks && hls.audioTracks.length > 1 && activeAudioIndex !== null) {
          const selectedMeta = playbackInfo?.audios?.find(a => a.index === activeAudioIndex);
          if (selectedMeta) {
            const hlsTrackIdx = hls.audioTracks.findIndex(t => t.name === selectedMeta.label || (t as any).language === selectedMeta.language || (t as any).lang === selectedMeta.language);
            if (hlsTrackIdx !== -1) {
              console.log(`[HLS NATIVE AUDIO] Switching HLS audioTrack to ${hlsTrackIdx} (${selectedMeta.label})`);
              hls.audioTrack = hlsTrackIdx;
            } else if (hls.audioTracks.findIndex(t => t.default) !== -1) {
              hls.audioTrack = hls.audioTracks.findIndex(t => t.default);
            }
          }
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("Hls.js fatal error in VideoPlayer:", data);
          try {
            hls.recoverMediaError();
          } catch (e) {
            console.error("Failed to recover HLS media error:", e);
          }
        }
      });

      setActiveSrc(finalStreamUrl);
    } else {
      setActiveSrc(finalStreamUrl);
    }
  }, [finalStreamUrl]);

  // Synchronize HTML5 video play/pause with state
  useEffect(() => {
    const video = videoRef.current;
    if (video && activeSrc) {
      if (videoState.playing) {
        console.log("[DEBUG PLAYER] Calling play() immediately.");
        video.play().catch(err => {
          console.warn("[DEBUG PLAYER] Play failed or auto-play blocked:", err);
        });
      } else {
        console.log("[DEBUG PLAYER] Pause called on video.");
        video.pause();
      }
    }
  }, [videoState.playing, activeSrc]);

  // Synchronize HTML5 video volume and muted attributes
  useEffect(() => {
    if (videoRef.current && activeSrc) {
      videoRef.current.volume = videoState.volume / 100;
      videoRef.current.muted = videoState.muted;
    }
  }, [videoState.volume, videoState.muted, activeSrc]);

  // Set up dynamic metadata loader on the real HTML5 video component
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const checkMetadata = () => {
      const duration = video.duration;
      console.log("Checking loaded video duration:", duration);
      
      if (!duration || isNaN(duration) || duration < 1 || !isFinite(duration)) {
        console.warn("Duration is invalid (< 1 or NaN). Retrying in 500ms...");
        timeoutId = setTimeout(checkMetadata, 500);
      } else {
        setVideoState(prev => {
          const finalDuration = (playbackInfo && playbackInfo.duration > 0) ? playbackInfo.duration : duration;
          return {
            ...prev,
            duration: finalDuration
          };
        });
        setIsMetadataLoaded(true);

        if (savedRestoreTime.current > 0) {
          const targetRestoreTime = savedRestoreTime.current;
          console.log(`[RESTORE SYSTEM] Automatically restoring playhead to: ${targetRestoreTime}s.`);
          video.currentTime = targetRestoreTime;
          savedRestoreTime.current = 0;
        }
      }
    };

    video.onloadedmetadata = () => {
      console.log("[DEBUG PLAYER] Event loadedmetadata triggered (onloadedmetadata callback).");
      checkMetadata();
    };

    // If metadata is already ready, run the check immediately
    if (video.readyState >= 1) {
      checkMetadata();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (video) {
        video.onloadedmetadata = null;
      }
    };
  }, [activeSrc, videoRef.current]);

  const handleSeekCompletedLogs = () => {
    if (!seekTimestampRef.current) return;
    const now = Date.now();
    if (now - seekTimestampRef.current > 15000) return; // Stale seek

    const initialTime = videoRef.current ? videoRef.current.currentTime : 0;
    console.log(`[SEEK METROLOGY] Video load complete! currentTime initial: ${initialTime}s.`);
    
    setLastSeekLog(prev => {
      if (!prev) return null;
      return {
        ...prev,
        timeAfterLoaded: `${initialTime.toFixed(2)} s`
      };
    });

    // Schedule 2s check
    setTimeout(() => {
      if (videoRef.current) {
        const t2 = videoRef.current.currentTime;
        console.log(`[SEEK METROLOGY] 2s check: currentTime: ${t2}s.`);
        setLastSeekLog(prev => {
          if (!prev) return null;
          return {
            ...prev,
            timeAfter2s: `${t2.toFixed(2)} s`
          };
        });
      }
    }, 2000);

    // Schedule 5s check
    setTimeout(() => {
      if (videoRef.current) {
        const t5 = videoRef.current.currentTime;
        console.log(`[SEEK METROLOGY] 5s check: currentTime: ${t5}s.`);
        setLastSeekLog(prev => {
          if (!prev) return null;
          return {
            ...prev,
            timeAfter5s: `${t5.toFixed(2)} s`
          };
        });
      }
    }, 5000);

    seekTimestampRef.current = null;
  };

  // Track when a subtitle is selected to compute timing differences
  useEffect(() => {
    if (activeSubtitleIndex !== null && videoState.subtitlesOn) {
      subtitleActivatedAtRef.current = Date.now();
    } else {
      subtitleActivatedAtRef.current = null;
    }
  }, [activeSubtitleIndex, videoState.subtitlesOn]);

  // Deep diagnostic loop of HTML5 Video Subtitles (cues, track states, readiness)
  useEffect(() => {
    const runDiagnostic = () => {
      const video = videoRef.current;
      if (!video) {
        setSubtitlesDiagnostic(null);
        return;
      }

      const textTracks = video.textTracks;
      const readyState = video.readyState;
      const currentTime = video.currentTime;
      const duration = video.duration || 0;
      const hasWebkitTextTracks = "webkitTextTracks" in video || (video as any).webkitTextTracks !== undefined;

      const tracksList: {
        index: number;
        label: string;
        language: string;
        kind: string;
        mode: string;
        cuesCount: number | null;
        criticalWarning: string | null;
      }[] = [];

      let hasShowingTrack = false;
      let targetTrackCuesLength: number | null = null;
      let targetTrackLabel = "";
      let hasShowingTrackButNoCues = false;

      const selectedTrackMeta = playbackInfo?.subtitles?.find(s => s.index === activeSubtitleIndex);

      if (textTracks) {
        for (let i = 0; i < textTracks.length; i++) {
          const track = textTracks[i];
          let cuesCount: number | null = null;
          let criticalWarning: string | null = null;

          try {
            if (track.cues) {
              cuesCount = track.cues.length;
            } else {
              cuesCount = null;
            }
          } catch (e: any) {
            cuesCount = null;
            criticalWarning = `Ecriture cues non-accessible: ${e.message || e}`;
          }

          if (track.mode === "showing") {
            hasShowingTrack = true;
            targetTrackCuesLength = cuesCount;
            targetTrackLabel = track.label || `Piste ${i}`;

            if (cuesCount === null || cuesCount === 0) {
              hasShowingTrackButNoCues = true;
              criticalWarning = "NO CUES LOADED (render impossible)";
              console.error(`%c[SUBTITLE CRITICAL LOG] NO CUES LOADED (render impossible) on track "${track.label || i}"!`, "color: #ef4444; font-weight: bold;");
            }
          }

          tracksList.push({
            index: i,
            label: track.label || `Piste ${i}`,
            language: track.language || "unknown",
            kind: track.kind || "subtitles",
            mode: track.mode,
            cuesCount,
            criticalWarning,
          });
        }
      }

      // Determine Verdict
      let verdict: "OK" | "BROKEN" | "TIMING_ISSUE" | "RENDER_BLOCKED" | "DISCONNECTED" | "UNKNOWN" = "UNKNOWN";
      let verdictDetails = "";

      if (activeSubtitleIndex === null || !videoState.subtitlesOn) {
        verdict = "DISCONNECTED";
        verdictDetails = "Les sous-titres sont désactivés ou aucune piste n'est sélectionnée par l'utilisateur.";
      } else if (!textTracks || textTracks.length === 0) {
        verdict = "BROKEN";
        verdictDetails = "Aucune piste HTML5 (TextTrack) n'a été injectée par le navigateur sur la balise <video>.";
      } else if (!hasShowingTrack) {
        verdict = "BROKEN";
        verdictDetails = "Une piste a été choisie, mais le navigateur n'a pas basculé son mode à 'showing' (toutes désactivées).";
      } else if (hasShowingTrackButNoCues) {
        const activationDuration = subtitleActivatedAtRef.current ? Date.now() - subtitleActivatedAtRef.current : 0;
        if (activationDuration < 5050) {
          verdict = "TIMING_ISSUE";
          verdictDetails = `La piste "${targetTrackLabel}" est active mais le navigateur n'a pas encore fini de télécharger/parser les cues VTT (attente: ${activationDuration}ms / 5000ms).`;
        } else {
          verdict = "BROKEN";
          verdictDetails = `La piste "${targetTrackLabel}" est active en mode 'showing' depuis plus de 5s, mais track.cues reste à 0 ou null. Problème d'accessibilité URL ou de CORS.`;
        }
      } else if (hasShowingTrack && targetTrackCuesLength !== null && targetTrackCuesLength > 0) {
        verdict = "OK";
        verdictDetails = `La piste "${targetTrackLabel}" est active en mode 'showing' avec ${targetTrackCuesLength} cues prêtes! Le rendu natif HTML5 est initié. Si rien ne s'affiche, de l'UI/CSS ou un overlay de calque bloque l'affichage de l'élément d'accessibilité natif du navigateur.`;
      }

      setSubtitlesDiagnostic({
        readyState,
        currentTime,
        duration,
        hasWebkitTextTracks,
        tracks: tracksList,
        verdict,
        verdictDetails,
      });
    };

    const interval = setInterval(runDiagnostic, 1000);
    runDiagnostic();

    return () => clearInterval(interval);
  }, [activeSubtitleIndex, videoState.subtitlesOn, playbackInfo]);

  // Poll server-side stream proxy logs
  useEffect(() => {
    if (!isJellyfinMovie) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/playback-stream-debug");
        if (res.ok) {
          const data = await res.json();
          setServerStreamDebug(data);
        }
      } catch (e) {
        // Silent catch
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isJellyfinMovie]);

  const applySubtitleSelection = (index: number | null) => {
    const video = videoRef.current;
    if (!video) return;

    const textTracks = video.textTracks;
    if (!textTracks) {
      console.warn("[SUBTITLE SYSTEM] video.textTracks is not available on the <video> element.");
      return;
    }

    const selectedTrackMeta = playbackInfo?.subtitles?.find(s => s.index === index);
    console.log(`[SUBTITLE SYSTEM] Applying subtitle activation for index: ${index} ("${selectedTrackMeta?.label || "None"}")`);

    const finalStatusList: { label: string; mode: string }[] = [];

    // Strictly activate selected track to 'showing' and disable all others.
    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      const matchesMeta = selectedTrackMeta && 
        (track.label === selectedTrackMeta.label || track.language === selectedTrackMeta.language);

      if (index !== null && matchesMeta) {
        track.mode = "showing";
        const cuesLength = track.cues ? track.cues.length : 0;
        console.log(`[SUBTITLE DEBUG] Found Track: "${track.label}" | mode: "${track.mode}" | cues.length: ${cuesLength}`);
        
        if (track.mode === "showing" && cuesLength === 0) {
          console.warn("[SUBTITLE SYSTEM] WARNING: SUBS NOT LOADED: Track is showing but cues length is 0");
        }
      } else {
        track.mode = "disabled";
      }

      finalStatusList.push({
        label: track.label || `Piste ${i}`,
        mode: track.mode
      });
    }

    setSubtitlesTrackStateDebug(finalStatusList);
  };

  useEffect(() => {
    if (isMetadataLoaded) {
      applySubtitleSelection(videoState.subtitlesOn ? activeSubtitleIndex : null);
    }
  }, [activeSubtitleIndex, videoState.subtitlesOn, isMetadataLoaded]);

  // Handle timeline animation for non-Jellyfin (simulated) playback
  useEffect(() => {
    if (finalStreamUrl) return; // Do not use custom progress timer for real streaming video

    // Standard fallback simulated duration
    setVideoState(prev => {
      if (prev.duration <= 0) {
        return { ...prev, duration: 40 };
      }
      return prev;
    });

    if (videoState.playing) {
      progressInterval.current = setInterval(() => {
        setVideoState(prev => {
          const newProgress = prev.progress + 0.5;
          if (newProgress >= prev.duration) {
            return { ...prev, progress: 0 };
          }
          
          if (movieId && prev.duration > 0) {
            try {
              const savedStr = localStorage.getItem("classico_progress") || "{}";
              const progressObj = JSON.parse(savedStr);
              progressObj[movieId] = {
                id: movieId,
                title: movieTitle,
                poster: moviePoster || "",
                currentTime: newProgress,
                duration: prev.duration,
                updatedAt: Date.now()
              };
              localStorage.setItem("classico_progress", JSON.stringify(progressObj));
            } catch (e) {}
          }
          
          return { ...prev, progress: newProgress };
        });
      }, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [videoState.playing, finalStreamUrl]);

  // Complete intro once progress goes above 5s in simulated mode or if streaming
  useEffect(() => {
    if (finalStreamUrl || videoState.progress >= 5) {
      setIntroCompleted(true);
    }
  }, [finalStreamUrl, videoState.progress]);

  // Synchronize fullscreen state change listener
  useEffect(() => {
    const handleFsChange = () => {
      setVideoState(prev => ({ 
        ...prev, 
        fullscreen: !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      }));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // Find active subtitle (simulated mode only)
  const absoluteProgress = seekOffset + videoState.progress;
  
  const currentDisplayProgress = dragProgress !== null ? dragProgress : absoluteProgress;

  const activeSubtitle = (!streamUrl && videoState.subtitlesOn)
    ? SIMULATED_SUBTITLES.find(s => absoluteProgress >= s.time && absoluteProgress < s.time + 4.5)
    : null;

  const progressPercent = videoState.duration > 0 ? (currentDisplayProgress / videoState.duration) * 100 : 0;

  const handleFullscreenToggle = () => {
    const video = videoRef.current as any;
    const container = playerContainerRef.current as any;
    const doc = document as any;

    if (!video) return;

    const isIPhone = /iPhone|iPod/i.test(navigator.userAgent);

    if (isIPhone && video.webkitEnterFullscreen) {
      try {
        video.webkitEnterFullscreen();
      } catch (e) {
        console.warn("Erreur webkitEnterFullscreen iOS:", e);
      }
      return;
    }

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (container && container.requestFullscreen) {
        container.requestFullscreen().catch(console.warn);
      } else if (container && container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen().catch(console.warn);
      } else if (video.requestFullscreen) {
        video.requestFullscreen().catch(console.warn);
      } else if (video.webkitEnterFullscreen) {
        // Fallback for Safari Desktop strictly on the video element if container request fails
        video.webkitEnterFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(console.warn);
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen().catch(console.warn);
      }
    }
  };

  const calculateTimeFromEvent = (clientX: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    return videoState.duration * percentage;
  };

  const applySeekTime = (newTime: number) => {
    setRequestedSeekTime(newTime);
    bypassRestoreRef.current = true;
    seekTimestampRef.current = Date.now();

    const ticks = Math.round(newTime * 10000000);
    setLastSeekLog({
      requestedTime: newTime,
      ticksSent: ticks.toString(),
      timeAfterLoaded: "En attente du chargement / bufferisation...",
      timeAfter2s: "En attente...",
      timeAfter5s: "En attente..."
    });
    
    if (isJellyfinMovie && playbackInfo) {
      setSeekOffset(0);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
      setVideoState(prev => ({ ...prev, progress: newTime }));
    } else {
      setSeekOffset(0);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setVideoState(prev => ({ ...prev, progress: newTime }));
      }
    }
  };

  return (
    <div 
      ref={playerContainerRef}
      className={`flex-grow flex flex-col bg-black min-h-[350px] sm:min-h-[480px] ${videoState.fullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen' : ''}`}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      
      {/* Theatre Video Display Screen Area */}
      <div 
        ref={playerViewportRef}
        id="simulated-player-viewport" 
        className="relative flex-grow bg-radial from-stone-900 to-black flex items-center justify-center p-0 overflow-hidden "
      >
        
        {/* PlaybackInfo and Stream Status Loader Spinner layer */}
        {(isLoadingStreams || isWaiting || isStreamLoading || (!isStreamReady && finalStreamUrl)) && !videoError && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}

        {videoError ? (
          <div className="absolute inset-0 bg-neutral-950/98 z-50 flex items-center justify-center p-6 sm:p-8 overflow-y-auto text-left">
            <div className="max-w-2xl w-full space-y-4 my-auto">
              <div className="space-y-1.5 pb-2 border-b border-rose-950/50">
                <span className="text-[10px] font-mono tracking-[3px] text-rose-500 font-black block">⚠️ PLAYBACK DIAGNOSTICS</span>
                <h4 className="text-lg font-forum font-bold text-white uppercase tracking-wider">{movieTitle} — Blocage du flux</h4>
              </div>
              
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs rounded-xl leading-relaxed space-y-2.5 font-mono">
                <p className="font-bold text-rose-300">Player error message:</p>
                <p className="bg-black/40 p-2.5 rounded font-mono text-[11px] text-zinc-300 break-words">{videoError}</p>
                <div className="space-y-1 text-[11px] text-zinc-400">
                  <p><span className="text-zinc-500">URL Demandée :</span> <span className="text-amber-400 break-all">{finalStreamUrl || "Non résolue"}</span></p>
                  <p><span className="text-zinc-500">Fichier original :</span> {playbackInfo ? `${playbackInfo.title} (${playbackInfo.container})` : "Standard"}</p>
                  <p><span className="text-zinc-500">Profil de connexion :</span> Mode {streamMode === "proxy" ? "PROXIFIÉ 🛡️ (Safe CORS et Bypass SSL)" : "DIRECT 🔌 (Origin Server)"}</p>
                </div>
              </div>

              {/* Troubleshooting Instructions (Step 6/7/8/9/10 compliance) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans leading-relaxed text-zinc-400">
                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-wider block">🔒 1. CONTOURNER LES CRÉDENTIALS ET CORS</span>
                  <p>
                    If a <strong>CORS (401 / Stream Block)</strong> error occurs, <strong>PROXIED</strong> mode (enabled by default) routes calls through our secure Express server to include the token and hide the API key.
                  </p>
                </div>
                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-wider block">⚙️ 2. AUTORISER CORS DANS LE SERVEUR</span>
                  <p>
                    Si vous utilisez le mode Direct, accédez au <strong>Tableau de bord de votre serveur &gt; Avancé</strong> et ajoutez le domaine de ce site dans <i>"CORS Allowed Domains"</i> ou cochez <i>"Allow CORS"</i>.
                  </p>
                </div>
              </div>

              {/* Quick corrective settings actions inside error viewport */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs text-left">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">OPTIONS CORRECTRICES DU CLIENT :</span>
                  <p className="text-[11px] text-zinc-400">Try the playback modes below to find optimal compatibility.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setStreamMode(prev => prev === "proxy" ? "direct" : "proxy");
                      setVideoError(null);
                    }}
                    className="bg-zinc-90 w-max bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all"
                  >
                    MODE : {streamMode === "proxy" ? "🔄 FORCE DIRECT" : "🔄 FORCE PROXY CACHE"}
                  </button>

                  <button
                    onClick={() => {
                      setForceTranscode(prev => !prev);
                      setVideoError(null);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all"
                  >
                    FLUX : {isTranscoded ? "🔄 FORCE ORIGINAL DIRECT (BRUT)" : "🔄 FORCE TRANSCODAGE (AAC)"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setVideoError(null)}
                  className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 py-2.5 rounded-xl text-[10px] font-mono tracking-wider font-bold uppercase transition-all cursor-pointer active:scale-95"
                >
                  Retry playback
                </button>
                <button
                  onClick={() => {
                    setVideoError(null);
                    onCloseView();
                  }}
                  className="w-full bg-transparent hover:bg-white/5 border border-zinc-800 text-zinc-400 py-2.5 rounded-xl text-[10px] font-mono tracking-wider font-bold uppercase transition-all cursor-pointer active:scale-95"
                >
                  Close Classico Player
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isJellyfinMovie ? (
          /* NATIVE HTML5 VIDEO FOR JELLYFIN STREAMS */
          <video
            ref={videoRef}
            src={activeSrc || undefined}
            preload="auto"
            playsInline
            webkit-playsinline="true"
            controls={false}
            className={`absolute inset-0 w-full h-full bg-black ${videoState.objectFit === "cover" ? "object-cover" : "object-contain"}`}
            style={{ display: activeSrc ? "block" : "none" }}
            onPlay={() => {
              console.log("[DEBUG PLAYER] Video play event triggered.");
              trackEventFired("play", "Événement play");
              setVideoState(prev => ({ ...prev, playing: true }));
              setIsWaiting(false);
              handleSeekCompletedLogs();
            }}
            onPause={() => {
              console.log("[DEBUG PLAYER] Video pause event triggered.");
              setVideoState(prev => ({ ...prev, playing: false }));
            }}
            onWaiting={() => setIsWaiting(true)}
            onPlaying={() => {
              setIsWaiting(false);
              handleSeekCompletedLogs();
            }}
            onSeeking={() => setIsWaiting(true)}
            onSeeked={() => {
              setIsWaiting(false);
              handleSeekCompletedLogs();
              if (videoRef.current) {
                setVideoState(prev => ({
                  ...prev,
                  progress: videoRef.current!.currentTime
                }));
              }
            }}
            onCanPlay={() => {
              console.log("[DEBUG PLAYER] Event canplay triggered (onCanPlay event handler).");
              trackEventFired("canplay", "Événement canplay");
              setIsCanPlay(true);
              console.trace("[PLAYER STATE CHANGE]", {
                action: "setIsStreamLoading(false) - onCanPlay event",
                streamUrl: finalStreamUrl,
                playbackState: videoState,
                isLoading: isLoadingStreams,
                isStreamLoading,
                readyState: videoRef.current?.readyState,
                networkState: videoRef.current?.networkState
              });
              setIsStreamLoading(false);
              setIsWaiting(false);
              handleSeekCompletedLogs();
            }}
            onLoadedData={() => {
              console.log("[DEBUG PLAYER] Event loadeddata triggered.");
              trackEventFired("loadeddata", "Événement loadeddata");
              setIsWaiting(false);
              handleSeekCompletedLogs();
            }}
            onLoadedMetadata={() => {
              console.log("[DEBUG PLAYER] Event loadedmetadata triggered (onLoadedMetadata event handler).");
              trackEventFired("loadedmetadata", "Événement loadedmetadata");
              setIsMetadataLoaded(true);
              applySubtitleSelection(activeSubtitleIndex);
            }}
            onError={(e) => {
              const el = e.currentTarget;
              const err = el.error;
              console.error("[DEBUG PLAYER] Video error event occurred:", err ? `Code: ${err.code}, Message: ${err.message}` : "Unknown error");
              
              if (el.seeking) {
                console.log("[PLAYER] Seeking active; skipping temporary native stream abort state.");
                return;
              }

              if (err && err.code === 1) {
                console.log("[PLAYER] Stream aborted (standard action during seek / network reload). Skipping.");
                return;
              }

              if (playbackAttempts < 3) {
                const nextAttempt = playbackAttempts + 1;
                console.warn(`[PLAYER RECOVERY] HTML5 video error occurred. Attempting automatic recovery ${nextAttempt}/3...`);
                if (el.currentTime > 0) {
                  savedRestoreTime.current = el.currentTime;
                  console.log(`[RESTORE SYSTEM] Guarded current position: ${savedRestoreTime.current}s`);
                }
                setPlaybackAttempts(nextAttempt);
                if (nextAttempt === 1) {
                  setForceTranscode(true);
                } else if (nextAttempt === 2) {
                  setIsLowQuality(true);
                }
                setVideoError(null);
                setIsMetadataLoaded(false);
                setIsCanPlay(false);
                return;
              }

              let msg = "Erreur de format, codec ou CORS bloqué par votre navigateur.";
              if (err) {
                if (err.code === 2) {
                  msg = "Erreur réseau de connexion. Le serveur de médias est inaccessible en CORS direct ou le réseau a expiré.";
                } else if (err.code === 3) {
                  msg = "Décodage impossible. Les formats ou codecs requis (ex: HEVC/H.265, DTS-HD, AC3, TrueHD) ne sont pas gérés par votre navigateur actuel.";
                } else if (err.code === 4) {
                  msg = "La source n'a pas pu être chargée. Le fichier est introuvable ou le lien de diffusion a renvoyé un code HTTP 401 ou 403.";
                } else {
                  msg = `Code d'erreur média navigateur: ${err.code}.`;
                }
              }

              logMissingEvents(`Erreur de lecture vidéo (${msg})`);
              console.error("[PLAYER FALLBACK] All recovery attempts exhausted. Forcing transparent raw stream fallback.");
              const fallbackPath = `/Videos/${resolvedTargetId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1`;
              const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
              const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
              const apiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : "";
              const fallbackUrl = isNetlify ? `${serverUrl}${fallbackPath}&api_key=${apiKey}&DeviceId=CinemaAppClient&MediaSourceId=${resolvedTargetId}` : `/api/jellyfin/proxy/stream?id=${resolvedTargetId}`;
              
              setActiveSrc(fallbackUrl);
              setVideoError(null);
            }}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              const curTime = el.currentTime;
              const dur = el.duration;
              if (!firstFrameLoggedRef.current && curTime > 0) {
                firstFrameLoggedRef.current = true;
                trackEventFired("firstFrame", "Première frame affichée");
              }
              setVideoState(prev => ({
                ...prev,
                progress: curTime
              }));

              // Save progress percentage to local storage for "Continue Watching" functionality
              if (curTime > 0 && dur > 0 && movieId) {
                try {
                  const savedStr = localStorage.getItem("classico_progress") || "{}";
                  const progressObj = JSON.parse(savedStr);
                  progressObj[movieId] = {
                    id: movieId,
                    title: movieTitle,
                    poster: moviePoster || "",
                    currentTime: curTime,
                    duration: dur,
                    updatedAt: Date.now()
                  };
                  localStorage.setItem("classico_progress", JSON.stringify(progressObj));
                } catch (e) {
                  // ignore parse errors
                }
              }
            }}
            onEnded={() => {
              setVideoState(prev => ({ ...prev, playing: false, progress: 0 }));
            }}
            autoPlay
            crossOrigin="anonymous"
          >
            {playbackInfo?.subtitles?.filter(track => isTextSubtitle(track.codec)).map((track) => (
              <track
                key={`track-${track.index}-${activeSubtitleIndex}`}
                kind="subtitles"
                src={track.url}
                srcLang={track.language || "fr"}
                label={track.label}
                default={videoState.subtitlesOn && activeSubtitleIndex === track.index}
                onError={() => {
                  console.warn(`[VIDEO SUBTITLE] Track error on subtitle track index: ${track.index}. Falling back to no subtitles.`);
                  setVideoState(prev => ({ ...prev, subtitlesOn: false }));
                  setActiveSubtitleIndex(null);
                }}
              />
            ))}
          </video>
        ) : (
          /* SIMULATED CINEMATIC VIDEO FEED */
          <div className="text-center z-20 transition-all duration-300 p-4">
            {videoState.progress < 5 && !introCompleted ? (
              <div className="font-mono text-zinc-600 space-y-2 animate-pulse">
                <p className="text-xs tracking-widest uppercase text-amber-500/60 font-bold">CLASSICO LEADER PRE-FEED</p>
                <div className="w-24 h-24 rounded-full border-4 border-zinc-800 flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 rounded-full border-t-4 border-amber-400 animate-spin" style={{ animationDuration: '1s' }} />
                  <span className="text-4xl font-extrabold text-white">{5 - Math.floor(videoState.progress)}</span>
                </div>
                <p className="text-[10px] text-zinc-500">SOUND CALIBRATION ON — STEREO OUT</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-md px-6">
                <p className="text-[10px] font-mono tracking-widest uppercase text-rose-500 flex items-center justify-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  PLAYING — SECURE PREVIEW
                </p>

                <div className={`p-6 rounded-2xl bg-gradient-to-br ${movieGradient} border border-white/5 shadow-2xl relative overflow-hidden group`}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-md opacity-20 animate-pulse pointer-events-none" />
                  
                  <div className="relative font-display space-y-2">
                    <span className="text-4xl block filter drop-shadow-md select-none">{movieSymbol}</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                      {movieTitle}
                    </h2>
                    <p className="text-xs text-amber-400 font-mono tracking-widest">{movieDuration} • HD STEREO</p>
                  </div>
                </div>

                {videoState.playing && (
                   <div className="flex justify-center items-end gap-1 h-6 pt-4">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-amber-500 rounded-t shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        style={{ 
                          height: `${Math.max(15, Math.sin((videoState.progress * 4) + i) * 100)}%`,
                          transition: 'height 0.15s ease-in-out'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Decorative retro TV Scanline Layer (Always present for vintage vibe!) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none z-30 opacity-20 animate-pulse" />

        {/* Projector light cone (Only active when playing and no video/simulated playing) */}
        {videoState.playing && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[150%] bg-gradient-to-b from-amber-500/5 via-amber-500/1 to-transparent blur-2xl transform origin-top rotate-180 scale-y-110 pointer-events-none z-10" />
        )}

        {/* Subtitles (Rendered only for simulated playback) */}
        {activeSubtitle && (
          <div className="absolute bottom-16 inset-x-4 sm:inset-x-12 z-40 text-center pointer-events-none">
            <span className="bg-black/85 text-yellow-300 font-sans tracking-wide font-medium text-xs sm:text-sm md:text-base px-4 py-2 rounded-lg border border-zinc-800 shadow-md inline-block max-w-xl">
              {activeSubtitle.text}
            </span>
          </div>
        )}



        {/* Dark Screen Overlay when Paused */}
        {!videoState.playing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30">
            <div className="text-center space-y-2 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto border border-white/20">
                <Pause className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">PAUSED</p>
            </div>
          </div>
        )}
      </div>

      {/* Player Bottom Control Deck */}
      <div className={`bg-neutral-950 p-4 border-t border-zinc-900 flex flex-col gap-3.5 z-40 transition-opacity duration-500 ${isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${videoState.fullscreen ? 'absolute bottom-0 left-0 right-0 bg-neutral-950/80 backdrop-blur-md pb-6 px-6 border-transparent' : ''}`}>
        
        {/* Seekbar scrub timeline */}
        {isMetadataLoaded && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500 select-none w-10 text-left">
              {`${Math.floor(currentDisplayProgress / 60)}:${(Math.floor(currentDisplayProgress % 60)).toString().padStart(2, "0")}`}
            </span>

            <div 
              id="mock-timeline-track"
              className="flex-grow h-1.5 bg-zinc-800 rounded-full cursor-pointer relative group touch-none"
              onTouchStart={(e) => {
                isDraggingRef.current = true;
                const newTime = calculateTimeFromEvent(e.touches[0].clientX, e.currentTarget);
                setDragProgress(newTime);
              }}
              onTouchMove={(e) => {
                if (isDraggingRef.current) {
                  const newTime = calculateTimeFromEvent(e.touches[0].clientX, e.currentTarget);
                  setDragProgress(newTime);
                }
              }}
              onTouchEnd={() => {
                if (isDraggingRef.current) {
                  isDraggingRef.current = false;
                  if (dragProgress !== null) {
                    applySeekTime(dragProgress);
                  }
                  setDragProgress(null);
                }
              }}
              onMouseDown={(e) => {
                isDraggingRef.current = true;
                const newTime = calculateTimeFromEvent(e.clientX, e.currentTarget);
                setDragProgress(newTime);
              }}
              onMouseMove={(e) => {
                if (isDraggingRef.current) {
                  const newTime = calculateTimeFromEvent(e.clientX, e.currentTarget);
                  setDragProgress(newTime);
                }
              }}
              onMouseUp={(e) => {
                if (isDraggingRef.current) {
                  isDraggingRef.current = false;
                  const newTime = calculateTimeFromEvent(e.clientX, e.currentTarget);
                  setDragProgress(null);
                  applySeekTime(newTime);
                }
              }}
              onMouseLeave={() => {
                if (isDraggingRef.current) {
                  isDraggingRef.current = false;
                  if (dragProgress !== null) {
                    applySeekTime(dragProgress);
                  }
                  setDragProgress(null);
                }
              }}
            >
              {/* Fill bar */}
              <div 
                className="absolute inset-y-0 left-0 bg-amber-500 rounded-full group-hover:bg-amber-400"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Floating scrubber head */}
              <div 
                className={`absolute w-3.5 h-3.5 bg-white border border-amber-600 rounded-full -top-1 shadow transition-all duration-150 ${dragProgress !== null ? 'scale-150' : 'group-hover:scale-125'}`}
                style={{ left: `calc(${progressPercent}% - 7px)` }}
              />
            </div>

            <span className="text-[10px] font-mono text-zinc-500 select-none w-10 text-right">
              {`${Math.floor(videoState.duration / 60)}:${(Math.floor(videoState.duration % 60)).toString().padStart(2, "0")}`}
            </span>
          </div>
        )}

        {/* Control Action Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Rewind 15s */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  const newTime = Math.max(0, videoRef.current.currentTime - 15);
                  videoRef.current.currentTime = newTime;
                  setVideoState(prev => ({ ...prev, progress: newTime }));
                }
              }}
              className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer"
              title="Reculer de 15s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              id="player-play-btn"
              onClick={() => setVideoState(prev => ({ ...prev, playing: !prev.playing }))}
              className="text-[#e2e8f0] hover:text-amber-400 p-1.5 active:scale-90 transition-all duration-150 cursor-pointer"
              title={videoState.playing ? "Pause" : "Play"}
            >
              {videoState.playing ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            {/* FastForward 15s */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  const newTime = Math.min(videoState.duration, videoRef.current.currentTime + 15);
                  videoRef.current.currentTime = newTime;
                  setVideoState(prev => ({ ...prev, progress: newTime }));
                }
              }}
              className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer"
              title="Avancer de 15s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Restart Track */}
            <button
              id="player-restart-btn"
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
                setVideoState(prev => ({ ...prev, progress: 0 }));
              }}
              className="text-zinc-500 hover:text-white p-1.5 transition-colors duration-150 cursor-pointer"
              title="Recommencer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume Slider Section */}
            <div className="hidden sm:flex items-center gap-2 border-l border-zinc-800 pr-2 pl-4">
              <button
                id="player-mute-btn"
                onClick={() => setVideoState(prev => ({ ...prev, muted: !prev.muted }))}
                className="text-zinc-400 hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {videoState.muted || videoState.volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-500" />
                )}
              </button>

              <input
                id="player-volume-slider"
                type="range"
                min="0"
                max="100"
                value={videoState.muted ? 0 : videoState.volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVideoState(prev => ({ ...prev, volume: v, muted: v === 0 }));
                }}
                className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>


          </div>

          {/* Title of active film / Jellyfin status */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono font-bold tracking-tight text-zinc-400">
            {isJellyfinMovie ? (
              <>
                <span className="text-amber-400 bg-amber-500/5 border border-amber-500/25 px-2.5 py-1 rounded">
                  STREAM : {movieTitle.toUpperCase()}
                </span>
                
                {/* Active media source name if loaded */}
                {playbackInfo && (
                  <span className="text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded">
                    SÉLECTION : {playbackInfo.container.toUpperCase()}
                  </span>
                )}

                {/* Estimated bitrate display */}
                {estimatedBitrate !== null && (
                  <span className="text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1">
                    📶 {(estimatedBitrate / 1000000).toFixed(1)} Mbps
                  </span>
                )}

                {/* Initial buffering time */}
                {initialBufferingTime !== null && (
                  <span className="text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded" title="Initial wait time before playback starts">
                    ⏱️ {initialBufferingTime.toFixed(1)}s
                  </span>
                )}

                {/* Auto downgrade status */}
                {isAutoDowngraded && (
                  <span className="text-rose-400 bg-rose-950/45 border border-rose-500/30 px-2 py-1 rounded animate-pulse" title="Stream automatically optimized to prevent buffering">
                    ⚠️ FLUX ALLÉGÉ AUTO (DÉBIT LIMITÉ)
                  </span>
                )}

                {/* Stream mode switcher */}
                <button
                  onClick={() => {
                    setStreamMode(prev => prev === "proxy" ? "direct" : "proxy");
                    setVideoError(null);
                  }}
                  className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 hover:text-white px-2 py-1 rounded text-zinc-500 hover:text-amber-400 font-bold transition-all cursor-pointer"
                  title="Masquer ou exposer le serveur d'origine en direct"
                >
                  CONEX : {streamMode === "proxy" ? "🛡️ CACHE-PROXY" : "🔌 ACCÈS DIRECT"}
                </button>

                {/* Transcode switcher */}
                <button
                  onClick={() => {
                    setForceTranscode(prev => !prev);
                    setVideoError(null);
                  }}
                  className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 hover:text-white px-2 py-1 rounded text-zinc-500 hover:text-amber-400 font-bold transition-all cursor-pointer"
                  title="Changer entre le flux d'origine brut (Direct) ou l'encodage de compatibilité à la volée (Transcodé)"
                >
                  MODE : {isTranscoded ? "⚙️ TRANSCODING" : "🔋 ORIGINAL RAW STREAM"}
                </button>
              </>
            ) : (
              <span>APPRÉCIATION CINÉMATIQUE : {movieTitle.toUpperCase()}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Cast Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current && (videoRef.current as any).remote && (videoRef.current as any).remote.prompt) {
                  (videoRef.current as any).remote.prompt().catch((err: any) => {
                    console.log("Cast prompt error:", err);
                    alert("Impossible de démarrer le casting. Veuillez vérifier votre appareil.");
                  });
                } else {
                  alert("Le casting (Chromecast) n'est pas supporté directement sur ce navigateur ou aucune cible n'est disponible.");
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Caster l'écran"
            >
              <Cast className="w-5 h-5" />
            </button>

            {/* AirPlay Control */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current && (videoRef.current as any).webkitShowPlaybackTargetPicker) {
                  (videoRef.current as any).webkitShowPlaybackTargetPicker();
                } else {
                  alert("AirPlay n'est pas supporté sur ce navigateur (nécessite Safari).");
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="AirPlay"
            >
              <Airplay className="w-5 h-5" />
            </button>

            {/* Unified Settings Menu */}
            <div className="relative">
              <button
                id="player-settings-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsMenu(prev => !prev);
                }}
                className={`p-1.5 rounded transition-colors duration-150 cursor-pointer flex items-center justify-center ${
                  showSettingsMenu ? "text-amber-400 bg-amber-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
                title="Paramètres"
              >
                <Menu className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div 
                  id="player-settings-menu"
                  className="absolute bottom-10 right-0 z-50 w-64 bg-zinc-950/98 border border-zinc-800 rounded-xl p-3 shadow-2xl font-sans text-xs text-left backdrop-blur-md max-h-[50vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150"
                  onClick={e => e.stopPropagation()}
                >
                  {settingsView === "main" && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                      {/* Vitesse de lecture */}
                      <div className="mb-3">
                        <div className="text-zinc-400 font-bold tracking-wide text-[10px] uppercase mb-1.5">Vitesse de lecture</div>
                        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                            <button
                              key={speed}
                              onClick={() => {
                                setPlaybackRate(speed);
                                if (videoRef.current) videoRef.current.playbackRate = speed;
                              }}
                              className={`px-2 py-1 rounded shrink-0 font-medium transition-colors cursor-pointer ${
                                playbackRate === speed ? "bg-amber-500 text-zinc-950 font-bold" : "bg-white/5 text-zinc-300 hover:bg-white/10"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Menu Audio */}
                      {isJellyfinMovie && playbackInfo?.audios && playbackInfo.audios.length > 0 && (
                        <button
                          onClick={() => setSettingsView("audio")}
                          className="w-full px-2.5 py-2.5 mb-1 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-300"
                        >
                          <span className="font-semibold text-[11px]">Audio</span>
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          </div>
                        </button>
                      )}

                      {/* Menu Subtitles */}
                      <button
                        onClick={() => setSettingsView("subtitles")}
                        className="w-full px-2.5 py-2.5 mb-3 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-300"
                      >
                        <span className="font-semibold text-[11px]">Subtitles</span>
                        <div className="flex items-center gap-1.5">
                          
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                      </button>

                      {/* Popout (PiP) */}
                      {typeof document !== "undefined" && (document as any).pictureInPictureEnabled && (
                        <button
                          onClick={() => {
                            if (videoRef.current && videoRef.current !== document.pictureInPictureElement) {
                              videoRef.current.requestPictureInPicture().catch(() => {});
                            } else if (document.pictureInPictureElement) {
                              document.exitPictureInPicture().catch(() => {});
                            }
                            setShowSettingsMenu(false);
                            setTimeout(() => setSettingsView("main"), 200);
                          }}
                          className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-bold text-[11px] flex justify-center items-center cursor-pointer transition-colors"
                        >
                          Mode Popout (PiP)
                        </button>
                      )}
                    </div>
                  )}

                  {settingsView === "audio" && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                        <button 
                          onClick={() => setSettingsView("main")}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-zinc-300 font-bold tracking-wide text-[11px] uppercase">Audio</span>
                      </div>
                      <div className="space-y-0.5 max-h-[40vh] overflow-y-auto pr-1">
                        {playbackInfo?.audios && playbackInfo.audios.map(track => {
                          const isCurrentActive = activeAudioIndex === track.index;
                          return (
                            <button
                              key={track.index}
                              onClick={() => {
                                setActiveAudioIndex(track.index);
                                // Don't close menu immediately, let user see selection
                              }}
                              className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrentActive ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              <span className="font-semibold text-[11px] truncate"><TrackName track={track} /></span>
                              {isCurrentActive && <span className="text-amber-500 pl-2">✔</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {settingsView === "subtitles" && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                        <button 
                          onClick={() => setSettingsView("main")}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-zinc-300 font-bold tracking-wide text-[11px] uppercase">Subtitles</span>
                      </div>
                      <div className="space-y-0.5 max-h-[40vh] overflow-y-auto pr-1">
                        <button
                          onClick={() => {
                            setActiveSubtitleIndex(null);
                            setVideoState(prev => ({ ...prev, subtitlesOn: false }));
                          }}
                          className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            !videoState.subtitlesOn || activeSubtitleIndex === null ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          <span className="font-semibold text-[11px]">Off</span>
                          {(!videoState.subtitlesOn || activeSubtitleIndex === null) && <span className="text-amber-500 pl-2">✔</span>}
                        </button>

                        {playbackInfo?.subtitles && playbackInfo.subtitles.length > 0 && playbackInfo.subtitles.map(track => {
                          const isCurrentActive = videoState.subtitlesOn && activeSubtitleIndex === track.index;
                          return (
                            <button
                              key={track.index}
                              onClick={() => {
                                setActiveSubtitleIndex(track.index);
                                setVideoState(prev => ({ ...prev, subtitlesOn: true }));
                              }}
                              className={`w-full px-2.5 py-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isCurrentActive ? "bg-amber-500/15 text-amber-400 font-bold border-l-2 border-amber-500" : "text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              <span className="font-semibold text-[11px] truncate"><TrackName track={track} /></span>
                              {isCurrentActive && <span className="text-amber-500 pl-2">✔</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
</div>
              )}
            </div>

            
            {/* Fullscreen Button */}
            <button
              id="player-fullscreen-btn"
              type="button"
              onClick={handleFullscreenToggle}
              className="text-zinc-400 hover:text-amber-400 p-1.5 transition-colors duration-150 cursor-pointer touch-manipulation z-50 relative"
              title="Plein écran"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            
          </div>
        </div>

        {/* Secure premium audio feedback diagnostics bar */}
        {(isJellyfinMovie || streamUrl) && (
          <div className="bg-amber-500/5 hover:bg-amber-500/10 border-t border-zinc-900/50 px-4 py-3 sm:py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-left transition-colors rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-black tracking-widest text-amber-500 flex items-center gap-1 uppercase">
                <VolumeX className="w-3.5 h-3.5" />
                Playback or sound issues? (Codec AC3 / DTS / HEVC)
              </span>
              <p className="text-[10px] text-zinc-400 font-sans leading-snug">
                Some browsers do not support multi-channel audio decoding or certain original file types. Switch to <strong>TRANSCODING</strong> mode in the toolbar, or copy the URL to play it in a powerful external player like <strong>VLC</strong> or <strong>IINA</strong>!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={(e) => {
                  if (finalStreamUrl) {
                    navigator.clipboard.writeText(finalStreamUrl);
                    const target = e.currentTarget;
                    const originalText = target.innerText;
                    target.innerText = "✓ FLUX COPIÉ !";
                    target.style.color = "#10b981";
                    target.style.borderColor = "#10b981";
                    setTimeout(() => {
                      target.innerText = originalText;
                      target.style.color = "";
                      target.style.borderColor = "";
                    }, 2500);
                  }
                }}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-[9px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                COPIER LE FLUX
              </button>
              
              <a
                href={finalStreamUrl ? `intent:${finalStreamUrl}#Intent;package=org.videolan.vlc;type=video/*;end` : undefined}
                className="bg-amber-500 hover:bg-amber-400 text-black font-mono text-[9px] font-black px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1"
              >
                OUVRIR VLC 📡
              </a>
            </div>
          </div>
        )}

        {/* PANEL DIAGNOSTIQUE FLOTTANT (USER TEST EN TEMPS RÉEL) */}
        {showDiagnostics && (
          <div className="absolute top-18 right-6 z-50 w-full max-w-md bg-stone-950/96 border border-amber-500/30 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-zinc-300 shadow-2xl space-y-3.5 backdrop-blur-md max-h-[72vh] overflow-y-auto pointer-events-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-sans font-black text-xs text-white tracking-widest uppercase">REAL PLAYBACK CONTROLLER</span>
              </div>
              <button 
                onClick={() => setShowDiagnostics(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs"
              >
                [Masquer]
              </button>
            </div>

            {/* MOMENT DU CLIC DIAGNOSTICS */}
            <div className="space-y-1">
              <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">1. MENTIONS AU CLIC (MOMENT DU CLIC) :</div>
              <div className="bg-black/55 p-2 rounded-lg border border-zinc-900 space-y-1">
                <p><span className="text-zinc-500">Titre :</span> <span className="text-zinc-100 font-bold">{clickLog?.title || movieTitle}</span></p>
                <p><span className="text-zinc-500">ID Envoyé au Player :</span> <span className="text-zinc-400 break-all">{clickLog?.idSent || movieId}</span></p>
                <p><span className="text-zinc-500 font-semibold">Substitution Rocky III :</span> <span className={clickLog?.isOverridden ? "text-emerald-400 font-bold" : "text-zinc-500"}>{clickLog?.isOverridden ? "ACTIF (Forcé sur 8db5a60d8317cdd9ca66b81e52cad247)" : "NON REQUIS"}</span></p>
                <p><span className="text-zinc-500">Active MediaSourceId:</span> <span className="text-amber-400 whitespace-nowrap overflow-hidden select-all">{playbackInfo?.id || "Loading..."}</span></p>
                <p><span className="text-zinc-500">Fichier Serveur (Path) :</span> <span className="text-zinc-400 break-all select-all">{clickLog?.path || "Calculé dynamiquement..."}</span></p>
              </div>
            </div>

            {/* MÉTROLOGIE DU SEEK / POSITION ET RECHERCHE */}
            <div className="space-y-1">
              <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">1b. ANALYSE DU SEEKING (CHRONOLOGIE DÉTAILLÉE) :</div>
              <div className="bg-black/55 p-2 rounded-lg border border-zinc-900 space-y-1.5">
                <p><span className="text-zinc-500">currentTime réel :</span> <span className="text-emerald-400 font-bold font-mono">{(videoRef.current?.currentTime || 0).toFixed(2)} s</span></p>
                <p><span className="text-zinc-500">Requested currentTime:</span> <span className="text-teal-400 font-bold font-mono">{requestedSeekTime !== null ? `${requestedSeekTime.toFixed(2)} s` : "None (Initial Play)"}</span></p>
                <p><span className="text-zinc-500">temps retourné serveur :</span> <span className="text-sky-400 font-bold font-mono">{(seekOffset + (videoRef.current?.currentTime || 0)).toFixed(2)} s</span></p>
                <p><span className="text-zinc-500">Playback Method:</span> <span className="text-white font-bold">{isJellyfinMovie ? (playbackInfo?.isDirect ? "Direct Play (Raw File)" : "On-the-fly Transcoding (Progressive MP4)") : "Simulated Mode"}</span></p>
                
                {lastSeekLog && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1 text-[10px] text-zinc-400">
                    <p className="text-amber-500 font-bold text-[9px] uppercase">Rapport de chronologie du dernier Seek :</p>
                    <p><span className="text-zinc-500">Temps demandé :</span> <span className="text-zinc-200 font-bold">{lastSeekLog.requestedTime.toFixed(2)} s</span></p>
                    <p><span className="text-zinc-500">StartTimeTicks envoyé :</span> <span className="text-indigo-400 break-all select-all font-mono">{lastSeekLog.ticksSent}</span></p>
                    <p><span className="text-zinc-500">Temps réel après chargement :</span> <span className="text-emerald-400 font-bold">{lastSeekLog.timeAfterLoaded}</span></p>
                    <p><span className="text-zinc-500">Temps à t + 2 secondes :</span> <span className="text-teal-400 font-bold">{lastSeekLog.timeAfter2s}</span></p>
                    <p><span className="text-zinc-500">Temps à t + 5 secondes :</span> <span className="text-sky-400 font-bold">{lastSeekLog.timeAfter5s}</span></p>
                  </div>
                )}
                
                <p><span className="text-zinc-500">URL Vidéo Active :</span> <span className="text-zinc-400 break-all select-all text-[9.5px] block bg-black/40 p-1.5 rounded mt-0.5 border border-zinc-800/50">{finalStreamUrl || "Non résolue"}</span></p>
                <p><span className="text-zinc-500">Last error:</span> <span className={videoError ? "text-rose-400 font-bold" : "text-zinc-500"}>{videoError || "None (OK)"}</span></p>
              </div>
            </div>

            {/* ÉTAT DES SOUS-TITRES (SYNC & ACTIVATION) WITH DEEP DIAGNOSTIC SYSTEM */}
            <div className="space-y-1">
              <div className="text-amber-500 font-bold uppercase tracking-wider text-[10.5px]">1c. DIAGNOSTIC PROFOND DES SOUS-TITRES :</div>
              <div className="bg-black/65 p-2.5 rounded-lg border border-zinc-900 space-y-2 text-[10px]">
                
                {/* VERDICT AUTOMATIQUE */}
                <div className="bg-zinc-900/60 p-2 rounded border border-zinc-850">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400 uppercase font-black tracking-wider text-[9px]">VERDICT ACTUEL :</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${
                      subtitlesDiagnostic?.verdict === "OK" 
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        : subtitlesDiagnostic?.verdict === "TIMING_ISSUE"
                        ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                        : subtitlesDiagnostic?.verdict === "DISCONNECTED"
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        : subtitlesDiagnostic?.verdict === "RENDER_BLOCKED"
                        ? "bg-sky-950 text-sky-300 border border-sky-500/30"
                        : "bg-rose-950 text-rose-300 border border-rose-500/30"
                    }`}>
                      {subtitlesDiagnostic?.verdict || "INDÉTERMINÉ"}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-300 text-[10px] leading-relaxed">
                    {subtitlesDiagnostic?.verdictDetails || "Initialisation du diagnostic des TextTracks..."}
                  </p>
                </div>

                {/* ÉTAT DU NAVIGATEUR ET BALISE VIDEO */}
                <div className="grid grid-cols-2 gap-2 text-[9.5px] bg-black/40 p-2 rounded border border-zinc-900/60">
                  <div>
                    <span className="text-zinc-500">video.readyState :</span> <span className="text-zinc-300 font-mono font-bold">{subtitlesDiagnostic?.readyState !== undefined ? subtitlesDiagnostic.readyState : "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">webkitTextTracks :</span> <span className={subtitlesDiagnostic?.hasWebkitTextTracks ? "text-emerald-400 font-bold" : "text-zinc-500 font-mono"}>{subtitlesDiagnostic?.hasWebkitTextTracks ? "OUI (OK)" : "NON"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Playhead :</span> <span className="text-zinc-300 font-mono">{(subtitlesDiagnostic?.currentTime || 0).toFixed(2)}s</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Durée :</span> <span className="text-zinc-300 font-mono">{(subtitlesDiagnostic?.duration || 0).toFixed(1)}s</span>
                  </div>
                </div>

                {/* TRACKS INTERNES DÉTECTÉS */}
                <div className="space-y-1.5">
                  <span className="text-amber-500 font-bold uppercase text-[9px] tracking-wider block">ÉTAT DÉTAILLÉ DES TRÉSO DE PISTES (TEXTTRACKS) :</span>
                  {subtitlesDiagnostic?.tracks && subtitlesDiagnostic.tracks.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {subtitlesDiagnostic.tracks.map((track, i) => (
                        <div key={i} className="bg-black/30 p-2 rounded border border-zinc-900 text-[9.5px] space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-200 font-bold font-mono">Piste #{track.index} "{track.label}"</span>
                            <span className={`px-1 py-0.5 rounded text-[8.5px] font-mono font-bold ${
                              track.mode === "showing" 
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" 
                                : "bg-zinc-900 text-zinc-500"
                            }`}>
                              mode: {track.mode}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-400 font-mono">
                            <div>Langue : <span className="text-zinc-300">{track.language}</span></div>
                            <div>Catégorie : <span className="text-zinc-300">{track.kind}</span></div>
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-mono border-t border-zinc-900/60 pt-1 mt-1">
                            <span className="text-zinc-500">Cues locales (track.cues) :</span>
                            <span className={track.cuesCount !== null && track.cuesCount > 0 ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                              {track.cuesCount === null ? "null (Non chargé)" : `${track.cuesCount} cues`}
                            </span>
                          </div>

                          {track.criticalWarning && (
                            <div className="bg-rose-950/40 text-rose-400 text-[8.5px] font-bold p-1 rounded mt-1 border border-rose-900/30 font-mono flex items-center gap-1">
                              <span className="animate-pulse">⚠️</span> CRITICAL : {track.criticalWarning}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-rose-950/20 text-rose-400 text-[9px] italic p-2 rounded border border-rose-900/20">
                      Aucun TextTrack détecté sur la balise &lt;video&gt;. (Pendant le chargement ou indisponibilité du conteneur).
                    </div>
                  )}
                </div>

                <div className="text-[8.5px] text-zinc-500 leading-normal border-t border-zinc-900 pt-1.5">
                  <p>💡 <span className="text-zinc-400">Pourquoi pas de sous-titre si cues &gt; 0 ?</span> Firefox/Chrome ont un afficheur d'accessibilité natif. Si l'overlay du player est placé au-dessus sans z-index ou si la balise n'a pas les attributs CSS requis, ils sont masqués sous l'image.</p>
                </div>

              </div>
            </div>

            {/* REQUÈTE RÉSEAU EN TIERS RÉEL */}
            <div className="space-y-1">
              <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">2. REQUÊTE RÉSEAU DE STREAM ET TRANSCODAGE :</div>
              <div className="bg-black/55 p-2 rounded-lg border border-zinc-900 space-y-2">
                <div className="space-y-1 text-[10px]">
                  <p className="text-teal-400 font-bold text-[9.5px] uppercase">Proxy Réseau (Serveur Node Express) :</p>
                  
                  {/* SPEED & BUFFER DIAGNOSTICS */}
                  <div className="mb-2 p-1.5 bg-zinc-950 rounded border border-zinc-900 space-y-1 text-[9.5px]">
                    <p><span className="text-zinc-500">Débit estimé :</span> <span className="text-emerald-400 font-bold font-mono">{estimatedBitrate !== null ? `${(estimatedBitrate / 1000000).toFixed(2)} Mbps` : "En cours d'évaluation..."}</span></p>
                    <p><span className="text-zinc-500">Temps buffering initial :</span> <span className="text-teal-400 font-bold font-mono">{initialBufferingTime !== null ? `${initialBufferingTime.toFixed(2)}s` : "Mesure en attente..."}</span></p>
                    <p><span className="text-zinc-500">Auto Downgrade :</span> <span className={isAutoDowngraded ? "text-rose-400 font-bold" : "text-zinc-400"}>{isAutoDowngraded ? "YES (Light stream enabled)" : "NO (Standard quality)"}</span></p>
                  </div>

                  <p><span className="text-zinc-500 font-mono">Requested Range:</span> <span className="text-zinc-200 font-semibold font-mono">{serverStreamDebug?.requestRange || "No range (Continuous Playback)"}</span></p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Status HTTPS :</span> 
                    <span className={`px-1 rounded text-[9px] font-mono leading-none ${
                      serverStreamDebug?.statusCode === 206 || serverStreamDebug?.statusCode === 200 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" 
                        : (serverStreamDebug?.statusCode ? "bg-rose-950 text-rose-400 border border-rose-500/20" : "bg-zinc-900 text-zinc-400")
                    }`}>
                      {serverStreamDebug?.statusCode || "CRITICAL INITIAL TEST PENDING..."}
                    </span>
                  </p>
                  <p><span className="text-zinc-500">Content-Range Jellyfin :</span> <span className="text-zinc-300 font-mono text-[9px]">{serverStreamDebug?.jellyfinResponseRange || "Attente..."}</span></p>
                  <p><span className="text-zinc-500">StartTimeTicks détecté :</span> <span className="text-indigo-400 font-mono break-all">{serverStreamDebug?.startTimeTicks || "0"}</span></p>
                </div>

                <div className="space-y-1 text-[10px] border-t border-zinc-900 pt-1.5 pb-0.5">
                  <p className="text-amber-500 font-bold text-[9.5px] uppercase">Requête relayée vers Jellyfin :</p>
                  <p className="break-all font-mono text-[9px] bg-black/40 p-1 rounded border border-zinc-850 select-all leading-normal max-h-24 overflow-y-auto">
                    {serverStreamDebug?.targetUrl || "Liaison non établie..."}
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-1.5 text-[9.5px]">
                  <span className="text-zinc-500 font-semibold block mb-0.5">Analyse de directivité du flux :</span>
                  <p className="text-zinc-400 leading-normal">
                    {isTranscoded 
                      ? "Flux progressif MP4 transcoder à la volée. Le transcodeur démarre précisément à l'image correspondante à l'indice StartTimeTicks fourni dans les arguments." 
                      : "Flux natif Direct Play. Le navigateur effectue des requêtes partielles (Range Requests HTTP 206) directement sur le fichier d'origine."}
                  </p>
                </div>
              </div>
            </div>

            {/* ÉTAT DES CACHES CACHÉS */}
            <div className="space-y-1">
              <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">3. CACHES DU CLAVIER (SÉCURITÉ D'ANCIEN CACHE) :</div>
              <div className="bg-black/55 p-2 rounded-lg border border-zinc-900 space-y-1 text-zinc-400 text-[10px]">
                {cacheLog.length > 0 ? (
                  cacheLog.map((log, idx) => (
                    <div key={idx} className="border-b border-zinc-900/50 pb-1 last:border-b-0 break-words">
                      {log}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500">Aucun cache local détecté.</p>
                )}
                <div className="pt-2 border-t border-zinc-800 mt-1 flex justify-between items-center">
                  <span className="text-zinc-500 text-[9px]">Pas de cache de lecture persistant actif.</span>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                    className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/30 rounded px-1.5 py-0.5 transition-all text-[9.5px] cursor-pointer"
                  >
                    FORCER TOUT NETTOYER
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-[10px] text-zinc-400">
              ℹ️ Ce panneau s'exécute en direct depuis votre iframe. Il vérifie que le fichier sain de <strong>Rocky III</strong> (ID: 8db5a6...) répond immédiatement en <strong>HTTP 206 (Partial Content)</strong> pour autoriser le streaming progressif en direct sans latence.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
