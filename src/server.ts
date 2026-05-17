import mongoose from "mongoose";
import express, {
  Request,
  Response,
  NextFunction,
} from "express";

import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";

import config from "./config/index";
import logger from "./utils/logger";

import correlation from "./middlewares/correlationId";
import encryptionMiddleware from "./middlewares/encryption";
import corsMiddleware from "./middlewares/cors";

import routes from "./routes/index";

const app = express();

app.use(helmet());

app.use(corsMiddleware);

app.use(hpp());

app.use(mongoSanitize({ replaceWith: "_", }));

app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * Body Parser
 */
app.use(
  bodyParser.json({
    limit: "2mb",
  })
);

/**
 * Encryption Middleware
 */
app.use(encryptionMiddleware(config));

/**
 * Correlation ID
 */
app.use(correlation);

/**
 * Request Logger
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const cid = (req as any).correlationId || res.locals.correlationId;

  logger.info(`${req.method} ${req.path}`, {
    meta: {
      correlationId: cid,
      ip: req.ip,
    },
  });

  next();
}
);

/**
 * Routes
 */
app.use("/", routes);

const port = config.port || 5000;

mongoose
  .connect(config.db.uri)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`gojo backend expansion on port ${port} (env=${config.env})`);

      logger.info("Server started", {
        meta: {
          env: config.env,
        },
      });
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);

    process.exit(1);
  });

export default app;