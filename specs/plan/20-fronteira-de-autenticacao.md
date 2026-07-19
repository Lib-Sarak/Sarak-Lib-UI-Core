---
tipo: "spec"
titulo: "Fronteira de Autenticação (Login como Tela Renderizada)"
dominio: "Manifest Engine / Contrato do Importador"
status: "🟢 Concluída (2026-07-19)"
prioridade: "Alta"
tags: ["spec", "auth", "fronteira", "login", "interceptors"]
relacionados: ["08-consumo-externo-e-integracao", "11-engine-declarativa-e-manifestos"]
---

# 1. Visão Geral e Descrição do Problema

**Princípio:** a lib NÃO autentica ninguém. Ela **renderiza a tela de login** e entrega as credenciais ao host pelos canais do contrato (`actions` → `networkInterceptor`); o sistema de autenticação (próprio, Supabase Auth, AWS Cognito, Keycloak, JWT caseiro…) é 100% decisão do consumidor. O mesmo princípio da porta de persistência (spec plan/19), aplicado à identidade.

Estado atual e lacunas:
1. `SarakAuthScreen` existe como `type` nativo (registrado no `NATIVE_COMPONENTS`), mas **não há verificação nem documentação de que o fluxo completa via manifesto**: campos → submit → `api_call` com credenciais → host guarda token → telas protegidas. Ninguém validou ponta a ponta.
2. O contrato de "requisição autenticada" existe implicitamente (o `networkInterceptor` injeta headers — Spec 08 §6.2), mas não há receita canônica: onde o token vive, como o manifesto reage a "logado/deslogado" (`renderIf`/rotas), como o host força redirect de sessão expirada.
3. Risco de acoplamento: qualquer código da lib que assuma provider específico de auth é defeito — precisa de auditoria + gate (mesma família do `RegistryParity`).

# 2. Regras de Negócio (Solução)

## 2.1 Fluxo canônico de login 100% manifesto
- Validar (e corrigir o que faltar) o ciclo: rota `/login` com `SarakAuthScreen` (ou form de átomos) → `model` nos campos → ação `api_call` com `submit: true` para o endpoint do host → resposta depositada via `into` → host captura token no próprio `networkInterceptor` (ou ação dedicada) → rotas protegidas via `renderIf`/decisão de rota do host.
- Auditar `SarakAuthScreen` (`src/components/atomic/Templates/SarakAuthScreen.tsx` + `components/Auth*`): todos os callbacks/campos devem ser alcançáveis por props/`$event`/`actions` (padrão `onChange` do motor). O que for callback imperativo inalcançável via JSON deve ganhar canal declarativo (mesmo upgrade feito no `SarakShellNav`).
- Estado de sessão é do host: a lib nunca lê/escreve token; no máximo reflete flags que o host colocar no DataStore (ex.: `{{session.isLogged}}`).

## 2.2 Receita canônica no contrato (docs + skills)
- Nova seção na Spec 08 (§6.2-b) e na skill `ui-integra-escrever-manifesto`: **"Autenticação é porta"** — exemplo completo com: manifesto da tela de login; `networkInterceptor` injetando `Authorization` a partir do storage do host; tratamento de 401 (interceptor dispara navegação do host para `/login`); logout como `api_call`+`navigate`.
- Exemplos por provider APENAS como documentação (Supabase Auth, Cognito, backend próprio) — nenhum SDK entra no pacote.

## 2.3 Gate anti-acoplamento
- Teste/auditoria: grep-gate garantindo que `src/` não importa SDKs de auth nem lê tokens de storage diretamente (allowlist explícita se houver exceção legítima, com motivo — padrão `manifestExclusions`).

# 3. Critérios de Aceite
- [x] E2E: app com rota `/login` 100% JSON autentica contra um backend fake (token em memória do host), navega para rota protegida, e `renderIf` reage ao estado de sessão do DataStore.
- [x] `SarakAuthScreen` completa o fluxo via manifesto (campos, submit, erro de credencial exibido) — sem nenhum callback imperativo obrigatório.
- [x] Documentação da receita canônica publicada (Spec 08 + skill), incluindo 401→redirect.
- [x] Gate anti-acoplamento verde (nenhum provider de auth referenciado em `src/`) — 2 violações reais achadas e corrigidas (leitura direta de token em `localStorage`).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] SarakAuthScreen emite valores via canais declaráveis (onChange/$event) para todos os campos/botões.
## Integração
- [x] Manifesto de login + interceptor fake: submit válido deposita resposta via `into`; inválido dispara `onError` (toast).
- [x] Interceptor com token injeta `Authorization` em `api_call`/`source` subsequentes — desenho documentado na receita (Spec 08 §6.2-b); a lib só entrega o canal, quem injeta é o host.
## E2E (browser)
- [x] Fluxo completo login → rota protegida → logout → redirect, tudo com telas declaradas em JSON — implementado como E2E jsdom (`AuthFlow.integration.test.tsx`, mesmo padrão de "E2E" já usado no gate funcional do Dispatcher da Spec 11); harness de browser real (Playwright CT) fica pendente, mesmo precedente de specs anteriores (18/24).
