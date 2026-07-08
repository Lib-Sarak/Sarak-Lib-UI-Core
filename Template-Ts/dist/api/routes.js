"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const agent_engine_1 = require("../core/agent_engine");
const file_loader_1 = require("../utils/file_loader");
const logger_1 = require("../utils/logger");
exports.router = (0, express_1.Router)();
exports.router.post('/chat', async (req, res) => {
    try {
        const requestData = req.body;
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
        const response = await agent_engine_1.agentEngine.processMessage(requestData);
        res.json(response);
    }
    catch (error) {
        if (error.message && error.message.includes("not found")) {
            logger_1.logger.error(`Agent directory/files missing: ${error.message}`);
            res.status(404).json({ detail: error.message });
        }
        else if (error.message && error.message.includes("Configuração")) {
            logger_1.logger.error(`Validation error in chat request: ${error.message}`);
            res.status(400).json({ detail: error.message });
        }
        else {
            logger_1.logger.error(`Unhandled server error in chat endpoint: ${error.message}`);
            res.status(500).json({ detail: "Internal server error occurred." });
        }
    }
});
exports.router.get('/config', (req, res) => {
    try {
        const agentId = req.query.agentId;
        if (!agentId) {
            res.status(400).json({ detail: "Missing 'agentId' query parameter." });
            return;
        }
        const [config, identity, knowledge, workflow, manifest] = (0, file_loader_1.loadAgentAssets)(agentId);
        if (!manifest) {
            res.status(404).json({ detail: `UI Manifest for agent '${agentId}' is empty or not found.` });
            return;
        }
        res.json(manifest);
    }
    catch (error) {
        if (error.message && error.message.includes("not found")) {
            logger_1.logger.error(`Config path not found: ${error.message}`);
            res.status(404).json({ detail: error.message });
        }
        else {
            logger_1.logger.error(`Unhandled error in config endpoint: ${error.message}`);
            res.status(500).json({ detail: "Internal server error occurred." });
        }
    }
});
exports.router.get('/health', (req, res) => {
    res.json({ status: "healthy", service: "AI Agent Factory Engine" });
});
