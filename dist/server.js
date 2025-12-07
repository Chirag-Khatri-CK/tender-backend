"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = __importDefault(require("./config/index"));
const logger_1 = __importDefault(require("./utils/logger"));
const correlationId_1 = __importDefault(require("./middlewares/correlationId"));
const encryption_1 = __importDefault(require("./middlewares/encryption"));
// Routes
const index_2 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: '2mb' }));
app.use((0, encryption_1.default)(index_1.default));
app.use(correlationId_1.default);
app.use((req, res, next) => {
    const cid = req.correlationId || res.locals.correlationId;
    logger_1.default.info(`${req.method} ${req.path}`, { meta: { correlationId: cid, ip: req.ip } });
    next();
});
app.use('/', index_2.default);
const port = index_1.default.port || 5000;
// connect to mongo then start
mongoose_1.default.connect(index_1.default.db.uri)
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`gojo backend expansion on port ${port} (env=${index_1.default.env})`);
        logger_1.default.info('Server started', { meta: { env: index_1.default.env } });
    });
})
    .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
exports.default = app;
