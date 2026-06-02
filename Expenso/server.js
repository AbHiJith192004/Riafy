const createApp = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  logger.info('Expense Tracker server started', {
    url: `http://localhost:${PORT}`,
    port: Number(PORT),
    environment: process.env.NODE_ENV || 'development'
  });
});
