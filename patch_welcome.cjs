const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [showWelcomeModal, setShowWelcomeModal] = useState(false);`;
const replacement = `  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("classico_welcome_shown")) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);`;

content = content.replace(target, replacement);

const target2 = `  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeModal(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);`;

content = content.replace(target2, "");

// And when they click "Got it!" we should set the item
const target3 = `                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-3.5 bg-amber-500`;
const replacement3 = `                onClick={() => { setShowWelcomeModal(false); localStorage.setItem("classico_welcome_shown", "true"); }}
                className="w-full py-3.5 bg-amber-500`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/App.tsx', content);
