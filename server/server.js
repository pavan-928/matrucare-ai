const path = require('path');
// Always load server/.env, no matter which folder the command is run from.
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const { verifyEmailConfig } = require('./services/emailService');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const contactRoutes = require('./routes/contactRoutes');

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

// Needed on Render/Railway so secure cookies and rate limiting see the real client IP.
app.set('trust proxy', 1);

app.use(helmet());

// CORS: only the configured frontend origin(s) may call the API with cookies.
const allowedOrigins = process.env.CLIENT_URL.split(',').map((o) => o.trim().replace(/\/$/, ''));
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (no Origin header) and whitelisted origins.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Slow down brute-force attempts on login / OTP endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hackathon', hackathonRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
    verifyEmailConfig();
  });
});
