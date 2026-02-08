
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory persistent store
let siteSettings = {
  gemini_api_key: process.env.API_KEY || "••••••••",
  veo_api_key: process.env.API_KEY || "••••••••",
  is_maintenance: false
};

// Activity logs store (latest 100 entries)
let activityLogs = [];

const ADMIN_TOKEN = "admin-secure-session-root";

/**
 * Utility to add logs
 */
const addLog = (feature, prompt, status = 200) => {
  activityLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    feature: feature,
    prompt: prompt.length > 100 ? prompt.substring(0, 97) + "..." : prompt,
    status: status
  });
  if (activityLogs.length > 100) activityLogs.pop();
};

/**
 * Admin: Fetch Current System Settings
 */
app.get("/api/admin/settings", (req, res) => {
  res.json(siteSettings);
});

/**
 * Admin: Update System Settings
 */
app.post("/api/admin/settings", (req, res) => {
  const { newSettings } = req.body;
  siteSettings = { ...siteSettings, ...newSettings };
  res.json({ success: true });
});

/**
 * Admin: Fetch Activity Logs
 */
app.get("/api/admin/logs", (req, res) => {
  res.json(activityLogs);
});

/**
 * Client: Log Chat Activity (Frontend calls this since it uses SDK directly)
 */
app.post("/api/log-activity", (req, res) => {
  const { feature, prompt, status } = req.body;
  addLog(feature || "Chat", prompt || "N/A", status || 200);
  res.sendStatus(200);
});

/**
 * High-performance Video Generation Route
 */
app.post("/generate-video", async (req, res) => {
  const { prompt, aspect_ratio } = req.body;
  
  try {
    if (siteSettings.is_maintenance) {
      addLog("Video", prompt, 503);
      return res.status(503).json({ error: "Maintenance Mode" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: aspect_ratio || '16:9' }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoAsset = operation.response?.generatedVideos?.[0]?.video;
    addLog("Video", prompt, 200);
    res.json({ videoUrl: `${videoAsset.uri}&key=${process.env.API_KEY}` });

  } catch (error) {
    addLog("Video", prompt, 500);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NovaAI Backend active on port ${PORT}`));
