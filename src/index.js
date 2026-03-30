require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const transactionsRoutes = require('./routes/transactions');
const complaintsRoutes = require('./routes/complaints');
const alertsRoutes = require('./routes/alerts');
const agentsRoutes = require('./routes/agents');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/v1/auth', authRoutes);
app.use('/v1/profile', profileRoutes);
app.use('/v1/dashboard', dashboardRoutes);
app.use('/v1/transactions', transactionsRoutes);
app.use('/v1/complaints', complaintsRoutes);
app.use('/v1/alerts', alertsRoutes);
app.use('/v1/agents', agentsRoutes);
app.use('/v1/ai', aiRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SafeNest API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅  Database connected');
    await sequelize.sync({ force: false });
    console.log('✅  Models synced');

    app.listen(PORT, () => {
      console.log(`\n🚀  SafeNest API running on http://localhost:${PORT}`);
      console.log(`📱  Mobile (emulator) → http://10.0.2.2:${PORT}`);
      console.log(`📋  Health check      → http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
  }
}

start();
