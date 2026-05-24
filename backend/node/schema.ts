export const INIT_UI_SCHEMA_SQL = `
-- 001_init_ui_schema.sql
-- Este script é fornecido pelo Sarak-Lib-UI-Core para que os sistemas consumidores
-- (Earendel, MyService, etc.) possam inicializar a tabela de temas do Design Engine.

CREATE SCHEMA IF NOT EXISTS "ui_core";

-- 1. Cria a tabela de Custom Themes
CREATE TABLE IF NOT EXISTS "ui_core"."custom_themes" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    system VARCHAR(50) DEFAULT 'global',
    owner_id UUID, -- Referência opcional para o tenant/usuário
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false, -- Aponta se este é o tema ativo atual
    
    -- Top-Level Globals
    mode VARCHAR(50) DEFAULT 'dark',
    navigation_style VARCHAR(50) DEFAULT 'sidebar',
    body_size VARCHAR(50) DEFAULT '14px',
    
    -- Colunas JSONB Granulares (Mapeadas automaticamente via gerador)
    branding_config JSONB DEFAULT '{}'::jsonb,
    colors_and_atmosphere JSONB DEFAULT '{}'::jsonb,
    typography JSONB DEFAULT '{}'::jsonb,
    layout_and_navigation JSONB DEFAULT '{}'::jsonb,
    components_base JSONB DEFAULT '{}'::jsonb,
    cards_engine JSONB DEFAULT '{}'::jsonb,
    data_and_charts JSONB DEFAULT '{}'::jsonb,
    motion_and_animation JSONB DEFAULT '{}'::jsonb,
    specialized_engines JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Self-Healing para garantir que tabelas antigas ganhem as novas colunas
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'ui_core' AND table_name = 'custom_themes'
    ) THEN
        ALTER TABLE "ui_core"."custom_themes" ADD COLUMN IF NOT EXISTS system VARCHAR(50) DEFAULT 'global';
        ALTER TABLE "ui_core"."custom_themes" ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
    END IF;
END $$;
`;
