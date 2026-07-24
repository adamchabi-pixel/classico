const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const popstateHook = `
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setRoutePath(path);
      if (path === "/") setActiveTab("accueil");
      else if (path === "/collections") setActiveTab("collections");
      else if (path === "/profil") setActiveTab("profil");
      else if (path.startsWith("/collection/")) {
        setSelectedCollectionId(path.split("/")[2]);
        setActiveTab("collection-detail");
      }
      else if (path.startsWith("/player/")) {
        setActiveTab("player");
      }
      else if (path.startsWith("/movie/")) {
        setActiveTab("movie");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
`;

code = code.replace(
  /const loadJellyfinLibrary = async \(\) => \{\};/,
  `${popstateHook}\n  const loadJellyfinLibrary = async () => {};`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx for popstate");
