# Plano Mestre de Expansão Lógica: A Camada de Vida e Dados (Manifest Renderer)

Este documento atua como o **Master Plan** focado exclusivamente na subcamada funcional da Sarak-Lib-UI-Core. O objetivo aqui não é desenhar a aparência (abordado no plano visual genérico), mas sim definir a arquitetura necessária para que o módulo consiga ingerir um arquivo JSON e transformá-lo em uma aplicação viva, com lógica de negócios, tráfego de dados e interação de eventos.

Esta expansão criará o "cérebro" que orquestra os componentes visuais (Átomos) com base em dados dinâmicos.

---

## 1. O Problema Atual (A Inércia Visual)
Atualmente, a Sarak UI Core consegue aplicar estilos e texturas através do JSON do Design Engine. No entanto, o sistema é inerte: tabelas não buscam dados, botões não disparam funções reais e listas não iteram dinamicamente. É um protótipo estático.

## 2. Pilares da Expansão Lógica (O Que Será Criado)

Para que o módulo seja o "Agnostic UI Engine" absoluto, equiparável aos gigantes do mercado, construiremos as seguintes engrenagens na camada `features/` e `core/`:

### 2.1. Motor de Repetição (Repeater / For-Loop Engine)
**Propósito:** Iterar arrays de dados vindos da API e desenhar blocos dinamicamente.
**O que será construído:**
- O JSON suportará o comando estrutural `renderFor: "{{lista_de_itens}}"`.
- O motor intercepta esse nó do JSON, itera sobre a variável alvo e clona o elemento (ex: um SarakCard) `N` vezes na tela, popularizando cada clone com os dados individuais (`{{item.nome}}`). Crucial para tabelas, feeds e listas.

### 2.2. Motor de Interpolação e Formatadores (Data Binding & Pipes)
**Propósito:** Substituir variáveis e formatar dados visuais em tempo real.
**O que será construído:**
- Parser de strings para capturar chaves como `{{user.name}}`.
- **Pipes Transformers:** Suporte a formatação nativa no template, como `{{valor | currency: 'BRL'}}` ou `{{data | date: 'DD/MM/YYYY'}}`. O motor aplica as máscaras de tradução instantaneamente.

### 2.3. Dispatcher Central de Eventos (Event Bus) e Modificadores
**Propósito:** Traduzir comandos estáticos do JSON em ações de JavaScript executáveis.
**O que será construído:**
- Expansão do Schema Interativo para a chave `actions: []`.
- O Dispatcher global lidará com: `api_call`, `navigate`, `mutate_state`, `trigger_toast`.
- **Debounce e Throttle Nativos:** O JSON poderá declarar `debounce: 500ms` em inputs de busca, garantindo que o disparo ao Event Bus seja suavizado e proteja a API de sobrecarga.

### 2.4. Motor de Avaliação Condicional (Expression Evaluator)
**Propósito:** Esconder, mostrar ou desabilitar elementos baseados em regras do negócio.
**O que será construído:**
- Suporte estrito a `renderIf` e `disabledIf`.
- Um *Safe Evaluator* que traduz strings (ex: `renderIf: "{{role}} === 'ADMIN'"`) blindado contra injeções de código indesejadas (XSS).

### 2.5. Tratamento de Erros e Fallbacks (Error Boundaries as Data)
**Propósito:** Garantir estabilidade da UI caso uma requisição de dados ou renderização falhe.
**O que será construído:**
- Suporte a `onError: []` no Event Bus. Se a API falhar, engatilha ações automáticas (como disparo de Toast de falha).
- Acoplamento com *React Error Boundaries* para que partes quebradas do JSON exibam um componente visual de substituição ("Ops, falha ao carregar"), mantendo o restante do layout seguro.

### 2.6. Persistência de Estado Local (Local Storage Manager)
**Propósito:** Manter estados entre navegações.
**O que será construído:**
- O JSON poderá declarar `persistState: "nome_da_chave"`. O motor salva e restaura o estado selecionado diretamente no `localStorage` do navegador do usuário.

### 2.7. Validação de Schema de Formulários (Form Engine)
**Propósito:** Proibir o envio de dados inválidos via automação guiada por JSON.
**O que será construído:**
- Integração de schemas de validação nos inputs (ex: `validation: { required: true, pattern: "email" }`).
- Bloqueio da ação `api_call` e injeção automática de tokens visuais de erro nos inputs.

---

## 3. O Componente Supremo: Sarak Manifest Renderer
A materialização resulta no `<SarakManifestRenderer payload={seu_json_aqui} />`.

**Fluxo de Vida do Renderer:**
1. Recebe o JSON completo (Manifesto) gerado pelo usuário/IA.
2. Resolve todas as variáveis, multiplica os loops (`renderFor`) e processa condicionais.
3. Repassa as funções de evento formatadas para os átomos.
4. Renderiza a árvore de componentes visuais, tornando-os 100% autossuficientes.

---

## 4. Atualização de Contratos e Documentação de Consumo (O Importador)
**Propósito:** Garantir que o sistema externo saiba orquestrar e alimentar o motor lógico.
**O que será construído/atualizado:**
- **Spec 08 (`08-consumo-externo.md`):** O novo contrato de integração. O importador passa a injetar callbacks globais no Renderer (ex: tokens de auth, router do Next.js).
- **Skills (`ui-integra-consumidor`):** Totalmente reescrita para refletir essa nova API de ingestão de JSON.
- **Manuais de Contexto (Data Store):** Documentação de como repassar o estado global para dentro da Sarak (a "árvore de dados" para a interpolação funcionar).

---

## Próximos Passos
Esta expansão lógica monstruosa será fatiada metodicamente em especificações técnicas (ex: `12-motor-de-data-binding.md`, `13-dispatcher-de-eventos.md`), preservando o ecossistema Sarak contra loops infinitos de re-renderização do React.
