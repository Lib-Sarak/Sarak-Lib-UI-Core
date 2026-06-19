---
tipo: "spec"
titulo: "Expansão de Navegação"
dominio: "Sarak-Lib-UI-Core (Visual)"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "navigation", "stepper", "breadcrumbs"]
relacionados: []
---

# 1. Visão Geral
Componentes direcionados ao fluxo e contexto do usuário em softwares de alto calibre. Sem estes elementos visuais, a usabilidade em painéis e ERPs com muitas páginas fica severamente comprometida.

# 2. Regras de Negócio
- **Regra 1: Command Palette Intrusivo (K-Bar):** O `SarakSpotlight` (ou Palette) deve ser uma modal global acionável por atalho de teclado (`Cmd+K` ou `Ctrl+K`), permitindo navegação instantânea. Seu visual de input central e lista de resultados é estritamente ditado pelo `NavigationSchema`.
- **Regra 2: Steppers Orientadores:** O `SarakStepper` deve desenhar "passos" e linhas conectoras, indicando visualmente passos concluídos (cor primária), atual (destaque) e futuros (desabilitados ou secundários). Deve suportar disposição horizontal e vertical.
- **Regra 3: Breadcrumbs Semânticos:** Os `SarakBreadcrumbs` devem montar o caminho do usuário com ícones personalizáveis entre as migalhas (ex: `/`, `>`, ou setas sólidas).
- **Regra 4: Paginação Parametrizada:** O `SarakPagination` desenhará controles numéricos `< 1 2 ... 5 >`, respeitando o design dos botões base da Sarak. 

# 3. Critérios de Aceite
- [ ] Pressionar o atalho do teclado configurado exibe globalmente o Command Palette por cima de qualquer tela.
- [ ] Steppers com passos longos em telas pequenas adotam *overflow horizontal* em modo scroll ou diminuem a fonte automaticamente, nunca quebrando o layout da barra em duas linhas não intencionais.
- [ ] A paginação compacta visualmente a listagem numérica com reticências (`...`) se o número de páginas for maior que o limiar máximo (`maxVisible`).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** detectar e registrar globalmente (Event Listener global) o atalho de ativação da Command Palette de forma segura.
- [ ] **Deve** gerar a lista de renderização numérica de paginação exibindo o início, miolo atual e final da paginação com cortes precisos.

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Acessibilidade: Navegação com as setas do teclado para subir/descer pelas opções do Command Palette e acionar a seleção da pesquisa ao dar Enter.
