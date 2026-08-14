-- Persistência de tema — DDL de REFERÊNCIA (Postgres) — plan-43.
--
-- DESCRITIVO, NÃO NORMATIVO (ver docs/persistencia-de-tema.md §0). Nenhum código
-- deste repositório executa, importa ou depende deste arquivo — a Sarak-Lib-UI-Core
-- não fala com banco (ADR-003). Copie, adapte, ou ignore.
--
-- Leia docs/persistencia-de-tema.md ANTES deste arquivo: ele explica O PORQUÊ de
-- cada decisão abaixo. Resumo das que mais surpreendem:
--   1. DUAS tabelas, não uma — "tema aplicado" e "tema criado" são entidades
--      diferentes (§1); o estado aplicado pode não corresponder a NENHUM tema salvo.
--   2. `design`/`state_design` são OPACOS — jsonb guarda o payload byte a byte.
--      Não crie trigger nem constraint que inspecione ou reescreva o conteúdo (§2).
--   3. `active_theme_id` NÃO é foreign key — pode apontar para um tema EMBARCADO da
--      lib (imutável, nunca ganha linha nesta tabela) ou para um tema desta tabela.
--      Uma FK aqui rejeitaria o caso mais comum (§3).
--   4. Sem coluna de usuário — o tema é do SISTEMA (ou do tenant), nunca da pessoa
--      logada (§4). `updated_by` é AUDITORIA de quem alterou por último, texto livre,
--      não uma identidade que a lib conhece ou exige.
--   5. `tenant_id` nasce NULL — só passa a ser preenchido quando você tiver
--      multi-tenant de verdade (ADR-009). Por isso a unicidade usa `tenant_key`
--      (coluna gerada) em vez de `tenant_id` cru: Postgres trata NULL como
--      distinto de NULL em UNIQUE/PK, então duas linhas com `tenant_id IS NULL` e o
--      mesmo `theme_id` NÃO colidiriam sem essa coluna — silenciosamente.

-- =============================================================================
-- 1) Temas CRIADOS pelo importador (docs/persistencia-de-tema.md §1.2)
--    Espelha `ThemeEntry` — entregue via `options.theme.onSave`.
-- =============================================================================
CREATE TABLE sarak_theme_definitions (
    -- Chave técnica; NÃO é o que garante unicidade por tenant — ver tenant_key abaixo.
    id              BIGSERIAL PRIMARY KEY,

    -- Opaco, não validado pela lib (ADR-009 §2.1). NULL = modo não-multi-tenant.
    tenant_id       TEXT,

    -- Coluna GERADA só para viabilizar UNIQUE(tenant, theme_id) com tenant NULL.
    -- Nunca escreva nela diretamente; ela deriva de tenant_id sozinha.
    tenant_key      TEXT GENERATED ALWAYS AS (COALESCE(tenant_id, '')) STORED,

    -- ThemeEntry.id — livre, definido no momento do salvamento (slug do nome).
    theme_id        TEXT NOT NULL,

    -- ThemeEntry.name — rótulo exibido nas listas do painel.
    name            TEXT,

    -- ThemeEntry.design (+ contraparte, se você optar por guardar os dois juntos
    -- num único objeto — a lib não prescreve como combinar os dois campos do
    -- ThemeEntry na coluna). OPAQUE: veja o aviso no cabeçalho, item 2.
    design          JSONB NOT NULL,

    -- Auditoria de "quem alterou por último" — texto livre (e-mail, login, o que
    -- o SEU sistema usar). NÃO é FK para tabela de usuário nenhuma: a lib não tem
    -- esse conceito (docs/persistencia-de-tema.md §4). NULL quando não aplicável.
    updated_by      TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Um `theme_id` é único DENTRO do tenant (tenant_key trata NULL como '').
CREATE UNIQUE INDEX sarak_theme_definitions_tenant_theme_uk
    ON sarak_theme_definitions (tenant_key, theme_id);

-- =============================================================================
-- 2) O tema APLICADO agora — estado corrente, SINGULAR por tenant
--    (docs/persistencia-de-tema.md §1.1). Entregue via
--    `options.persistence.onSave(design, activeThemeId)` / lido por `onLoad`.
-- =============================================================================
CREATE TABLE sarak_applied_theme_state (
    tenant_id           TEXT,
    tenant_key          TEXT GENERATED ALWAYS AS (COALESCE(tenant_id, '')) STORED,

    -- O payload COMPLETO resolvido pelo motor de tokens no instante do save.
    -- Pode não corresponder a NENHUMA linha de sarak_theme_definitions — o
    -- usuário ajusta tokens sem clicar em "Salvar tema" (§1.1). OPAQUE.
    state_design        JSONB NOT NULL,

    -- O id do tema que estava no ar quando este estado foi salvo (plan-42).
    -- PODE ser NULL (nenhum tema resolvido ainda) e PODE apontar para um tema
    -- EMBARCADO da lib (ex.: 'minimalist-airy') — por isso NÃO é FK para
    -- sarak_theme_definitions (item 3 do cabeçalho). Se você quiser saber se o
    -- id aponta para um tema salvo seu, faça o JOIN por fora, tratando "não
    -- achei" como "é um tema embarcado ou o id não existe mais" — os dois casos
    -- são legítimos e indistinguíveis só com este dado.
    active_theme_id     TEXT,

    updated_by          TEXT,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (tenant_key)
);
