"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = loggingMiddleware;
const logger_1 = require("../utils/logger");
function loggingMiddleware(req, res, next) {
    const startTime = Date.now();
    logger_1.logger.info(`Incoming Request: ${req.method} ${req.path}`);
    // Intercept response finish to log duration
    res.on('finish', () => {
        const processTime = (Date.now() - startTime) / 1000;
        logger_1.logger.info(`Completed Request: ${req.method} ${req.path} ` +
            `| Status: ${res.statusCode} | Duration: ${processTime.toFixed(4)}s`);
    });
    next();
}
