---
tipo: "plan"
titulo: "Publicar os quatro widgets do cromo na superfície pública"
objetivo: "Busca, alternância de tema, usuário e idioma passam a ser alcançáveis pelo consumidor, para que os slots do cromo tenham com o que ser preenchidos"
dominio: "Sarak-Lib-UI-Core / Superfície pública / Cromo"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "barril", "cromo", "widgets"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[specs/05-cromo-e-slots]]", "[[specs/04-shell-e-discovery]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

`ShellSearchWidget`, `ShellThemeToggle`, `ShellUserWidget` e `ShellLanguageSelector` deixam de ser internos
ao `SarakShell` e passam a ser componentes públicos, com contrato próprio, alcançáveis por qualquer
consumidor — incluindo quem usa o `SarakAppChrome` e os slots.

# 2. Contexto

O dono comparou os dois sistemas e reportou que a topbar/sidebar atual é *"muito simples em relação ao
sistema antigo, em funcionalidade e aparência"*. A investigação mostrou que o cromo rico **não regrediu**:
os componentes do `SarakShell` são os mesmos de junho, refatorados. O que mudou foi o modo de consumo — o
sistema de referência usava o `SarakShell` (modo módulos-plugin) e o ERP usa o `SarakAppChrome` (modo
ui-kit).

`grep -c "ShellSearchWidget|ShellThemeToggle|ShellLanguageSelector|ShellUserWidget"` em
`src/components/Layout/SarakAppChrome.tsx` devolve **0**. E o barril também: os quatro nomes têm **zero
ocorrências** em `dist/index.d.ts`.

> **A consequência que decide esta plan:** os 8 slots do `SarakAppChrome` são regiões que o consumidor não
> tem com o que preencher. Não é que o ERP não montou os widgets — é que ele **não pode**, porque o import
> não resolve. O princípio *"a lib dá a REGIÃO; o consumidor dá o CONTEÚDO"* ([[05-cromo-e-slots]] §2.2)
> está correto; o defeito é a lib reter o conteúdo que ela mesma escreveu.

Dois fatos de terreno que evitam um caminho errado:

- **Onde os componentes moram decide se os gates os enxergam.** `scripts/publicComponents.mjs:22-25` deriva
  a superfície pública de `src/components/atomic/<Categoria>/`, `src/components/engines/<Categoria>/` e da
  **raiz** de `src/components/Layout/`. `src/core/Shell/Components/` está fora dessa varredura: exportar de
  lá cria um nome público que nem `barrel:check` nem o catálogo cobrem. `src/components/atomic/Navigation/`
  já tem barril de categoria (`index.ts`), e já hospeda `SarakMenuItem` e `SarakShellNav`.
- **Hoje os quatro dependem do Shell.** Eles leem `design`, `user`, `logout` e `setIsSearchOpen` de props
  passadas pelo host, ou direto do contexto. Publicá-los exige dar a cada um uma fronteira que **não
  pressuponha** o `SarakShell` — este é o trabalho de verdade da plan, não o recorte de arquivo.

O `SarakShell` continua consumindo os mesmos componentes. Se ele passar a ver um comportamento diferente,
a fronteira foi desenhada errado.

Achado do backlog que fecha aqui: `ShellLanguageSelector`, no ramo `horizontal`, mantém um `font-black`
herdado do `SarakButton` que nunca foi neutralizado — resíduo do mesmo padrão que a ADR-013 corrigiu nos
itens de lista. Sem efeito visual hoje porque os textos internos trazem tipografia própria.

# 3. Escopo

## 3.1 Dentro
- Os quatro componentes de `src/core/Shell/Components/` — realocados para
  `src/components/atomic/Navigation/` (a categoria que já tem barril e já hospeda os átomos de cromo), com
  fronteira de props própria.
- `src/components/atomic/Navigation/index.ts` — os quatro nomes.
- `src/core/Shell/Components/SidebarNav.tsx` · `TopbarNav.tsx` · `DockNav.tsx` — passam a importar do novo
  caminho, sem mudança de comportamento.
- `src/index.ts` — os quatro nomes e os tipos de props.
- Testes: os existentes dos quatro componentes acompanham a realocação; acrescentar cobertura do uso
  **fora** do Shell, que é a razão de a plan existir.
- `docs/migracoes.md` — entrada aditiva.

## 3.2 Fora
- `SarakAppChrome` — **não** monta nenhum widget nesta plan. Montar por padrão é a plan 67, e ler tokens de
  cromo é a plan 66. Aqui só se publica.
- `SarakSearch` (`src/components/atomic/Inputs/SarakSearch.tsx`) — já é público e não muda.
- O comportamento dos quatro dentro do `SarakShell` — tem de sair idêntico.
- O atalho de teclado global (`useSarakShellUI.ts:42`) — pertence ao Shell; levá-lo ao modo ui-kit é a
  plan 67.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `arquitetura/03-superficie-publica.md` | o contrato do barril e o que significa entrar nele |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.2 — os 8 slots e o princípio região/conteúdo |
| Spec fixa | `specs/04-shell-e-discovery.md` | §4.3 — o papel de cada peça dentro do Shell hoje |
| Spec fixa | `arquitetura/00-mapa-do-modulo.md` | a regra de alocação e as duas fronteiras de dependência cobradas |
| Spec fixa | `specs/01-gates-e-baseline.md` | antes de rodar gate; a matriz de cobertura diz o que cada um não vê |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | altera assinatura e localização de componente sem quebrar paridade |
| Código | `scripts/publicComponents.mjs:16-30` | as raízes varridas — decide onde os componentes têm de morar |
| Código | `src/components/atomic/Navigation/index.ts` | o barril de categoria que os recebe |
| Código | `src/core/Shell/Components/ShellSearchWidget.tsx` · `ShellThemeToggle.tsx` · `ShellUserWidget.tsx` · `ShellLanguageSelector.tsx` | os quatro componentes e o que cada um lê hoje |
| Código | `src/core/Shell/Components/SidebarNav.tsx:52-55,175-192` · `TopbarNav.tsx:53,159-178` | como o Shell os compõe hoje, com as variantes |

# 5. Instruções de execução

1. Ler as referências da §4. Mapear, para cada um dos quatro, **tudo** o que ele lê hoje: props, contexto e
   suposições sobre o host.
2. Definir a fronteira de props de cada um: o que vem por prop, o que vem do Provider, e o que deixa de ser
   pressuposto. O componente tem de funcionar montado dentro de um slot do `SarakAppChrome`, sem Shell,
   sem Discovery e sem registro. **Pronto quando** cada prop obrigatória tem justificativa.
3. Realocar os quatro para `src/components/atomic/Navigation/` e registrá-los no barril da categoria.
4. Atualizar `SidebarNav`, `TopbarNav` e `DockNav` para o novo caminho. **Pronto quando** os testes do
   Shell passam sem alteração de expectativa.
5. Neutralizar o `font-black` herdado no ramo `horizontal` do `ShellLanguageSelector`, aproveitando a
   passagem — é o achado 8 do backlog, e a mudança é de uma classe.
6. Exportar os quatro nomes e os tipos de props no barril público.
7. Acrescentar testes de uso **fora** do Shell: cada widget montado sob `SarakUIProvider` dentro de um slot
   do `SarakAppChrome`, exercitando a interação principal. **Pronto quando** o teste falha se o componente
   voltar a depender do Shell.
8. Escrever a entrada aditiva em `docs/migracoes.md`, com um exemplo de composição por slot.
9. Rodar `npm run barrel:check`, `npm run catalog:check`, `npm run guide:check`, `npm run public-types:check`
   e `npx vitest run`.

# 6. Critérios de aceite

- [ ] Os quatro nomes e os tipos de props aparecem em `dist/index.d.ts` depois de `npm run build`.
- [ ] Os quatro estão no catálogo gerado (`docs/component-catalog.json`), com props publicadas.
- [ ] Cada um monta e funciona dentro de um slot do `SarakAppChrome`, sem Shell e sem registro — provado
      por teste.
- [ ] O comportamento dentro do `SarakShell` é idêntico ao de antes; nenhum teste do Shell mudou de
      expectativa.
- [ ] O `font-black` herdado do `ShellLanguageSelector` horizontal saiu.
- [ ] `barrel:check`, `catalog:check`, `guide:check`, `public-types:check` verdes.
- [ ] `npx vitest run` verde; cobertura dos quatro não regride.
- [ ] `docs/migracoes.md` tem a entrada aditiva com exemplo.
- [ ] Nenhuma cor ou medida em hardcode entrou; o que existe segue token com fallback.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — a paridade barril ↔ componentes ↔ catálogo já é cobrada por `barrel:check` e
`catalog:check`, e é exatamente a régua que esta plan tem de satisfazer. Régua nova aqui duplicaria a
existente.

- `git diff --stat` → só os arquivos de §3.1.
- `grep` dos quatro nomes em `dist/index.d.ts` → presentes, depois de `npm run build`.
- `node -e` lendo `docs/component-catalog.json` → os quatro com props publicadas.
- `npm run barrel:check` · `catalog:check` · `guide:check` · `public-types:check` → verdes.
- `npx vitest run src/components/atomic/Navigation src/core/Shell` → verde.
- Leitura do diff dos três `*Nav.tsx` → só troca de caminho de import.
- `npx vitest run` → verde.
- `npm run audit` → comparar com o baseline.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md` · `specs/05-cromo-e-slots.md`

Em `arquitetura/03`: os quatro entram na superfície pública. As cifras daquele documento **não** são
reescritas à mão — apontar a fonte gerada, que é o que o achado 9 do backlog já pedia.

Em `specs/05`, na §2.2, texto pronto para transporte:

> Os slots são preenchíveis com componentes da própria biblioteca: busca, alternância de tema, widget de
> usuário e seletor de idioma são públicos e montam fora do Shell, sob o Provider. O princípio segue o
> mesmo — a lib dá a região e o consumidor dá o conteúdo —, mas o conteúdo não precisa mais ser escrito do
> zero por quem já usa a lib.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
