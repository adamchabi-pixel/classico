import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add import
import_str = 'import { get, set } from "idb-keyval";\n'
if "idb-keyval" not in content:
    content = content.replace('import React, { useState, useEffect, useRef } from "react";', 'import React, { useState, useEffect, useRef } from "react";\n' + import_str)

# Replace useState
old_state = """  const [jellyfinMovies, setJellyfinMovies] = useState<Movie[]>(() => {
    try {
      const cached = localStorage.getItem("classico_movies_cache");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });"""
new_state = """  const [jellyfinMovies, setJellyfinMovies] = useState<Movie[]>([]);

  useEffect(() => {
    get("classico_movies_cache").then((val) => {
      if (val && Array.isArray(val) && val.length > 0) {
        setJellyfinMovies((prev) => prev.length === 0 ? val : prev);
      }
    }).catch(e => console.warn("IDB cache load failed:", e));
  }, []);"""

content = content.replace(old_state, new_state)

# Replace saving
old_save = 'try { localStorage.setItem("classico_movies_cache", JSON.stringify(libData.movies || [])); } catch(e) {}'
new_save = 'try { set("classico_movies_cache", libData.movies || []); } catch(e) {}'
content = content.replace(old_save, new_save)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
