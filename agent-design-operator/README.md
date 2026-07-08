# Design Operator (Sarak UI-Core)

O **Design Operator** é o agente de Inteligência Artificial responsável por traduzir *prompts* e intenções humanas de design para **Payloads JSON determinísticos**. Ele age exclusivamente como um "Operador de Dados de Banco", gerando as configurações visuais e estruturais consumidas pelo motor *Sarak-Lib-UI-Core*.

---

## 🛑 Regras Absolutas e Identidade

1. **Política "Zero Código" (No-Code/Filesystem-Free):** O agente **NUNCA** modifica, lê ou deleta arquivos do repositório (`.ts`, `.tsx`, `.css`). Sua atuação se restringe estritamente a produzir um JSON final que será persistido no banco de dados.
2. **Dicionário Estrito (Paridade):** O agente não possui permissão (nem capacidade técnica) para criar chaves CSS ou variáveis (`--sx-*`) inexistentes. Ele só "conhece" as propriedades validadas pelo Catálogo da UI-Core.
3. **Structured Output:** O agente responde exclusivamente com um objeto JSON embutido num trigger de parsing (ex: `[THEME_UPDATE]`). 

---

## 🧠 Arquitetura Cognitiva e Segurança

Este microsserviço (TypeScript/Express) opera isolado do front-end principal e possui travas arquiteturais severas contra alucinações de Inteligência Artificial:

### 1. Boot e RAG Dinâmico (`loadDynamicCatalog`)
O conhecimento do agente não é estático (Hardcoded). Toda vez que a API inicia (via `src/main.ts`), ela faz uma requisição (GET) para o backend da `Sarak-Lib-UI-Core`. 
O agente baixa o Catálogo JSON real (o Dicionário de Tokens permitidos) em tempo real. Isso significa que se um engenheiro Front-End adicionar uma nova propriedade de layout hoje, o Agente a conhecerá imediatamente no próximo *boot*, sem precisar de re-deploy ou fine-tuning.

### 2. O Escudo Anti-Alucinação (`ThemeValidator`)
Antes que qualquer dado gerado pela LLM seja enviado para o banco de dados da aplicação principal, o JSON atravessa o middleware `validator.ts`. 
Se a inteligência artificial tentar inventar uma chave que não existe no Catálogo (ex: `--sx-botao-sombra-louca`), a validação intercepta, lança uma `SECURITY_VIOLATION` (Erro 422) e aborta a operação. **Nenhuma chave órfã chega ao banco de dados.**

### 3. Persistência (`ThemeWriter`)
Após ser validado, o Payload é despachado via HTTP (`POST`) para o backend da Sarak UI-Core, efetivando a mudança visual instantaneamente para os consumidores.

---

## 📂 Estrutura de Diretórios

```text
agent-design-operator/
├── src/
│   ├── api/
│   │   └── routes.ts          # Porta de entrada (POST /api/themes/generate). Escuta o Front-End.
│   ├── config/
│   │   └── agents/
│   │       └── design-operator/
│   │           ├── config.json  # Parametrização da LLM (Temperatura 0.1, Structured Output On).
│   │           ├── identity.md  # System Prompt Mestre definindo que o Agente é um Operador de Banco.
│   │           └── rules.md     # Guardrails contra invenção de propriedades não mapeadas.
│   ├── toolbox/
│   │   ├── theme_writer.ts    # Action (Cliente HTTP) que salva o JSON na UI-Core.
│   │   └── validator.ts       # Validador de Chaves (Anti-fantasma) e montador do RAG dinâmico.
│   └── main.ts                # Entrypoint. Realiza o Boot bloqueante e levanta a API.
├── tests/
│   └── validator.spec.ts      # Suíte de testes (Vitest) que garante que alucinações sejam bloqueadas.
└── .env.example               # Variáveis de ambiente (Chaves Groq/OpenRouter e URL da UI-Core).
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18+)
- Backend da `Sarak-Lib-UI-Core` acessível na rede (Para *boot* do dicionário e envio de payloads).

### Instalação
```bash
npm install
```

### Configuração de Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e preencha as chaves:
```bash
# Provedores de IA
GROQ_API_KEY=sua_chave
OPENROUTER_API_KEY=sua_chave

# Conexão com o Backend da UI Core
UI_CORE_API_URL=http://localhost:4000/api
UI_CORE_AUTH_TOKEN=seu_token_de_acesso
```

### Inicialização
Para ambiente de desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Rodando os Testes
Para garantir que o escudo Anti-Alucinação está funcional:
```bash
npx vitest
```
