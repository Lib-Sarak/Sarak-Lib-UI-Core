"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const settings_1 = require("./config/shared/settings");
const routes_1 = require("./api/routes");
const middleware_1 = require("./api/middleware");
const logger_1 = require("./utils/logger");
function createApp() {
    const app = (0, express_1.default)();
    // 1. Configure CORS Middleware
    app.use((0, cors_1.default)({
        origin: '*', // Restrict this in production to matching frontend domains
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));
    // Parse JSON payloads
    app.use(express_1.default.json());
    // 2. Add custom middleware for request profiling
    app.use(middleware_1.loggingMiddleware);
    // 3. Register endpoints
    app.use('/api', routes_1.router);
    logger_1.logger.info("Express Application successfully built and initialized.");
    return app;
}
const app = createApp();
if (require.main === module) {
    const host = settings_1.settings.HOST;
    const port = settings_1.settings.PORT;
    app.listen(port, host, () => {
        logger_1.logger.info(`Starting express server on http://${host}:${port}`);
    });
}
exports.default = app;
