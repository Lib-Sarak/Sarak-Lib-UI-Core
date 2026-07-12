---
tipo: "spec"
titulo: "Responsividade e Isolamento de Viewport no Gêmeo Digital"
dominio: "Design Engine / Sandbox (Preview)"
status: "🟢 Tier A Corrigido (Problemas 1a/1b/2/3) — Tier B (Container Queries em produção) em aberto"
prioridade: "Alta"
tags: ["spec", "sandbox", "preview", "responsiveness", "media-queries", "resize", "css-variables"]
---

# 1. Visão Geral e Descrição dos Problemas

O Gêmeo Digital (área de Preview/Sandbox) do Sarak UI Core permite a visualização e customização de componentes em diferentes formatos de dispositivo (ex: Mobile, Tablet, Desktop). A investigação identificou **3 problemas distintos** nessa área, todos confirmados por leitura direta do código-fonte:

1. **Problema 1:** O conteúdo renderizado dentro da moldura do dispositivo não se adapta ao formato simulado (continua se comportando como Desktop).
2. **Problema 2:** A moldura (Stage) do Gêmeo Digital muda de tamanho junto com o dispositivo selecionado, quando deveria permanecer com tamanho fixo e apenas o "Frame" interno variar (sobrando espaço vazio para Mobile/Tablet).
3. **Problema 3:** O divisor de arraste (drag handle) da barra lateral "Design Engine" não redimensiona visualmente o painel.

# 2. Problema 1 — Conteúdo não reage ao dispositivo simulado

## 2.1 Causa Raiz (Arquitetural)
A raiz do problema encontra-se no mecanismo padrão de responsividade web: **CSS Media Queries**. A responsividade real do conteúdo é hoje gerada por `src/core/Design/hooks/useDesignVariables.ts` (linhas 177-202), que emite `@media (min-width: ...)` **e** seletores de classe explícitos (`.sarak-device-smartphone`, `.sarak-device-tablet`, `.sarak-device-desktop`). Esses mecanismos ainda dependem, em última instância, de contexto de classe/viewport — não há nenhuma regra `@container (min-width: ...)` real no projeto.

`PreviewSystemRenderer.tsx` (linha 67) já aplica a classe `@container sarak-device-${previewDevice}` (ativando `container-type` via plugin Tailwind), mas essa classe está **órfã**: nenhuma regra `@container` a consome hoje. É a fundação certa, incompleta.

## 2.2 Causa Raiz (Bug concreto que agrava o problema)
Em `src/features/DesignEngine/Canvas/hooks/useDeviceStyles.ts` (linhas 1-7), a largura-alvo por dispositivo é calculada corretamente:
```ts
const deviceWidths = { desktop: '100%', tablet: '768px', smartphone: '375px' };
const targetWidth = deviceWidths[previewDevice] || '100%';
```
Porém, em `PreviewCanvas.tsx`, esse `targetWidth` é escrito apenas como custom property (`--device-width` na linha 139, `--target-width` na linha 199) no `style` inline — e **nunca é lido** por nenhuma classe. A largura visível real do frame vem sempre de uma classe Tailwind fixa:
```tsx
className={`... w-[var(--sarak-device-phone-width,375px)] h-[var(--sarak-device-phone-height,812px)] ...`}
```
Ou seja, o valor calculado por dispositivo é descartado silenciosamente — o frame sempre usa o token fixo de 375px, independente do `previewDevice` selecionado (mascarado no modo Dual View porque o Frame já nasce nesse tamanho fixo, mas quebra qualquer expectativa de Tablet/Desktop dentro do Frame).

# 3. Problema 2 — Moldura (Stage) muda de tamanho com o dispositivo

## 3.1 Causa Raiz
Não existe hoje separação semântica entre **Stage** (a área do canvas, que deveria ter tamanho estável) e **Frame** (a moldura do dispositivo simulado, de tamanho variável). Em `PreviewCanvas.tsx` (linha 132), o container pai que envolve o Frame e o Catálogo é:
```tsx
<div className={`flex gap-6 p-6 items-stretch overflow-visible ${isPreviewStacked ? 'flex-col min-w-full min-h-full w-fit h-fit items-center' : 'flex-col xl:flex-row min-w-full min-h-full w-fit h-fit justify-center'}`}>
```
As classes `w-fit h-fit` fazem o container **encolher para o tamanho do conteúdo** — quando o Frame vira 375px (Mobile), a área inteira do Stage encolhe junto, em vez de manter uma área fixa com o Frame centralizado e espaço vazio ao redor. Esse é o efeito visto no print (o card inteiro fica do tamanho de um celular).

## 3.2 Relação com o Problema 1
É a mesma superfície de código, mas causas distintas: mesmo que o bug do `targetWidth` (§2.2) fosse corrigido, o Stage continuaria encolhendo por causa do `w-fit`. As duas correções são independentes e ambas necessárias.

# 4. Problema 3 — Resize da sidebar "Design Engine" não funciona

## 4.1 Causa Raiz
O hook de arraste `src/features/DesignEngine/hooks/useResizable.ts` está **mecanicamente correto**: `startResizing` (29-42) inicia o drag, `resize` (53-65) escuta `mousemove` com clamp de `minSize`/`maxSize`, `stopResizing` (44-51) trata `mouseup`, e os listeners são anexados/removidos corretamente via `useEffect` (67-77). Não há problema de `pointer-events`, z-index ou listener órfão.

O bug está em `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` (linhas 155-156): o hook devolve `engineSidebarWidth`, que é escrito na variável `--engine-sidebar-width`:
```tsx
className={`... w-[var(--sarak-sidebar-w, 240px)] ...`}
style={{ '--engine-sidebar-width': `${engineSidebarWidth}px` } as React.CSSProperties}
```
Só que a classe que define a largura visível lê `var(--sarak-sidebar-w, 240px)` — uma variável **diferente**, definida globalmente em `src/styles/_theme.css:27` (`--sarak-sidebar-w: var(--sarak-sidebar-width, 240px)`), sem nenhuma relação com o hook de resize. O valor calculado pelo arraste do mouse nunca chega à propriedade que a UI realmente usa — **divergência de nome de variável CSS**, não falha de interação.

> Nota: existe um segundo mecanismo de resize de sidebar em `PreviewCanvas.tsx` (linhas 69-83, `handleSidebarResize` → `onUpdateDraft('sidebarWidth', ...)`), mas esse controla o token `sidebarWidth` do **tema sendo editado** (a sidebar simulada dentro do Gêmeo Digital), não o painel real "Design Engine V14.0". Não deve ser confundido com o Problema 3.

# 5. O Desafio Arquitetural (Requisitos para a Solução)

- **Problema 1:** Isolar a responsividade do conteúdo do viewport real do navegador, ativando Container Queries de fato (regras `@container` reais consumindo a classe já existente `sarak-device-*`) e/ou conectando `targetWidth` à largura real do Frame.
- **Problema 2:** Separar estrutural e visualmente "Stage" (tamanho estável, definido pelo canvas) de "Frame" (tamanho do dispositivo simulado), eliminando o `w-fit`/`h-fit` do container pai como fonte de largura variável.
- **Problema 3:** Unificar a variável CSS escrita pelo `useResizable` com a variável lida pela classe Tailwind da sidebar (`--sarak-sidebar-w` ou equivalente), sem introduzir uma segunda fonte de verdade.
- Não quebrar a renderização normal da aplicação quando exportada e rodando nativamente na web.
- Manter o padrão *Zero Hardcode* e a fronteira Atômico vs Feature da Biblioteca (`ui-arquitetura-design`): a correção destes 3 bugs é lógica de `features/DesignEngine`, não afeta tokens do catálogo.

# 6. Referência Rápida de Achados (arquivo:linha)

| Problema | Arquivo | Linhas | Achado |
|---|---|---|---|
| 1 | `Canvas/hooks/useDeviceStyles.ts` | 1-7 | `targetWidth` calculado corretamente por dispositivo |
| 1 | `Canvas/PreviewCanvas.tsx` | 137-142, 198-199 | `targetWidth`/`--device-width`/`--target-width` escritos no `style` mas nunca lidos pela classe (`w-[var(--sarak-device-phone-width,375px)]` fixo) |
| 1 | `Canvas/components/PreviewSystemRenderer.tsx` | 67 | Classe `@container sarak-device-*` aplicada, porém sem nenhuma regra `@container (...)` real no projeto |
| 1 | `core/Design/hooks/useDesignVariables.ts` | 177-202 | Responsividade real via `@media`/seletor de classe, não Container Query |
| 2 | `Canvas/PreviewCanvas.tsx` | 132 | Container pai `w-fit h-fit` — Stage encolhe junto com o Frame |
| 3 | `DesignEngine/hooks/useResizable.ts` | 29-77 | Hook de drag mecanicamente correto (sem bug) |
| 3 | `Main/ThemeCustomizationTab.tsx` | 155-156 | Escreve `--engine-sidebar-width`, classe lê `--sarak-sidebar-w` (variáveis desconectadas) |
| 3 | `styles/_theme.css` | 27 | Definição global de `--sarak-sidebar-w`, alheia ao hook de resize |

*(O plano de correção passo-a-passo será derivado desta spec na próxima etapa.)*

# 7. Re-verificação (feita antes de executar — resultado: Tier A confirmado corrigido)

O `status` no frontmatter já dizia "Tier A Corrigido" — reverifiquei linha por linha contra o código atual antes de escrever esta seção, porque `PreviewCanvas.tsx` foi refatorado depois que esta spec foi escrita (extração de `LiveDraftPreviewFrame.tsx`, sessão de correção do Design Agent) e os `arquivo:linha` da Seção 6 estão desatualizados. Resultado da reverificação:

- **Problema 1 (largura não lida) — confirmado corrigido.** `LiveDraftPreviewFrame.tsx` (novo arquivo, substitui o trecho que era `PreviewCanvas.tsx:137-142`) já usa `style={{ width: ... : targetWidth }}`; o branch não-DualView (`PreviewCanvas.tsx:170`) também usa `style={{ width: targetWidth }}`. Nenhum dos dois lê mais uma classe hardcoded.
- **Problema 2 (Stage encolhe com o Frame) — confirmado corrigido.** `PreviewCanvas.tsx:138` hoje é `flex-1 w-full min-h-0 flex gap-6 ...` — sem `w-fit h-fit`.
- **Problema 3 (variável CSS divergente no resize da sidebar) — confirmado corrigido, por uma via diferente da esperada.** `ThemeCustomizationTab.tsx:156` hoje aplica `style={{ width: `${engineSidebarWidth}px` }}` diretamente — não passa mais por nenhuma CSS var intermediária, então a divergência de nome (`--engine-sidebar-width` vs `--sarak-sidebar-w`) deixou de existir.

**Conclusão prática: não há nada a corrigir no Tier A.** Se ao reexecutar esta spec o comportamento visual (frame não muda de tamanho, sidebar não redimensiona) ainda estiver quebrado, o bug é NOVO — re-diagnostique do zero em vez de aplicar as correções antigas desta spec, que não se aplicam mais ao código atual.

# 8. Tier B (único trabalho real restante) — Container Queries de Verdade

## 8.1. Estado atual (por que funciona parcialmente sem Container Query real)
`useDesignVariables.ts:177-202` emite, para o mesmo bloco de CSS responsivo, **duas estratégias em paralelo**: `@media (min-width: ...)` (reage ao viewport real do navegador) **e** seletores de classe estáticos `.sarak-device-smartphone`/`.sarak-device-tablet`/`.sarak-device-desktop` (aplicam o CSS daquele breakpoint sempre que a classe está presente, **independente do tamanho real do container**). É essa segunda estratégia que hoje faz o Gêmeo Digital parecer "reagir" ao dispositivo selecionado — não é Container Query real, é uma simulação por classe fixa.

**Isso já é funcionalmente aceitável para o caso de uso atual** (3 tamanhos fixos, sempre correspondendo 1:1 à seleção do usuário). Tier B é uma melhoria de corretude arquitetural (usar o mecanismo certo do CSS pra isolamento de container), não a correção de um bug visível ao usuário — priorize de acordo.

## 8.2. Proposta concreta
Adicionar um terceiro bloco em `responsiveCSS` usando `@container` de verdade, com o Frame (`LiveDraftPreviewFrame.tsx`) declarando `container-type: inline-size` (via a mesma classe `@container` já aplicada e hoje órfã em `PreviewSystemRenderer.tsx:67`):

```ts
// useDesignVariables.ts — adicionar ao template de responsiveCSS existente, sem remover os blocos @media/classe
`
@container sarak-device (min-width: ${bpTablet}px) {
  ${scopeSelector} {
${responsiveCssTab}
  }
}
@container sarak-device (min-width: ${bpDesktop}px) {
  ${scopeSelector} {
${responsiveCssDesk}
  }
}
`
```
`sarak-device` é o nome do container já declarado pela classe `@container sarak-device-${previewDevice}` — confirme o nome exato do container-name gerado por essa classe Tailwind antes de escrever a regra (pode ser necessário ajustar a sintaxe do plugin `@tailwindcss/container-queries` usado no projeto).

## 8.3. Critérios de Aceite
- [ ] Existe pelo menos uma regra `@container` real no CSS gerado (não só `@media`/seletor de classe).
- [ ] Redimensionar o **container** (não a janela do navegador) muda o layout do conteúdo dentro do Gêmeo Digital — teste isolando o Frame numa área menor que o viewport todo.
- [ ] Os 3 mecanismos (`@media`, classe `.sarak-device-*`, `@container`) não geram conflito visual quando coexistem (a especificidade/ordem CSS precisa ser verificada).

## 8.4. Plano de Testes (Quality Gate)

### Testes Unitários
- [ ] **Deve** `useDesignVariables` incluir o bloco `@container` no `responsiveCSS` retornado quando os breakpoints estão configurados.

### Testes de Contrato (API)
- *N/A* — sem I/O de rede.

### Testes E2E (Integração)
- [ ] Redimensionar manualmente o painel "Catalog Preview" (que já tem `resize` habilitado, `PreviewCanvas.tsx:156`) e confirmar visualmente que o conteúdo dentro do Frame reage ao novo tamanho do container, não só ao dispositivo selecionado.
