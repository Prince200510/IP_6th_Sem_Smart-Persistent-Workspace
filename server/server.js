const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Note = require('./models/Note');
const StateManager = require('./classes/StateManager');
const RecommendationEngine = require('./classes/RecommendationEngine');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    'http://ip-oops-js.vercel.app',
    'https://ip-oops-js.vercel.app',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:3000'
  ],
  credentials: true
}));

mongoose.connect('mongodb+srv://princeco10673_db_user:V3BW2Z9uv7gwJ1Df@cluster0.7qmpovd.mongodb.net/?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const JWT_SECRET = 'a8f3c9e7b2d14f6a9c5e8b1d3f7a2c6e4b9d0f1a7c3e5b2d8f6a1c9e4b7d3f2';
const stateManager = new StateManager(Note);
const recommendationEngine = new RecommendationEngine(Note);

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, username, password, phone, city, country } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: 'Name, email, username, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with that email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      phone,
      city,
      country
    });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        city: user.city,
        country: user.country
      }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'An account with that email or username already exists' });
    }

    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res.json({ token, username: user.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

app.post('/state/save', authMiddleware, async (req, res) => {
  try {
    await stateManager.saveState(req.userId, req.body.notes);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save state' });
  }
});

app.get('/state/load', authMiddleware, async (req, res) => {
  try {
    const notes = await stateManager.loadState(req.userId);
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load state' });
  }
});

app.post('/state/snapshot', authMiddleware, async (req, res) => {
  try {
    const { state, sessionId, label } = req.body;
    const result = await stateManager.saveSnapshot(req.userId, state, sessionId, label);
    res.json({ success: true, version: result.version });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
});

app.get('/state/versions', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const versions = await stateManager.getVersionHistory(req.userId, limit);
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load version history' });
  }
});

app.post('/state/restore', authMiddleware, async (req, res) => {
  try {
    const { version } = req.body;
    const snapshot = await stateManager.restoreVersion(req.userId, version);
    if (!snapshot) return res.status(404).json({ error: 'Version not found' });
    res.json({ success: true, state: snapshot });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

app.get('/state/crash-check/:sessionId', authMiddleware, async (req, res) => {
  try {
    const crashed = await stateManager.checkCrash(req.userId, req.params.sessionId);
    res.json({ crashed: !!crashed, data: crashed });
  } catch (err) {
    res.status(500).json({ error: 'Crash check failed' });
  }
});

app.post('/state/clean-exit', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    await stateManager.markCleanExit(req.userId, sessionId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark clean exit' });
  }
});

app.get('/notes/search', authMiddleware, async (req, res) => {
  try {
    const results = await recommendationEngine.rankAndSearch(req.userId, req.query.q || '');
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/notes/recommend', authMiddleware, async (req, res) => {
  try {
    const recommendations = await recommendationEngine.recommend(req.userId);
    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: 'Recommendation failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
