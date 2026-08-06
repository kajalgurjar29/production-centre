const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { allowedOrigins, nodeEnv } = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// CSP off: the admin panel is a static multi-page site built with inline
// onclick handlers and CDN <script> tags (Chart.js, iconify) — helmet's
// default script-src 'self' blocks both, which breaks it outright.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'admin-panel')));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
