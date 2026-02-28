// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/config', require('./routes/gameConfig'));

// Root API info
app.get('/api', (_req, res) => res.json({
  app: 'Scavenger Hunt API',
  ...
}));

// Health-check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
