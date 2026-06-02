const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/expenseRoutes');
const requestLogger = require('./middleware/requestLogger');
const apiNotFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  const publicPath = path.join(__dirname, '..', 'public');

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use('/api', apiRoutes);
  app.use('/api', apiNotFound);

  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
