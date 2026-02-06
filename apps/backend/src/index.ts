import express, { type Application } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';

const app: Application = express();
const PORT = process.env.BACKEND_PORT || 4291;



const allowedOrigins = new Set(
  (process.env.FRONTEND_URL ??
    'http://localhost:3847')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl/Postman/mobile apps) and same-origin requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true, // needed for cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Rate limiting (basic abuse protection). Tune limits as needed.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300, // per IP, per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);


app.use(express.json());

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log(`📨 Cookies:`, req.headers.cookie || 'none');
  next();
});

// Mount all API routes
app.use('/api', routes);

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running at http://localhost:${PORT}\n`);
  console.log('Available API endpoints:');
  console.log('  Auth:');
  console.log('    POST   /api/auth/login');
  console.log('  Sponsors:');
  console.log('    GET    /api/sponsors');
  console.log('    GET    /api/sponsors/:id');
  console.log('    POST   /api/sponsors');
  console.log('  Publishers:');
  console.log('    GET    /api/publishers');
  console.log('    GET    /api/publishers/:id');
  console.log('  Campaigns:');
  console.log('    GET    /api/campaigns');
  console.log('    GET    /api/campaigns/:id');
  console.log('    POST   /api/campaigns');
  console.log('  Ad Slots:');
  console.log('    GET    /api/ad-slots');
  console.log('    GET    /api/ad-slots/:id');
  console.log('    POST   /api/ad-slots');
  console.log('  Placements:');
  console.log('    GET    /api/placements');
  console.log('    POST   /api/placements');
  console.log('  Dashboard:');
  console.log('    GET    /api/dashboard/stats');
  console.log('  Health:');
  console.log('    GET    /api/health');
  console.log('');
});

export default app;
