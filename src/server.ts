import mongoose from 'mongoose';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import config from './config/index';
import logger from './utils/logger';
import correlation from './middlewares/correlationId';
import encryptionMiddleware from './middlewares/encryption';
import corsMiddleware from "./middlewares/cors";
 // Routes
import routes from "./routes/index";
import { startAllCrons } from './cron';

const app = express();
app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '2mb' }));
app.use(encryptionMiddleware(config));
app.use(correlation);

app.use((req: Request, res: Response, next: NextFunction) => {
  const cid = (req as any).correlationId || res.locals.correlationId;
  logger.info(`${req.method} ${req.path}`, { meta: { correlationId: cid, ip: req.ip } });
  next();
});


app.use('/', routes);
const port = config.port || 5000;

// connect to mongo then start
mongoose.connect(config.db.uri)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`gojo backend expansion on port ${port} (env=${config.env})`);
      logger.info('Server started', { meta: { env: config.env } });
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

export default app;
