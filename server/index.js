require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL, // set this in Render env vars if deploying separately
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// ── API Routes ────────────────────────────────────────
const questionsRouter = require('./routes/questions');
const daysRouter      = require('./routes/days');
const seedRouter      = require('./routes/seed');

app.use('/api/questions', questionsRouter);
app.use('/api/days',      daysRouter);
app.use('/api/seed',      seedRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DSA Tracker API is running',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ── Serve React build in production ──────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuild));
  // Catch-all: return React app for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// ── MongoDB + Start ───────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-tracker')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
