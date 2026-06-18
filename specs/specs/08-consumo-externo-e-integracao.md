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
Todos os tokens expostos pela biblioteca utilizam o prefixo estrito `--sx-` nas suas variáveis CSS nativas (ex: `--sx-color-background-base`). 
Esta regra existe para garantir que o consumidor (ex: Tailwind nativo do Site Earendel) não sofra colisão e sobreponha indevidamente as regras fundamentais do motor Sarak.
