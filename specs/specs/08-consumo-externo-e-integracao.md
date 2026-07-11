# 08. Consumo Externo e Integração da Sarak-Lib-UI-Core

Este manifesto estabelece as regras e o contrato de uso da biblioteca **Sarak-Lib-UI-Core** quando incorporada por sistemas externos, como o Site Earendel (Next.js), Agentes Locais ou backends em Python.

## 1. Exportação Estrita (O Contrato Público)
A Sarak UI Core não permite "Deep Imports" por consumidores externos (ex: `import Button from 'sarak-lib-ui-core/src/components/atomic/Button'`). Toda a exportação da biblioteca é mediada através do arquivo `src/index.ts`.
- O que estiver em `src/index.ts` é garantido pela retrocompatibilidade (Contrato).
- O que não estiver em `src/index.ts` é considerado módulo interno e pode mudar a qualquer momento sem aviso prévio.

## 2. Injeção de Estilos (CSS)
Sistemas consumidores **devem** importar o CSS global compilado da Sarak UI Core no seu ponto de entrada (ex: `_app.tsx` ou `layout.tsx`).
```tsx
import '@sarak/lib-ui-core/dist/sarak.css';
```
A Engine de Temas depende puramente destas variáveis CSS para realizar trocas visuais dinâmicas em tempo de execução sem afetar a árvore do DOM. Sem este arquivo, os componentes não terão forma geométrica, pois o Tailwind interno não será processado no consumidor.

## 3. O SarakUIProvider é Obrigatório
O consumidor nunca deve tentar invocar componentes atômicos complexos que dependam de variáveis dinâmicas (quase todos) sem abraçar a árvore do React com o `SarakUIProvider`.
O Provider é o único canal aprovado para estabelecer o estado de UI. Qualquer tentativa de aplicar design tokens puramente via strings (ignorando o Provider) resultará num sistema quebradiço.

## 4. Integração com Python (FastAPI/Scripts)
Agentes locais ou rotas Node.js externas não renderizam componentes visuais (React), porém podem interagir com as funções exportadas em `backend/node/backend-node.ts` (ex: acessar chaves do catálogo, extrair definições JSON de Design Systems para alimentar APIs LLMs, etc).
Sistemas backend Python devem consultar os dados gerados em `dist/catalog/` ou consumir endpoints Node que utilizam as funções expostas do motor.

## 5. Prevenção de Colisão (Prefixing)
Todos os tokens expostos pela biblioteca utilizam os prefixos reais `--sarak-*`/`--theme-*` nas suas variáveis CSS nativas (ex: `--sarak-color-background-base`), sempre emitidos com fallback. O namespace `--sx-*` é proibido (variável-fantasma — não é emitido por nenhuma fonte da engine).
Esta regra existe para garantir que o consumidor (ex: Tailwind nativo do Site Earendel) não sofra colisão e sobreponha indevidamente as regras fundamentais do motor Sarak.

## 6. Fronteira de Confiança (Spec 40 — Segurança)
O `SarakManifestRenderer` **executa um manifesto JSON autorado por usuário ou IA**. Por isso a Sarak trata o `payload` (manifesto) e o `dataStore` como **não confiáveis por padrão**. A divisão de responsabilidades é explícita — sem suposição implícita:

### 6.1 O que a Sarak garante (do lado da biblioteca)
- **Sanitização centralizada:** todo HTML/Markdown rico passa por um único canal (`sanitizeHtml`, baseado em DOMPurify). É **proibido** `dangerouslySetInnerHTML` com conteúdo externo fora desse canal. *(Única exceção: o `<style>` de `responsiveCSS` do `DesignScope`, que é CSS gerado pela própria engine, não conteúdo externo.)*
- **Avaliação sem `eval`:** `renderIf`/`disabledIf` usam um *Safe Evaluator* (Spec 26) que **falha fechado** — sem acesso a `window`/`document`/globais; expressão fora da gramática retorna `false`.
- **Interpolação escapada:** `{{...}}` (Spec 24) coage a `string`/primitivo; nunca concatena HTML cru executável.
- **Limites anti-DoS:** profundidade máxima de aninhamento (`MAX_NESTING_DEPTH`) e teto de itens em `renderFor` (`MAX_RENDERFOR_ITEMS`) impedem manifestos hostis de travar o navegador.

### 6.2 O que o importador DEVE prover (do lado do consumidor)
- **Autenticação e segredos:** a Sarak **nunca** embute tokens nem chama a rede diretamente. O `networkInterceptor` é o canal de rede do `SarakManifestRenderer` — o importador injeta auth (headers/cookies), faz a chamada e devolve os dados.
- **Roteamento:** o `routerInterceptor`/`NavigateFn` é responsabilidade do importador (ex.: o router do Next.js). A Sarak reage à rota, não controla a URL.
- **Design Agent (`SarakUIOptions.designAgent`):** o chat de IA do Design Engine (`DesignAgentChatCard`) segue a mesma regra — é proibido `fetch`/URL fixa embutida no componente. O importador injeta `options.designAgent.sendPrompt: (input: DesignAgentPromptInput) => Promise<DesignAgentPromptResult>` no `SarakUIProvider`; sem essa função configurada, o card informa "Não configurado" e não tenta rede nenhuma. `sendPrompt` roda no servidor do consumidor (nunca no browser direto) e é quem decide como falar com o backend `agent-design-operator` (acoplado na mesma API Node ou como microsserviço à parte).
- **Validação de origem do manifesto:** garantir que o JSON vem de uma fonte legítima e aplicar CSP/CORS no nível do app — a sanitização da Sarak é defesa em profundidade, não substitui o controle de origem.
