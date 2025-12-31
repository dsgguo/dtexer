import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration from Environment Variables
const HIDDEN_API_BASE = process.env.HIDDEN_API_BASE || 'https://api.openai.com/v1';
const HIDDEN_API_KEY = process.env.HIDDEN_API_KEY; // The real API Key
const HIDDEN_MODEL = process.env.HIDDEN_MODEL || 'gpt-4o';
const APP_ACCESS_SECRET = process.env.APP_ACCESS_SECRET; // The key user needs to provide

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large images

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy Endpoint
app.post('/api/proxy/chat/completions', async (req, res) => {
  const userAccessKey = req.headers['x-dtexer-access-key'];

  // 1. Verify Access Key
  if (!APP_ACCESS_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: APP_ACCESS_SECRET not set' });
  }

  if (userAccessKey !== APP_ACCESS_SECRET) {
    return res.status(401).json({ error: 'Invalid Access Key' });
  }

  // 2. Construct Payload for Real API
  // We trust the structure from the frontend, but we overwrite the model if needed 
  // or allow the frontend to specify it if compatible. 
  // For security, let's force the hidden model or pass through.
  const payload = { ...req.body };
  if (!payload.model) payload.model = HIDDEN_MODEL;

  try {
    const response = await axios.post(
      `${HIDDEN_API_BASE}/chat/completions`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HIDDEN_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch from AI provider' });
  }
});

// Fallback for SPA routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Environment check:');
  console.log('- HIDDEN_API_BASE:', HIDDEN_API_BASE);
  console.log('- APP_ACCESS_SECRET:', APP_ACCESS_SECRET ? 'Set' : 'Not Set');
  console.log('- HIDDEN_API_KEY:', HIDDEN_API_KEY ? 'Set' : 'Not Set');
});
