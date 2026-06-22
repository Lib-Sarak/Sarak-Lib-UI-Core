---
tipo: "spec"
titulo: "Expansão de Feedback e Interações"
dominio: "Sarak-Lib-UI-Core (Visual)"
status: "🟢 Implementado"
prioridade: "Baixa"
tags: ["spec", "feedback", "modals", "toasts"]
relacionados: []
---

# 1. Visão Geral
Esta spec define a criação de componentes de resposta, essenciais para manter a comunicação clara com o usuário em aplicações data-driven. Modais complexos, balões de contexto (tooltips) e sistemas de toast garantem que a interface responda visivelmente a cada ação efetuada via comandos do JSON.

# 2. Regras de Negócio
- **Regra 1: Toasts Globais Estáveis:** O `SarakToastProvider` deve gerenciar notificações em pilha sem z-index conflituosos. Os Toasts deverão mapear suas cores (Sucesso, Erro, Alerta, Info) do `SystemSchema`.
- **Regra 2: Modais Multi-step:** O componente `SarakModal` ou `SarakDialog` deve prever uma estrutura interna para sub-wizards, permitindo transição de telas ("Avançar/Voltar") contidas estritamente dentro do overlay, bloqueando interações com o fundo (backdrop).
- **Regra 3: Skeleton Dinâmicos:** O `SarakSkeleton` não deve ser apenas um retângulo cinza fixo. Ele deve poder assumir formas (circular para avatares, barra fina para texto) declaradas no JSON, emitindo a clássica animação de pulso estilizada com variáveis de tema Sarak.
- **Regra 4: Tooltips Acessíveis:** Tooltips (balões explicativos flutuantes) não podem ser cortados pelo `overflow: hidden` de parent containers, requerendo a renderização num portal no nível do body.
- **Regra 5: Menus de Contexto:** Devem se abrir precisamente na coordenada X,Y do clique do mouse (Botão Direito).

# 3. Critérios de Aceite
- [ ] O disparo de 5 Toasts sucessivos os empilha com espaçamento visual adequado e animação suave (ex: de baixo para cima).
- [ ] O clique na tecla ESC ou fora do Dialog fecha a janela modal por padrão.
- [ ] Tooltips e Popovers escapam das amarras de `overflow` em layouts aninhados complexos usando o padrão React Portal.
- [ ] Menus de contexto (clique direito) desaparecem instantaneamente quando o usuário clica em qualquer outro lugar da tela.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** montar e desmontar (unmount) componentes Toast após o período de timeout parametrizado (ex: 3000ms).
- [ ] **Deve** calcular corretamente a direção do Popover/Tooltip para não renderizá-lo fora da tela (Edge detection).

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Acessibilidade: O foco do teclado (Focus Trap) deve permanecer retido dentro do `SarakModal` aberto, nunca "vazando" para os botões atrás da tela opaca.
