import { Router, Request, Response } from 'express';
import { ChatRequest } from '../config/shared/types.js';
import { agentEngine } from '../core/agent_engine.js';
import { loadAgentAssets } from '../utils/file_loader.js';
import { logger } from '../utils/logger.js';
import { ConfigurationError, AgentNotFoundError } from '../utils/errors.js';
import { rateLimiter } from './middleware.js';

export const router = Router();

router.post('/chat', rateLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
        const requestData: ChatRequest = req.body;

        if (!requestData || !requestData.sessionId || !requestData.message) {
            res.status(400).json({ detail: "Missing required fields: 'sessionId' and 'message'." });
            return;
        }

        const telemetry = {
            ip: req.ip,
            user_agent: req.headers['user-agent'],
            referer: req.headers['referer'],
            accept_language: req.headers['accept-language']
        };

        requestData.metadata = { ...telemetry, ...(requestData.metadata || {}) };

        const response = await agentEngine.processMessage(requestData);
        res.json(response);
    } catch (error: any) {
        if (error.name === "SecurityViolationError") {
            logger.warn(`Security violation rejected: ${error.message}`);
            res.status(400).json({ detail: error.message });
        } else if (error instanceof AgentNotFoundError) {
            logger.error(`Agent directory/files missing: ${error.message}`);
            res.status(404).json({ detail: error.message });
        } else if (error instanceof ConfigurationError) {
            logger.error(`Validation error in chat request: ${error.message}`);
            res.status(400).json({ detail: error.message });
        } else {
            logger.error(`Unhandled server error in chat endpoint: ${error.message}`);
            res.status(500).json({ detail: "Internal server error occurred." });
        }
    }
});

router.get('/config', (req: Request, res: Response): void => {
    try {
        const agentId = req.query.agentId as string;
        if (!agentId) {
            res.status(400).json({ detail: "Missing 'agentId' query parameter." });
            return;
        }

        const [config, identity, knowledge, workflow, manifest] = loadAgentAssets(agentId);
        
        if (!manifest) {
            res.status(404).json({ detail: `UI Manifest for agent '${agentId}' is empty or not found.` });
            return;
        }
        
        res.json(manifest);
    } catch (error: any) {
        if (error instanceof AgentNotFoundError) {
            logger.error(`Config path not found: ${error.message}`);
            res.status(404).json({ detail: error.message });
        } else if (error instanceof ConfigurationError) {
            logger.error(`Configuration error: ${error.message}`);
            res.status(400).json({ detail: error.message });
        } else {
            logger.error(`Unhandled error in config endpoint: ${error.message}`);
            res.status(500).json({ detail: "Internal server error occurred." });
        }
    }
});

router.get('/health', (req: Request, res: Response): void => {
    res.json({ status: "healthy", service: "AI Agent Factory Engine" });
});
