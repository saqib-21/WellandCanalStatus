// server.js (CommonJS)
const express = require("express");
const fetch = require("node-fetch");         
const cheerio = require("cheerio");
const path = require("path");


const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory cache (reduce scraping load)
const cache = {
  niagara: { data: null, ts: 0 },
  portcolborne: { data: null, ts: 0 },
};
const TTL_MS = 20 * 1000; // 20s cache

async function scrapeBridgeStatus(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html,application/xhtml+xml",
    },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Parse visible text lines and pair "Name (Bridge N)" with the next line as status
  const lines = $("body")
    .text()
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

  const bridges = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(.+?)\s*\(Bridge\s*([0-9]+[A-Za-z]?)\)$/);
    if (m) {
      const name = `${m[1].trim()} (Bridge ${m[2]})`;
      const status = lines[i + 1] || "Unknown";
      bridges.push({ name, status });
    }
  }
  return bridges;
}

async function getCached(key, url) {
  const now = Date.now();
  if (cache[key].data && now - cache[key].ts < TTL_MS) {
    return cache[key].data;
  }
  const data = await scrapeBridgeStatus(url);
  cache[key] = { data, ts: now };
  return data;
}

// Niagara (St. Catharines / Thorold)
app.get("/api/bridges/niagara", async (req, res) => {
  try {
    const bridges = await getCached(
      "niagara",
      "https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgeSCT"
    );
    res.json({ bridges });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Port Colborne
app.get("/api/bridges/portcolborne", async (req, res) => {
  try {
    const bridges = await getCached(
      "portcolborne",
      "https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgePC"
    );
    res.json({ bridges });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Combined
app.get("/api/bridges", async (req, res) => {
  try {
    const [n, p] = await Promise.all([
      getCached("niagara", "https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgeSCT"),
      getCached("portcolborne", "https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgePC"),
    ]);
    res.json({ bridges: [...n, ...p] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get("/healthz", (_req, res) => res.send("ok"));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
