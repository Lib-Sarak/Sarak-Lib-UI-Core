"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentEngine = exports.AgentEngine = void 0;
const global_prompts_1 = require("../config/shared/global_prompts");
const settings_1 = require("../config/shared/settings");
const file_loader_1 = require("../utils/file_loader");
const provider_factory_1 = require("./providers/provider_factory");
const vector_store_factory_1 = require("./memory/vector_store_factory");
const database_factory_1 = require("./database/database_factory");
const trigger_extractor_1 = require("./parser/trigger_extractor");
const embeddings_factory_1 = require("./memory/embeddings_factory");
const logger_1 = require("../utils/logger");
class AgentEngine {
    db = database_factory_1.databaseClient;
    vectorDb = vector_store_factory_1.vectorStore;
    async _ensureKnowledgeIndexed(agentId, tableKnowledge, rawKnowledge, embeddingsProvider) {
        if (await this.vectorDb.isIndexed(tableKnowledge, agentId)) {
            return;
        }
        logger_1.logger.info(`Ingesting and vectorizing knowledge base for agent: '${agentId}' into table '${tableKnowledge}'...`);
        const rawBlocks = rawKnowledge.split("\n\n");
        const documents = [];
        for (let index = 0; index < rawBlocks.length; index++) {
            const cleanBlock = rawBlocks[index].trim();
            if (cleanBlock.length > 20) {
                documents.push({
                    text: cleanBlock,
                    metadata: {
                        chunk_index: index,
                        source: "knowledge.md"
                    }
                });
            }
        }
        if (documents.length > 0) {
            await this.vectorDb.addDocuments(tableKnowledge, agentId, documents, embeddingsProvider);
        }
    }
    async processMessage(request) {
        const agentId = request.agentId || "default-agent";
        const sessionId = request.sessionId;
        const userMessage = request.message;
        logger_1.logger.info(`Processing chat request for Agent: '${agentId}' | Session: '${sessionId}'`);
        let config, identity, knowledge, workflow, manifest;
        try {
            [config, identity, knowledge, workflow, manifest] = (0, file_loader_1.loadAgentAssets)(agentId);
        }
        catch (e) {
            logger_1.logger.error(`Failed to load agent assets for '${agentId}': ${e.message}`);
            throw new Error(`Error loading agent files: ${e.message}`);
        }
        const defaultLlm = settings_1.settings.GLOBAL_DEFAULTS.llm || {};
        const llmProviderName = config.provider || defaultLlm.provider;
        if (!llmProviderName) {
            throw new Error("Configuração 'provider' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        workflow = Array.isArray(config.workflow) ? config.workflow.join("\n") : workflow;
        const defaultDb = settings_1.settings.GLOBAL_DEFAULTS.database || {};
        const dbConfig = config.database || {};
        const tableTriggers = dbConfig.table_triggers || defaultDb.table_triggers;
        if (!tableTriggers) {
            throw new Error("Configuração 'database.table_triggers' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        if (request.metadata) {
            await this.db.saveTriggerEvent(tableTriggers, agentId, sessionId, "SYSTEM_TELEMETRY", request.metadata);
        }
        const llmModelName = config.model || defaultLlm.model;
        if (!llmModelName) {
            throw new Error("Configuração 'model' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        let llmTemperature = config.temperature;
        if (llmTemperature === undefined)
            llmTemperature = defaultLlm.temperature;
        if (llmTemperature === undefined) {
            throw new Error("Configuração 'temperature' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        let llmMaxTokens = config.max_tokens;
        if (llmMaxTokens === undefined)
            llmMaxTokens = defaultLlm.max_tokens;
        if (llmMaxTokens === undefined) {
            throw new Error("Configuração 'max_tokens' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        const defaultVectorization = settings_1.settings.GLOBAL_DEFAULTS.vectorization || {};
        const vectorizationConfig = config.vectorization || {};
        let topK = vectorizationConfig.top_k;
        if (topK === undefined)
            topK = defaultVectorization.top_k;
        if (topK === undefined) {
            throw new Error("Configuração 'vectorization.top_k' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        let threshold = vectorizationConfig.similarity_threshold;
        if (threshold === undefined)
            threshold = defaultVectorization.similarity_threshold;
        if (threshold === undefined) {
            throw new Error("Configuração 'vectorization.similarity_threshold' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        const tableHistory = dbConfig.table_history || defaultDb.table_history;
        if (!tableHistory) {
            throw new Error("Configuração 'database.table_history' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        const tableLeads = dbConfig.table_leads || defaultDb.table_leads;
        if (!tableLeads) {
            throw new Error("Configuração 'database.table_leads' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        const tableKnowledge = dbConfig.table_knowledge || defaultDb.table_knowledge;
        if (!tableKnowledge) {
            throw new Error("Configuração 'database.table_knowledge' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        const tableState = dbConfig.table_state || defaultDb.table_state;
        if (!tableState) {
            throw new Error("Configuração 'database.table_state' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        let chatHistoryLimit = dbConfig.chat_history_limit;
        if (chatHistoryLimit === undefined)
            chatHistoryLimit = defaultDb.chat_history_limit;
        if (chatHistoryLimit === undefined) {
            throw new Error("Configuração 'database.chat_history_limit' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        const embeddingsProviderName = config.embeddings_provider || settings_1.settings.GLOBAL_DEFAULTS.embeddings_provider;
        if (!embeddingsProviderName) {
            throw new Error("Configuração 'embeddings_provider' ausente tanto no config.json do agente quanto no defaults.json.");
        }
        const activeEmbeddings = embeddings_factory_1.EmbeddingsFactory.getEmbeddingsProvider(embeddingsProviderName);
        await this._ensureKnowledgeIndexed(agentId, tableKnowledge, knowledge, activeEmbeddings);
        let semanticContext = "";
        try {
            const queryVector = await activeEmbeddings.embedQuery(userMessage);
            const matches = await this.vectorDb.similaritySearch(tableKnowledge, agentId, queryVector, topK, threshold);
            if (matches && matches.length > 0) {
                semanticContext = matches.map((m) => m.text).join("\n\n---\n\n");
                logger_1.logger.debug(`Retrieved ${matches.length} relevant context blocks from semantic memory.`);
            }
        }
        catch (ve) {
            logger_1.logger.warning(`Failed to execute semantic search: ${ve.message}. Proceeding without semantic context.`);
        }
        const sessionState = await this.db.getSessionState(tableState, sessionId);
        let sessionStateText = "";
        if (sessionState && Object.keys(sessionState).length > 0) {
            sessionStateText = `[PERSISTENT USER MEMORY (STATE)]\n${JSON.stringify(sessionState)}\n\n`;
        }
        const systemPrompt = `${global_prompts_1.GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
            `[AGENT IDENTITY]\n${identity}\n\n` +
            `${sessionStateText}` +
            `[RELEVANT CONTEXT (SEMANTIC MEMORY)]\n${semanticContext ? semanticContext : 'Nenhum contexto relevante encontrado.'}\n\n` +
            `[WORKFLOW RULES]\n${workflow}`;
        const history = await this.db.getChatHistory(tableHistory, sessionId, chatHistoryLimit);
        const formattedHistory = history.map((msg) => ({ role: msg.role, content: msg.content }));
        await this.db.saveMessage(tableHistory, sessionId, agentId, "user", userMessage);
        const provider = provider_factory_1.ProviderFactory.getProvider(llmProviderName);
        let rawResponse = "";
        try {
            rawResponse = await provider.generateResponse(systemPrompt, formattedHistory, llmTemperature, llmMaxTokens, llmModelName);
        }
        catch (e) {
            logger_1.logger.error(`Inference generation failed: ${e.message}`);
            const errorFallback = "Estou enfrentando uma instabilidade técnica momentânea. Por favor, tente novamente.";
            await this.db.saveMessage(tableHistory, sessionId, agentId, "assistant", errorFallback);
            return {
                text: errorFallback,
                actions: [],
                agentId: agentId
            };
        }
        const triggersConfig = config.triggers || {};
        const [cleanResponse, extractedActions] = trigger_extractor_1.TriggerExtractor.extractTriggers(rawResponse, triggersConfig);
        for (const action of extractedActions) {
            await this.db.saveTriggerEvent(tableTriggers, agentId, sessionId, action.type, action.data);
            if (action.type === "LEAD") {
                await this.db.saveLead(tableLeads, agentId, sessionId, action.data);
            }
            else if (action.type === "SAVE_STATE") {
                await this.db.saveSessionState(tableState, sessionId, action.data);
            }
        }
        await this.db.saveMessage(tableHistory, sessionId, agentId, "assistant", cleanResponse);
        return {
            text: cleanResponse,
            actions: extractedActions,
            agentId: agentId
        };
    }
}
exports.AgentEngine = AgentEngine;
// Singleton Instance
exports.agentEngine = new AgentEngine();
