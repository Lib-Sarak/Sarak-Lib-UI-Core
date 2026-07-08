export const schemaSql = `
-- Schema Sarak UI Core (Agente de Design)
-- Cria o schema caso o agente esteja rodando de forma totalmente isolada
CREATE SCHEMA IF NOT EXISTS "ui_core";

CREATE TABLE IF NOT EXISTS "ui_core"."sarak_ui_design_agent_conversations" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para busca rápida por sessão
CREATE INDEX IF NOT EXISTS idx_sarak_ui_design_agent_conversations_session 
ON "ui_core"."sarak_ui_design_agent_conversations" (session_id);


CREATE TABLE IF NOT EXISTS "ui_core"."sarak_ui_design_agent_artifacts" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    artifact_type VARCHAR(50) NOT NULL CHECK (artifact_type IN ('theme', 'preset')),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para busca rápida por sessão
CREATE INDEX IF NOT EXISTS idx_sarak_ui_design_agent_artifacts_session 
ON "ui_core"."sarak_ui_design_agent_artifacts" (session_id);
`;
