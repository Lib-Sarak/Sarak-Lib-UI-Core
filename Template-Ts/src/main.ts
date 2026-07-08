import express from 'express';
import cors from 'cors';
import { settings } from './config/shared/settings.js';
import { router as apiRouter } from './api/routes.js';
import { loggingMiddleware, authMiddleware } from './api/middleware.js';
import { logger } from './utils/logger.js';
import { SecurityConfig } from './config/shared/types.js';

function createApp() {
    const app = express();

    const securityConfig = settings.GLOBAL_DEFAULTS.security as SecurityConfig | undefined;
    const allowedOrigins = securityConfig?.cors?.allowed_origins || ['*'];

    // 1. Configure CORS Middleware
    app.use(cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));

    // Parse JSON payloads
    app.use(express.json());

    // 2. Add custom middleware for request profiling
    app.use(loggingMiddleware);
    app.use(authMiddleware);

    // 3. Register endpoints
    app.use('/api', apiRouter);

    logger.info("Express Application successfully built and initialized.");
    return app;
}

const app = createApp();

if (require.main === module) {
    const host = settings.HOST;
    const port = settings.PORT;
    
    app.listen(port, host, () => {
        logger.info(`Starting express server on http://${host}:${port}`);
    });
}

export default app;
