-- Persistência de tema — DDL de REFERÊNCIA (SQLite) — plan-43.
--
-- DESCRITIVO, NÃO NORMATIVO (ver docs/persistencia-de-tema.md §0). Nenhum código
-- deste repositório executa, importa ou depende deste arquivo — a Sarak-Lib-UI-Core
-- não fala com banco (ADR-003). Copie, adapte, ou ignore.
--
-- Mesma modelagem do docs/schema/postgres.sql — leia o cabeçalho dele primeiro, os
-- cinco pontos valem aqui também. Diferenças só de dialeto, comentadas abaixo:
--   - Sem JSONB nativo: `design`/`state_design` são TEXT. SQLite não valida que o
--     conteúdo é JSON bem formado por conta própria (Postgres/JSONB valida só por
--     ser o tipo) — se quiser essa garantia de SINTAXE (não de conteúdo — não
--     confunda com "validar o tema", proibido em §2), há um CHECK comentado abaixo.
--   - Sem TIMESTAMPTZ: os campos de data são TEXT em formato ISO-8601 UTC.
--   - Colunas geradas (`GENERATED ALWAYS AS ... STORED`) existem desde o SQLite
--     3.31 (2020) — se o seu driver for mais antigo, troque por um trigger
--     `BEFORE INSERT/UPDATE` que copia `COALESCE(tenant_id, '')` para `tenant_key`.

-- =============================================================================
-- 1) Temas CRIADOS pelo importador (docs/persistencia-de-tema.md §1.2)
-- =============================================================================
CREATE TABLE sarak_theme_definitions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,

    tenant_id       TEXT,
    tenant_key      TEXT GENERATED ALWAYS AS (COALESCE(tenant_id, '')) STORED,

    theme_id        TEXT NOT NULL,
    name            TEXT,

    -- OPAQUE — guarde a string exatamente como veio de `theme.onSave`.
    design          TEXT NOT NULL,
    -- Opcional: só garante SINTAXE de JSON, não valida o tema (ver cabeçalho).
    -- CHECK (json_valid(design)),

    updated_by      TEXT,

    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX sarak_theme_definitions_tenant_theme_uk
    ON sarak_theme_definitions (tenant_key, theme_id);

-- =============================================================================
-- 2) O tema APLICADO agora — estado corrente, SINGULAR por tenant
--    (docs/persistencia-de-tema.md §1.1)
-- =============================================================================
CREATE TABLE sarak_applied_theme_state (
    tenant_id           TEXT,
    tenant_key          TEXT GENERATED ALWAYS AS (COALESCE(tenant_id, '')) STORED,

    -- OPAQUE. Pode não corresponder a nenhuma linha de sarak_theme_definitions.
    state_design        TEXT NOT NULL,

    -- NÃO é foreign key — pode apontar para um tema EMBARCADO da lib, que nunca
    -- ganha linha nesta base. Ver docs/schema/postgres.sql, item 3 do cabeçalho.
    active_theme_id     TEXT,

    updated_by          TEXT,
    updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    PRIMARY KEY (tenant_key)
);
