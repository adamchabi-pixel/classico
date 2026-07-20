const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const imports = `import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Play, Film, Info, Heart, Award, ChevronLeft, ChevronRight, ChevronDown, User, Tv, Clock, Sparkles, History, Compass, FilmIcon, BookmarkCheck, Star, CheckCircle, AlertCircle, RefreshCw, X, Shield, Menu, Settings, Loader2 } from "lucide-react";
import { Movie, Collection, COLLECTIONS as RAW_COLLECTIONS } from "./data";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import MovieDetailView from "./components/MovieDetailView";
import CinemaPlayerView from "./components/CinemaPlayerView";
import ErrorBoundary from "./components/ErrorBoundary";
import LazyVirtualCard from "./components/LazyVirtualCard";
import HeroSkeleton from "./components/HeroSkeleton";

const COLLECTIONS: Collection[] = [...RAW_COLLECTIONS];
`;

content = content.replace(/import React.*?from "motion\/react";\n/s, imports);
fs.writeFileSync('src/App.tsx', content);
