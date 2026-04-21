# 🚀 Integração e Deploy

Este documento detalha como levar a sua biblioteca UI-Core e seus módulos para o ambiente de produção.

## 1. Arquitetura Federada

A Sarak UI-Core foi desenhada sob o princípio da **Resiliência Estética**. 

- **Modo Integrado:** Quando detecta o portal principal, a UI-Core delega toda a gestão de estado para o **Orquestrador Global**. Isso elimina o efeito "Split Brain", garantindo que todos os micro-frontends mudem de tema em sincronia absoluta.
- **Auto-Cura (Self-Healing):** Caso o portal caia ou o módulo seja aberto em isolamento, ele ativa automaticamente seu motor interno para manter a usabilidade.

## 2. Padrão ESM Nativo (Proibição de Require)

Para garantir máxima performance e compatibilidade com ferramentas modernas (Vite, Rollup, Esbuild):

- **NUNCA** utilize `require()` ou expatrie módulos via CommonJS. 
- Utilize exclusivamente `import` e `export` padrão ES6.
- A biblioteca é distribuída como ESM puro para facilitar o *Tree Shaking* no consumidor final.

## 3. Sincronização via GitHub

Como trabalhamos com repositórios modulares e independentes, o fluxo de atualização é:

1.  Realize suas alterações no módulo específico.
2.  Faça o Push para o repositório no GitHub.
3.  No projeto consumidor (ex: Portal), force a atualização do pacote:
    ```bash
    npm install github:Lib-Sarak/Sarak-Lib-UI-Core --force
    ```

## 4. Otimização de Produção

Ao fazer o build final do seu sistema, o motor CSS converterá todas as variáveis dinâmicas em valores otimizados, mas manterá os tokens `--theme-*` para que o usuário sinta a fluidez das trocas de cor e densidade instantaneamente, sem necessidade de recarregar a aplicação.

---
[Anterior: Guia do Módulo Soberano](./3-guia-do-modulo-soberano.md) | [Voltar: Início](./0-arquitetura-matrix-v6.md)
