const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /import React.*?Chevrif \('scrollRestoration' in history\) \{/s;

const goodTop = `import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Play, Film, Info, Heart, Award, 
  ChevronLeft, ChevronRight, ChevronDown, User, Tv, Clock, 
  Sparkles, History, Compass, FilmIcon, BookmarkCheck,
  Star, CheckCircle, AlertCircle, RefreshCw, X, Shield, Menu, Settings, Loader2
} from "lucide-react";

import { Movie, Collection } from "./data";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import MovieDetailView from "./components/MovieDetailView";
import CinemaPlayerView from "./components/CinemaPlayerView";
import ErrorBoundary from "./components/ErrorBoundary";
import LazyVirtualCard from "./components/LazyVirtualCard";
import HeroSkeleton from "./components/HeroSkeleton";

if ('scrollRestoration' in history) {`;

content = content.replace(regex, goodTop);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched successfully.");

