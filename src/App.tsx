import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Play, Film, Info, Heart, Award, 
  ChevronLeft, ChevronRight, ChevronDown, User, Tv, Clock, 
  Sparkles, History, Compass, FilmIcon, BookmarkCheck,
  Star, CheckCircle, AlertCircle, RefreshCw, X, Shield, Menu
} from "lucide-react";
import { COLLECTIONS as RAW_COLLECTIONS, Movie, Collection } from "./data";

const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS].sort((a, b) => 
  a.title.localeCompare(b.title)
);
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import MovieDetailView from "./components/MovieDetailView";
import CinemaPlayerView from "./components/CinemaPlayerView";
import ErrorBoundary from "./components/ErrorBoundary";
import LazyVirtualCard from "./components/LazyVirtualCard";
import HeroSkeleton from "./components/HeroSkeleton";

// Import custom generated cinema assets safely
const CLASSICO_HERO_BACKDROP = "/src/assets/images/classico_hero_backdrop_1781395618793.jpg";
const CLASSICO_ABSTRACT_BANNER = "/src/assets/images/classico_abstract_banner_1781395631739.jpg";

// Hand-crafted high-fidelity collection backgrounds custom-generated
const COLLECTION_BANNERS: Record<string, string> = {
  "john-wick": "/src/assets/images/john_wick_banner_1781396452240.jpg",
  "indiana-jones": "/src/assets/images/indiana_jones_banner_1781396466470.jpg",
  "christopher-nolan": "/src/assets/images/nolan_banner_1781396487471.jpg",
  "tarantino-collection": "/src/assets/images/tarantino_banner_1781396514352.jpg",
  "star-wars": "/src/assets/images/star_wars_banner_fixed_1781396525726.jpg",
  "james-bond": "/src/assets/images/bond_banner_1781396536406.jpg",
  "rocky": "/src/assets/images/rocky_banner_1781396548528.jpg",
  "terminator": "/src/assets/images/terminator_banner_1781396559445.jpg",
  "fast-and-furious": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop"
};

// -------------------------------------------------------------
// INTELLIGENT MATCHING UTILITIES BETWEEN JELLYFIN & HAND-CRAFTED COLLECTIONS
// -------------------------------------------------------------
function cleanTitle(title: string): string {
  if (!title) return "";
  let t = title.toLowerCase();
  // Remove parenthesized or bracketed years e.g. (2014), [2017]
  t = t.replace(/\(\d{4}\)/g, " ");
  t = t.replace(/\[\d{4}\]/g, " ");
  // Remove freestanding 4-digit years at the end of title, e.g. "John Wick 2014"
  t = t.replace(/\b(19|20)\d{2}\b/g, " ");
  
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace punctuation with space
    .replace(/\s+/g, " ")           // collapse spaces
    .trim();
}

// -------------------------------------------------------------
// HIGH-PRECISION SAGA & FRANCHISE DOMAIN CLASSIFIER
// -------------------------------------------------------------
interface ClassificationResult {
  sagaId?: string;
  franchiseId?: string;
  confidence: "high" | "low" | "none";
}

function classifyMovie(
  title: string, 
  originalTitle?: string, 
  director?: string, 
  genre?: string[],
  studios?: string[]
): ClassificationResult {
  const t = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const ot = originalTitle ? originalTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  
  // Safe bounds Check - To completely avoid "Casino" Scorsese (1995) matching Casino Royale James Bond
  const isCasinoOnly = (t === "casino" || ot === "casino") && !t.includes("royale") && !ot.includes("royale");
  if (isCasinoOnly) {
    return { confidence: "none" };
  }

  // 1. STAR WARS
  const swKeywords = [
    "star wars", "guerre des etoiles", "la menace fantome", "phantom menace", "clones", "revanche des sith",
    "revenge of the sith", "un nouvel espoir", "new hope", "empire contre attaque", "empire strikes back",
    "retour du jedi", "return of the jedi", "reveil de la force", "force awakens", "derniers jedi", "last jedi",
    "ascension de skywalker", "rise of skywalker", "rogue one", "solo a star wars"
  ];
  if (swKeywords.some(kw => t.includes(kw) || ot.includes(kw)) || studios?.some(s => /lucasfilm/i.test(s))) {
    return { sagaId: "star-wars", confidence: "high" };
  }

  // 2. JAMES BOND
  const bondKeywords = [
    "007", "james bond", "dr no", "dr. no", "bons baisers de russie", "from russia with love",
    "goldfinger", "operation tonnerre", "thunderball", "on ne vit que deux fois", "you only live twice",
    "au service secret de sa majeste", "on her majesty's secret service",
    "les diamants sont eternels", "diamonds are forever", "vivre et laisser mourir", "live and let die",
    "l homme au pistolet d or", "the man with the golden gun", "l espion qui m aimait", "the spy who loved me",
    "moonraker", "rien que pour vos yeux", "for your eyes only", "octopussy",
    "dangereusement votre", "a view to a kill", "tuer n est pas jouer", "the living daylights",
    "permis de tuer", "licence to kill", "goldeneye", "demain ne meurt jamais", "tomorrow never dies",
    "le monde ne suffit pas", "the world is not enough", "meurs un autre jour", "die another day",
    "casino royale", "quantum of solace", "skyfall", "spectre", "mourir peut attendre", "no time to die"
  ];
  if (bondKeywords.some(kw => t.includes(kw) || ot.includes(kw))) {
    return { sagaId: "james-bond", confidence: "high" };
  }

  // 3. JOHN WICK
  if (/\bjohn wick\b/i.test(title) || /\bjohn wick\b/i.test(originalTitle || "")) {
    return { sagaId: "john-wick", confidence: "high" };
  }

  // 4. INDIANA JONES
  const indianaKeywords = [
    "indiana jones", "les aventuriers de l arche perdue", "raiders of the lost ark", "temple maudit",
    "temple of doom", "derniere croisade", "last crusade", "royaume du crane de cristal", "crystal skull",
    "cadran de la destinee", "dial of destiny"
  ];
  if (indianaKeywords.some(kw => t.includes(kw) || ot.includes(kw))) {
    return { sagaId: "indiana-jones", confidence: "high" };
  }

  // 5. ROCKY
  const isRockyKeyword = /\brocky\b/i.test(title) || /\brocky\b/i.test(originalTitle || "");
  const isCreed = /\bcreed\b/i.test(title) || /\bcreed\b/i.test(originalTitle || "");
  const notRockyHorror = !t.includes("horror") && !t.includes("picture show");
  if ((isRockyKeyword && notRockyHorror) || isCreed) {
    return { sagaId: "rocky", confidence: "high" };
  }

  // 6. TERMINATOR
  const isTerminator = /\bterminator\b/i.test(title) || /\bterminator\b/i.test(originalTitle || "");
  if (isTerminator) {
    return { sagaId: "terminator", confidence: "high" };
  }

  // 7. MATRIX
  const isMatrix = /\bmatrix\b/i.test(title) || /\bmatrix\b/i.test(originalTitle || "");
  if (isMatrix) {
    return { franchiseId: "matrix", confidence: "high" };
  }

  // 8. LORD OF THE RINGS / HOBBIT
  const lotrKeywords = [
    "lord of the rings", "seigneur des anneaux", "la communaute de l anneau", "fellowship of the ring",
    "les deux tours", "the two towers", "le retour du roi", "return of the king", "le hobbit", "the hobbit",
    "un voyage inattendu", "unexpected journey", "la desolation de smaug", "desolation of smaug",
    "la bataille des cinq armees", "battle of the five armies"
  ];
  if (lotrKeywords.some(kw => t.includes(kw) || ot.includes(kw))) {
    return { franchiseId: "lord-of-the-rings", confidence: "high" };
  }

  // 9. HARRY POTTER
  const isHP = /\bharry potter\b/i.test(title) || /\bharry potter\b/i.test(originalTitle || "");
  if (isHP) {
    return { franchiseId: "harry-potter", confidence: "high" };
  }

  // 10. GODFATHER
  const isGodfather = /\bgodfather\b/i.test(title) || /\bparrain\b/i.test(title) || ot.includes("godfather");
  if (isGodfather) {
    return { franchiseId: "godfather", confidence: "high" };
  }

  // 11. MISSION IMPOSSIBLE
  const isMI = /mission\s*:?\s*impossible|protocole\s*fantome|rogue\s*nation|fallout|dead\s*reckoning/i.test(t) || /mission\s*:?\s*impossible/i.test(ot);
  if (isMI) {
    return { franchiseId: "mission-impossible", confidence: "high" };
  }

  // 12. SPIDER-MAN
  const isSpiderMan = /spider-?man/i.test(t) || /spider-?man/i.test(ot);
  if (isSpiderMan) {
    return { franchiseId: "spider-man", confidence: "high" };
  }

  // 13. ALIEN
  const isAlienExact = t === "alien" || t === "aliens" || t.includes("alien le huitieme passager") || t.includes("alien resurrection") || t.includes("alien covenant") || t.includes("prometheus") || ot === "alien" || ot === "aliens" || ot.includes("covenant") || ot.includes("prometheus");
  if (isAlienExact) {
    return { franchiseId: "alien", confidence: "high" };
  }

  // 14. BACK TO THE FUTURE
  const isBTTF = /retour\s*vers\s*le\s*futur|back\s*to\s*the\s*future/i.test(t) || /back\s*to\s*the\s*future/i.test(ot);
  if (isBTTF) {
    return { franchiseId: "back-to-the-future", confidence: "high" };
  }

  // 15. FAST AND FURIOUS & JUSTIN LIN MATCHERS
  const isFastAndFurious = /fast\s*(and|&)?\s*furious|tokyo\s*drift|fast\s*(five|5|6|7|8|9|10)|furious\s*(7|8)|hobbs\s*(&|and)\s*shaw/i.test(t) || 
                           /fast\s*(and|&)?\s*furious|tokyo\s*drift|fast\s*(five|5|6|7|8|9|10)|furious\s*(7|8)|hobbs\s*(&|and)\s*shaw/i.test(ot) ||
                           /justin\s*lin/i.test(director || "");
  if (isFastAndFurious) {
    return { franchiseId: "fast-and-furious", confidence: "high" };
  }

  return { confidence: "none" };
}

// -------------------------------------------------------------
// REVOLUTIONARY HIGHEST-COMPATIBILITY RECURSIVE SORT ENGINE
// -------------------------------------------------------------
function sortSagaMovies(sagaId: string, movies: Movie[]): Movie[] {
  const list = [...movies];

  const cleanSW = (title: string): string => {
    return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ").trim();
  };

  if (sagaId === "star-wars") {
    const getSWScore = (m: Movie): number => {
      const s = cleanSW(m.title) + " " + cleanSW(m.originalTitle || "");
      if (/\b(episode\s*1|episode\s*i\b|menace\s*fantome|phantom\s*menace)/i.test(s)) return 1;
      if (/\b(episode\s*2|episode\s*ii\b|attaque\s*des\s*clones|attack\s*of\s*the\s*clones)/i.test(s)) return 2;
      if (/\b(episode\s*3|episode\s*iii\b|revanche\s*des\s*sith|revenge\s*of\s*the\s*sith)/i.test(s)) return 3;
      if (/\brogue\s*one\b/i.test(s)) return 4;
      if (/\b(episode\s*4|episode\s*iv\b|un\s*nouvel\s*espoir|new\s*hope)/i.test(s)) return 5;
      if (/\b(episode\s*5|episode\s*v\b|empire\s*contre|empire\s*strikes\s*back)/i.test(s)) return 6;
      if (/\b(episode\s*6|episode\s*vi\b|retour\s*du\s*jedi|return\s*of\s*the\s*jedi)/i.test(s)) return 7;
      if (/\b(episode\s*7|episode\s*vii\b|reveil\s*de\s*la\s*force|force\s*awakens)/i.test(s)) return 8;
      if (/\b(episode\s*8|episode\s*viii\b|derniers\s*jedi|last\s*jedi)/i.test(s)) return 9;
      if (/\b(episode\s*9|episode\s*ix\b|ascension\s*de\s*skywalker|rise\s*of\s*skywalker)/i.test(s)) return 10;
      return m.year ? m.year * 10 : 999;
    };
    return list.sort((a, b) => getSWScore(a) - getSWScore(b));
  }

  if (sagaId === "rocky") {
    const getRockyScore = (m: Movie): number => {
      const s = m.title.toLowerCase();
      if (/\bcreed\s*3|creed\s*iii\b/i.test(s)) return 9.3;
      if (/\bcreed\s*2|creed\s*ii\b/i.test(s)) return 9.2;
      if (/\bcreed\b/i.test(s)) return 9.1;
      return m.year;
    };
    return list.sort((a, b) => getRockyScore(a) - getRockyScore(b));
  }

  return list.sort((a, b) => a.year - b.year);
}

// -------------------------------------------------------------
// ADVANCED SAGA/FRANCHISE DOMAIN-SPECIFIC MATCHERS
// -------------------------------------------------------------
function isStarWarsEpisodeMatch(t1: string, t2: string): boolean {
  // Check if both titles contain Star Wars style references or known elements
  const isSW1 = /star\s*wars|guerre\s*des\s*etoiles|empire\s*contre|retour\s*du\s*jedi|menace\s*fantome|revanche\s*des\s*sith|reveil\s*de\s*la\s*force|derniers\s*jedi|ascension\s*skywalker|rogue\s*one/i.test(t1);
  const isSW2 = /star\s*wars|guerre\s*des\s*etoiles|empire\s*contre|retour\s*du\s*jedi|menace\s*fantome|revanche\s*des\s*sith|reveil\s*de\s*la\s*force|derniers\s*jedi|ascension\s*skywalker|rogue\s*one/i.test(t2);
  
  if (!isSW1 || !isSW2) return false;

  const clean1 = cleanTitle(t1);
  const clean2 = cleanTitle(t2);

  // Helper to extract Star Wars episode index (1-9)
  const getSWIndex = (s: string): number | null => {
    if (/\b(episode\s*1|episode\s*i\b|menace\s*fantome|phantom\s*menace)/i.test(s)) return 1;
    if (/\b(episode\s*2|episode\s*ii\b|attaque\s*des\s*clones|attack\s*of\s*the\s*clones)/i.test(s)) return 2;
    if (/\b(episode\s*3|episode\s*iii\b|revanche\s*des\s*sith|revenge\s*of\s*the\s*sith)/i.test(s)) return 3;
    if (/\b(episode\s*4|episode\s*iv\b|un\s*nouvel\s*espoir|new\s*hope)/i.test(s)) return 4;
    if (/\b(episode\s*5|episode\s*v\b|empire\s*contre|empire\s*strikes\s*back)/i.test(s)) return 5;
    if (/\b(episode\s*6|episode\s*vi\b|retour\s*du\s*jedi|return\s*of\s*the\s*jedi)/i.test(s)) return 6;
    if (/\b(episode\s*7|episode\s*vii\b|reveil\s*de\s*la\s*force|force\s*awakens)/i.test(s)) return 7;
    if (/\b(episode\s*8|episode\s*viii\b|derniers\s*jedi|last\s*jedi)/i.test(s)) return 8;
    if (/\b(episode\s*9|episode\s*ix\b|ascension\s*de\s*skywalker|rise\s*of\s*skywalker)/i.test(s)) return 9;
    if (/\brogue\s*one\b/i.test(s)) return 10;
    return null;
  };

  const idx1 = getSWIndex(clean1);
  const idx2 = getSWIndex(clean2);

  return idx1 !== null && idx1 === idx2;
}

function isBondMovieMatch(title1: string, title2: string): boolean {
  const t1 = cleanTitle(title1);
  const t2 = cleanTitle(title2);

  const bondKeywords = [
    "007", "james bond", "dr no", "dr. no", "goldfinger", "thunderball", "octopussy", 
    "goldeneye", "skyfall", "spectre", "casino royale", "quantum of solace", "solace",
    "mourir peut attendre", "no time to die", "licence to kill", "permis de tuer"
  ];
  
  const isBond1 = bondKeywords.some(kw => t1.includes(kw)) || /007|bond/i.test(title1);
  const isBond2 = bondKeywords.some(kw => t2.includes(kw)) || /007|bond/i.test(title2);
  
  if (!isBond1 && !isBond2) return false;

  const bondGroups = [
    ["dr no", "dr. no", "doctor no", "contre dr no"],
    ["russia with love", "baisers de russie", "bons baisers de russie"],
    ["goldfinger"],
    ["thunderball", "operation tonnerre"],
    ["live twice", "deux fois", "on ne vit que deux fois"],
    ["her majesty", "secret service", "service secret", "au service secret de sa majeste"],
    ["diamonds are forever", "diamants sont eternels", "les diamants sont eternels"],
    ["live and let die", "vivre et laisser mourir"],
    ["golden gun", "pistolet d or", "l homme au pistolet d or"],
    ["spy who loved me", "espion qui m aimait", "l espion qui m aimait"],
    ["moonraker"],
    ["eyes only", "pour vos yeux", "rien que pour vos yeux"],
    ["octopussy"],
    ["view to a kill", "dangereusement votre", "dangereusement vôtre"],
    ["living daylights", "tuer n est pas jouer"],
    ["licence to kill", "permis de tuer"],
    ["goldeneye"],
    ["tomorrow never dies", "demain ne meurt", "demain ne meurt jamais"],
    ["world is not enough", "monde ne suffit", "le monde ne suffit pas"],
    ["die another day", "meurs un autre jour"],
    ["casino royale"],
    ["quantum of solace", "solace", "quantum"],
    ["skyfall"],
    ["spectre"],
    ["no time to die", "mourir peut attendre"]
  ];

  for (const group of bondGroups) {
    const hasT1 = group.some(term => t1.includes(cleanTitle(term)) || cleanTitle(term) === t1);
    const hasT2 = group.some(term => t2.includes(cleanTitle(term)) || cleanTitle(term) === t2);
    if (hasT1 && hasT2) return true;
  }

  return false;
}

function isMovieMatch(title1: string, title2: string): boolean {
  const t1 = cleanTitle(title1);
  const t2 = cleanTitle(title2);
  
  if (!t1 || !t2) return false;
  
  // Exact match after cleaning
  if (t1 === t2) return true;

  // Star Wars specific match
  if (isStarWarsEpisodeMatch(title1, title2)) {
    return true;
  }

  // James Bond specific match
  if (isBondMovieMatch(title1, title2)) {
    return true;
  }

  const aliasGroups = [
    ["john wick 2", "john wick chapitre 2", "john wick chapter 2", "john wick ii"],
    ["john wick 3", "john wick parabellum", "john wick chapter 3", "john wick iii"],
    ["john wick 4", "john wick chapitre 4", "john wick chapter 4", "john wick iv"],
    ["les aventuriers de l arche perdue", "raiders of the lost ark", "arche perdue", "lost ark"],
    ["indiana jones et le temple maudit", "indiana jones and the temple of doom", "temple maudit", "temple of doom"],
    ["indiana jones et la derniere croisade", "indiana jones and the last crusade", "derniere croisade", "last crusade"],
    ["indiana jones et le royaume du crane de cristal", "indiana jones and the kingdom of the crystal skull", "crane de cristal", "crystal skull"],
    ["indiana jones et le cadran de la destinee", "indiana jones and the dial of destiny", "cadran de la destinee", "dial of destiny"],
    ["kill bill volume 1", "kill bill vol 1", "kill bill 1"],
    ["kill bill volume 2", "kill bill vol 2", "kill bill 2"],
    ["les huit salopards", "the hateful eight", "hateful eight", "hateful 8", "huit salopards"],
    ["dunkerque", "dunkirk"],
    ["rocky", "rocky 1", "rocky i"],
    ["rocky ii la revanche", "rocky 2", "rocky ii", "la revanche"],
    ["rocky iii l oeil du tigre", "rocky 3", "rocky iii", "eye of the tiger", "l oeil du tigre"],
    ["rocky iv", "rocky 4", "rocky iv"],
    ["rocky v", "rocky 5", "rocky v"],
    ["rocky balboa", "rocky 6", "rocky vi"],
    ["terminator 2 le jugement dernier", "terminator 2", "t2", "judgment day", "jugement dernier"],
    ["terminator 3 le soulevement des machines", "terminator 3", "rise of the machines", "soulevement des machines"],
    ["terminator renaissance", "terminator salvation", "terminator 4", "salvation"],
    ["fast and furious", "the fast and the furious", "fast & furious", "fast and furious 1", "fast & furious 1"],
    ["2 fast 2 furious", "fast and furious 2", "fast & furious 2"],
    ["the fast and the furious tokyo drift", "tokyo drift", "fast and furious 3", "fast & furious 3", "fast and furious tokyo drift"],
    ["fast & furious 4", "fast and furious 4", "fast and furious 2009", "fast & furious 2009"],
    ["fast five", "fast and furious 5", "fast & furious 5", "fast 5"],
    ["fast & furious 6", "fast and furious 6", "fast 6"],
    ["furious 7", "fast and furious 7", "furious vicii", "furious vii", "fast & furious 7", "furious 7"],
    ["the fate of the furious", "fast and furious 8", "fast & furious 8", "fate of the furious", "fast 8"],
    ["f9", "fast and furious 9", "fast & furious 9", "f9 the fast saga", "fast 9"],
    ["fast x", "fast and furious 10", "fast & furious 10", "fast 10"]
  ];

  for (const group of aliasGroups) {
    const hasT1 = group.some(alias => t1 === alias || cleanTitle(alias) === t1);
    const hasT2 = group.some(alias => t2 === alias || cleanTitle(alias) === t2);
    if (hasT1 && hasT2) return true;
  }

  return false;
}

const GENRE_AESTHETICS: Record<string, { gradient: string; accentColor: string; accentHex: string; symbol: string; description: string }> = {
  "action": {
    gradient: "from-slate-900 via-neutral-900 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "💥🔫🥋",
    description: "Séquences spectaculaires, combats intenses et adrénaline pure."
  },
  "adventure": {
    gradient: "from-neutral-900 via-amber-950/30 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "🤠🗺️🧭",
    description: "Explorations lointaines, quêtes épiques et mystères de l'histoire."
  },
  "aventure": {
    gradient: "from-neutral-900 via-amber-950/30 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "🤠🗺️🧭",
    description: "Explorations lointaines, quêtes épiques et mystères de l'histoire."
  },
  "science fiction": {
    gradient: "from-neutral-900 via-emerald-950/30 to-teal-950/40",
    accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    accentHex: "#34d399",
    symbol: "👽🪐🚀",
    description: "Futurs extraordinaires, technologies avancées et voyages stellaires."
  },
  "science-fiction": {
    gradient: "from-neutral-900 via-emerald-950/30 to-teal-950/40",
    accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    accentHex: "#34d399",
    symbol: "👽🪐🚀",
    description: "Futurs extraordinaires, technologies avancées et voyages stellaires."
  },
  "crime": {
    gradient: "from-stone-900 via-neutral-900 to-red-950/50",
    accentColor: "text-neutral-200 border-neutral-400/30 bg-neutral-400/10",
    accentHex: "#e5e5e5",
    symbol: "🕶️🤵🚨",
    description: "Hommes de l'ombre, enquêtes sombres et destins coupables."
  },
  "thriller": {
    gradient: "from-slate-900 via-neutral-900 to-purple-950/40",
    accentColor: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    accentHex: "#c084fc",
    symbol: "🔪🤫🔦",
    description: "Suspense psychologique, mystères insolubles et tension dramatique."
  },
  "drama": {
    gradient: "from-neutral-900 via-yellow-950/20 to-stone-900",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#ca8a04",
    symbol: "🎭🎭🍷",
    description: "Histoires humaines poignantes, relations complexes et destins bouleversants."
  },
  "drame": {
    gradient: "from-neutral-900 via-yellow-950/20 to-stone-900",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#ca8a04",
    symbol: "🎭🎭🍷",
    description: "Histoires humaines poignantes, relations complexes et destins bouleversants."
  },
  "comedy": {
    gradient: "from-neutral-900 via-yellow-950/30 to-amber-950/40",
    accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    accentHex: "#eab308",
    symbol: "😂🍿🎭",
    description: "Humour décapant, situations rocambolesques et rires garantis."
  },
  "comédie": {
    gradient: "from-neutral-900 via-yellow-950/30 to-amber-950/40",
    accentColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    accentHex: "#eab308",
    symbol: "😂🍿🎭",
    description: "Humour décapant, situations rocambolesques et rires garantis."
  },
  "animation": {
    gradient: "from-neutral-900 via-blue-950/30 to-indigo-950/40",
    accentColor: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    accentHex: "#60a5fa",
    symbol: "🎨✨🦁",
    description: "Merveilleux univers dessinés, aventures fantastiques pour tous les âges."
  }
};

// -------------------------------------------------------------
// DYNAMIC FRANCHISES & SAGA MATCHING CONFIGURATION
// -------------------------------------------------------------
const FRANCHISES = [
  {
    id: "matrix",
    title: "La Saga Matrix",
    description: "Le chef-d'œuvre cyber-punk des sœurs Wachowski qui a révolutionné les effets spéciaux et le cinéma de science-fiction.",
    pattern: /matrix/i,
    gradient: "from-neutral-950 via-emerald-950/40 to-neutral-950",
    accentColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    accentHex: "#34d399",
    symbol: "🔌🟢📟"
  },
  {
    id: "lord-of-the-rings",
    title: "Le Seigneur des Anneaux",
    pattern: /\b(lord of the rings|seigneur des anneaux|hobbit)\b/i,
    description: "L'adaptation légendaire de l'œuvre d'heroic fantasy de J.R.R. Tolkien par Peter Jackson.",
    gradient: "from-stone-900 via-amber-950/30 to-amber-950/40",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#f59e0b",
    symbol: "💍🧝🏰"
  },
  {
    id: "harry-potter",
    title: "Harry Potter",
    pattern: /harry potter/i,
    description: "Suivez le parcours légendaire du jeune sorcier à lunettes à l'école de magie de Poudlard.",
    gradient: "from-indigo-950 via-purple-950/30 to-zinc-950",
    accentColor: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    accentHex: "#c084fc",
    symbol: "⚡🦉🔮"
  },
  {
    id: "godfather",
    title: "Le Parrain",
    pattern: /\b(godfather|parrain)\b/i,
    description: "La trilogie mythique de Francis Ford Coppola sur l'ascension et la chute de la dynastie mafieuse Corleone.",
    gradient: "from-stone-900 via-neutral-950 to-stone-950",
    accentColor: "text-neutral-300 border-zinc-700 bg-zinc-800/10",
    accentHex: "#d4d4d8",
    symbol: "🌹🤵🍷"
  },
  {
    id: "mission-impossible",
    title: "Mission: Impossible",
    pattern: /mission\s*:?\s*impossible/i,
    description: "Les cascades les plus folles du cinéma d'action et d'espionnage menées par Tom Cruise.",
    gradient: "from-neutral-900 via-slate-900 to-red-950/30",
    accentColor: "text-red-500 border-red-500/30 bg-red-500/10",
    accentHex: "#ef4444",
    symbol: "🚁🏍️💣"
  },
  {
    id: "spider-man",
    title: "Spider-Man",
    pattern: /spider-?man/i,
    description: "Les aventures de l'homme-araignée de New York à travers différentes époques et dimensions.",
    gradient: "from-blue-950 via-slate-900 to-red-950/30",
    accentColor: "text-red-400 border-red-400/30 bg-red-400/10",
    accentHex: "#f87171",
    symbol: "🕸️🕷️🏙️"
  },
  {
    id: "alien",
    title: "Alien",
    pattern: /\balien\b/i,
    description: "Le summum du survival horrifique spatial et de la science-fiction d'épouvante.",
    gradient: "from-zinc-950 via-neutral-900 to-[#0e1c15]",
    accentColor: "text-lime-400 border-lime-400/30 bg-lime-400/10",
    accentHex: "#a3e635",
    symbol: "👽🪐📦"
  },
  {
    id: "back-to-the-future",
    title: "Retour vers le Futur",
    pattern: /\b(back to the future|retour vers le futur)\b/i,
    description: "Le voyage dans le temps mythique de Marty McFly et Doc Brown à bord de la légendaire DeLorean.",
    gradient: "from-blue-950 via-amber-950/20 to-neutral-950",
    accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    accentHex: "#ca8a04",
    symbol: "🚗⚡🕰️"
  },
  {
    id: "fast-and-furious",
    title: "(fast and Furious)",
    pattern: /\b(fast\s*(and|&)?\s*furious|tokyo\s*drift|fast\s*(five|5|6|7|8|9|10)|furious\s*(7|8)|hobbs\s*(&|and)\s*shaw)\b/i,
    description: "Vitesse, grosses cylindrées, famille et cascades spectaculaires. L'intégrale de la saga légendaire d'action propulsée par Justin Lin.",
    gradient: "from-neutral-900 via-amber-950/40 to-neutral-950",
    accentColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    accentHex: "#fb923c",
    symbol: "🚗💨🔥"
  }
];

function isBondMovie(m: Movie): boolean {
  const result = classifyMovie(m.title, m.originalTitle || "", m.director || "", m.genre || [], m.studios || []);
  return result.confidence === "high" && result.sagaId === "james-bond";
}

function getDynamicSagaId(m: Movie): string | null {
  const result = classifyMovie(m.title, m.originalTitle || "", m.director || "", m.genre || [], m.studios || []);
  if (result.confidence === "high" && result.sagaId) {
    return result.sagaId;
  }
  return null;
}

function enrichDynamicMovie(m: Movie, contextID: string): Movie {
  const primaryGenre = (m.genre && m.genre[0]) || "Drame";
  const aesthetic = GENRE_AESTHETICS[primaryGenre.toLowerCase()] || {
    gradient: "from-slate-900 via-neutral-900 to-zinc-950/40",
    accentColor: "text-zinc-400 border-zinc-500/30 bg-zinc-900/10",
    accentHex: "#71717a",
    symbol: "🎬"
  };

  const titleLower = m.title.toLowerCase();
  let tagline = m.tagline || "Un film légendaire indiscutable.";
  
  if (titleLower.includes("quantum of solace")) {
    tagline = "La vengeance personnelle est une affaire d'État.";
  } else if (titleLower.includes("spectre")) {
    tagline = "Un message secret du passé lance 007 sur une piste sinistre.";
  } else if (titleLower.includes("reloaded")) {
    tagline = "La vérité est une arme.";
  } else if (titleLower.includes("revolutions")) {
    tagline = "Tout ce qui a un début a une fin.";
  } else if (titleLower.includes("resurrections")) {
    tagline = "Retournez à la source.";
  } else if (titleLower.includes("matrix")) {
    tagline = "Libérez votre esprit.";
  }

  // Choose appropriate franchise style if matched
  let customGradient = m.gradient || aesthetic.gradient;
  let customAccent = m.accentColor || aesthetic.accentColor;
  let customHex = m.accentHex || aesthetic.accentHex;
  let customSymbol = m.symbol || aesthetic.symbol;

  if (contextID === "matrix") {
    customGradient = "from-neutral-950 via-emerald-950/30 to-neutral-950";
    customAccent = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    customHex = "#34d399";
    customSymbol = "🟢";
  } else if (contextID === "james-bond") {
    customGradient = "from-neutral-900 via-neutral-950 to-red-950/20";
    customAccent = "text-rose-500 border-rose-500/30 bg-rose-500/10";
    customHex = "#f43f5e";
    customSymbol = "🤵";
  }

  return {
    ...m,
    gradient: customGradient,
    accentColor: customAccent,
    accentHex: customHex,
    symbol: customSymbol,
    tagline,
    isJellyfin: true,
  };
}

export default function App() {
  const [activeTab, setActiveTab ] = useState<"accueil" | "collections" | "profil" | "collection-detail" | "movie" | "player">("accueil");
  const [routePath, setRoutePath] = useState(window.location.pathname);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Synchronize custom router state with HTML5 pushState
  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, "", path);
    setRoutePath(path);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (routePath === "/" || routePath === "/accueil") {
      setActiveTab("accueil");
      setSelectedCollectionId(null);
    } else if (routePath === "/collections") {
      setActiveTab("collections");
      setSelectedCollectionId(null);
    } else if (routePath === "/profil") {
      setActiveTab("profil");
      setSelectedCollectionId(null);
    } else if (routePath.startsWith("/collection-detail/")) {
      const id = routePath.slice("/collection-detail/".length);
      setSelectedCollectionId(id);
      setActiveTab("collection-detail");
    } else if (routePath.startsWith("/movie/")) {
      setActiveTab("movie");
    } else if (routePath.startsWith("/player/")) {
      setActiveTab("player");
    }
  }, [routePath]);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem("isAdmin") === "true";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [startAsPlaying, setStartAsPlaying] = useState(false);
  const [jellyfinHeroMovies, setJellyfinHeroMovies] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const jellyfinHeroMovie = jellyfinHeroMovies[currentHeroIndex] || null;
  const [isJellyfinHeroLoading, setIsJellyfinHeroLoading] = useState(false);
  const [useTextTitleForJellyfinHero, setUseTextTitleForJellyfinHero] = useState(false);

  // Server Integration States
  const [jellyfinConfig, setJellyfinConfig] = useState<{ configured: boolean; url: string } | null>(null);

  const isHeroLoading = 
    jellyfinConfig === null || 
    (jellyfinConfig.configured && isJellyfinHeroLoading && jellyfinHeroMovies.length === 0);

  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({
    "christopher-nolan": true, // Start with Christopher Nolan collection unfolded so users see films immediately
  });

  const [jellyfinMovies, setJellyfinMovies] = useState<Movie[]>([]);
  const [jellyfinSearchQuery, setJellyfinSearchQuery] = useState("");
  const [isJellyfinLoading, setIsJellyfinLoading] = useState(false);
  const [isJellyfinError, setIsJellyfinError] = useState("");

  // Connection form states
  const [jellyfinInputUrl, setJellyfinInputUrl] = useState("");
  const [jellyfinInputApiKey, setJellyfinInputApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Dynamically map movies into collections & genres by checking server presence
  const mappedCollections = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];

    const matchedServersMovieIds = new Set<string>();

    // 1. Process standard Saga Collections (Christopher Nolan, John Wick, etc.)
    // Keep ONLY movies actually found on the server, and drop empty collections
    const curatedSagaCollections = COLLECTIONS.map((collection) => {
      const enrichedMovies = collection.movies
        .map((movie) => {
          const match = jellyfinMovies.find((jf) => isMovieMatch(movie.title, jf.title));
          if (match) {
            matchedServersMovieIds.add(match.id);
            return {
              ...movie,
              id: match.id, // Use server id to play correctly
              streamUrl: match.streamUrl,
              isJellyfin: true,
              posterUrl: match.posterUrl || movie.posterUrl,
              backdropUrl: match.backdropUrl || movie.backdropUrl,
              year: match.year || movie.year,
              originalTitle: match.originalTitle || movie.originalTitle,
              studios: match.studios || movie.studios,
              director: match.director || movie.director,
              genre: match.genre || movie.genre
            } as Movie;
          }
          return null;
        })
        .filter((m): m is Movie => m !== null);

      // Dynamically load unmatched movies from Jellyfin that belong to this saga!
      jellyfinMovies.forEach((jf) => {
        if (!matchedServersMovieIds.has(jf.id)) {
          const sagaId = getDynamicSagaId(jf);
          if (sagaId === collection.id) {
            // Check if it's already represented to prevent duplicate titles
            if (!enrichedMovies.some(m => isMovieMatch(m.title, jf.title))) {
              const enriched = enrichDynamicMovie(jf, collection.id);
              enrichedMovies.push(enriched);
              matchedServersMovieIds.add(jf.id);
            }
          }
        }
      });

      // SORT ACCORDING TO RECOMMENDED CHRONOLOGICAL OR OFFICIAL RELEASE ORDER
      const sortedMovies = sortSagaMovies(collection.id, enrichedMovies);

      return {
        ...collection,
        movies: sortedMovies,
      };
    }).filter((col) => col.movies.length > 0);

    // 2. Classify other remaining server movies into custom franchise dynamic collections (like Matrix) using high-confidence classification
    const dynamicFranchiseCollections: any[] = [];
    FRANCHISES.forEach((franchise) => {
      const franchiseMovies = jellyfinMovies
        .filter((m) => {
          if (matchedServersMovieIds.has(m.id)) return false;
          const classification = classifyMovie(m.title, m.originalTitle || "", m.director || "", m.genre || [], m.studios || []);
          return classification.confidence === "high" && classification.franchiseId === franchise.id;
        })
        .map((m) => {
          matchedServersMovieIds.add(m.id);
          return enrichDynamicMovie(m, franchise.id);
        });

      if (franchiseMovies.length >= 1) {
        const sortedFranchise = franchiseMovies.sort((a, b) => a.year - b.year);
        dynamicFranchiseCollections.push({
          id: `franchise-${franchise.id}`,
          title: franchise.title,
          description: franchise.description,
          movies: sortedFranchise,
        });
      }
    });

    // 3. Classify other remaining server movies into dynamic director retrospectives
    const dynamicDirectorCollections: any[] = [];
    const remainingAfterFranchises = jellyfinMovies.filter((m) => !matchedServersMovieIds.has(m.id));
    
    const directorGroups: Record<string, Movie[]> = {};
    remainingAfterFranchises.forEach((m) => {
      if (m.director && m.director.trim() !== "" && !/unknown|inconnu|divers|various|various directors/i.test(m.director)) {
        const dName = m.director.trim();
        // Skip directors already in main sagas (Quentin Tarantino and Christopher Nolan)
        if (!/tarantino|nolan/i.test(dName)) {
          if (!directorGroups[dName]) {
            directorGroups[dName] = [];
          }
          directorGroups[dName].push(m);
        }
      }
    });

    Object.entries(directorGroups).forEach(([directorName, movies]) => {
      if (movies.length >= 2) {
        const enrichedMovies = movies.map((m) => {
          matchedServersMovieIds.add(m.id);
          return enrichDynamicMovie(m, "director");
        });

        const slug = directorName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "-");
        dynamicDirectorCollections.push({
          id: `director-${slug}`,
          title: directorName,
          description: `Rétrospective consacrée à l'œuvre d'exception du réalisateur : ${directorName}.`,
          movies: enrichedMovies,
        });
      }
    });

    // Sort dynamic director collections A-Z
    dynamicDirectorCollections.sort((a, b) => a.title.localeCompare(b.title));

    // 4. Classify leftover unmatched movies into genre categories (shelf rows)
    const finalUnmatchedMovies = jellyfinMovies.filter((m) => !matchedServersMovieIds.has(m.id));

    const genreGroups: Record<string, Movie[]> = {};
    finalUnmatchedMovies.forEach((movie) => {
      const genres = movie.genre && movie.genre.length > 0 ? movie.genre : ["Divers"];
      genres.forEach((genreName) => {
        const key = genreName.trim();
        if (!genreGroups[key]) {
          genreGroups[key] = [];
        }
        if (!genreGroups[key].some((m) => m.id === movie.id)) {
          genreGroups[key].push({
            ...movie,
            gradient: GENRE_AESTHETICS[key.toLowerCase()]?.gradient || "from-slate-900 via-neutral-900 to-zinc-950/40",
            accentColor: GENRE_AESTHETICS[key.toLowerCase()]?.accentColor || "text-zinc-400 border-zinc-800 bg-zinc-900/10",
            accentHex: GENRE_AESTHETICS[key.toLowerCase()]?.accentHex || "#71717a",
            symbol: GENRE_AESTHETICS[key.toLowerCase()]?.symbol || "🎬🎥"
          });
        }
      });
    });

    // Construct dynamic genre collections
    const genreCollections = Object.entries(genreGroups).map(([genreName, movies]) => {
      const idClean = genreName.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "-");
      const config = GENRE_AESTHETICS[genreName.toLowerCase()] || {
        description: `Sélection de films d'auteur catalogués sous la thématique ${genreName}.`
      };

      return {
        id: `genre-${idClean}`,
        title: `Cinéma ${genreName}`,
        description: config.description,
        movies: movies
      };
    }).filter((g) => g.movies.length > 0);

    const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections
    ];

    return finalCollections.map((col) => {
      // Nettoyer et éliminer tout doublon de film (doublons par ID ou par titre identique)
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      const uniqueMovies = col.movies.filter((movie) => {
        if (!movie) return false;
        const idKey = String(movie.id);
        const titleKey = movie.title.toLowerCase().trim();
        if (seenIds.has(idKey) || seenTitles.has(titleKey)) {
          return false;
        }
        seenIds.add(idKey);
        seenTitles.add(titleKey);
        return true;
      });
      return {
        ...col,
        movies: uniqueMovies
      };
    }).filter((col) => col.movies.length > 0);
  }, [jellyfinMovies]);

  // SAGA COMPLETENESS CHECKLIST VALIDATION ENGINE
  const sagaCompletenessList = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];

    return COLLECTIONS.map(collection => {
      const ownedTitles: string[] = [];
      const missingMovies: Array<{ title: string; year: number }> = [];

      collection.movies.forEach(expectedMovie => {
        const isOwned = jellyfinMovies.some(jf => isMovieMatch(expectedMovie.title, jf.title));
        if (isOwned) {
          ownedTitles.push(expectedMovie.title);
        } else {
          missingMovies.push({ title: expectedMovie.title, year: expectedMovie.year });
        }
      });

      const totalExpected = collection.movies.length;
      const countOwned = ownedTitles.length;
      const percentage = totalExpected > 0 ? Math.round((countOwned / totalExpected) * 100) : 100;

      return {
        id: collection.id,
        title: collection.title,
        countOwned,
        totalExpected,
        percentage,
        missingMovies
      };
    });
  }, [jellyfinMovies]);

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  };

  const expandCollection = (collectionId: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: true
    }));
  };

  // References to horizontal carousel containers for navigation buttons
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hoveredCarousels = useRef<Record<string, boolean>>({});
  const scrollPositions = useRef<Record<string, number>>({});
  const rowSpeedMultipliers = useRef<Record<string, number>>({});
  const heroTouchStartX = useRef<number | null>(null);


  const handleRecalculateSagas = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/jellyfin/recalculate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await Promise.all([loadJellyfinLibrary(), loadJellyfinHeroMovie()]);
      }
    } catch (err) {
      console.error("Error recalculating sagas:", err);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Load library movies from backend
  const loadJellyfinLibrary = async () => {
    setIsJellyfinLoading(true);
    setIsJellyfinError("");
    try {
      const res = await fetch("/api/jellyfin/movies");
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setJellyfinMovies(data.movies || []);
      } else {
        setIsJellyfinError(data.error || "Unable to retrieve your movies.");
      }
    } catch (err: any) {
      setIsJellyfinError("Network error communicating with the media server.");
    } finally {
      setIsJellyfinLoading(false);
    }
  };

  const loadJellyfinHeroMovie = async () => {
    setIsJellyfinHeroLoading(true);
    let attempts = 0;
    const maxAttempts = 3;

    const tryFetchHero = async () => {
      try {
        const res = await fetch("/api/jellyfin/hero");
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          if (data.heroes && data.heroes.length > 0) {
            setJellyfinHeroMovies(data.heroes);
          } else if (data.hero) {
            setJellyfinHeroMovies([data.hero]);
          } else {
            setJellyfinHeroMovies([]);
          }
          setCurrentHeroIndex(0);
          setIsJellyfinHeroLoading(false);
        } else {
          setJellyfinHeroMovies([]);
          setIsJellyfinHeroLoading(false);
        }
      } catch (err) {
        console.warn(`Jellyfin Hero load attempt ${attempts + 1} failed:`, err);
        if (attempts < maxAttempts - 1) {
          attempts++;
          setTimeout(tryFetchHero, 1500 * attempts);
        } else {
          console.warn("Jellyfin Hero load error:", err);
          setJellyfinHeroMovies([]);
          setIsJellyfinHeroLoading(false);
        }
      }
    };

    tryFetchHero();
  };

  // Reset title display preferences when user slides to a different hero film
  useEffect(() => {
    setUseTextTitleForJellyfinHero(false);
  }, [currentHeroIndex]);

  // Automatic advances interval for dynamic Jellyfin Hero banner collection (10s loops)
  useEffect(() => {
    if (jellyfinHeroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentHeroIndex((prev) => (prev + 1) % jellyfinHeroMovies.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [jellyfinHeroMovies.length]);

  // Load Jellyfin Hero whenever config status updates
  useEffect(() => {
    if (jellyfinConfig?.configured) {
      loadJellyfinHeroMovie();
    } else {
      setJellyfinHeroMovies([]);
    }
  }, [jellyfinConfig?.configured]);

  const handleConnectJellyfin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectionError("");

    if (!jellyfinInputUrl || !jellyfinInputApiKey) {
      setConnectionError("Veuillez remplir tous les champs.");
      setIsConnecting(false);
      return;
    }

    try {
      const res = await fetch("/api/jellyfin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jellyfinInputUrl, apiKey: jellyfinInputApiKey })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setJellyfinConfig({ configured: true, url: data.url });
        localStorage.setItem("classico_jellyfin_url", data.url);
        localStorage.setItem("classico_jellyfin_apikey", jellyfinInputApiKey);
        
        // Load movies
        setIsJellyfinLoading(true);
        const libRes = await fetch("/api/jellyfin/movies");
        const libData = await libRes.json();
        if (libData.success) {
          setJellyfinMovies(libData.movies);
        }
        setIsJellyfinLoading(false);
      } else {
        setConnectionError(data.error || "Failed to connect to the media server.");
      }
    } catch (err) {
      setConnectionError("Unable to connect to the remote server. Check your server URL.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectJellyfin = async () => {
    if (!window.confirm("Voulez-vous déconnecter ce serveur de CLASSICO ?")) return;
    try {
      const res = await fetch("/api/jellyfin/disconnect", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setJellyfinConfig({ configured: false, url: "" });
        setJellyfinMovies([]);
        setJellyfinInputUrl("");
        setJellyfinInputApiKey("");
        localStorage.removeItem("classico_jellyfin_url");
        localStorage.removeItem("classico_jellyfin_apikey");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load watchlist and search default spotlight film
  useEffect(() => {
    // Watchlist persistence
    const savedWatchlist = localStorage.getItem("classico_watchlist");
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error(e);
      }
    }

    // History persistence
    const savedHistory = localStorage.getItem("classico_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Progress persistence
    const savedProgress = localStorage.getItem("classico_progress");
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress));
      } catch (e) {
        console.error(e);
      }
    }

    // Check Jellyfin server configuration status
    const checkJellyfinSetup = async () => {
      let attempts = 0;
      const maxAttempts = 3;
      
      const tryFetch = async () => {
        try {
          const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
          const defaultUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
          const defaultApiKey = "a2aac09e434e4bcc897c1b181ca197eb";

          const localUrl = localStorage.getItem("classico_jellyfin_url");
          const localKey = localStorage.getItem("classico_jellyfin_apikey");

          if (isNetlify || !localUrl || !localKey) {
            localStorage.setItem("classico_jellyfin_url", defaultUrl);
            localStorage.setItem("classico_jellyfin_apikey", defaultApiKey);
          }

          const targetUrl = localStorage.getItem("classico_jellyfin_url") || defaultUrl;
          const targetKey = localStorage.getItem("classico_jellyfin_apikey") || defaultApiKey;

          // Perform auto-configuration on server
          const restoreRes = await fetch("/api/jellyfin/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl, apiKey: targetKey })
          });

          if (!restoreRes.ok) throw new Error("Auto-configuration request failed");
          const restoreData = await restoreRes.json();

          if (restoreData.success) {
            setJellyfinConfig({ configured: true, url: restoreData.url });
            localStorage.setItem("classico_jellyfin_url", restoreData.url);
            localStorage.setItem("classico_jellyfin_apikey", targetKey);

            setIsJellyfinLoading(true);
            try {
              const libRes = await fetch("/api/jellyfin/movies");
              if (!libRes.ok) throw new Error("Could not fetch movies");
              const libData = await libRes.json();
              if (libData.success) {
                setJellyfinMovies(libData.movies || []);
              } else {
                setIsJellyfinError(libData.error || "Unable to read movies.");
              }
            } catch (libErr) {
              console.warn("Failed to load library movies on check:", libErr);
              setIsJellyfinError("Unable to connect to Jellyfin.");
            } finally {
              setIsJellyfinLoading(false);
            }
          } else {
            // Fallback gracefully and set configured to true with targetUrl
            setJellyfinConfig({ configured: true, url: targetUrl });
            setIsJellyfinLoading(false);
          }
        } catch (err) {
          console.warn(`Jellyfin connection check attempt ${attempts + 1} failed:`, err);
          if (attempts < maxAttempts - 1) {
            attempts++;
            setTimeout(tryFetch, 1500 * attempts);
          } else {
            console.warn("Jellyfin connection check error:", err);
            // Bulletproof fallback: set configured to true to unblock the screen immediately
            const defaultUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
            setJellyfinConfig({ configured: true, url: defaultUrl });
            setIsJellyfinLoading(false);
            setIsJellyfinHeroLoading(false);
          }
        }
      };
      
      tryFetch();
    };
    checkJellyfinSetup();

  }, []);

  const handleToggleWatchlist = (movieID: string) => {
    const updated = watchlist.includes(movieID)
      ? watchlist.filter(id => id !== movieID)
      : [...watchlist, movieID];
    setWatchlist(updated);
    localStorage.setItem("classico_watchlist", JSON.stringify(updated));
  };

  const handleAddToHistory = (movieID: string) => {
    if (!history.includes(movieID)) {
      const updated = [movieID, ...history].slice(0, 10); // Keep last 10
      setHistory(updated);
      localStorage.setItem("classico_history", JSON.stringify(updated));
    }
  };

  const handleOpenMovie = (movie: Movie, immediatePlay = false) => {
    if (immediatePlay) {
      // Enregistrer le temps du clic initial
      (window as any).moviePlayClickTime = performance.now();
      console.log("%c[CHRONO LECTEUR] Clic sur le film : 0.000s (Début du flux)", "color: #a855f7; font-weight: bold; font-size: 13px;");
      
      // Préchargement immédiat de l'API de playback au clic pour devancer la navigation de la page
      const pId = movie.id;
      const prefetches = (window as any).playbackPrefetches || {};
      prefetches[pId] = fetch(`/api/playback/${encodeURIComponent(pId)}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const ct = res.headers.get("content-type");
          if (!ct || !ct.includes("application/json")) throw new Error("Not JSON");
          return res.json();
        })
        .catch(err => {
          console.warn("[PLAYBACK PREFETCH ERROR]", err);
          return null;
        });
      (window as any).playbackPrefetches = prefetches;

      navigateTo("/player/" + movie.id);
    } else {
      navigateTo("/movie/" + movie.id);
    }
    handleAddToHistory(movie.id);
  };

  // Carousel smooth scrolling helper
  const scrollCarousel = (collectionId: string, direction: "left" | "right") => {
    const container = carouselRefs.current[collectionId];
    if (container) {
      const scrollAmt = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === "left" ? -scrollAmt : scrollAmt,
        behavior: "smooth"
      });
    }
  };

  // Continuous scroll animation removed for max-fluidity, standard native sub-millisecond scrolling with chevrons is retained.
  // Avoids any background CPU/GPU thread starvation or memory consumption.

  // Keyboard controls for carousels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is active, let it handle its own controls
      if (selectedMovie) return;
      if (e.key === "Escape") {
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMovie]);

  // Filter movies globally based on search query
  const allMovies = React.useMemo(() => {
    const map = new Map<string, Movie>();
    
    // Add custom mapped collection movies first (they have beautiful gradients, symbols, etc., and are now enriched with Jellyfin dynamic streams!)
    mappedCollections.flatMap(c => c.movies).forEach(m => {
      const key = cleanTitle(m.title);
      map.set(key, m);
    });

    // Add Jellyfin-only library movies that did not match any of the hand-crafted collections
    jellyfinMovies.forEach(m => {
      const key = cleanTitle(m.title);
      if (!map.has(key)) {
        map.set(key, m);
      }
    });

    return Array.from(map.values());
  }, [mappedCollections, jellyfinMovies]);

  const unmatchedMovies = React.useMemo(() => {
    if (!jellyfinMovies || jellyfinMovies.length === 0) return [];
    
    const inCollections = new Set<string>();
    mappedCollections.forEach(c => c.movies.forEach(m => inCollections.add(m.id)));

    return jellyfinMovies.filter(m => !inCollections.has(m.id));
  }, [jellyfinMovies, mappedCollections]);

  const searchedMovies = searchQuery.trim() === ""
    ? []
    : allMovies.filter(m => 
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.genre && m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
      );

  const activeMovie = React.useMemo(() => {
    let targetId = "";
    if (routePath.startsWith("/movie/")) {
      targetId = routePath.slice("/movie/".length);
    } else if (routePath.startsWith("/player/")) {
      targetId = routePath.slice("/player/".length);
    }
    if (!targetId) return null;
    return allMovies.find(m => m.id === targetId) || null;
  }, [routePath, allMovies]);

  // Mobile interaction states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Intercept and return the standalone full-screen cinema view with zero overlay UI
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
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-black antialiased overflow-x-hidden font-sans">
      
      {/* ========================================================== */}
      {/* 1. FIXED GLASS HEADER BAR                                 */}
      {/* ========================================================== */}
      <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ease-in-out border-b ${isScrolled ? "bg-black border-white/5" : "bg-black border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 md:py-3.5 flex flex-row items-center justify-between gap-2.5 md:gap-4 font-sans w-full">
          
          {/* Logo CLASSICO with Metallic Gold Reflection */}
          <div 
            className="flex flex-col items-center cursor-pointer group select-none py-0.5 md:py-1 shrink-0"
            onClick={() => {
              navigateTo("/");
              setSearchQuery("");
            }}
          >
            <div className="relative overflow-hidden flex items-center">
              <span className="font-cinzel font-bold text-xl sm:text-2.5xl md:text-3xl tracking-[0.22em] gold-metallic-text uppercase leading-none transition-all duration-300 group-hover:scale-102">
                CLASSICO
              </span>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
            </div>
            <span className="block font-signature text-[13px] sm:text-[17px] md:text-[20px] text-[#f4ecd8] leading-none mt-[-2px] sm:mt-[-1px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)] font-signature">
              The Best
            </span>
          </div>

          {/* Desktop Search & Nav (hidden on mobile), Mobile Action Buttons */}
          <div className="flex items-center gap-3 w-full justify-end">
            
            {/* Interactive Search Field Bar (Desktop always, Mobile conditionally visible) */}
            <div className={`relative w-full md:max-w-xs lg:max-w-sm group font-sans transition-all duration-300 ${isMobileSearchOpen ? 'block' : 'hidden md:block'}`}>
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-400 transition-colors duration-200">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="global-search-input"
                type="text"
                placeholder="Search for a movie, director..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 text-stone-100 placeholder-zinc-500 text-[11px] sm:text-xs pl-9 pr-4 py-1.5 md:py-2 rounded-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 shadow-inner group-hover:border-zinc-700/80 font-sans"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white text-[10px] font-mono"
                >
                  EFFACER
                </button>
              )}
            </div>

            {/* Mobile Actions: Search Toggle & Hamburger (hidden on md) */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              {!isMobileSearchOpen && (
                <button 
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2 text-zinc-400 hover:text-amber-400 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-300 hover:text-amber-400 transition-colors z-50 relative"
              >
                {isMobileMenuOpen ? <X strokeWidth={1.5} className="w-7 h-7" /> : <Menu strokeWidth={1.5} className="w-7 h-7" />}
              </button>
            </div>

            {/* Desktop Navigation Controls Menu */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2 font-sans">
              {[
                { id: "accueil", label: "Home", icon: Compass },
                { id: "collections", label: "Library", icon: FilmIcon },
                { id: "profil", label: "My Profile", icon: User }
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id && searchQuery === "";
                return (
                  <button
                    id={`nav-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => {
                      navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                      setSearchQuery("");
                    }}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-250 font-sans ${
                      isActive
                        ? "gold-button scale-102"
                        : "text-zinc-400 hover:text-white hover:bg-neutral-900/50"
                    }`}
                  >
                    <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {tab.label}
                    {tab.id === "profil" && watchlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] text-white font-mono rounded-full flex items-center justify-center border border-black font-extrabold shadow-sm animate-pulse">
                        {watchlist.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute top-16 right-4 w-48 bg-black/75 backdrop-blur-md overflow-hidden border border-white/5 rounded-2xl shadow-2xl origin-top-right"
            >
              <nav className="flex flex-col py-2 px-2 gap-1">
                {[
                  { id: "accueil", label: "Home", icon: Compass },
                  { id: "collections", label: "Library", icon: FilmIcon },
                  { id: "profil", label: "My Profile", icon: User }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id && searchQuery === "";
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        navigateTo(tab.id === "accueil" ? "/" : `/${tab.id}`);
                        setSearchQuery("");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 w-full text-left ${
                        isActive
                          ? "bg-amber-500/10 text-amber-400"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <IconComp strokeWidth={2} className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ALERT BANNER */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-950/95 overflow-hidden border-t border-amber-500/20"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 md:py-2.5 flex items-center justify-between gap-4">
                <p className="text-amber-500/90 text-[11px] sm:text-xs font-light leading-relaxed">
                  <AlertCircle className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Notice: The site is currently under construction and modification. It is normal if some features are temporarily unavailable or if certain movies are missing from the catalog.
                </p>
                <button 
                  onClick={() => setShowBanner(false)}
                  className="shrink-0 p-1 text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacing for Fixed Header - Hidden for the home tab's Hero section to allow full screen 100vh display */}
      {(activeTab !== "accueil" || searchQuery.trim() !== "") && (
        <div className="h-[80px] md:h-[72px]" />
      )}

      {/* ========================================================== */}
      {/* 2. MAIN VIEWER CONTENT CONTAINER                           */}
      {/* ========================================================== */}
      <main className="pb-16 min-h-[75vh]">
        <AnimatePresence mode="wait">

          {/* SEARCH RESULTS SHOWCASE GRID OVERLAY */}
          {searchQuery.trim() !== "" ? (
            <motion.div
              key="search-results-pane"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8"
            >
              <div className="space-y-2 text-left">
                <p className="text-xs font-mono uppercase tracking-[3px] text-zinc-500">SEARCH ENGINE</p>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                  Results for: <span className="text-amber-400 italic">"{searchQuery}"</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                  {searchedMovies.length} cinematic masterpiece{searchedMovies.length > 1 ? "s" : ""} found
                </p>
              </div>

              {searchedMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 pt-2 justify-items-center">
                  {searchedMovies.map((movie, idx) => (
                    <LazyVirtualCard key={`${movie.id}-search-${idx}`}>
                      <MovieCard
                        movie={movie}
                        onSelect={(m) => handleOpenMovie(m, false)}
                        onPlay={(m) => handleOpenMovie(m, true)}
                      />
                    </LazyVirtualCard>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto text-zinc-600">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">No matches found</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans">
                    Some of our classic movies are grouped by director or themes. Try for example: <span className="text-amber-400 font-mono">Tarantino</span>, <span className="text-amber-400 font-mono">Nolan</span>, <span className="text-amber-400 font-mono">Star Wars</span> or <span className="text-amber-400 font-mono">Action</span>.
                  </p>
                </div>
              )}
            </motion.div>
          ) : activeTab === "accueil" ? (
            /* ========================================================== */
            /* VIEW A: ACCUEIL - DISCOVER & SPOTLIGHT SECTIONS             */
            /* ========================================================== */
            <motion.div
              key="tab-accueil"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-12"
            >
              {/* Grand Showcase Spotlight Hero Section (Premium Netflix/Apple TV style) */}
              {isHeroLoading ? (
                <HeroSkeleton />
              ) : jellyfinConfig?.configured && jellyfinHeroMovies.length > 0 && jellyfinHeroMovie ? (
                <div 
                  className="relative w-full h-[85vh] [@media(max-height:500px)_and_(orientation:landscape)]:h-[100vh] md:h-screen bg-stone-950 overflow-hidden flex items-end select-none"
                  onTouchStart={(e) => {
                    heroTouchStartX.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (heroTouchStartX.current === null) return;
                    const touchEndX = e.changedTouches[0].clientX;
                    const diff = heroTouchStartX.current - touchEndX;
                    
                    if (Math.abs(diff) > 50) { // threshold for swipe
                      if (diff > 0 && jellyfinHeroMovies.length > 1) {
                        // Swiped left, go to next
                        setDirection(1);
                        setCurrentHeroIndex((prev) => (prev + 1) % jellyfinHeroMovies.length);
                      } else if (diff < 0 && jellyfinHeroMovies.length > 1) {
                        // Swiped right, go to prev
                        setDirection(-1);
                        setCurrentHeroIndex((prev) => (prev - 1 + jellyfinHeroMovies.length) % jellyfinHeroMovies.length);
                      }
                    }
                    heroTouchStartX.current = null;
                  }}
                >
                  
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={jellyfinHeroMovie.id}
                      custom={direction}
                      variants={{
                        enter: (dir: number) => ({
                          x: dir > 0 ? "100%" : "-100%",
                          opacity: 0,
                        }),
                        center: {
                          x: 0,
                          opacity: 1,
                        },
                        exit: (dir: number) => ({
                          x: dir < 0 ? "100%" : "-100%",
                          opacity: 0,
                          zIndex: 0,
                        }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 220, damping: 25, mass: 0.8 },
                        opacity: { duration: 0.4, ease: "easeInOut" }
                      }}
                      style={{ willChange: "transform" }}
                      className="absolute inset-0 w-full h-full flex items-end"
                    >
                      {/* Cinematic background image wrapper covering the full width */}
                      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                        <motion.img
                          src={jellyfinHeroMovie.backdropUrl || CLASSICO_HERO_BACKDROP}
                          alt={jellyfinHeroMovie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center md:object-top"
                          style={{ willChange: "transform" }}
                          animate={{ 
                            scale: [1.02, 1.05, 1.02],
                            x: [0, 4, 0],
                            y: [0, -2, 0]
                          }}
                          transition={{
                            duration: 40,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </div>

                      {/* Progressive cinematic bottom-to-top black gradient that separates the hero from the thematic library below */}
                      <div 
                        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-black/50 to-transparent md:!bg-[linear-gradient(to_top,#0c0a09_0%,rgba(12,10,9,0.95)_15%,rgba(12,10,9,0.75)_40%,rgba(12,10,9,0.2)_75%,transparent_100%)]" 
                      />

                      {/* Spotlight Content and Description Box with high contrast text drop-shadows */}
                      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-12 pb-14 sm:pb-28 pt-20 sm:pt-36 md:pt-28 flex flex-col items-start text-left [@media(max-height:500px)_and_(orientation:landscape)]:pb-4 [@media(max-height:500px)_and_(orientation:landscape)]:pt-16">
                        
                        {/* Fade-in Text Section Wrapper */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-4 sm:space-y-5 w-full md:max-w-[35%] lg:max-w-[35%] min-w-[280px] sm:min-w-[360px] md:min-w-[0px] z-20 [@media(max-height:500px)_and_(orientation:landscape)]:space-y-2"
                        >
                          {/* Poster Style Cinematic Title or Logo with dynamic fallback to text based styling */}
                          {jellyfinHeroMovie.hasLogo && jellyfinHeroMovie.logoUrl && !useTextTitleForJellyfinHero ? (
                            <div className="scale-75 sm:scale-100 origin-left select-none my-2 relative group uppercase italic leading-[0.9]">
                              <img 
                                src={jellyfinHeroMovie.logoUrl} 
                                alt={jellyfinHeroMovie.title}
                                className="h-12 xs:h-16 sm:h-20 lg:h-24 object-contain max-w-[85%] sm:max-w-[75%] select-none pointer-events-none filter brightness-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
                                referrerPolicy="no-referrer"
                                onError={() => {
                                  setUseTextTitleForJellyfinHero(true);
                                }}
                              />
                              {/* Subtle user feedback action to bypass logo if it's white or unreadable */}
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUseTextTitleForJellyfinHero(true);
                                }}
                                className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 text-[9.5px] font-sans text-zinc-400 hover:text-white transition-opacity bg-black/80 px-2 py-0.5 rounded border border-white/10"
                              >
                                Logo peu lisible ? Passer au format texte 🗸
                              </button>
                            </div>
                          ) : (
                            <div className="relative group my-1">
                              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tight text-white uppercase italic leading-[1.05] filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] transform -skew-x-2">
                                {jellyfinHeroMovie.title}
                              </h1>
                              {jellyfinHeroMovie.hasLogo && jellyfinHeroMovie.logoUrl && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUseTextTitleForJellyfinHero(false);
                                  }}
                                  className="mt-1.5 inline-flex items-center gap-1 opacity-60 hover:opacity-100 text-[9px] text-amber-400/90 hover:text-amber-300 bg-stone-900/60 hover:bg-stone-900 border border-white/5 hover:border-amber-400/20 px-2.5 py-0.5 rounded transition-all cursor-pointer font-mono"
                                >
                                  🖼️ Voir logo officiel
                                </button>
                              )}
                            </div>
                          )}

                          {/* Premium Discrete Pills / Badges for movie tags */}
                           <div className="flex w-full justify-start items-center gap-1.5 text-[10px] md:text-[9.5px] font-mono uppercase tracking-[0.08em] pb-1 md:pb-0">
                            <div className="hidden md:flex items-center gap-1.5">
                              {jellyfinHeroMovie.genre && jellyfinHeroMovie.genre.slice(0, 4).map((g: string) => (
                                <span key={g} className="whitespace-nowrap px-1.5 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 rounded-full font-sans font-bold tracking-wider transition-colors duration-200">
                                  {g}
                                </span>
                              ))}
                            </div>
                            <span className="whitespace-nowrap px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold tracking-wider rounded-full">
                              {jellyfinHeroMovie.year}
                            </span>
                            <span className="whitespace-nowrap px-1.5 py-0.5 bg-white/5 border border-white/10 text-zinc-400 tracking-wider rounded-full">
                              {jellyfinHeroMovie.duration}
                            </span>
                            {jellyfinHeroMovie.rating && jellyfinHeroMovie.rating !== "N/A" && (
                              <span className="whitespace-nowrap px-1.5 py-0.5 bg-white/5 border border-white/10 text-zinc-300 font-bold tracking-wider rounded-full">
                                <span className="text-amber-500 font-extrabold mr-0.5">★</span>{jellyfinHeroMovie.rating}
                              </span>
                            )}
                          </div>

                          {/* Movie Description: Stricter clamping for a lighter card feeling (max 2/3 lines limit) */}
                          <p 
                            className="text-zinc-300 text-[11px] sm:text-xs md:text-sm leading-relaxed font-sans filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] line-clamp-2 md:line-clamp-3 overflow-hidden text-ellipsis whitespace-normal max-w-[70%] md:max-w-full"
                            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)" }}
                          >
                            {jellyfinHeroMovie.description}
                          </p>

                          {/* Netflix & Apple TV Styled Fluid Selection Buttons */}
                          <div className="flex items-center gap-2.5 pt-1.5">
                            <button
                              id="hero-play-btn"
                              onClick={() => handleOpenMovie(jellyfinHeroMovie, true)}
                              className="group flex items-center justify-center gap-1.5 sm:gap-2 bg-white hover:bg-neutral-100 text-stone-950 font-sans font-black px-4.5 py-2.5 sm:px-8 sm:py-3.5 rounded-full text-[10.5px] sm:text-xs md:text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] hover:scale-103 active:scale-95 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-stone-950 group-hover:scale-110 transition-transform duration-250" />
                              Regarder
                            </button>

                            <button
                              id="hero-info-btn"
                              onClick={() => handleOpenMovie(jellyfinHeroMovie, false)}
                              className="group flex items-center justify-center gap-1.5 sm:gap-2 bg-transparent hover:bg-white/10 border border-white/40 hover:border-white text-white font-sans font-black px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-full text-[10.5px] sm:text-xs md:text-sm tracking-widest uppercase transition-all duration-300 hover:scale-102 active:scale-95 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:scale-110 transition-transform duration-250" />
                              Plus d'infos
                            </button>
                          </div>
                        </motion.div>

                      </div>

                    </motion.div>
                  </AnimatePresence>

                  {/* Carousel Dots Navigation Indicator at the bottom center */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-1.5 bg-stone-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-lg">
                    {jellyfinHeroMovies.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDirection(idx > currentHeroIndex ? 1 : -1);
                          setCurrentHeroIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentHeroIndex 
                            ? "w-4 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] shadow-[0_0_10px_rgba(252,246,186,0.8)]" 
                            : "w-1.5 bg-zinc-500/75 hover:bg-zinc-400"
                        }`}
                        title={`Aller au film ${idx + 1}`}
                        aria-label={`Aller au film ${idx + 1}`}
                      />
                    ))}
                  </div>

                </div>
              ) : null}
              
               {/* Collections Segment block - Horizontal Carousels grouped by Collection */}
              <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 pb-16">
                
                {/* Reprendre la lecture Section */}
                {history.some(id => progressData[id] > 0 && progressData[id] < 0.95) && (
                  <div className="space-y-4 text-left pt-6 sm:pt-8">
                    <div className="flex flex-row items-center sm:items-end justify-between gap-2 sm:gap-3 border-b border-zinc-900 pb-2 sm:pb-3">
                      <div className="space-y-0.5 max-w-[80%]">
                        <span className="text-[8px] sm:text-[9px] font-mono tracking-[2px] sm:tracking-[3px] text-amber-500 uppercase font-bold">
                          CONTINUE WATCHING
                        </span>
                        <h3 className="text-base sm:text-2xl font-cinzel font-bold text-white uppercase tracking-widest leading-tight truncate">
                          Resume Watching
                        </h3>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      {/* Optional Overlay Carousel Arrows */}
                      <div className="hidden sm:flex absolute inset-y-0 -left-6 items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <button
                          onClick={() => scrollCarousel('resume-lecture', "left")}
                          className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                          title="Previous"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="hidden sm:flex absolute inset-y-0 -right-6 items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <button
                          onClick={() => scrollCarousel('resume-lecture', "right")}
                          className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                          title="Next"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Horizontal movie items flex row with ultra-fast virtualization */}
                      <div
                        id={`carousel-container-resume-lecture`}
                        ref={(el) => {
                          carouselRefs.current['resume-lecture'] = el;
                        }}
                        className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4"
                      >
                        {history
                          .filter(id => progressData[id] > 0 && progressData[id] < 0.95)
                          .map(id => allMovies.find(m => m.id === id))
                          .filter((m): m is Movie => !!m)
                          .map((movie, idx) => (
                            <LazyVirtualCard key={`resume-${movie.id}-${idx}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                                progressPercent={progressData[movie.id]}
                              />
                            </LazyVirtualCard>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-left py-1 select-none">
                  <h2 className="font-cinzel font-bold text-[17px] sm:text-2xl tracking-[0.1em] sm:tracking-[0.22em] gold-metallic-text uppercase leading-none whitespace-nowrap">
                    THEMATIC LIBRARY
                  </h2>
                  <span className="block font-signature text-[18px] sm:text-[23px] text-[#f4ecd8] leading-none mt-1 filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
                    Sélections Cinémathèques
                  </span>
                </div>

                <div className="flex flex-col gap-6 sm:gap-8 divide-y divide-zinc-700/60">
                  {mappedCollections.map((collection, idx) => (
                    <div key={collection.id} className={`space-y-4 text-left ${idx > 0 ? "pt-6 sm:pt-8" : ""}`}>
                      {/* Collection Header with name and 'Voir Tout' button */}
                      <div className="flex flex-row items-center sm:items-end justify-between gap-2 sm:gap-3 border-b border-zinc-900 pb-2 sm:pb-3">
                        <div className="space-y-0.5 max-w-[80%]">
                          <span className="text-[8px] sm:text-[9px] font-mono tracking-[2px] sm:tracking-[3px] text-zinc-500 uppercase font-bold">
                            CINEMATIC COLLECTION • {collection.movies.length} MOVIES
                          </span>
                          <h3 className="text-base sm:text-2xl font-cinzel font-bold text-white uppercase tracking-widest leading-tight truncate">
                            {collection.title}
                          </h3>
                        </div>

                        <button
                          onClick={() => {
                            navigateTo("/collection-detail/" + collection.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="shrink-0 inline-flex items-center justify-center gap-1.5 text-[#e5c158] hover:text-white transition-all duration-200 sm:bg-[#BF953F]/5 sm:hover:bg-[#BF953F]/15 sm:border sm:border-[#BF953F]/40 sm:hover:border-[#FCF6BA]/60 sm:px-3.5 sm:py-1.5 sm:rounded-full cursor-pointer p-1.5 sm:p-0"
                        >
                          <span className="hidden sm:inline text-[10px] font-mono font-bold tracking-[1.5px] uppercase">
                            TOUT COMPRENDRE
                          </span>
                          <ChevronRight className="w-5 h-5 sm:w-3 sm:h-3" />
                        </button>
                      </div>

                      {/* Smooth Horizontal Carousel Row of Movies */}
                      <div 
                        className="relative group/carousel"
                        onMouseEnter={() => { hoveredCarousels.current[collection.id] = true; }}
                        onMouseLeave={() => { hoveredCarousels.current[collection.id] = false; }}
                      >
                        {/* Soft ambient mask on edges */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />

                        {/* Navigation chevron triggers */}
                        <div className="absolute inset-y-0 left-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <button
                            onClick={() => scrollCarousel(collection.id, "left")}
                            className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                            title="Previous"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="absolute inset-y-0 right-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <button
                            onClick={() => scrollCarousel(collection.id, "right")}
                            className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                            title="Next"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Horizontal movie items flex row with ultra-fast virtualization */}
                        <div
                          id={`carousel-container-${collection.id}`}
                          ref={(el) => {
                            carouselRefs.current[collection.id] = el;
                          }}
                          className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4"
                        >
                          {collection.movies.map((movie) => (
                            <LazyVirtualCard key={`${collection.id}-${movie.id}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                              />
                            </LazyVirtualCard>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* OTHER BANGERS Section */}
                {unmatchedMovies.length > 0 && (
                  <div className="space-y-4 text-left pt-6 sm:pt-8 border-t border-zinc-700/60 mt-8">
                    <div className="flex flex-row items-center sm:items-end justify-between gap-2 sm:gap-3 border-b border-zinc-900 pb-2 sm:pb-3">
                      <div className="space-y-0.5 max-w-[80%]">
                        <span className="text-[8px] sm:text-[9px] font-mono tracking-[2px] sm:tracking-[3px] text-zinc-500 uppercase font-bold">
                          UNCATEGORIZED • {unmatchedMovies.length} MOVIES
                        </span>
                        <h3 className="text-base sm:text-2xl font-cinzel font-bold text-white uppercase tracking-widest leading-tight truncate">
                          OTHER BANGERS
                        </h3>
                      </div>
                    </div>
                    
                    <div 
                      className="relative group/carousel"
                      onMouseEnter={() => { hoveredCarousels.current["other-bangers"] = true; }}
                      onMouseLeave={() => { hoveredCarousels.current["other-bangers"] = false; }}
                    >
                      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
                      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />
                      
                      <div className="absolute inset-y-0 left-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <button
                          onClick={() => scrollCarousel("other-bangers", "left")}
                          className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                          title="Previous"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="absolute inset-y-0 right-2 flex items-center z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <button
                          onClick={() => scrollCarousel("other-bangers", "right")}
                          className="bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-stone-200 hover:text-amber-400 p-2 rounded-full shadow-lg transition-all duration-150 pointer-events-auto active:scale-95 cursor-pointer"
                          title="Next"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div
                        id={`carousel-container-other-bangers`}
                        ref={(el) => {
                          carouselRefs.current["other-bangers"] = el;
                        }}
                        className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4"
                      >
                        {unmatchedMovies.map((movie) => (
                          <LazyVirtualCard key={`other-bangers-${movie.id}`}>
                            <MovieCard
                              movie={movie}
                              onSelect={(m) => handleOpenMovie(m, false)}
                              onPlay={(m) => handleOpenMovie(m, true)}
                            />
                          </LazyVirtualCard>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === "collections" ? (
            /* ========================================================== */
            /* VIEW B: COLLECTIONS INDEX GRID OVERVIEW (GRID VIEW)         */
            /* ========================================================== */
            <motion.div
              key="tab-collections"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-8 sm:py-8 space-y-8 sm:space-y-12"
            >
              <div className="text-left space-y-2 max-w-2xl">
                <p className="text-xs font-mono uppercase tracking-[3px] text-zinc-500">THEMATIC INDEXES</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-signature text-[#f4ecd8] leading-none filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
                  Collections
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
                  Découvrez nos dossiers exclusifs par réalisateur emblématique, sagas infinies, ou thèmes épiques qui ont redéfini l'histoire du cinéma mondial.
                </p>
              </div>

              {/* Collections Grid Layout cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-8 pt-2">
                {mappedCollections.map((c, i) => {
                  const representative = c.movies[0];
                  return (
                    <div 
                      id={`collection-folder-${c.id}`}
                      key={c.id}
                      className="relative overflow-hidden group bg-neutral-900/60 rounded-2xl border border-zinc-800/80 p-4 sm:p-8 flex flex-col justify-between gap-4 sm:gap-6 hover:border-amber-400/40 transition-all duration-300 text-left cursor-pointer"
                      onClick={() => {
                        navigateTo("/collection-detail/" + c.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {/* background gradient matching representative movie */}
                      <div className={`absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l ${representative.gradient} opacity-20 group-hover:opacity-40 blur-lg rounded-r-2xl transition-all duration-500 pointer-events-none`} />

                      <div className="space-y-2 sm:space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-mono font-medium tracking-widest text-amber-400 uppercase bg-black/40 border border-amber-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md">
                            {c.movies.length} MOVIES
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-2xl font-cinzel font-bold text-white tracking-widest uppercase transition-all duration-300">
                          {c.title}
                        </h3>

                        <p className="text-zinc-400 text-[10px] sm:text-sm leading-relaxed font-sans line-clamp-2 sm:line-clamp-3">
                          {c.description}
                        </p>
                      </div>

                      {/* Display movie list previews inside card folder */}
                      <div className="hidden sm:block relative z-10 pt-4 border-t border-zinc-800/60">
                        <p className="text-[10px] font-mono uppercase tracking-[2px] text-zinc-500 mb-3 font-semibold">Included in Collection:</p>
                        <div className="flex overflow-x-auto no-scrollbar flex-nowrap md:flex-wrap gap-2 pb-1 md:pb-0">
                          {c.movies.slice(0, 4).map((movie, idx) => (
                            <span 
                              key={`${movie.id}-prev-${idx}`}
                              className="whitespace-nowrap bg-black/40 hover:bg-neutral-800 text-zinc-300 text-[11px] font-mono px-2 py-1 rounded border border-zinc-800/70"
                            >
                              {movie.title}
                            </span>
                          ))}
                          {c.movies.length > 4 && (
                            <span className="whitespace-nowrap bg-amber-500/10 text-amber-400 text-[10px] font-mono font-extrabold px-2 py-1 rounded border border-amber-500/20">
                              + {c.movies.length - 4} ENCORE
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : activeTab === "collection-detail" ? (
            /* ========================================================== */
            /* VIEW D: COLLECTION DETAIL PAGE VIEW                        */
            /* ========================================================== */
            (() => {
              const selectedCollection = mappedCollections.find(c => c.id === selectedCollectionId) || mappedCollections[0];
              const bannerBg = COLLECTION_BANNERS[selectedCollection.id] || CLASSICO_ABSTRACT_BANNER;

              return (
                <motion.div
                  key={`collection-detail-${selectedCollection.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6 sm:space-y-10"
                >
                  {/* Top breadcrumb / navigation bar */}
                  <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-8 pt-4">
                    <button
                      id="back-to-collections"
                      onClick={() => {
                        navigateTo("/collections");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-400 hover:text-amber-400 group/back py-2 px-3 bg-neutral-900/40 rounded-full border border-zinc-800 hover:border-amber-400/20 transition-all duration-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-zinc-500 group-hover/back:text-amber-400 transition-colors transform group-hover/back:-translate-x-0.5" />
                      BACK TO COLLECTIONS
                    </button>
                  </div>

                  {/* Content and details wrapper */}
                  <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-2 sm:pt-6 flex flex-col items-center text-center gap-3 sm:gap-4">
                    <div className="w-full flex justify-start sm:hidden mb-1">
                      <button
                        onClick={() => {
                          navigateTo("/collections");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="p-1.5 -ml-1.5 bg-neutral-900/40 rounded-full border border-zinc-800 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>

                    <h1 className="text-xl sm:text-3xl md:text-4xl font-cinzel font-bold tracking-wider uppercase leading-snug text-white flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
                      <span className="text-amber-400 text-lg sm:text-2xl md:text-3xl">★</span>
                      <span className="max-w-full break-words">{selectedCollection.title}</span>
                      <span className="text-amber-400 text-lg sm:text-2xl md:text-3xl">★</span>
                    </h1>

                    <p className="text-zinc-200 text-[11px] sm:text-base max-w-3xl leading-relaxed font-sans drop-shadow-md">
                      {selectedCollection.description}
                    </p>
                  </div>

                  {/* Grid presentation of films nested inside this collection */}
                  <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-10 space-y-4 sm:space-y-6 mt-5 sm:mt-8">
                    <div className="border-t border-zinc-700/60 pt-4 sm:pt-6 text-left">
                      <h2 className="text-[13px] sm:text-base font-cinzel font-bold text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] truncate">
                        MOVIE CATALOG
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
                      {selectedCollection.movies.map((movie, idx) => (
                        <LazyVirtualCard key={`${movie.id}-detail-${idx}`}>
                          <MovieCard
                            movie={movie}
                            onSelect={(m) => handleOpenMovie(m, false)}
                            onPlay={(m) => handleOpenMovie(m, true)}
                          />
                        </LazyVirtualCard>
                      ))}
                    </div>
                  </div>

                </motion.div>
              );
            })()
          ) : activeTab === "movie" ? (
            <motion.div
              key="tab-movie-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeMovie ? (
                <MovieDetailView
                  movie={activeMovie}
                  onBack={() => navigateTo("/")}
                  onPlay={(id) => {
                    (window as any).moviePlayClickTime = performance.now();
                    console.log("%c[CHRONO LECTEUR] Clic sur le film : 0.000s (Début du flux via Détails)", "color: #a855f7; font-weight: bold; font-size: 13px;");
                    const prefetches = (window as any).playbackPrefetches || {};
                    prefetches[id] = fetch(`/api/playback/${encodeURIComponent(id)}`)
                      .then(res => {
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const ct = res.headers.get("content-type");
                        if (!ct || !ct.includes("application/json")) throw new Error("Not JSON");
                        return res.json();
                      })
                      .catch(err => {
                        console.warn("[PLAYBACK PREFETCH ERROR]", err);
                        return null;
                      });
                    (window as any).playbackPrefetches = prefetches;
                    navigateTo("/player/" + id);
                  }}
                  isBookmarked={watchlist.includes(activeMovie.id)}
                  onToggleBookmark={() => handleToggleWatchlist(activeMovie.id)}
                />
              ) : (
                <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                  <p className="text-zinc-400 font-mono">Loading movie data...</p>
                </div>
              )}
            </motion.div>
          ) : activeTab === "profil" ? (
            /* ========================================================== */
            /* VIEW C: MON PROFIL & WATCHLIST PERSISTENCE                   */
            /* ========================================================== */
            <motion.div
              key="tab-profil"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12"
            >
              
              {/* Profile Card Deck */}
              <div className="space-y-8 text-left">
                
                {/* Film Library & Watchlists */}
                <div className="space-y-8">
                  
                  {/* Watchlist Row displaying bookmarked films */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                      My Watchlist ({watchlist.length})
                    </h3>

                    {watchlist.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
                        {allMovies
                          .filter(m => watchlist.includes(m.id))
                          .map((movie, idx) => (
                            <LazyVirtualCard key={`${movie.id}-watchlist-${idx}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                              />
                            </LazyVirtualCard>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="py-12 bg-neutral-900/40 p-6 rounded-xl border border-dashed border-zinc-800 text-center space-y-3">
                        <p className="text-sm text-zinc-400">Your watchlist is empty right now.</p>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                          Click the "Add to my List" button or use the details view of any movie to save it here.
                        </p>
                        <button
                          onClick={() => setActiveTab("accueil")}
                          className="gold-button px-5 py-2.5 rounded-lg text-xs transition-transform hover:scale-103 active:scale-95 cursor-pointer"
                        >
                          EXPLORE HOME
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Watch History displaying viewed films */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                      <History className="w-4 h-4 text-zinc-400" />
                      Recently Viewed ({history.length})
                    </h3>

                    {history.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
                        {allMovies
                          .filter(m => history.includes(m.id))
                          .map((movie, idx) => (
                            <LazyVirtualCard key={`${movie.id}-history-${idx}`}>
                              <MovieCard
                                movie={movie}
                                onSelect={(m) => handleOpenMovie(m, false)}
                                onPlay={(m) => handleOpenMovie(m, true)}
                              />
                            </LazyVirtualCard>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 font-mono italic">No recent watch history available.</p>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          ) : null}

        </AnimatePresence>
      </main>

      {/* ========================================================== */}
      {/* 3. FOOTER SIGNATORIES                                      */}
      {/* ========================================================== */}
      <footer className="bg-neutral-950 border-t border-zinc-900 py-12 px-4 sm:px-8 text-center text-xs text-zinc-500 font-mono space-y-4">
        <div className="flex justify-center items-center gap-2 gold-metallic-text font-cinzel font-extrabold tracking-widest text-sm uppercase">
          CLASSICO
        </div>
        <p className="max-w-md mx-auto leading-relaxed text-[11px] text-zinc-400/80">
          CLASSICO is a streaming site dedicated to cult movies and legendary cinema collections. All images, metadata, and playback simulators are purely artistic and fictional.
        </p>
        <p className="text-zinc-600 font-sans tracking-wide text-[10px] pt-2">
          © {new Date().getFullYear()} CLASSICO Streaming Inc. • All rights reserved.
        </p>
      </footer>

      {/* ========================================================== */}
      {/* 4. DETAILS & VIDEO SIMULATION POPUP MODAL SCREEN           */}
      {/* ========================================================== */}
      <MovieModal
        movie={selectedMovie}
        onClose={() => {
          setSelectedMovie(null);
          const savedProgress = localStorage.getItem("classico_progress");
          if (savedProgress) {
            try {
              setProgressData(JSON.parse(savedProgress));
            } catch (e) {}
          }
        }}
        isBookmarked={selectedMovie ? watchlist.includes(selectedMovie.id) : false}
        onToggleBookmark={() => selectedMovie && handleToggleWatchlist(selectedMovie.id)}
      />



    </div>
  );
}
