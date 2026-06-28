---
tipo: "arquitetura"
titulo: "Plano Diretor: Engine Declarativa (A Camada Lógica)"
dominio: "Core / Lógica"
status: "🔵 Em Expansão"
prioridade: "Máxima"
tags: ["roadmap", "engine", "logica", "manifest", "dados"]
relacionados: ["06-plano-diretor-expansao-visual"]
---

# 1. Visão Geral
Este documento define o "Master Plan" funcional da Sarak-Lib-UI-Core. O objetivo é estabelecer a arquitetura do **Sarak Manifest Renderer**, o cérebro que ingere um manifesto JSON e o transforma numa aplicação viva, orquestrando componentes atômicos estáticos (da expansão visual) com dados dinâmicos, lógicas e eventos.

# 2. Regras de Negócio (Pilares da Expansão Lógica)
A construção da Engine divide-se em 7 sub-motores interdependentes:

1. **Motor de Repetição (Repeater):** Suporte nativo ao laço `renderFor: "{{lista}}"`, multiplicando o componente *N* vezes no Virtual DOM e populando os dados individuais.
2. **Motor de Interpolação (Data Binding & Pipes):** Parser de variáveis (ex: `{{user.name}}`) e transformadores instantâneos (Pipes como `| currency`).
3. **Dispatcher de Eventos:** Barramento que traduz ações descritas em JSON (ex: `api_call`, `navigate`) em chamadas JavaScript reais, integrando debounce e throttle nativos.
4. **Expression Evaluator:** Condicionais estruturais como `renderIf` e `disabledIf`. Tradução segura de strings avaliadas sem injeção de código (Zero-Trust/Safe Eval).
5. **Tratamento de Erros:** Delegação de falhas (*Error Boundaries as Data*) engatilhando blocos visuais fallback ou notificações ao falhar requisições.
6. **Persistência de Estado (Local Storage):** Sincronização e hidratação de estados a partir do armazenamento local (`persistState`).
7. **Form Engine:** Acoplamento de validações e esquemas aos dados inseridos pelos usuários (bloqueando submissões inválidas na Engine).

# 3. Critérios de Aceite (Gate Funcional)
Diferente da camada visual, esta camada não segue a paridade 1:1:1:1:1 de design tokens. O seu Gate de Qualidade foca em estabilidade:
- [ ] Todo o contrato de integração (Fronteira JSON) é estritamente tipado (Zero Any). As interfaces `ManifestNode`, `SarakDataStore`, `Action` e `Pipe` devem ser explícitas.
- [ ] Cobertura de testes unitários para a lógica isolada de cada motor e testes E2E/Integração para o Renderer.
- [ ] O `auditor_modulo` possui (ou possuirá) um verificador determinístico extra (Conferência Funcional) para evitar laços infinitos ou *data-bindings* órfãos no JSON.

# 4. Plano de Testes
## Unitários
- [x] Testar o isolamento do Avaliador de Expressões (garantia de imunidade a `eval()` perigoso).
- [x] Verificar a tradução correta dos Pipes de formatação (`currency`, `date`).
## Contrato/API
- [x] Integrar a `SarakDataStore` para receber a injeção inicial global sem quebra de contrato no importador.
## E2E
- [x] Simular um ciclo de vida inteiro: `Renderer` consome JSON -> `renderFor` desenha lista -> Clica em Item -> `Dispatcher` dispara evento -> `State` sofre mutação -> Re-renderiza o componente limpo.
