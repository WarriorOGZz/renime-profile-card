import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const VIEWS_FILE = path.join(process.cwd(), "views.json");

function getViewsCount(): number {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      const data = fs.readFileSync(VIEWS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return typeof parsed.views === "number" ? parsed.views : 0;
    }
  } catch (error) {
    console.error("Error reading views.json:", error);
  }
  return 1024; // Start with a premium initial value if no file exists
}

function saveViewsCount(count: number) {
  try {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify({ views: count }), "utf-8");
  } catch (error) {
    console.error("Error saving views.json:", error);
  }
}

const STAGING_URL = "https://profile.renime.top";

const STATIC_DISCORD_FALLBACK = {
  id: "1186206505658220597",
  username: "0itzdark",
  global_name: "Dark",
  discriminator: "0",
  avatar: "5b78b6d180f47a8c98a75d75c2960884",
  banner: null,
  accent_color: 10066329,
  public_flags: 64,
  premium_type: 0,
  bot: false,
  avatar_decoration_data: {
    asset: "a_29662829c08c8d55d1614a24fff424cc",
    sku_id: "1341506443659968512",
    expires_at: null
  }
};

const STATIC_PRESENCE_FALLBACK = {
  status: "offline",
  activities: [],
  listening_to_spotify: false,
  spotify: null,
  active: false,
  updated_at: new Date().toISOString(),
  last_seen: "2026-09-21T04:17:23.474Z",
  source: "bot-gateway"
};

app.get("/api/views", (req, res) => {
  const views = getViewsCount();
  res.json({ views });
});

app.post("/api/views", (req, res) => {
  let views = getViewsCount();
  views += 1;
  saveViewsCount(views);
  res.json({ views });
});

app.get("/api/discord", async (req, res) => {
  const userId = req.query.id || "1186206505658220597";
  try {
    const response = await fetch(`${STAGING_URL}/api/discord?id=${userId}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (error) {
    console.warn("Failed to proxy /api/discord, falling back to cache:", error);
  }
  res.json(STATIC_DISCORD_FALLBACK);
});

app.get("/api/discord/presence", async (req, res) => {
  const userId = req.query.id || "1186206505658220597";
  try {
    const response = await fetch(`${STAGING_URL}/api/discord/presence?id=${userId}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (error) {
    console.warn("Failed to proxy /api/discord/presence, falling back to cache:", error);
  }
  res.json(STATIC_PRESENCE_FALLBACK);
});

app.get("/api/discord/guild", async (req, res) => {
  const guildId = req.query.id;
  if (!guildId) {
    return res.status(400).json({ error: "Missing guild ID" });
  }
  try {
    const response = await fetch(`${STAGING_URL}/api/discord/guild?id=${guildId}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (error) {
    console.warn("Failed to proxy /api/discord/guild:", error);
  }
  res.status(502).json({ error: "Guild data unavailable" });
});

app.get("/api/discord/last-seen", async (req, res) => {
  try {
    const response = await fetch(`${STAGING_URL}/api/discord/last-seen`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (error) {
    console.warn("Failed to proxy /api/discord/last-seen, falling back:", error);
  }
  res.json({ last_seen: STATIC_PRESENCE_FALLBACK.last_seen });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
