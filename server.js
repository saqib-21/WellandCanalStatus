const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Function to scrape a Seaway bridge page
async function scrapeBridgeStatus(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const fullText = $("body").text();
  const lines = fullText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l);

  let bridges = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(.+?)\s*\(Bridge\s*(\d+[A-Za-z]?)\)$/);
    if (match) {
      const name = match[1].trim() + " (Bridge " + match[2] + ")";
      const status = lines[i + 1] || "Unknown";
      bridges.push({ name, status });
    }
  }

  return bridges;
}

// Niagara bridges (St. Catharines / Thorold)
app.get("/api/bridges/niagara", async (req, res) => {
  try {
    const bridges = await scrapeBridgeStatus(
      "https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgeSCT"
    );
    res.json({ bridges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Port Colborne bridges
app.get("/api/bridges/portcolborne", async (req, res) => {
  try {
    const bridges = await scrapeBridgeStatus(
      "https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgePC"
    );
    res.json({ bridges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Combined (Niagara + Port Colborne)
app.get("/api/bridges", async (req, res) => {
  try {
    const [niagara, portColborne] = await Promise.all([
      scrapeBridgeStatus("https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgeSCT"),
      scrapeBridgeStatus("https://seaway-greatlakes.com/bridgestatus/detailsnai?key=BridgePC"),
    ]);

    res.json({ bridges: [...niagara, ...portColborne] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
