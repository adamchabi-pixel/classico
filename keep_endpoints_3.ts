app.get("/api/wishlist", (req, res) => {
  try {
    const DB_PATH = path.join(process.cwd(), "wishlist_requests.json");
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      return res.json({ success: true, requests: data });
    }
  } catch(e) {}
  res.json({ success: true, requests: [] });
});

app.post("/api/wishlist/add", express.json(), (req, res) => {
  try {
    const newReq = req.body;
    const DB_PATH = path.join(process.cwd(), "wishlist_requests.json");
    let existing = [];
    if (fs.existsSync(DB_PATH)) {
      try { existing = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); } catch(e) {}
    }
    if (!existing.some(r => String(r.id) === String(newReq.id))) {
      existing.push(newReq);
      fs.writeFileSync(DB_PATH, JSON.stringify(existing, null, 2));
    }
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/wishlist/remove", express.json(), (req, res) => {
  try {
    const { id } = req.body;
    const DB_PATH = path.join(process.cwd(), "wishlist_requests.json");
    if (fs.existsSync(DB_PATH)) {
      let existing = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      existing = existing.filter(r => String(r.id) !== String(id));
      fs.writeFileSync(DB_PATH, JSON.stringify(existing, null, 2));
    }
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------
// JELLYFIN SECURE BACKEND API ENDPOINTS
// ------------------------------------------------------------------

// 1. Get current connection status (Without leaking the sensitive API key!)
