const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const badChunkStart = `onLeft, ChevronRight, ChevronDown, User, Tv, Clock, 
  Sparkles, History, Compass, FilmIcon, BookmarkCheck,
  Star, CheckCircle, AlertCircle, RefreshCw, X, Shield, Menu, Settings, Loader2
} from "lucide-react";`;

if (content.includes(badChunkStart)) {
    console.log("Found bad chunk start");
} else {
    console.log("Not exactly matched");
}
