---
name: ui-novo-componente
description: Orquestra a adição de novos tokens de design e componentes atômicos à UI Core, garantindo a paridade nas três fontes do dicionário e o alcance pelo barril público. Use ao adicionar um token ou componente base ao sistema. NÃO acione proativamente.
---

# Skill: Adicionar Token ou Componente (Paridade)

> **Esta skill ORQUESTRA; ela não define regra.** A regra mora nas specs, e quando as duas
> divergirem **a spec vence**:
> - Dicionário, alavancas e o que "paridade" significa hoje → `specs/arquitetura/04-contrato-de-tokens-e-paridade.md`
> - Superfície pública e barril → `specs/arquitetura/03-superficie-publica.md`
> - Contrato único de regras (R4 paridade, R8 cobertura, R14 barril) → `specs/specs/00-regras-e-invariantes.md`
> - O fluxo passo a passo → `sarak-dev/GUIA-MANUTENCAO.md` §2 (token) e §3 (componente)
>
> **Dependência:** para a escrita dos testes unitários obrigatórios, consulte `test-unitario`.

## Quando usar
- Quando solicitado a adicionar um novo token de design ou um componente atômico ao repositório.
- **Validação de Fronteira (Configuração × Expansão):** antes de aceitar a tarefa, responda —
  **a chave já existe no dicionário?** Se existe, é **Configuração**: preencha o valor no
  tema/preset e **nenhum arquivo de `src/` é tocado**. Só siga esta skill se for **Expansão**.
  Os ids são camelCase e específicos (`btnBorderRadius`, não `buttonRadius`) — procure no
  catálogo antes de concluir que o token não existe.
- **Validação de Fronteira (alocação):** componente com estado/negócio vai para `src/features/`;
  puramente visual vai para `src/components/atomic/`. Se for feature, não use esta skill.
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

### 1. Verificação de Intenção e Schema
- **Ação:** confirme com o usuário os detalhes do token/componente (nome, tipo, faixa, alavanca).
- **Gate Estrito:** antes de injetar qualquer valor no roteamento ou no catálogo, valide e
  atualize a **interface TypeScript** (`src/core/Design/types.ts` e o schema do domínio). Se a
  variante não estiver tipada, tipifique-a primeiro.
- **Decida a alavanca ANTES de escrever** (`arquitetura/04` §3):
  - **Valor** — o token vira `var(--sarak-<kebab-id>, fallback)` no DOM. Nada além da paridade.
  - **Estrutural** — o token é lido em JS pelo Hook Controlador. Exige `structuralConsumer` no
    schema **e** `consumerHook` na partição, e o consumo real no hook. Token estrutural não
    marcado existe na paridade e **não move nada**.

### 2. Injeção nas TRÊS fontes do dicionário (a paridade real)
Um token só é **REAL** se existir simultaneamente nas três — fora delas ele é inexistente, e o
mais cruel é que a tela não quebra: o valor apenas não pinta nada.

| # | Fonte | Arquivo |
| --- | --- | --- |
| 1 | **Schema** | `src/core/Design/schema/` — o arquivo do domínio, agregado por `src/core/Design/master-map.ts` |
| 2 | **Roteamento de persistência** | `src/core/Design/catalog/theme_table_mapping.json` |
| 3 | **Partição do catálogo** | `src/core/Design/catalog/partitions/` — o JSON da coluna correspondente |

> ⚠️ **A "6ª camada" NÃO existe mais.** Se você leu, aqui ou em documento antigo, que todo
> componente precisa ser registrado num **NATIVE_COMPONENTS**, em **src/core/Manifest/Registry/**,
> e que é preciso rodar o **RegistryParity.test.tsx** — **nada disso existe**. O motor de
> manifesto foi removido inteiro (`specs/adr/002-remocao-motor-manifesto.md`). O alcance hoje é
> cobrado por dois gates: `npm run barrel:check` e `npm run catalog:check`.

### 3. Se for COMPONENTE, o alcance (barril + catálogo)
- **Nome** `PascalCase` com prefixo `Sarak` se for público.
- **Interface de props nomeada:** exporte sempre `interface <Nome>Props` — o gate cobra o tipo
  **junto** com o valor, e é dela que o catálogo extrai a documentação de props.
- **Exporte os dois** (valor + tipo) em `src/index.ts`. Se o componente for interno de propósito,
  a exclusão vai em `scripts/barrelExclusions.mjs` **com motivo escrito**; o gate também derruba
  exclusão obsoleta.
- **Nada pesado sai eager do barril** — componente que arrasta biblioteca grande vive atrás de
  fronteira `React.lazy`, senão o barril anula a fronteira que já existia lá dentro.
- ⚠️ **Limitação conhecida do coletor** (`scripts/publicComponents.mjs`): categoria **sem** barril
  `index.ts` só tem a **raiz** varrida. Componente em subpasta de categoria sem barril escapa do
  `barrel:check` e do catálogo. Se precisar de subpasta, crie o barril da categoria.

### 4. Teste 1:1 (obrigatório)
`__tests__/<Nome>.test.tsx` **ao lado** do componente/hook. Sem ele o `auditor_coverage` reprova.
Ver `specs/specs/11-testes-e-cobertura.md`.

### 5. Verificação de Integridade
```bash
npm run audit           # inclui auditor_paridade → verify_parity.ts (as 3 fontes)
npm run barrel:check    # o componente e o <Nome>Props estão expostos?
npm run catalog         # regenera docs/component-catalog.{json,md} — COMMITE o resultado
npm run guide           # o kit do consumidor passa a listá-lo
npm run dev-kit         # a contagem do kit do mantenedor muda
npx vitest run          # a suíte INTEIRA
```
- **Critério:** `barrel:check` e `catalog:check` em verde; e o `npm run audit` **no BASELINE**,
  não em zero — ver `specs/specs/01-gates-e-baseline.md` antes de acusar regressão.
- Para rodar só a paridade do dicionário:
  `npx tsx .agents/skills/ui-novo-componente/scripts/verify_parity.ts`.

### 6. Finalização
Informe o resultado da injeção, quais gates rodaram e com que números, comparados ao baseline.

## Regras
- **NUNCA** crie um token em apenas uma ou duas fontes: a paridade é nas **três**, na mesma
  entrega — nunca "o schema primeiro, o resto depois".
- **ALOCAÇÃO CORRETA:** todo componente atômico novo vive em `src/components/atomic/<Categoria>`.
  Lógica de negócio vai para `src/features/`, fora desta skill.
- **ZERO HARDCODE no `.tsx`:** nada de hex/px/rem nem Tailwind estrutural (`p-4`, `gap-4`,
  `flex-col`, grid). O lugar legítimo do valor estrutural é o Hook Controlador da categoria.
- **COMPOSIÇÃO ATÔMICA:** proibido `<button>`/`<input>`/`<select>` cru — use `SarakButton`,
  `SarakInput`, `SarakSelect`.
- **≤ 250 linhas** por arquivo. Ao estourar, extraia — e cada peça extraída precisa do próprio teste.
- **NÃO** finalize sem rodar os gates da etapa 5.

## Checklist
- [ ] Confirmou que é **Expansão** e não Configuração (o token realmente não existe)?
- [ ] O tipo/interface do Schema foi atualizado ANTES da injeção?
- [ ] A alavanca foi decidida — e, se estrutural, `structuralConsumer` + `consumerHook` + consumo no hook?
- [ ] O token existe nas **três** fontes (schema, `theme_table_mapping.json`, partição)?
- [ ] Se é componente: exportado com `<Nome>Props` em `src/index.ts` e `barrel:check` verde?
- [ ] Teste 1:1 criado ao lado?
- [ ] `npm run catalog` / `guide` / `dev-kit` regenerados e commitados?
- [ ] `npm run audit` comparado ao **baseline** (não a zero) e a suíte inteira verde?

## Referências (Camada 3)
- `.agents/skills/ui-novo-componente/scripts/verify_parity.ts` — motor de paridade das três
  fontes do dicionário. É o mesmo script que o `auditor_paridade.mjs` invoca. Rode com
  `npx tsx .agents/skills/ui-novo-componente/scripts/verify_parity.ts`.
