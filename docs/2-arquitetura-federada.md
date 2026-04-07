# 🛠️ Arquitetura Federada e Self-Healing

A **Sarak-Lib-UI-Core** foi construída sobre o princípio da **Resiliência Estética**. Diferente de UI Kits tradicionais que quebram sem um provedor de tema, a Sarak UI é inteligente: ela gerência seu próprio estado se necessário.

## 🧠 O Conceito "Self-Healing" (Auto-Cura)

O componente central `SarakUIProvider` realiza uma verificação tripla ao ser inicializado:

1. **Detecção de Orquestrador:** Tenta localizar o contexto da `@sarak/lib-shared`.
2. **Avaliação de Hierarquia:** Se encontrar a Shared, ele se torna um **"Módulo Integrado"**, delegando todas as mudanças de tema e cores para o orquestrador global.
3. **Ativação de Autonomia:** Se NÃO encontrar a Shared, ele ativa seu motor interno de estado e `localStorage` (Modo Independente).

## 🛡️ Modo Independente (100% Autonomia)
Ideal para:
- Desenvolvimento isolado no Storybook.
- Testes unitários e mocks de UI.
- Uso em projetos que não utilizam o Framework Sarak completo.

Neste modo, o módulo persiste todas as escolhas do usuário automaticamente, garantindo que o tema não seja perdido ao recarregar a página.

## 🔗 Modo Integrado (Arquitetura Federada)
Ideal para:
- Microsserviços rodando dentro do Portal Sarak.
- Dashboards integrados que compartilham o mesmo login e segurança.

Neste modo, ao trocar o tema no **App Principal**, todos os microsserviços integrados mudam de cor e layout **instantaneamente** e em sincronia, eliminando o erro de "Split Brain".

---
[Anterior: Anatomia do Tema](./1-anatomia-do-tema.md) | [Próximo: Instalação e Uso](./3-instalacao-e-uso.md)
