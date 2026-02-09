// Mock API server for dashboard data
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use('/stickers', express.static('/Users/tim/.openclaw/workspace/media/stickers'));

// API endpoint to get quest stats
app.get('/api/quests', async (req, res) => {
  try {
    const questsData = await fs.readFile('/Users/tim/.openclaw/workspace/memory/quests.json', 'utf8');
    res.json(JSON.parse(questsData));
  } catch (error) {
    console.error('Error reading quests.json:', error);
    res.status(500).json({ error: 'Failed to read quests data' });
  }
});

// API endpoint to get health status
app.get('/api/health', async (req, res) => {
  try {
    const healthData = await fs.readFile('/Users/tim/.openclaw/workspace/memory/heartbeat-state.json', 'utf8');
    res.json(JSON.parse(healthData));
  } catch (error) {
    console.error('Error reading heartbeat-state.json:', error);
    res.status(500).json({ error: 'Failed to read health data' });
  }
});

// API endpoint to get moltbook karma
app.get('/api/karma', async (req, res) => {
  try {
    const healthData = await fs.readFile('/Users/tim/.openclaw/workspace/memory/heartbeat-state.json', 'utf8');
    const health = JSON.parse(healthData);
    res.json({ karma: health.last_moltbook_karma || 0 });
  } catch (error) {
    console.error('Error reading karma data:', error);
    res.status(500).json({ error: 'Failed to read karma data' });
  }
});

// API endpoint to list stickers
app.get('/api/stickers', async (req, res) => {
  try {
    // Read sticker files from the directory
    const stickerDir = '/Users/tim/.openclaw/workspace/media/stickers/';
    const files = await fs.readdir(stickerDir);
    
    const stickers = files
      .filter(file => /\.(gif|png|jpg|jpeg)$/i.test(file))
      .map((file, index) => ({
        id: index + 1,
        name: file.replace(/\.[^/.]+$/, ""), // Remove extension for name
        filename: file,
        url: `/stickers/${file}`
      }));
    
    res.json(stickers);
  } catch (error) {
    console.error('Error reading stickers:', error);
    res.status(500).json({ error: 'Failed to read stickers' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});