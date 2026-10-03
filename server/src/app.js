const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const standingsRoutes = require('./routes/standingsRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();

// Behind a reverse proxy (Nginx, Heroku, Render, etc.) so rate limiting / secure
// cookies see the real client IP and protocol.
app.set('trust proxy', 1);

// --- Security middleware -------------------------------------------------
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"]
    }
  })
);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

// Same-origin requests (the Vercel deployment serves client + API from one domain) are
// always allowed; other origins must be listed in CORS_ORIGIN.
app.use(
  cors((req, callback) => {
    const origin = req.header('Origin');
    const sameOrigin = origin && origin === `${req.protocol}://${req.get('host')}`;
    const allowed = !origin || sameOrigin || allowedOrigins.includes(origin);
    callback(allowed ? null : new Error('Not allowed by CORS'), { origin: allowed, credentials: true });
  })
);

app.use(express.json({ limit: '10kb' })); // small limit: this API has no file uploads
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . from req.body/params/query to block NoSQL injection
app.use(hpp()); // prevents HTTP parameter pollution
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

app.use('/api', apiLimiter);

// --- Routes ----------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
