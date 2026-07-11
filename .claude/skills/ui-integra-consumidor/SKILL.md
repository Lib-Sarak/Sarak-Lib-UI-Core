---
name: ui-integra-consumidor
description: Instala e acopla o motor SarakManifestRenderer num sistema consumidor (Next.js/React/FastAPI). Configura Interceptors e DataStore. Use ao iniciar a infraestrutura do front-end com a Lib. NÃO acione proativamente.
---

# Skill: Integrar Consumidor (Infraestrutura)

Skill responsável pela instalação plug-and-play do Motor Declarativo (Sarak-Lib-UI-Core) no projeto cliente, garantindo a inicialização do `SarakManifestRenderer`, `SarakDataStore` e `Interceptors`.

## Quando usar
- Quando o usuário informar que está num repositório que consumirá a `Sarak-Lib-UI-Core` e precisa acoplar o sistema (Engine) na raiz do projeto.
- Quando for necessário plugar roteamento do framework hospedeiro ou cabeçalhos de autenticação na Engine.
- Use APENAS quando o usuário solicitar explicitamente a instalação/integração inicial. NÃO acione proativamente.

## Workflow

1. **Identificação do Ecossistema (HITL)**
   - **Ação:** Pergunte qual é a stack do projeto consumidor (Ex: Next.js/React, Vite, etc).
2. **Criação da Pasta Sarak-Engine (Isolamento)**
   - **Ferramenta:** `run_command`
   - **Ação:** Crie o diretório dedicado `Sarak-Engine/` na raiz do consumidor, que isolará os proxies, a store local e instâncias da biblioteca.
3. **Instanciação da DataStore e Interceptors**
   - **Ação:** Crie o arquivo de inicialização exportando uma instância isolada de `SarakDataStore`.
   - **Ação:** Configure o `networkInterceptor` (para injetar tokens JWT e cookies em chamadas de API geradas pela Sarak) e o `routerInterceptor` (para conectar o router do framework cliente, ex: `useRouter` do Next.js).
4. **Injeção do Manifest Renderer**
   - **Ação:** Substitua o conteúdo estático da página/layout raiz ou crie um Ponto de Entrada base injetando o componente mestre: `<SarakManifestRenderer payload={jsonDaPagina} dataStore={store} networkInterceptor={apiHandler} routerInterceptor={routeHandler} />`.
5. **Integração do Design Agent (canal `designAgent`, nunca fetch direto)**
   - A Sarak nunca chama rede diretamente (Spec 08 §6.2) — o chat do Design Agent (`DesignAgentChatCard`) só funciona se o consumidor injetar `options.designAgent.sendPrompt` no `SarakUIProvider`. Sem isso, o card mostra "Não configurado" e não tenta nenhum fetch.
   - **Ação:** Implemente `sendPrompt: (input: DesignAgentPromptInput) => Promise<DesignAgentPromptResult>` (tipos exportados por `@sarak/lib-ui-core`) chamando o backend `agent-design-operator` a partir do SEU servidor (nunca do browser direto, para não expor credenciais):
     - **Se o backend consumidor for Node.js (Next.js/Express/Fastify):** importe e acople a rota da IA diretamente na API nativa usando `initDesignAgent()` (da pasta `agent-design-operator` da Sarak-Lib-UI-Core), e implemente `sendPrompt` chamando essa rota interna.
     - **Se o backend consumidor for Python (FastAPI/Django) ou PHP:** o agente da IA roda como um microsserviço Node isolado (porta 4000). `sendPrompt` (implementado no seu backend, não no browser) faz a chamada HTTP para esse microsserviço e devolve `{ message, themePatch }` no formato esperado.
   - **Ação:** Injete o resultado no Provider: `<SarakUIProvider options={{ designAgent: { sendPrompt } }}>`.
6. **Handoff (Ponto de Transição)**
   - **Ação:** Após a infraestrutura base estar acoplada e renderizando com sucesso um manifesto vazio ou de teste (fallback), informe ao usuário que a integração arquitetural terminou.
   - **Próximo Passo Obrigatório:** Oriente o usuário (ou você mesmo no próximo turno) a invocar a skill **`ui-integra-escrever-manifesto`** para começar, de fato, a construir as telas (escrever o JSON).

## Regras (SRP - Responsabilidade Única)
- **NÃO** ensine ou tente montar telas, formulários ou laços de repetição (`renderFor`) nesta skill. O foco aqui é estrito: DevOps e Infraestrutura Front-end.
- **SEMPRE** garanta que o componente importado nas rotas seja o Renderizador Mestre, bloqueando a importação direta de componentes atômicos isolados pelo desenvolvedor (garantindo que tudo passe pelo JSON).

## Referências
- Spec 11 (`11-engine-declarativa-e-manifestos.md`) da Biblioteca Core.
- `references/examples.md` — Exemplos práticos do padrão de injeção de dependência e integração do Renderer.
