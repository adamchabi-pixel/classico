import React, { useState, useEffect, useRef, useMemo } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize2, ArrowLeft, Loader2, Sparkles, AlertCircle, Captions, Lock
} from "lucide-react";

interface JfSubtitleCue {
  start: number;
  end: number;
  text: string;
}

const logChrono = (step: string) => {
  const clickTime = (window as any).moviePlayClickTime;
  const now = performance.now();
  const elapsed = clickTime ? ((now - clickTime) / 1000).toFixed(3) : "N/A (mount reference)";
  console.log(`%c[CHRONO LECTEUR CINEMA] %c${step} : %c+${elapsed}s%c (Timestamp: ${new Date().toISOString().slice(11, 23)})`, 
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

export function formatHlsUrl(url: string, id: string, deviceId?: string, apiKey?: string): string {
  if (!url) return url;
  
  // 3. Vérifie la présence des tokens : Assure-toi que les variables deviceId et apiKey transmises à la fonction ne sont pas undefined.
  const finalDeviceId = deviceId || "CinemaAppClient";
  const finalApiKey = apiKey || localStorage.getItem("classico_jellyfin_apikey") || "";

  let formatted = url;
  // 1. Remplacement de l'endpoint : Remplace définitivement /api/jellyfin/proxy/main.m3u8 par l'URL officielle : /api/jellyfin/proxy/videos/${id}/master.m3u8
  if (formatted.includes("/api/jellyfin/proxy/main.m3u8")) {
    formatted = formatted.replace("/api/jellyfin/proxy/main.m3u8", `/api/jellyfin/proxy/videos/${id}/master.m3u8`);
  } else if (formatted.includes("/main.m3u8")) {
    formatted = formatted.replace("/main.m3u8", `/videos/${id}/master.m3u8`);
  } else if (formatted.includes("/api/jellyfin/proxy/stream") && !formatted.includes("/videos/")) {
    formatted = formatted.replace("/api/jellyfin/proxy/stream", `/api/jellyfin/proxy/videos/${id}/master.m3u8`);
  }
  
  // S'assurer que le chemin d'accès pointe bien vers /videos/${id}/master.m3u8 s'il s'agit d'une URL de transcodage proxy
  if (formatted.includes("/api/jellyfin/proxy") && !formatted.includes("/videos/") && !formatted.includes("Static=true")) {
    try {
      const urlParts = formatted.split("?");
      const searchStr = urlParts[1] || "";
      formatted = `/api/jellyfin/proxy/videos/${id}/master.m3u8` + (searchStr ? "?" + searchStr : "");
    } catch (e) {
      formatted = `/api/jellyfin/proxy/videos/${id}/master.m3u8`;
    }
  }

  // 2. Nettoyage des doublons d'API Key : Supprime le paramètre dupliqué &api_key=... à la toute fin de la chaîne de requête.
  // Conserve uniquement le paramètre au format standard : &api_key=...
  try {
    const urlParts = formatted.split("?");
    const params = new URLSearchParams(urlParts[1] || "");
    const apiKeyVal = params.get("api_key") || params.get("ApiKey") || finalApiKey;
    
    params.delete("api_key");
    params.delete("ApiKey");
    
    if (apiKeyVal) {
      params.set("api_key", apiKeyVal);
    }
    
    // 1. Ajoute les paramètres manquants : Dans l'URL générée pour /master.m3u8, tu DOIS impérativement réinjecter les query params suivants :
    // - &DeviceId=${deviceId}
    // - &MediaSourceId=${movieId}
    // - &api_key=${apiKey}
    params.set("DeviceId", finalDeviceId);
    params.set("MediaSourceId", id);
    
    // 2. Remove bitrate limitations to force max quality on mobile/Safari
    params.set("VideoBitrate", "140000000");
    params.set("MaxVideoBitrate", "140000000");
    params.set("SegmentLength", "3");
    params.set("MinSegments", "1");
    params.set("Static", "false");
    
    formatted = urlParts[0] + "?" + params.toString();
  } catch (err) {
    console.warn("Issue formatting HLS URL params:", err);
  }

  return formatted;
}

interface CinemaPlayerViewProps {
  movieId: string;
  movieTitle: string;
  movieDuration?: string;
  onClose: () => void;
}

export default function CinemaPlayerView({
  movieId,
  movieTitle,
  movieDuration,
  onClose
}: CinemaPlayerViewProps) {
  const deviceId = "CinemaAppClient";
  const apiKey = localStorage.getItem("classico_jellyfin_apikey") || "";

  const [playbackInfo, setPlaybackInfo] = useState<{
    id: string;
    streamUrl: string;
    duration: number;
    container: string;
    title: string;
    isDirect: boolean;
    videoCodec?: string;
    audioCodec?: string;
    chosenPath?: string;
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
  } | null>(null);

  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [subtitlesOn, setSubtitlesOn] = useState<boolean>(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  
  const [cinemaCues, setCinemaCues] = useState<JfSubtitleCue[]>([]);
  const [activeCinemaCue, setActiveCinemaCue] = useState<string | null>(null);
  const cinemaCuesRef = useRef<JfSubtitleCue[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isStreamLoading, setIsStreamLoading] = useState(true);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const [playing, setPlaying] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const isInitialAutoplayRef = useRef<boolean>(true);
  
  const [progress, setProgress] = useState(0);
  const [seekOffset, setSeekOffset] = useState(0);
  const [duration, setDuration] = useState<number>(() => {
    if (movieDuration) {
      const minutes = parseInt(movieDuration);
      if (!isNaN(minutes) && minutes > 0) {
        return minutes * 60;
      }
    }
    return 0;
  });
  const [volume, setVolume] = useState(85);
  const [muted, setMuted] = useState(true); // Commencer muet pour garantir l'autoplay instantané
  const [fullscreen, setFullscreen] = useState(false);

  // Buffer and Safety Timeout States
  const [isBuffering, setIsBuffering] = useState(false);
  const [isTimeoutReached, setIsTimeoutReached] = useState(false);
  const [forceTranscode, setForceTranscode] = useState(false);
  const [isLowQuality, setIsLowQuality] = useState(false);
  const [estimatedBitrate, setEstimatedBitrate] = useState<number | null>(null);
  const [initialBufferingTime, setInitialBufferingTime] = useState<number | null>(null);
  const [isAutoDowngraded, setIsAutoDowngraded] = useState(false);
  const streamLoadStartRef = useRef<number | null>(null);
  const [playbackAttempts, setPlaybackAttempts] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [playTimeoutMessage, setPlayTimeoutMessage] = useState<string | null>(null);

  // Mobile player initialization & on-screen logs states
  const [isInitialized, setIsInitialized] = useState(true);
  const [playerLogs, setPlayerLogs] = useState<string[]>([]);
  const [adClicks, setAdClicks] = useState(0);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPlayerLogs(prev => [...prev, `[${timestamp}] ${msg}`].slice(-8));
    console.log(`[PLAYER LOG] ${msg}`);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastLoadedSourceRef = useRef<string | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const firstFrameLoggedRef = useRef<boolean>(false);
  
  const isIOS = useMemo(() => {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
           /CriOS/i.test(navigator.userAgent) || 
           /FxiOS/i.test(navigator.userAgent);
  }, []);
  const lastFetchedMovieIdRef = useRef<string | null>(null);
  const savedRestoreTimeRef = useRef<number>(0);
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

  // Set moviePlayClickTime on mount if accessed directly / not set
  useEffect(() => {
    if (!(window as any).moviePlayClickTime) {
      (window as any).moviePlayClickTime = performance.now();
      console.log("%c[CHRONO LECTEUR CINEMA] Aucun click initial détecté, initialisation du temps de référence au montage : 0.000s", "color: #eab308; font-style: italic;");
    }
    return () => {
      logMissingEvents("Rechargement du composant ou fermeture du lecteur");
    };
  }, []);

  // Reset first frame logged when movie changes
  useEffect(() => {
    firstFrameLoggedRef.current = false;
  }, [movieId]);

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

  // Convertit les secondes ou minutes en format hh:mm (ex: "2h 07m" ou "1h 45m" ou "45m")
  const getFormattedDuration = () => {
    let totalSecs = 0;

    // 1. Source de vérité Jellyfin metadata (après chargement de l'API de lecture)
    if (playbackInfo && playbackInfo.duration > 0) {
      totalSecs = playbackInfo.duration;
    }
    // 2. Initialisation immédiate via la prop movieDuration ("169 min")
    else if (movieDuration) {
      const minsDecimal = parseInt(movieDuration);
      if (!isNaN(minsDecimal) && minsDecimal > 0) {
        totalSecs = minsDecimal * 60;
      }
    }
    // 3. Fallback en cas d'absence complète : la durée vidéo réelle du lecteur du navigateur
    else if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
      totalSecs = videoRef.current.duration;
    }

    if (totalSecs > 0) {
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      if (h > 0) {
        return `${h}h ${m.toString().padStart(2, "0")}m`;
      }
      return `${m}m`;
    }

    return "chargement...";
  };

  // LOGIQUE DE VALIDATION ET SYNC DE LA DURÉE AUDIOVISUELLE (NAVIGATEUR & JELLYFIN METADATA)
  const validateAndSetDuration = (liveDur: number, jellyfinDurRaw: number) => {
    // Conversion RunTimeTicks si Jellyfin envoie des Ticks (ex: plus de 100 millions pour quelques secondes)
    let jellyfinDuration = jellyfinDurRaw || (playbackInfo?.duration || 0);
    let conversionType = "secondes";
    if (jellyfinDuration > 100000000) {
      jellyfinDuration = jellyfinDuration / 10000000;
      conversionType = "Ticks convertis en secondes (ticks / 10 000 000)";
    }

    const currentVideoEl = videoRef.current;
    const videoDuration = currentVideoEl ? currentVideoEl.duration : liveDur;
    const sourceUrl = currentVideoEl ? currentVideoEl.src : (playbackInfo?.streamUrl || "");

    // -----------------------------------------------------
    // TEMPORARY DIAGNOSTIC CONSOLE LOGS AS REQUESTED
    // -----------------------------------------------------
    console.log("JELLYFIN duration:", jellyfinDuration);
    console.log("VIDEO duration:", videoDuration);
    console.log("SOURCE URL:", sourceUrl);
    console.log("MEDIA INFO:", playbackInfo);
    // -----------------------------------------------------

    let finalSecs = 0;
    let source = "Aucune source";

    // Netflix / Disney+ rule: metadata is the source of truth
    if (jellyfinDuration > 0) {
      finalSecs = jellyfinDuration;
      source = "Jellyfin Metadata (Règle Netflix : Source de vérité prioritaire)";
    } 
    // Fallback if Jellyfin metadata is absent
    else if (videoDuration && !isNaN(videoDuration) && isFinite(videoDuration) && videoDuration > 0) {
      finalSecs = videoDuration;
      source = "Vidéo réelle (Fallback car Jellyfin duration absente)";
    }

    console.log(`[DURÉE DEBUG] Source finale décidée pour l'affichage : ${source} (${finalSecs}s)`);

    // Synchronize slider state scale
    if (finalSecs > 0) {
      setDuration(finalSecs);
    }
  };



  // Keep ref synchronized with cinemaCues to bypass closures in high frequency listeners
  useEffect(() => {
    cinemaCuesRef.current = cinemaCues;
  }, [cinemaCues]);

  // Parser de WebVTT robuste identique à VideoPlayer.tsx
  const parseVTT = (text: string): JfSubtitleCue[] => {
    const list: JfSubtitleCue[] = [];
    const cleanLines = text.split(/\r?\n/);
    
    const parseTime = (timeStr: string): number => {
      const cleanTimeStr = timeStr.trim().split(/\s+/)[0].replace(",", ".");
      const parts = cleanTimeStr.split(":");
      let h = 0, m = 0, s = 0;
      if (parts.length === 3) {
        h = parseFloat(parts[0]) || 0;
        m = parseFloat(parts[1]) || 0;
        s = parseFloat(parts[2]) || 0;
      } else if (parts.length === 2) {
        m = parseFloat(parts[0]) || 0;
        s = parseFloat(parts[1]) || 0;
      } else {
        s = parseFloat(parts[0]) || 0;
      }
      return h * 3600 + m * 60 + s;
    };

    let i = 0;
    while (i < cleanLines.length) {
      const line = cleanLines[i].trim();
      if (line.includes("-->")) {
        const times = line.split("-->");
        if (times.length === 2) {
          const start = parseTime(times[0]);
          const end = parseTime(times[1]);
          
          let textLines: string[] = [];
          i++;
          
          while (i < cleanLines.length) {
            const nextLine = cleanLines[i].trim();
            if (nextLine === "") {
              break;
            }
            if (nextLine.includes("-->")) {
              i--;
              break;
            }
            if (/^\d+$/.test(nextLine) && i + 1 < cleanLines.length && cleanLines[i + 1].trim().includes("-->")) {
              break;
            }
            textLines.push(nextLine);
            i++;
          }
          
          const textBuffer = textLines.join("\n");
          const textCleaned = textBuffer.replace(/<[^>]+>/g, "").trim();
          if (textCleaned) {
            list.push({ start, end, text: textCleaned });
          }
        }
      } else {
        i++;
      }
    }
    return list;
  };

  // Charger les sous-titres sélectionnés via fetch
  useEffect(() => {
    if (!subtitlesOn || activeSubtitleIndex === null || !playbackInfo) {
      setCinemaCues([]);
      setActiveCinemaCue(null);
      return;
    }

    const activeTrack = playbackInfo.subtitles?.find(s => s.index === activeSubtitleIndex);
    if (!activeTrack) {
      setCinemaCues([]);
      setActiveCinemaCue(null);
      return;
    }

    let isSubscribed = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchSubtitles = async () => {
      try {
        console.log(`[CONCURRENCY] Téléchargement asynchrone du sous-titre .vtt lancé en même temps que Hls.js depuis : ${activeTrack.url}`);
        const res = await fetch(activeTrack.url);
        if (res.ok) {
          const vttText = await res.text();
          if (isSubscribed) {
            const parsed = parseVTT(vttText);
            console.log(`[CINEMA SUBTITLE] Chargé avec succès : ${parsed.length} répliques.`);
            if (parsed.length > 0) {
              console.log("[CINEMA SUBTITLE DIACNOSTICS] Premières répliques pour contrôle de format et d'unité (secondes vs millisecondes) :");
              console.dir(parsed.slice(0, 3));
            }
            setCinemaCues(parsed);
          }
        } else if (res.status === 404 || res.status === 401) {
          console.warn(`[CINEMA SUBTITLE] Échec de téléchargement (${res.status}). Pas de retry pour ce code.`);
          if (isSubscribed) {
            setCinemaCues([]);
            setActiveCinemaCue(null);
            setSubtitlesOn(false);
            setActiveSubtitleIndex(null);
          }
        } else {
          throw new Error(`Code HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`[CINEMA SUBTITLE] Erreur de chargement (essai ${retryCount + 1}/${maxRetries}):`, err);
        if (isSubscribed && retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchSubtitles, 1500 * retryCount);
        } else if (isSubscribed) {
          console.warn(`[CINEMA SUBTITLE] Échec définitif du chargement des sous-titres:`, err);
          setCinemaCues([]);
          setActiveCinemaCue(null);
          setSubtitlesOn(false);
          setActiveSubtitleIndex(null);
        }
      }
    };

    fetchSubtitles();

    return () => {
      isSubscribed = false;
    };
  }, [activeSubtitleIndex, subtitlesOn, playbackInfo]);

  // Detector to click away closes subtitle menu nicely
  useEffect(() => {
    if (!showSubtitleMenu) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#cinema-subtitle-btn") && !target.closest("#cinema-subtitle-menu")) {
        setShowSubtitleMenu(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [showSubtitleMenu]);

  // Robust seek mechanism supporting native seeking for both Direct Play & HLS transcode (m3u8)
  const seekTo = (newTime: number) => {
    const video = videoRef.current;
    if (!video || !playbackInfo) return;

    // Boundary protection
    const targetTime = Math.max(0, Math.min(newTime, duration || 999999));

    console.log(`[SEEK LOGS] --- NATIVE SEEK TRIGGERED ---`);
    console.log(`[SEEK LOGS] Seeking to : ${targetTime}s (Total duration : ${duration}s)`);
    console.log(`[SEEK LOGS] mode isDirect : ${playbackInfo.isDirect}`);
    console.log(`[SEEK LOGS] currentTime before seek : ${video.currentTime}s`);

    // Native HTML5 seek remains identical for both Direct Play and HLS:
    // setting video.currentTime will trigger Hls.js segment-seeking behind the scenes!
    video.currentTime = targetTime;
    setSeekOffset(0);
    setProgress(targetTime);

    console.log(`[SEEK LOGS] currentTime immediately after seek assignment : ${video.currentTime}s`);

    // Ensure we trigger play if we were in playing state or if video was paused by seek side effects
    if (playing) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
            setIsAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn("[SEEK LOGS] Playback paused post-seeking :", err);
            setIsAutoplayBlocked(true);
            setPlaying(false);
          });
      } else {
        setPlaying(true);
      }
    }
  };

  // 1. FETCH PLAYBACK DETAILS FROM BACKEND API (Supports Ultra-Fast Prefetch cache)
  useEffect(() => {
    const lastOpts = lastFetchedParamsRef.current;
    if (
      playbackInfo &&
      lastOpts.movieId === movieId &&
      lastOpts.forceTranscode === forceTranscode &&
      lastOpts.playbackAttempts === playbackAttempts &&
      lastOpts.isLowQuality === isLowQuality
    ) {
      console.log("[CINEMA METADATA BLOCK] Playback metadata already loaded with same parameters. Preventing re-fetch.");
      return;
    }

    let active = true;
    const fetchPlayback = async () => {
      if (!movieId || movieId === "undefined") {
        setIsLoading(false);
        setIsStreamLoading(false);
        setVideoError("Aucun ID de film valide n'a été fourni au lecteur cinéma.");
        return;
      }
      setIsLoading(true);
      setIsStreamLoading(true);
      setIsActuallyPlaying(false);
      logChrono("Récupération des métadonnées (Début)");
      setVideoError(null);
      setIsTimeoutReached(false);
      try {
        const prefetches = (window as any).playbackPrefetches || {};
        
        // Nettoyage complet du click prefetch pour forcer un démarrage sur un état totalement neuf
        if (prefetches[movieId]) {
          console.log("[PLAYBACK CACHE] Nettoyage du click prefetch pour garantir un état 100% neuf.");
          delete prefetches[movieId];
        }
        
        let data: any;
        
        // Fallback if prefetch was null or failed (now always runs since we cleared it)
        if (!data) {
          console.log("[PLAYBACK FETCH] Fetching metadata synchronously for movie: " + movieId);
          const needsTranscodeParam = forceTranscode || playbackAttempts > 0 || isLowQuality;
          
          const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
          
          if (isNetlify) {
            const serverUrl = localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud";
            const currentApiKey = localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb";
            
            // Bypass google proxy entirely
            const streamUrl = `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}`;
            
            data = {
              id: movieId,
              streamUrl: streamUrl,
              duration: 0,
              container: "m3u8",
              title: movieTitle || "Film",
              isDirect: false,
              videoCodec: "h264",
              audioCodec: "aac",
              chosenPath: "Direct Bypass",
              subtitles: [],
              audios: []
            };
            
            try {
              // Try to get real duration if possible
              const itemRes = await fetch(`${serverUrl}/Users/me/Items/${movieId}?api_key=${currentApiKey}`);
              if (itemRes.ok) {
                const itemData = await itemRes.json();
                if (itemData && itemData.RunTimeTicks) {
                  data.duration = Math.round(itemData.RunTimeTicks / 10000000);
                }
              }
            } catch (e) {
              console.warn("Could not get exact duration from direct bypass:", e);
            }
          } else {
            let url = `/api/playback/${encodeURIComponent(movieId)}?`;
            const params = new URLSearchParams();
            if (needsTranscodeParam) params.set("forceTranscode", "true");
            if (isLowQuality) params.set("lowQuality", "true");
            url += params.toString();

            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`Erreur de lecture (Code ${res.status})`);
            }
            data = await res.json();
          }
        }

        if (active) {
          logChrono("Récupération des métadonnées terminée");
          if (data && data.streamUrl) {
            const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
            if (!isNetlify) {
              data = {
                ...data,
                streamUrl: formatHlsUrl(data.streamUrl, movieId, deviceId, apiKey)
              };
            }
            logChrono("Récupération de l'URL de stream : " + data.streamUrl);
          }
          setPlaybackInfo(data);
          setIsLoading(false);
          lastFetchedMovieIdRef.current = movieId;
          lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality };
          // Initialisation immédiate et stable avec la métadonnée Jellyfin
          if (data && data.duration && data.duration > 0) {
            setDuration(data.duration);
          }
          if (data && data.subtitles && data.subtitles.length > 0) {
            const defaultTrack = data.subtitles.find((t: any) => (t.isDefault || t.isForced) && isTextSubtitle(t.codec)) 
              || data.subtitles.find((t: any) => isTextSubtitle(t.codec));
            if (defaultTrack) {
              setActiveSubtitleIndex(defaultTrack.index);
              setSubtitlesOn(true);
              console.log(`[CINEMA SUBTITLE] Auto-selected default subtitle: Index ${defaultTrack.index} (${defaultTrack.label})`);
            } else {
              setActiveSubtitleIndex(null);
              setSubtitlesOn(false);
            }
          } else {
            setActiveSubtitleIndex(null);
            setSubtitlesOn(false);
          }
        }
      } catch (err: any) {
        console.warn(`Playback fetch attempt could not complete (attempt ${playbackAttempts + 1}):`, err);
        if (active) {
          if (playbackAttempts < 3) {
            const nextAttempt = playbackAttempts + 1;
            console.warn(`[CINEMA METADATA RETRY] Attempt ${playbackAttempts + 1} did not succeed. Retrying with attempt ${nextAttempt + 1} in ${1500 * nextAttempt}ms...`);
            setTimeout(() => {
              if (active) {
                setPlaybackAttempts(nextAttempt);
                if (nextAttempt === 1) {
                  setForceTranscode(true);
                } else if (nextAttempt === 2) {
                  setIsLowQuality(true);
                }
              }
            }, 1500 * nextAttempt);
          } else {
            console.warn("[CINEMA METADATA FALLBACK] All metadata fetching attempts did not succeed. Emitting safe fallback source.");
            const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
            const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
            const currentApiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : apiKey;
            
            const fallbackPath = `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
            const fallbackData = {
              id: movieId,
              streamUrl: isNetlify 
                ? `${serverUrl}${fallbackPath}&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}`
                : formatHlsUrl(`/api/jellyfin/proxy/videos/${movieId}/master.m3u8`, movieId, deviceId, apiKey),
              duration: 0,
              container: "m3u8",
              title: movieTitle || "Film",
              isDirect: false,
              chosenPath: fallbackPath,
              videoCodec: "h264",
              audioCodec: "aac",
              subtitles: [],
              audios: []
            };
            setPlaybackInfo(fallbackData as any);
            setIsLoading(false);
            lastFetchedParamsRef.current = { movieId, forceTranscode, playbackAttempts, isLowQuality };
            setVideoError(null);
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchPlayback();

    return () => {
      active = false;
    };
  }, [movieId, forceTranscode, playbackAttempts, isLowQuality]);

  // Real-time console diagnostics logger for Cinema
  useEffect(() => {
    if (playbackInfo && playbackInfo.streamUrl) {
      console.log(`%c[DIAGNOSTIC CINEMA CLIENT] DEBUT DES INFORMATIONS DE FLUX`, "color: #f59e0b; font-weight: bold; font-size: 12px;");
      console.log(`%cURL exacte du flux : %c${playbackInfo.streamUrl}`, "color: #9ca3af;", "color: #38bdf8; font-family: monospace;");
      console.log(`%cMode de lecture : %c${playbackInfo.isDirect ? "DirectPlay (Flux brut d'origine)" : "Transcoding (Conversion HLS)"}`, "color: #9ca3af;", "color: #10b981; font-weight: bold;");
      console.log(`%cCodec Vidéo Détecté : %c${playbackInfo.videoCodec || "Inconnu"}`, "color: #9ca3af;", "color: #a78bfa; font-family: monospace;");
      console.log(`%cCodec Audio Détecté : %c${playbackInfo.audioCodec || "Inconnu"}`, "color: #9ca3af;", "color: #a78bfa; font-family: monospace;");
      console.log(`%cConteneur : %c${playbackInfo.container || "Inconnu"}`, "color: #9ca3af;", "color: #f472b6; font-family: monospace;");
      console.log(`%c[DIAGNOSTIC CINEMA CLIENT] FIN DES INFORMATIONS DE FLUX`, "color: #f59e0b; font-weight: bold; font-size: 12px;");
    }
  }, [playbackInfo]);

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



  // Measure initial buffering time before playback starts
  useEffect(() => {
    if (playbackInfo?.streamUrl) {
      streamLoadStartRef.current = performance.now();
      setInitialBufferingTime(null);
    }
  }, [playbackInfo?.streamUrl]);

  useEffect(() => {
    if (isMetadataLoaded && streamLoadStartRef.current !== null) {
      const durationMs = performance.now() - streamLoadStartRef.current;
      setInitialBufferingTime(durationMs / 1000);
      streamLoadStartRef.current = null;
      console.log(`[CINEMA PLAYER] Initial buffering took ${(durationMs / 1000).toFixed(2)} seconds.`);
    }
  }, [isMetadataLoaded]);

  // 1b. Progressive load timeout system (3s, 8s, 12s) - Disabled to guarantee stream stability
  useEffect(() => {
    // Disabled to prevent progressive timeouts and automatic stream reloads
    return;
  }, []);

  // 1c. Buffer safety retry system (Check every 2 seconds if no buffer is loaded or playback stalls) - Disabled to guarantee stream stability
  useEffect(() => {
    // Disabled to prevent automatic buffering retries or reloads
    return;
  }, []);

  // 2. AUTOMATIC FULLSCREEN TRIGGER ON MOUNT REMOVED (Replaced by direct user gesture on play click)

  // Monitor document change for ESC key or native exit-fullscreen actions
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 3. AUTO-HIDE MOUSE CURSOR AND CONTROLS ON INACTIVITY
  const resetInactivityTimer = () => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (playing) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [playing]);

  // 4. INTERACTION RECOVERY CONTROLLER
  const handleUserPlayInteraction = () => {
    handlePlayPauseClick();
  };

  const handlePlayPauseClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      resetInactivityTimer();
    }
    
    const video = videoRef.current;
    if (!video) return;

    // Capture the current playing state
    const wasPlaying = playing;

    if (wasPlaying) {
      video.pause();
      setPlaying(false);
    } else {
      // 3. Mise à jour des états : Assure-toi que l'état isPlaying passe immédiatement à true et que l'overlay disparaisse complètement du DOM dès que le clic est détecté
      setPlaying(true);
      setIsAutoplayBlocked(false);
      setIsInitialized(true);

      const streamUrl = playbackInfo?.streamUrl;
      const isDirect = playbackInfo?.isDirect;

      // 1. Force l'attachement du média : Dans la fonction déclenchée par le bouton de lecture, assure-toi que hls.attachMedia(videoRef.current) soit explicitement exécuté AVANT de lancer hls.loadSource(streamUrl)
      if (!isDirect && streamUrl && Hls.isSupported()) {
        if (loadedUrlRef.current !== streamUrl) {
          console.log("[PLAYBACK HANDLER] Synchronous HLS initialization on user click gesture...");
          let hls = hlsRef.current;
          if (!hls) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 60,
              manifestLoadingTimeOut: 15000,
              manifestLoadingMaxRetry: 2,
              manifestLoadingRetryDelay: 1000,
              levelLoadingTimeOut: 15000,
              levelLoadingMaxRetry: 2,
              levelLoadingRetryDelay: 1000,
              fragLoadingTimeOut: 15000,
              fragLoadingMaxRetry: 2,
              fragLoadingRetryDelay: 1000,
            });
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsMetadataLoaded(true);
              const liveDur = video.duration;
              const jellyfinDur = playbackInfo?.duration || 0;
              validateAndSetDuration(liveDur, jellyfinDur);
              // Safe deferred play when manifest is parsed
              video.play().catch((err) => {
                console.warn("[PLAYBACK HANDLER] Deferred HLS play could not start, retrying with muted...");
                video.muted = true;
                setMuted(true);
                video.play().catch((err2) => {
                  console.warn("[PLAYBACK HANDLER] Deferred HLS muted play could not start either");
                });
              });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.details === "bufferSeekOverHole") {
                // Ignore completely in silence
                return;
              }
              if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
                hls.recoverMediaError();
                return;
              }
              if (data.fatal) {
                console.warn("[CINEMA RECOVERY] Severe HLS condition. Falling back to alternative stream.");
                const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
                const currentApiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : apiKey;
                const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
                const fallbackUrl = isNetlify ? `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}` : formatHlsUrl(`/api/jellyfin/proxy/videos/${movieId}/master.m3u8`, movieId, deviceId, apiKey);
                setPlaybackInfo({
                  id: movieId,
                  streamUrl: fallbackUrl,
                  duration: duration,
                  container: "m3u8",
                  title: playbackInfo?.title || "Film",
                  isDirect: false,
                  chosenPath: `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1`,
                  videoCodec: "h264",
                  audioCodec: "aac",
                  subtitles: [],
                  audios: []
                } as any);
                hls.destroy();
                hlsRef.current = null;
                setVideoError(null);
                setIsMetadataLoaded(false);
              }
            });
          }

          console.log("[PLAYBACK HANDLER] Attaching media and loading source...");
          hls.attachMedia(video);
          hls.loadSource(streamUrl);
          lastLoadedSourceRef.current = streamUrl;
          loadedUrlRef.current = streamUrl;
        } else {
          console.log("[PLAYBACK HANDLER] HLS is already loaded for this URL. Skipping loadSource to avoid aborting play.");
        }
      } else if (streamUrl) {
        if (loadedUrlRef.current !== streamUrl) {
          console.log("[PLAYBACK HANDLER] Loading direct play src...");
          video.src = streamUrl;
          video.load();
          lastLoadedSourceRef.current = streamUrl;
          loadedUrlRef.current = streamUrl;
        } else {
          console.log("[PLAYBACK HANDLER] Direct play src already loaded. Skipping video.load() to avoid aborting play.");
        }
      }

      // 4. Sécurise le .play() : Assure-toi que la promesse de lecture ne soit appelée qu'une fois que l'événement HLS MANIFEST_PARSED a été totalement validé par le lecteur.
      // 2. Déclenchement direct du Play : Une fois le média attaché, force la lecture avec une promesse propre seulement si les métadonnées sont chargées ou si c'est du Direct Play (qui gère sa propre synchro de chargement)
      if (isDirect || isMetadataLoaded) {
        console.log("[PLAYBACK HANDLER] Metadata is already loaded or DirectPlay. Triggering video.play() immediately...");
        video.play().catch((err) => {
          console.warn("[PLAYBACK HANDLER] Play attempt halted by browser. Retrying with muted fallback...");
          video.muted = true;
          setMuted(true);
          video.play().catch((err2) => {
            console.warn("[PLAYBACK HANDLER] Muted play attempt could not start:");
          });
        });
      } else {
        console.log("[PLAYBACK HANDLER] Metadata not loaded yet. Delaying video.play() until MANIFEST_PARSED / loadedmetadata fires.");
      }

      // Request fullscreen on explicit user gesture/click
      if (viewportRef.current) {
        if (viewportRef.current.requestFullscreen) {
          viewportRef.current.requestFullscreen()
            .then(() => setFullscreen(true))
            .catch((err) => console.warn("Fullscreen request could not complete:"));
        }
      }
    }
  };

  // 5. VIDEO SOURCE TRANSITION MANAGER WITH SEAMLESS HLS.JS INTEGRATION
  useEffect(() => {
    if (isLoading) return;
    const video = videoRef.current;
    if (!video || !playbackInfo?.streamUrl) return;

    // Prevent destructive stream reset if the URL is already loaded (State Stabilization)
    if (loadedUrlRef.current === playbackInfo.streamUrl) {
      console.log("[STREAM LOAD] Stream URL already loaded (loadedUrlRef match). Skipping destructive reset & loadSource.");
      return;
    }
    
    // 3. Mise à jour unique : Ne mets à jour loadedUrlRef.current = streamUrl que la toute première fois où le film est injecté.
    loadedUrlRef.current = playbackInfo.streamUrl;
    lastLoadedSourceRef.current = playbackInfo.streamUrl;

    // Reset video player stream state
    video.pause();
    if (hlsRef.current) {
      console.trace("[PLAYER STATE CHANGE]", {
        action: "hls.destroy() - stream load cleanup",
        streamUrl: playbackInfo.streamUrl,
        playbackState: playing ? "playing" : "paused",
        isLoading,
        isStreamLoading: isLoading,
        readyState: video?.readyState,
        networkState: video?.networkState
      });
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.removeAttribute("src");
    try {
      video.load();
    } catch (e) {
      console.warn("Video reset completed with adjustment");
    }

    setIsMetadataLoaded(false);
    setIsAutoplayBlocked(false);
    setPlaying(false);
    setIsActuallyPlaying(false);
    setSeekOffset(0);
    isInitialAutoplayRef.current = true;

    // Force secure properties in the HTML5 backend ref
    video.muted = true;
    video.autoplay = false;
    setMuted(true);

    const handleLoadedMetadata = () => {
      trackEventFired("loadedmetadata", "Événement loadedmetadata");
      setIsMetadataLoaded(true);
      const liveDur = video.duration;
      const jellyfinDur = playbackInfo?.duration || 0;
      validateAndSetDuration(liveDur, jellyfinDur);
      if (savedRestoreTimeRef.current > 0) {
        console.log(`[CINEMA RESTORE] Restoring position to: ${savedRestoreTimeRef.current}s`);
        video.currentTime = savedRestoreTimeRef.current;
        savedRestoreTimeRef.current = 0;
      }
      // Transition smoothly into play state
      setPlaying(true);
    };

    const handleCanPlay = () => {
      trackEventFired("canplay", "Événement canplay");
      const liveDur = video.duration;
      const jellyfinDur = playbackInfo?.duration || 0;
      validateAndSetDuration(liveDur, jellyfinDur);
      if (savedRestoreTimeRef.current > 0) {
        console.log(`[CINEMA RESTORE] Restoring position to: ${savedRestoreTimeRef.current}s`);
        video.currentTime = savedRestoreTimeRef.current;
        savedRestoreTimeRef.current = 0;
      }
      setPlaying(true);
      console.trace("[PLAYER STATE CHANGE]", {
        action: "setIsLoading(false) - handleCanPlay",
        streamUrl: playbackInfo.streamUrl,
        playbackState: playing ? "playing" : "paused",
        isLoading: false,
        isStreamLoading: false,
        readyState: video?.readyState,
        networkState: video?.networkState
      });
      setIsLoading(false);
      setIsStreamLoading(false);
    };

    const handleLoadedData = () => {
      trackEventFired("loadeddata", "Événement loadeddata");
      setPlaying(true);
      console.trace("[PLAYER STATE CHANGE]", {
        action: "setIsLoading(false) - handleLoadedData",
        streamUrl: playbackInfo.streamUrl,
        playbackState: playing ? "playing" : "paused",
        isLoading: false,
        isStreamLoading: false,
        readyState: video?.readyState,
        networkState: video?.networkState
      });
      setIsLoading(false);
      setIsStreamLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);

    const streamMode = playbackInfo.isDirect ? "DirectPlay" : "Transcoding / HLS";

    if (streamMode === "DirectPlay") {
      // 1. BRANCHING LOGIC CRITIQUE: Si mode === "DirectPlay", bypass HLS entirely
      console.log("[STREAM LOAD] Lecture directe (Direct Play) native lancée (HLS contourné complètement)");
      addLog("Stream attached (Direct Play)");
      logChrono("Attribution du src vidéo");
      console.log(`[URL DEBUG LOG] [CINEMA PLAYER DIRECT] Loading URL: "${playbackInfo.streamUrl}" | Contains id: ${playbackInfo.streamUrl.includes("id=")} | Contains path: ${playbackInfo.streamUrl.includes("path=")}`);
      if (video.src === playbackInfo.streamUrl) return;
      console.trace("[PLAYER STATE CHANGE]", {
        action: "video.src = playbackInfo.streamUrl - DirectPlay",
        streamUrl: playbackInfo.streamUrl,
        playbackState: playing ? "playing" : "paused",
        isLoading,
        isStreamLoading: isLoading,
        readyState: video?.readyState,
        networkState: video?.networkState
      });
      video.src = playbackInfo.streamUrl;
      video.load();

      // play() immédiat seulement si l'utilisateur a débloqué
      if (adClicks >= 2) {
        video.play().catch((err) => {
          console.warn("[STREAM LOAD] Playback immédiat DirectPlay reporté");
        });
      }
    } else {
      // Si mode === "Transcoding / HLS", initialiser Hls.js s'il est supporté
      console.log(`[CONCURRENCY] Initialisation asynchrone de Hls.js lancée en parallèle du téléchargement du sous-titre pour : ${playbackInfo.title}`);
      addLog("Stream attached (HLS)");
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          console.warn("[HLS CONTROLLER] Destroying previous HLS player instance to prevent double instantiation.");
          console.trace("[PLAYER STATE CHANGE]", {
            action: "hls.destroy() - pre-instantiation safety",
            streamUrl: playbackInfo.streamUrl,
            playbackState: playing ? "playing" : "paused",
            isLoading,
            isStreamLoading: isLoading,
            readyState: video?.readyState,
            networkState: video?.networkState
          });
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        console.trace("[PLAYER STATE CHANGE]", {
          action: "new Hls() - initializing cinema player instance",
          streamUrl: playbackInfo.streamUrl,
          playbackState: playing ? "playing" : "paused",
          isLoading,
          isStreamLoading: isLoading,
          readyState: video?.readyState,
          networkState: video?.networkState
        });
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingTimeOut: 15000,
          manifestLoadingMaxRetry: 2,
          manifestLoadingRetryDelay: 1000,
          levelLoadingTimeOut: 15000,
          levelLoadingMaxRetry: 2,
          levelLoadingRetryDelay: 1000,
          fragLoadingTimeOut: 15000,
          fragLoadingMaxRetry: 2,
          fragLoadingRetryDelay: 1000,
        });

        logChrono("Attribution du src vidéo");
        console.log(`[URL DEBUG LOG] [CINEMA PLAYER HLS] Loading URL: "${playbackInfo.streamUrl}" | Contains id: ${playbackInfo.streamUrl.includes("id=")} | Contains path: ${playbackInfo.streamUrl.includes("path=")}`);
        if (video.src === playbackInfo.streamUrl) return;
        console.trace("[PLAYER STATE CHANGE]", {
          action: "hls.loadSource() - loading cinema manifest",
          streamUrl: playbackInfo.streamUrl,
          playbackState: playing ? "playing" : "paused",
          isLoading,
          isStreamLoading: isLoading,
          readyState: video?.readyState,
          networkState: video?.networkState
        });
        hls.attachMedia(video);
        hls.loadSource(playbackInfo.streamUrl);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsMetadataLoaded(true);
          const liveDur = video.duration;
          const jellyfinDur = playbackInfo?.duration || 0;
          validateAndSetDuration(liveDur, jellyfinDur);
          // Auto-play the HLS stream
          setPlaying(true);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.details === "bufferSeekOverHole") {
            // Ignore completely in silence
            return;
          }
          if ((data.type as string) === "mediaError" || data.details === "bufferStalledError") {
            hls.recoverMediaError();
            return;
          }
          if (data.fatal) {
            // Instant fallback (0ms) to alternative safe stream
            console.warn("[CINEMA RECOVERY] Severe HLS condition encountered.");
            if (progress > 0) {
              savedRestoreTimeRef.current = progress;
            }
            const fallbackPath = `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
            const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
            const currentApiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : apiKey;
            const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
            const fallbackUrl = isNetlify ? `${serverUrl}${fallbackPath}&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}` : formatHlsUrl(`/api/jellyfin/proxy/videos/${movieId}/master.m3u8`, movieId, deviceId, apiKey);
            setPlaybackInfo({
              id: movieId,
              streamUrl: fallbackUrl,
              duration: duration,
              container: "m3u8",
              title: playbackInfo?.title || "Film",
              isDirect: false,
              chosenPath: fallbackPath,
              videoCodec: "h264",
              audioCodec: "aac",
              subtitles: [],
              audios: []
            } as any);
            hls.destroy();
            hlsRef.current = null;
            setVideoError(null);
            setIsMetadataLoaded(false);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native support (Safari iOS/macOS)
        console.log("[STREAM LOAD] Lecture native HLS activée (Safari)");
        logChrono("Attribution du src vidéo");
        video.src = playbackInfo.streamUrl;
        video.load();
      } else {
        // Fallback
        console.log("[STREAM LOAD] Fallback HLS non supporté au niveau du navigateur");
        logChrono("Attribution du src vidéo");
        video.src = playbackInfo.streamUrl;
        video.load();
      }
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackInfo?.streamUrl, isInitialized, isLoading]);

  // 4. SYNC PLAY ACTIONS WITH HTML5 VIDEO ELEMENT (For subsequent user play/pause button actions)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (adClicks < 2) {
      video.pause();
      if (playing) setPlaying(false);
      return;
    }

    if (playing) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAutoplayBlocked(false);
            console.log("[AUTOPLAY/PLAY] Playback execution successful.");
            console.log(`[SEEK LOGS] currentTime après play resolved : ${video.currentTime}s`);

            // Handle unmuting after initial load if permitted by user/browser environment
            if (isInitialAutoplayRef.current) {
              isInitialAutoplayRef.current = false;
              setTimeout(() => {
                if (videoRef.current) {
                  try {
                    videoRef.current.muted = false;
                    setMuted(false);
                    console.log("[AUTOPLAY] Unmuted successfully post-safety delay");
                  } catch (unmuteErr) {
                    console.warn("[AUTOPLAY] Unmute bypass prevented (browser restriction)");
                  }
                }
              }, 1500);
            }
          })
          .catch((err) => {
            console.warn("Play request delayed by browser security policy. Triggering automatic muted fallback...");
            video.muted = true;
            setMuted(true);
            video.play()
              .then(() => {
                setIsAutoplayBlocked(false);
                setPlaying(true);
                console.log("[AUTOPLAY] Play with automatic muted fallback successful.");
              })
              .catch((err2) => {
                console.warn("[AUTOPLAY] Muted fallback could not start");
                setIsAutoplayBlocked(false); // Do not block UI with an overlay
                setPlaying(false);
              });
          });
      } else {
        setIsAutoplayBlocked(false);
        if (isInitialAutoplayRef.current) {
          isInitialAutoplayRef.current = false;
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              setMuted(false);
            }
          }, 1500);
        }
      }
    } else {
      // Avoid calling pause() if initial loading of metadata has just completed and we're about to auto-play,
      // or if it's already paused.
      if (!video.paused) {
        video.pause();
      }
    }
  }, [playing, isMetadataLoaded]);

  // 5. UPDATE VOLUME ACTIONS
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Format second timestamps to MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Scrubber percent progress
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Toggle Fullscreen explicitly
  const toggleFullscreen = () => {
    if (!viewportRef.current || !videoRef.current) return;
    
    const vid = videoRef.current as any;
    const isIPhone = /iPhone|iPod/i.test(navigator.userAgent);
    
    // 1. Force Apple's native player on iPhone/iPod ONLY
    if (isIPhone && vid.webkitEnterFullscreen) {
      try {
        vid.webkitEnterFullscreen();
      } catch (e) {
        console.warn("Erreur webkitEnterFullscreen:", e);
      }
      return;
    }
    
    // 2. For all other devices (iPad, Mac, PC, Android), use standard fullscreen on the wrapper
    const doc = document as any;
    const viewport = viewportRef.current as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (viewport.requestFullscreen) {
        viewport.requestFullscreen().then(() => setFullscreen(true)).catch((e: any) => console.warn(e));
      } else if (viewport.webkitRequestFullscreen) {
        viewport.webkitRequestFullscreen().then(() => setFullscreen(true)).catch((e: any) => console.warn(e));
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().then(() => setFullscreen(false)).catch((e: any) => console.warn(e));
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen().then(() => setFullscreen(false)).catch((e: any) => console.warn(e));
      }
    }
  };

  return (
    <div 
      ref={viewportRef}
      onMouseMove={resetInactivityTimer}
      onClick={resetInactivityTimer}
      className={`fixed inset-0 z-50 bg-black flex flex-col justify-between select-none overflow-hidden ${
        controlsVisible ? "cursor-default" : "cursor-none"
      }`}
    >
      
      {/* 1. STANDALONE CINEMA UPPER DECK (GO BACK & TITLE INFO) */}
      <div className={`relative p-6 bg-gradient-to-b from-black/95 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-50 ${
        controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${adClicks < 2 ? "hidden" : ""}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onClose();
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white border border-white/5 hover:border-white/15 transition-all cursor-pointer flex items-center justify-center"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg md:text-xl font-serif text-white/90 tracking-wide font-light">
            {movieTitle}
          </h2>
        </div>

        {/* Top Right completely empty and clean */}
        <div />
      </div>

      {/* 2. CORE MOVIE VIEWPORT RENDER CONTAINER */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-950">
        
        {/* Unified High-End Loader Overlay */}
        {(isLoading || isStreamLoading || isBuffering) && !videoError && adClicks >= 2 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
          </div>
        )}

        {videoError && (
          <div className="max-w-md p-6 bg-stone-950/95 border border-rose-500/20 rounded-2xl text-center space-y-4 z-40 mx-4 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">Cinema Playback Error</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">{videoError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 text-xs font-mono py-2 px-4 rounded-lg transition-all"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Dynamic Video element (Unconditionally mounted to prevent remounting) */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ display: !videoError ? "flex" : "none" }}
        >
          <video
            ref={videoRef}
            playsInline
            controls={false}
            autoPlay={adClicks >= 2}
            muted={muted}
            preload="auto"
            crossOrigin="anonymous"
            className="w-full h-full object-contain max-h-screen"
            onPlay={() => {
              trackEventFired("play", "Événement play");
            }}
            onTimeUpdate={(e) => {
              if (!videoRef.current) return;
              const currentVideoTime = e.currentTarget.currentTime;
              if (!firstFrameLoggedRef.current && currentVideoTime > 0) {
                firstFrameLoggedRef.current = true;
                setIsActuallyPlaying(true);
                trackEventFired("firstFrame", "Première frame affichée");
              }
              const absoluteTime = seekOffset + currentVideoTime;
              setProgress(absoluteTime);

              // Synchronisation et recherche de la réplique correspondante
              if (!cinemaCuesRef || !cinemaCuesRef.current) {
                setActiveCinemaCue(null);
                return;
              }
              const cuesLimit = cinemaCuesRef.current.length;
              if (subtitlesOn && activeSubtitleIndex !== null && cuesLimit > 0) {
                // Tolérance de +/- 0.3s pour parer aux décalages de synchro
                const foundCue = cinemaCuesRef.current.find(
                  cue => cue && absoluteTime >= (cue.start - 0.3) && absoluteTime <= (cue.end + 0.3)
                );
                
                setActiveCinemaCue(foundCue ? foundCue.text : null);
              } else {
                setActiveCinemaCue(null);
              }
            }}
            onEnded={() => {
              setPlaying(false);
              setProgress(0);
              setSeekOffset(0);
            }}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              console.log(`[SEEK LOGS] currentTime après loadedmetadata : ${video.currentTime}s`);
              validateAndSetDuration(video.duration, playbackInfo?.duration || 0);
            }}
            onCanPlay={(e) => {
              const video = e.currentTarget;
              console.log(`[SEEK LOGS] currentTime après canplay : ${video.currentTime}s`);
              validateAndSetDuration(video.duration, playbackInfo?.duration || 0);
              setIsBuffering(false);
            }}
            onWaiting={() => {
              setIsBuffering(true);
              addLog("Buffering started");
            }}
            onPlaying={(e) => {
              setIsBuffering(false);
              setIsActuallyPlaying(true);
              addLog("Playback started");
              const video = e.currentTarget;
              if (video && video.muted) {
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    setMuted(false);
                    addLog("Unmuted after stream started");
                  }
                }, 800);
              }
            }}
            onSeeked={(e) => {
              const video = e.currentTarget;
              console.log(`[SEEK LOGS] currentTime après seeked event : ${video.currentTime}s`);
              console.log(`[SEEK EVENT] seeked - Valeur réelle finale dans le player : ${seekOffset + video.currentTime}s (currentTime locale : ${video.currentTime}s)`);
              setIsBuffering(false);
            }}
            onSeeking={(e) => {
              const video = e.currentTarget;
              console.log(`[SEEK LOGS] currentTime après seeking event : ${video.currentTime}s`);
              console.log(`[SEEK EVENT] seeking - Valeur cible demandée : ${progress}s (currentTime actuelle : ${video.currentTime}s)`);
              setIsBuffering(true);
            }}
            onError={(e) => {
              const video = e.currentTarget;
              const err = video.error;
              console.warn("HTML5 video warning event:");
              
              if (err && err.code === 1) {
                console.log("[CINEMA] Stream aborted. Skipping.");
                return;
              }
              
              // Suppression des boucles de secours : Bascule instantanée (0ms) vers le flux direct de secours
              console.warn("[CINEMA RECOVERY] HTML5 video transition occurred. Adjusting streaming sources.");
              if (progress > 0) {
                savedRestoreTimeRef.current = progress;
              }
              const fallbackPath = `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&VideoBitrate=140000000&MaxVideoBitrate=140000000`;
              const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
              const currentApiKey = isNetlify ? (localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb") : apiKey;
              const serverUrl = isNetlify ? (localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud") : "";
              const fallbackUrl = isNetlify ? `${serverUrl}${fallbackPath}&api_key=${currentApiKey}&DeviceId=${deviceId}&MediaSourceId=${movieId}` : formatHlsUrl(`/api/jellyfin/proxy/videos/${movieId}/master.m3u8`, movieId, deviceId, apiKey);
              setPlaybackInfo({
                id: movieId,
                streamUrl: fallbackUrl,
                duration: duration,
                container: "m3u8",
                title: playbackInfo?.title || "Film",
                isDirect: false,
                chosenPath: fallbackPath,
                videoCodec: "h264",
                audioCodec: "aac",
                subtitles: [],
                audios: []
              } as any);
              setVideoError(null);
              setIsMetadataLoaded(false);
            }}
          >
          </video>

          {/* Custom React Subtitle Overlay */}
          {subtitlesOn && activeCinemaCue && (
            <div 
              className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-40 text-center pointer-events-none w-[80%] max-w-2xl select-none"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
            >
              <span className="inline-block bg-black/85 text-stone-100 px-4 py-2 rounded-lg text-sm sm:text-base md:text-lg lg:text-xl font-sans font-medium tracking-wide leading-relaxed shadow-2xl border border-white/5 whitespace-pre-line text-center">
                {activeCinemaCue}
              </span>
            </div>
          )}
        </div>

      {/* 3. CENTER SCREEN TAP GRABBER (PLAY/PAUSE ON BIG SCREEN TAP) */}
      <div 
        onClick={() => {
          handlePlayPauseClick();
        }}
        className={`absolute inset-0 z-20 cursor-pointer ${adClicks < 2 ? "hidden" : ""}`}
        style={{ pointerEvents: isLoading || videoError ? "none" : "auto" }}
      />

      {/* AD WALL OVERLAY */}
      <AnimatePresence>
        {adClicks < 2 && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('button') && !target.closest('a')) {
                e.stopPropagation();
              }
            }}
          >
            <div className="max-w-2xl w-[90%] md:w-full flex flex-col gap-3">
              {/* Top Status Bars */}
              <div className="flex justify-between gap-3 px-1">
                <div className="h-1.5 flex-1 bg-[#D4AF37] rounded-full transition-all duration-300" />
                <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${adClicks >= 1 ? 'bg-[#D4AF37]' : 'bg-[#333333]'}`} />
              </div>

              <div className="flex flex-col items-center gap-6 w-full px-6 py-10 md:px-10 bg-[#1e1e1e] rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#D4AF37]/30 relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-2 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  <Lock className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Ads completed: {adClicks} / 2</h3>
                  <p className="text-[15px] md:text-base text-zinc-300 leading-relaxed max-w-xl mx-auto">
                    To keep Classico 100% free and premium, please support us by temporarily disabling your AdBlocker and interacting with our sponsored links. Thank you for your amazing support! While you unlock the access, your movie is already safely loading in the background.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    window.open('https://s.magsrv.com/v1/vast.php?idz=5964150', '_blank');
                    if (adClicks === 0) {
                      setAdClicks(1);
                    } else if (adClicks === 1) {
                      setAdClicks(2);
                      setPlaying(true); // Auto start playback
                    }
                  }}
                  className="w-full max-w-sm relative overflow-hidden group bg-gradient-to-b from-[#E5C158] to-[#C39B22] text-black font-semibold py-4 px-6 rounded-xl hover:from-[#F6D269] hover:to-[#D4AF37] active:scale-[0.98] transition-all block text-center mt-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-lg">
                      Watch Ad & Unlock
                    </span>
                  </div>
                </button>
                <div className="mt-2 text-center max-w-md mx-auto">
                  <p className="text-[11px] md:text-xs text-zinc-500 font-mono tracking-wide leading-relaxed">
                    We strictly guarantee absolutely NO interruptions, unexpected cuts, or pop-up redirections during your movie playback.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ON-SCREEN MUTED INDICATOR & PAUSE COVER OVERLAY REMOVED */}

      </div>

      {/* 4. CINEMA LOWER CONTROL STATION */}
      <div className={`relative p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent border-t border-white/5 flex flex-col gap-4 transition-opacity duration-300 z-40 ${
        controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${adClicks < 2 ? "hidden" : ""}`}>
        
        {/* PROGRESS SCRUB TIMELINE BAR */}
        {!isLoading && !videoError && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-zinc-400 select-none w-10 text-left">
              {formatTime(progress)}
            </span>

            <div 
              id="cinema-timeline"
              className="flex-grow h-1.5 bg-zinc-800 rounded-full cursor-pointer relative group"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const newTime = duration * percentage;
                seekTo(newTime);
              }}
            >
              {/* Loaded visual progress fill */}
              <div 
                className="absolute inset-y-0 left-0 bg-amber-500 rounded-full group-hover:bg-amber-400"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Handled Scrubber point */}
              <div 
                className="absolute w-3.5 h-3.5 bg-white border border-amber-500 rounded-full -top-1 shadow group-hover:scale-125 transition-all duration-150"
                style={{ left: `calc(${progressPercent}% - 7px)` }}
              />
            </div>

            <span className="text-[10px] font-mono text-zinc-400 select-none min-w-[70px] text-right whitespace-nowrap">
              {getFormattedDuration()}
            </span>
          </div>
        )}

        {/* CORE AUDIO/PLAY/MUTING ACTION DECK BUTTONS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-5">
            {/* Play/Pause control */}
            <button
              onClick={handlePlayPauseClick}
              className="text-white/80 hover:text-white p-1.5 active:scale-90 transition-all duration-150 cursor-pointer"
              title={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
            </button>

            {/* Reculer de 15s */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  seekTo(videoRef.current.currentTime - 15);
                }
              }}
              className="text-white/60 hover:text-white p-1.5 active:scale-90 transition-all duration-150 cursor-pointer flex items-center justify-center"
              title="Reculer de 15s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Avancer de 15s */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  seekTo(videoRef.current.currentTime + 15);
                }
              }}
              className="text-white/60 hover:text-white p-1.5 active:scale-90 transition-all duration-150 cursor-pointer flex items-center justify-center"
              title="Avancer de 15s"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume control deck */}
            <div className="flex items-center border-l border-white/10 pl-2 sm:pl-4 group/volume relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted(prev => !prev);
                }}
                className="text-white/60 hover:text-white transition-colors p-1.5 active:scale-95 cursor-pointer flex items-center justify-center"
                title={muted || volume === 0 ? "Activer le son" : "Couper le son"}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-500" />
                ) : (
                  <Volume2 className="w-5 h-5 text-amber-500" />
                )}
              </button>

              <div className="w-0 overflow-hidden group-hover/volume:w-24 group-focus-within/volume:w-24 transition-all duration-300 ease-out flex items-center pl-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    setMuted(v === 0);
                  }}
                  className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Subtitles Button next to Volume */}
            {playbackInfo?.subtitles && playbackInfo.subtitles.length > 0 && (
              <div className="relative border-l border-white/10 pl-2 sm:pl-4">
                <button
                  id="cinema-subtitle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubtitleMenu(prev => !prev);
                  }}
                  className={`p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                    subtitlesOn && activeSubtitleIndex !== null ? "text-amber-400" : ""
                  }`}
                  title="Subtitles"
                >
                  <Captions className="w-5 h-5" />
                </button>

                {/* Subtitle dropdown/popover */}
                {showSubtitleMenu && (
                  <div id="cinema-subtitle-menu" className="absolute bottom-full left-0 mb-3 w-56 bg-zinc-950/95 border border-white/10 rounded-xl shadow-2xl p-2 z-50 overflow-hidden text-[11px] text-zinc-200">
                    <div className="px-2 py-1.5 border-b border-white/5 flex items-center justify-between gap-1">
                      <span className="font-bold uppercase tracking-wider text-amber-500 text-[9px] truncate">Subtitles</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSubtitleMenu(false);
                        }}
                        className="text-zinc-500 hover:text-white text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto py-1 space-y-0.5 mt-1 select-none">
                      {/* Disable subtitles option */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSubtitleIndex(null);
                          setSubtitlesOn(false);
                          setShowSubtitleMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          activeSubtitleIndex === null || !subtitlesOn
                            ? "bg-amber-500/10 text-amber-400 font-bold"
                            : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span>Disable subtitles</span>
                        {(activeSubtitleIndex === null || !subtitlesOn) && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </button>

                      {/* Jellyfin subtitle tracks */}
                      {playbackInfo.subtitles.map((track) => {
                        const isCurrentActive = subtitlesOn && activeSubtitleIndex === track.index;
                        return (
                          <button
                            key={track.index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSubtitleIndex(track.index);
                              setSubtitlesOn(true);
                              setShowSubtitleMenu(false);
                              console.log(`[CINEMA SUBTITLE SELECTED] Activated track ${track.index} (${track.label})`);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                              isCurrentActive
                                ? "bg-amber-500/10 text-amber-400 font-bold"
                                : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            <span className="truncate pr-2">{track.label}</span>
                            {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: DIAGNOSTICS & FULLSCREEN */}
          <div className="flex items-center gap-3">
            {/* Playback Info Button (Visible only in admin mode) */}
            {localStorage.getItem("isAdmin") === "true" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDiagnostics(prev => !prev);
                }}
                className={`p-1.5 rounded-full border transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  showDiagnostics 
                    ? "border-amber-500 text-amber-400 bg-amber-500/10" 
                    : "border-white/5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                }`}
                title="Real-time playback info (Admin Mode)"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-1.5 text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Plein écran"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Floating diagnostic overlay (Admin Mode) */}
      {showDiagnostics && (
        <div className="absolute top-20 right-6 z-50 w-full max-w-md bg-stone-950/96 border border-amber-500/30 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-zinc-300 shadow-2xl space-y-3.5 backdrop-blur-md max-h-[72vh] overflow-y-auto pointer-events-auto text-left">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-sans font-black text-xs text-white tracking-widest uppercase">CINEMA PLAYBACK CONTROLLER</span>
            </div>
            <button 
              onClick={() => setShowDiagnostics(false)}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs"
            >
              [Masquer]
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">1. PLAYBACK INFORMATION :</div>
            <div className="bg-black/55 p-2 rounded-lg border border-zinc-900 space-y-1">
              <p><span className="text-zinc-500">Titre :</span> <span className="text-zinc-100 font-bold">{movieTitle}</span></p>
              <p><span className="text-zinc-500">ID Film :</span> <span className="text-zinc-400 break-all">{movieId}</span></p>
              <p><span className="text-zinc-500">Playback Method :</span> <span className="text-emerald-400 font-bold">{playbackInfo?.isDirect ? "Direct Play (Raw File)" : "Transcoding (HLS Stream)"}</span></p>
              <p><span className="text-zinc-500">Conteneur :</span> <span className="text-zinc-300 font-mono font-bold uppercase">{playbackInfo?.container || "Inconnu"}</span></p>
              <p><span className="text-zinc-500">Codec Vidéo :</span> <span className="text-amber-400 font-mono font-bold">{playbackInfo?.videoCodec || "Inconnu"}</span></p>
              <p><span className="text-zinc-500">Codec Audio :</span> <span className="text-amber-400 font-mono font-bold">{playbackInfo?.audioCodec || "Inconnu"}</span></p>
              <p><span className="text-zinc-500">Transcoding State :</span> <span className="text-teal-400 font-bold">{playbackInfo?.isDirect ? "Inactive (Direct Play)" : "Active (Jellyfin Transcoder)"}</span></p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">2. FLUX ET PROTOCOLE :</div>
            <div className="bg-black/55 p-2 rounded-lg border border-zinc-900 space-y-1">
              <p><span className="text-zinc-500">URL du flux :</span> <span className="text-zinc-400 break-all select-all text-[9.5px] block bg-black/40 p-1.5 rounded mt-0.5 border border-zinc-800/50">{playbackInfo?.streamUrl || "Non résolue"}</span></p>
              <p><span className="text-zinc-500">Chemin Jellyfin :</span> <span className="text-zinc-400 break-all text-[9.5px] block bg-black/40 p-1.5 rounded mt-0.5 border border-zinc-800/50">{playbackInfo?.chosenPath || "Indéterminé"}</span></p>
              <p><span className="text-zinc-500">currentTime réel :</span> <span className="text-emerald-400 font-bold font-mono">{(videoRef.current?.currentTime || 0).toFixed(2)} s</span></p>
              <p><span className="text-zinc-500">video.readyState :</span> <span className="text-zinc-300 font-mono">{videoRef.current?.readyState ?? "-"}</span></p>
              <p><span className="text-zinc-500">Last Error :</span> <span className={videoError ? "text-rose-400 font-bold" : "text-zinc-500"}>{videoError || "None (OK)"}</span></p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">3. EVENT LOGS (VISIBLE) :</div>
            <div className="bg-black/55 p-2 rounded-lg border border-zinc-900 space-y-1 max-h-[150px] overflow-y-auto scrollbar-thin">
              {playerLogs.length === 0 ? (
                <p className="text-zinc-600 italic">Waiting for events...</p>
              ) : (
                playerLogs.map((log, i) => (
                  <p key={i} className="text-[10px] text-amber-100 font-mono leading-tight">{log}</p>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
