import { ChatRequest, ChatResponse, TriggerAction } from '../config/shared/types.js';
import * as crypto from 'crypto';
import { ConfigurationError } from '../utils/errors.js';
import { GLOBAL_SYSTEM_CONSTRAINTS } from '../config/shared/global_prompts.js';
import { settings } from '../config/shared/settings.js';
import { loadAgentAssets } from '../utils/file_loader.js';
import { TriggerExtractor } from './parser/trigger_extractor.js';
import { logger } from '../utils/logger.js';
import { extractIntent } from '../utils/intent_parser.js';
import { AgentValidator } from '../utils/agent_validator.js';
import { InputValidator, SecurityViolationError } from '../core/security/input_validator.js';

import { ProviderFactory } from './providers/provider_factory.js';
import { databaseClient } from './database/database_factory.js';

export class AgentEngine {
    private db = databaseClient;

    private async _ensureKnowledgeIndexed(agentId: string, tableKnowledge: string, rawKnowledge: string, embeddingsProvider: any, tableState: string, vectorDb: any): Promise<void> {
        const hash = crypto.createHash('sha256').update(rawKnowledge).digest('hex');
        const systemSessionId = `system_hash_${agentId}`;
        const state = await this.db.getSessionState(tableState, systemSessionId);
        const currentHash = state?.knowledgeHash;

        if (currentHash === hash && await vectorDb.isIndexed(tableKnowledge, agentId)) {
            return;
        }

        logger.info(`Ingesting and vectorizing knowledge base for agent: '${agentId}' into table '${tableKnowledge}'...`);
        
        if (currentHash !== hash) {
            await vectorDb.clearAgentVectors(tableKnowledge, agentId);
        }

        const rawBlocks = rawKnowledge.split("\n\n");
        const documents: any[] = [];
        
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
            await vectorDb.addDocuments(tableKnowledge, agentId, documents, embeddingsProvider);
            await this.db.saveSessionState(tableState, systemSessionId, { knowledgeHash: hash });
        }
    }

    async processMessage(request: ChatRequest): Promise<ChatResponse> {
        const { agentId = 'default-agent', payload, sessionId } = request;
        
        logger.info(`Processing chat request for Agent: '${agentId}' | Session: '${sessionId}'`);

        let config: any, identity: string, knowledge: string, workflow: string, rules: string, manifest: any;
        try {
            [config, identity, knowledge, workflow, rules, manifest] = loadAgentAssets(agentId);
        } catch (e: any) {
            logger.error(`Failed to load agent assets for '${agentId}': ${e.message}`);
            throw e; // Preserve explicit error (ConfigurationError or AgentNotFoundError)
        }

        // Modality Enforcement
        const defaultCapabilities = { input_modalities: ["text"], output_format: "text" };
        const capabilities = config.capabilities || defaultCapabilities;
        
        for (const part of payload) {
            if (!capabilities.input_modalities.includes(part.type)) {
                throw new SecurityViolationError(`Input modality '${part.type}' is not supported by agent '${agentId}'.`);
            }
        }

        // Extract text for sanitization and RAG
        const userMessage = payload
            .filter(p => p.type === 'text' && p.content)
            .map(p => p.content)
            .join('\n');

        // 0. Sanitize input to prevent prompt injections
        InputValidator.sanitizeInput(userMessage);

        const defaultLlm = settings.GLOBAL_DEFAULTS.llm || {};
        
        const llmProviderName = config.provider || defaultLlm.provider;
        if (!llmProviderName) {
            throw new ConfigurationError("Configuração 'provider' ausente tanto no config.json do agente quanto no defaults.json.");
        }

        workflow = Array.isArray(config.workflow) ? config.workflow.join("\n") : workflow;

        const defaultDb = settings.GLOBAL_DEFAULTS.database || {};
        const dbConfig = config.database || {};
        
        const tableTriggers = dbConfig.table_triggers || defaultDb.table_triggers;
        if (!tableTriggers) {
            throw new ConfigurationError("Configuração 'database.table_triggers' ausente tanto no config.json do agente quanto no defaults.json.");
        }

        if (request.metadata) {
            await this.db.saveTriggerEvent(
                tableTriggers,
                agentId,
                sessionId,
                "SYSTEM_TELEMETRY",
                request.metadata
            );
        }
        
        const llmModelName = config.model || defaultLlm.model;
        if (!llmModelName) {
            throw new ConfigurationError("Configuração 'model' ausente tanto no config.json do agente quanto no defaults.json.");
        }

        let llmTemperature = config.temperature;
        if (llmTemperature === undefined) llmTemperature = defaultLlm.temperature;
        if (llmTemperature === undefined) {
            throw new ConfigurationError("Configuração 'temperature' ausente tanto no config.json do agente quanto no defaults.json.");
        }

        let llmMaxTokens = config.max_tokens;
        if (llmMaxTokens === undefined) llmMaxTokens = defaultLlm.max_tokens;
        if (llmMaxTokens === undefined) {
            throw new ConfigurationError("Configuração 'max_tokens' ausente tanto no config.json do agente quanto no defaults.json.");
        }
 
        const defaultVectorization = settings.GLOBAL_DEFAULTS.vectorization || {};
        const vectorizationConfig = config.vectorization || {};
        
        let topK = vectorizationConfig.top_k;
        if (topK === undefined) topK = defaultVectorization.top_k;
        if (topK === undefined) {
            throw new ConfigurationError("Configuração 'vectorization.top_k' ausente tanto no config.json do agente quanto no defaults.json.");
        }
            
        let threshold = vectorizationConfig.similarity_threshold;
        if (threshold === undefined) threshold = defaultVectorization.similarity_threshold;
        if (threshold === undefined) {
            throw new ConfigurationError("Configuração 'vectorization.similarity_threshold' ausente tanto no config.json do agente quanto no defaults.json.");
        }
 
        const tableHistory = dbConfig.table_history || defaultDb.table_history;
        if (!tableHistory) {
            throw new ConfigurationError("Configuração 'database.table_history' ausente tanto no config.json do agente quanto no defaults.json.");
        }
            
        const tableLeads = dbConfig.table_leads || defaultDb.table_leads;
        if (!tableLeads) {
            throw new ConfigurationError("Configuração 'database.table_leads' ausente tanto no config.json do agente quanto no defaults.json.");
        }
            
        const tableKnowledge = dbConfig.table_knowledge || defaultDb.table_knowledge;
        if (!tableKnowledge) {
            throw new ConfigurationError("Configuração 'database.table_knowledge' ausente tanto no config.json do agente quanto no defaults.json.");
        }

        const tableState = dbConfig.table_state || defaultDb.table_state;
        if (!tableState) {
            throw new ConfigurationError("Configuração 'database.table_state' ausente tanto no config.json do agente quanto no defaults.json.");
        }

        let chatHistoryLimit = dbConfig.chat_history_limit;
        if (chatHistoryLimit === undefined) chatHistoryLimit = defaultDb.chat_history_limit;
        if (chatHistoryLimit === undefined) {
            throw new ConfigurationError("Configuração 'database.chat_history_limit' ausente tanto no config.json do agente quanto no defaults.json.");
        }

        const useRag = config.features?.rag ?? settings.GLOBAL_DEFAULTS.features?.rag ?? false;
        let semanticContext = "";

        if (useRag) {
            const embeddingsProviderName = config.embeddings_provider || settings.GLOBAL_DEFAULTS.embeddings_provider;
            if (!embeddingsProviderName) {
                throw new ConfigurationError("Configuração 'embeddings_provider' ausente tanto no config.json do agente quanto no defaults.json.");
            }

            // Lazy Load Vector/RAG Dependencies
            const { vectorStore } = await import('./memory/vector_store_factory.js');
            const { EmbeddingsFactory } = await import('./memory/embeddings_factory.js');
            
            const activeEmbeddings = EmbeddingsFactory.getEmbeddingsProvider(embeddingsProviderName);

            // Background ingestion (fire and forget)
            this._ensureKnowledgeIndexed(agentId, tableKnowledge, knowledge, activeEmbeddings, tableState, vectorStore).catch((err: any) => {
                logger.error(`Background knowledge indexing failed for agent '${agentId}': ${err.message}`);
            });

            try {
                const queryVector = await activeEmbeddings.embedQuery(userMessage);
                const matches = await vectorStore.similaritySearch(
                    tableKnowledge,
                    agentId,
                    queryVector,
                    topK,
                    threshold
                );

                if (matches && matches.length > 0) {
                    semanticContext = matches.map((m: any) => m.text).join("\n\n---\n\n");
                    logger.debug(`Retrieved ${matches.length} relevant context blocks from semantic memory.`);
                }
            } catch (ve: any) {
                logger.warning(`Failed to execute semantic search: ${ve.message}. Proceeding without semantic context.`);
            }
        } else {
            // RAG disabled: Use raw knowledge as static context if present
            semanticContext = knowledge.trim();
        }

        const sessionState = await this.db.getSessionState(tableState, sessionId);
        let sessionStateText = "";
        if (sessionState && Object.keys(sessionState).length > 0) {
            sessionStateText = `[PERSISTENT USER MEMORY (STATE)]\n${JSON.stringify(sessionState)}\n\n`;
        }

        const systemPrompt = 
            `${GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
            `[AGENT IDENTITY]\n${identity}\n\n` +
            `${sessionStateText}` +
            `[RELEVANT CONTEXT (SEMANTIC MEMORY)]\n${semanticContext ? semanticContext : 'Nenhum contexto relevante encontrado.'}\n\n` +
            `[WORKFLOW RULES]\n${workflow}\n\n` +
            `[STRICT GUARDRAILS]\n${rules}`;

        const history = await this.db.getChatHistory(tableHistory, sessionId, chatHistoryLimit);
        const formattedHistory = history.map((msg: any) => ({ role: msg.role, content: msg.content }));
        formattedHistory.push({ role: "user", content: userMessage }); // ADD NEW MESSAGE TO HISTORY

        await this.db.saveMessage(tableHistory, sessionId, agentId, "user", userMessage);

        const fallbacks = config.fallbacks || [];
        const modelsToTry = [
            { provider: llmProviderName, model: llmModelName },
            ...fallbacks
        ];

        const retriesConfig = defaultLlm.retries || { enabled: false, max_attempts: 1, initial_delay_ms: 1000 };
        const maxAttempts = retriesConfig.enabled ? retriesConfig.max_attempts : 1;
        const initialDelay = retriesConfig.initial_delay_ms || 1000;

        let rawResponse = "";
        let success = false;

        for (const attempt of modelsToTry) {
            try {
                const provider = ProviderFactory.getProvider(attempt.provider);
                
                // Exponential Backoff Retry Loop
                let attemptCount = 0;
                while (attemptCount < maxAttempts && !success) {
                    try {
                        attemptCount++;
                        rawResponse = await provider.generateResponse(
                            systemPrompt,
                            formattedHistory,
                            llmTemperature,
                            llmMaxTokens,
                            attempt.model
                        );
                        success = true;
                    } catch (netErr: any) {
                        logger.warning(`Attempt ${attemptCount}/${maxAttempts} failed for provider ${attempt.provider}: ${netErr.message}`);
                        if (attemptCount >= maxAttempts) {
                            throw netErr; // Exhausted retries for this provider, try fallback provider
                        }
                        // Wait before retrying (exponential backoff)
                        const delay = initialDelay * Math.pow(2, attemptCount - 1);
                        await new Promise(res => setTimeout(res, delay));
                    }
                }
                
                if (success) break;
                
            } catch (e: any) {
                logger.error(`Inference exhausted for provider ${attempt.provider} / model ${attempt.model}: ${e.message}`);
            }
        }

        if (!success) {
            const errorFallback = "Estou enfrentando uma instabilidade técnica momentânea nos servidores. Por favor, tente novamente.";
            await this.db.saveMessage(tableHistory, sessionId, agentId, "assistant", errorFallback);
            return {
                text: errorFallback,
                actions: [],
                agentId: agentId
            };
        }

        const triggersConfig = config.triggers || {};
        const [cleanResponse, extractedActions] = TriggerExtractor.extractTriggers(rawResponse, triggersConfig);

        for (const action of extractedActions) {
            await this.db.saveTriggerEvent(tableTriggers, agentId, sessionId, action.type, action.data);
            
            if (action.type === "LEAD") {
                await this.db.saveLead(
                    tableLeads,
                    agentId,
                    sessionId,
                    action.data
                );
            } else if (action.type === "SAVE_STATE") {
                await this.db.saveSessionState(
                    tableState,
                    sessionId,
                    action.data
                );
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

// Singleton Instance
export const agentEngine = new AgentEngine();
