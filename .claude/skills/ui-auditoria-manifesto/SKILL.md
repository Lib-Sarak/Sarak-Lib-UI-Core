---
name: ui-auditoria-manifesto
description: Skill de conferência estática do JSON do manifesto. Vasculha chaves órfãs, valores de tokens inválidos, loops infinitos e vazamentos de segurança (Safe Eval). Use ao auditar layouts que optaram pelo motor de manifesto (caminho opcional, não o modelo padrão). NÃO acione proativamente.
---

> ⚠️ **MARCADA PARA REMOÇÃO (Spec 46, `specs/plan/46-remover-motor-de-manifesto.md`).** Desde a Spec 43, o modelo OFICIAL de consumo da lib é módulos-plugin (ver skill `ui-integra-consumidor`). Esta skill audita o motor de manifesto, que segue vivo como caminho **opcional** até a Spec 46 rodar — use somente sobre manifestos JSON que o consumidor escolheu escrever deliberadamente.

# Skill: Auditoria de Manifesto (JSON Linter)

Atua como um Linter estático e Gatekeeper de Segurança para os JSONs da Engine Declarativa, garantindo
que o Desenvolvedor ou as próprias IAs importadoras não injetaram códigos hostis, VALORES inventados ou
lógicas corrompidas na interface. Desde a Spec 22, a auditoria valida **valores**, não só chaves — um
`type`/prop existir não basta se o valor atribuído não existe no catálogo.

## Quando usar
- Quando um Manifesto JSON for muito complexo (múltiplos *renderFor* e *renderIf*) e precisar de validação para ter certeza que não quebrará o `<SarakManifestRenderer />`.
- Ao revisar a construção de uma tela (Review) antes de enviar para o ambiente produtivo de um sistema consumidor.
- Use APENAS sob demanda. NÃO acione proativamente.

## Workflow (Conferência Estática Funcional)

Ao ser instruído para auditar um Manifesto JSON, siga a sequência:

1. **Validação Estrutural (Schema e Nós) — contra o catálogo GERADO**
   - Carregue `docs/manifest-catalog.json` (na lib ou em `node_modules/@sarak/lib-ui-core/docs/`) — ele é derivado do código e lista todos os `type`s, props, ações, pipes, diretivas **e a seção "Tokens e valores permitidos"**.
   - Cheque se todo objeto de interface (Nó) do JSON possui a propriedade mandatória `type` **e se o valor existe em `components` do catálogo** (fora dele = Fallback garantido).
   - Confira cada prop do nó contra as props do catálogo para aquele `type` (prop inexistente é ignorada em silêncio — reporte como WARNING).
   - No bloco de `actions`, assegure-se de que os tipos listados existem em `actions` do catálogo (ex.: `api_call`, `mutate_state`, `navigate`, `trigger_toast`, `open_modal`). Em `api_call`, o corpo é `payload.params` — a chave `body` NÃO existe (CRITICAL se aparecer).
   - Pipes usados em `{{ | }}` devem existir em `pipes` do catálogo; diretivas de nó devem existir em `directives`.
2. **Validação de VALORES (Spec 22 — não só chaves)**
   - **Espaçamento (`gap`/`padding`):** todo valor deve ser um token da tabela "Espaçamento semântico" (`spacing-xs`..`spacing-xl`) OU um comprimento CSS válido (`var(...)`, `calc(...)`, `clamp(...)`, `min(...)`, `max(...)`, literal com unidade `px|rem|em|%|vh|vw`, ou `0`). Qualquer outra string (`spacing-xxl`, `"16"` sem unidade, `"large"`) é **WARNING** — cai em silêncio no default do Design Engine, sem quebrar a build, por isso é fácil passar batido sem esta auditoria.
   - **Variantes literais por componente:** confira cada prop de variante (`direction`, `justify`, `align`, `variant`, `size`, `role`, `density`, `importance`, `orientation`, etc.) contra a tabela "Variantes literais por componente" DAQUELE `type` específico — o mesmo nome de prop pode ter listas diferentes por componente (ex.: `SarakButton.variant` ≠ `SarakCardGrid.variant`). Valor fora da lista para aquele componente é **WARNING**.
   - **CSS Variables citadas em `style`/expressões (`var(--sarak-...)`):** confira contra a seção "CSS Variables públicas" do catálogo. Uma var `--sarak-*`/`--theme-*` que NÃO está nessa lista é **var-fantasma** — nunca é emitida por nenhuma fonte da Engine, então o `var(--x, fallback)` sempre resolve pro fallback. Reporte como **WARNING** (o CSS não quebra, mas o token nunca aplica). Qualquer var fora do namespace `--sarak-*`/`--theme-*` (ex.: `--sx-*`) é **CRITICAL** (Spec 08 §5 — namespace proibido, risco de colisão).
3. **Segurança do Safe Evaluator (Crítico)**
   - Vasculhe cirurgicamente os blocos `"{{ }}"` buscando por strings proibidas que representem injeção de script.
   - **Bloqueio Imediato:** Qualquer presença de `<script>`, `<style>`, ou tentativas de invocar `window.*` e `document.*` dentro das condicionais ou pipes do JSON deve ser vetada. A Engine exige que o JSON seja burro e dependa apenas da DataStore.
4. **Mapeamento de Chaves Órfãs**
   - Se um laço `"renderIf"` checar a variável `{{user.role}}`, garanta que o nó importador saiba que a chave `user` deve existir na `DataStore`, prevenindo um *undefined check* obscuro.
5. **Ciclos e Loops (RenderFor)**
   - Valide se os nós engatilhados com `"renderFor"` estão corretamente estruturados, evitando que eles empilhem listas infinitas de chaves sem o operador de indexação.
6. **Lista de dados sem `source` (padrão botão-carregar) — WARNING de UX (Spec 22)**
   - Detecte o anti-padrão: um nó com `renderFor: { source: "{{chave}}" }` cuja `chave` é populada por um `api_call` disparado a partir de um `SarakButton`/ação manual (não por um `source` no nó pai/ancestral com `into: "chave"`). Isso é o padrão "botão Carregar" que a skill `ui-integra-escrever-manifesto` proíbe para telas finais.
   - Reporte como **WARNING**: `"<caminho do nó>: lista consome '{{chave}}' via renderFor mas nada no manifesto usa 'source'+'into: \"chave\"' — considere carga automática com states (loading/empty/error)."`
   - Se o nó pai já tem `source.into` casando com a `chave` do `renderFor`, NÃO reporte — é o padrão correto. Se `source` existe mas `states` está ausente, reporte **WARNING** separado: `"<caminho>: 'source' sem 'states' — a tela usa o Skeleton/Fallback genérico da Engine em vez de um estado de loading/empty/error autoral."`

## Regras
- A auditoria deve ser meramente estática (como a leitura humana/algorítmica de um texto). Você nunca deve tentar injetar o JSON num navegador local durante esse processo.
- Reporte infrações em três níveis: **INFO** (órfãos), **WARNING** (falhas visuais/UX — inclui todo valor de token fora do catálogo e lista sem `source`) e **CRITICAL** (injeções XSS, Safe Eval hostil, `body` em `api_call`, CSS var fora do namespace `--sarak-*`/`--theme-*`).
- **NÃO** valide um valor de token "de memória" — releia a seção "Tokens e valores permitidos" do catálogo a cada auditoria (ela é GERADA e muda quando novos componentes/variantes entram na lib).

## Referências
- Spec 11 (`11-engine-declarativa-e-manifestos.md`): Contém a explicação oficial de como a Conferência Funcional opera.
- Spec 16 (`16-tokens-semanticos-e-validacao-de-valores.md`): o resolutor de tokens de espaçamento e a origem da seção "Tokens e valores permitidos" do catálogo.
- Spec 22 (`22-skills-de-consumo-golden-path.md`): motivação desta auditoria de VALORES (achado real: tokens/vars inventados passavam pela auditoria antiga, que só conferia chaves).
- `docs/manifest-catalog.md` / `.json` — fonte única dos valores válidos (espaçamento, variantes, CSS vars).
