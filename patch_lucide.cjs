const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(
  /import { Plus, Play, ChevronDown, Award, Users, Film, ArrowLeft, Star, Clock, Heart, X, User } from "lucide-react";/,
  'import { Plus, Play, ChevronDown, Award, Users, Film, ArrowLeft, Star, Clock, Heart, X, User, ChevronLeft, ChevronRight } from "lucide-react";'
);

code = code.replace(
  />&lt;<\/button>/,
  '><ChevronLeft className="w-5 h-5" /></button>'
);
code = code.replace(
  />&gt;<\/button>/,
  '><ChevronRight className="w-5 h-5" /></button>'
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched Lucide");
