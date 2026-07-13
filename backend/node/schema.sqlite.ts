/**
 * Tradução SQLite do schema de `schema.ts` (INIT_UI_SCHEMA_SQL, Postgres). Mesmas 4
 * tabelas, mesmas colunas — só os tipos/recursos Postgres-específicos mudam:
 * - Schema namespace `"ui_core"."x"` → tabela prefixada `ui_core_x` (SQLite não tem
 *   schemas nomeados).
 * - `UUID DEFAULT gen_random_uuid()` → `TEXT PRIMARY KEY` (UUID gerado em JS via
 *   `crypto.randomUUID()` no insert — SQLite não roda função JS em `DEFAULT`).
 * - `VARCHAR(n)` → `TEXT`; `BOOLEAN` → `INTEGER` (0/1); `JSONB` → `TEXT` (serialização
 *   manual em JS); `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` → `TEXT DEFAULT
 *   CURRENT_TIMESTAMP`.
 * - Self-healing: SQLite não tem blocos `DO $$` (PL/pgSQL) — vira `SQLITE_SELF_HEALING_COLUMNS`,
 *   uma lista declarativa aplicada em JS via `PRAGMA table_info` (ver `database.ts`).
 */

export const INIT_UI_SCHEMA_SQLITE = `
CREATE TABLE IF NOT EXISTS ui_core_custom_themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    system TEXT DEFAULT 'global',
    owner_id TEXT,
    is_public INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 0,

    mode TEXT DEFAULT 'dark',
    navigation_style TEXT DEFAULT 'sidebar',
    body_size TEXT DEFAULT '14px',

    branding_config TEXT DEFAULT '{}',
    colors_and_atmosphere TEXT DEFAULT '{}',
    typography TEXT DEFAULT '{}',
    layout_and_navigation TEXT DEFAULT '{}',
    components_base TEXT DEFAULT '{}',
    cards_engine TEXT DEFAULT '{}',
    data_and_charts TEXT DEFAULT '{}',
    motion_and_animation TEXT DEFAULT '{}',
    specialized_engines TEXT DEFAULT '{}',

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ui_core_system_branding (
    id TEXT PRIMARY KEY,
    system TEXT DEFAULT 'global',
    owner_id TEXT,
    company_name TEXT DEFAULT 'Sarak OS',
    login_name TEXT DEFAULT 'Acesso ao Sistema',
    tab_name TEXT DEFAULT 'Sarak OS',
    logo_base64 TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(system, owner_id)
);

CREATE TABLE IF NOT EXISTS ui_core_design_agent_conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ui_core_design_agent_conversations_session
ON ui_core_design_agent_conversations (session_id);

CREATE TABLE IF NOT EXISTS ui_core_design_agent_artifacts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    artifact_type TEXT NOT NULL CHECK (artifact_type IN ('theme', 'preset')),
    payload TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ui_core_design_agent_artifacts_session
ON ui_core_design_agent_artifacts (session_id);
`;

/** Self-healing declarativo (equivalente ao bloco `DO $$` do lado Postgres). */
export interface SarakSqliteHealingColumn {
    table: string;
    column: string;
    ddlFragment: string;
}

export const SQLITE_SELF_HEALING_COLUMNS: readonly SarakSqliteHealingColumn[] = [
    { table: 'ui_core_custom_themes', column: 'system', ddlFragment: "system TEXT DEFAULT 'global'" },
    { table: 'ui_core_custom_themes', column: 'is_active', ddlFragment: 'is_active INTEGER DEFAULT 0' },
];
