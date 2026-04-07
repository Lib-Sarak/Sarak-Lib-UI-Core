# Sarak UI Core: Manifesto e Visão Geral

Bem-vindo à **Sarak-Lib-UI-Core**, o coração visual e motor de interface do ecossistema Sarak. 

Esta biblioteca não é apenas um conjunto de componentes, mas uma **Engine de Design Federada** projetada para oferecer maturidade visual e operacional a qualquer microsserviço.

## 🎯 Propósito
A `UI-Core` foi criada para resolver três problemas fundamentais do desenvolvimento modular:
1. **Consistência Visual:** Garantir que todos os módulos tenham a mesma estética premium, independentemente de quem os desenvolva.
2. **Independência 100%:** Permitir que cada plugin ou serviço funcione de forma integral e autônoma, sem depender de um orquestrador central para existir.
3. **Mecânica Plug & Play:** Automatizar a integração de novas interfaces no portal através de um sistema de registros dinâmicos.

## 🚀 Filosofia Source-Driven
Diferente de bibliotecas tradicionais que exportam código compilado (dist), a Sarak UI exporta seu **código-fonte (TypeScript/TSX)**. 
- **Vantagem:** A compilação ocorre no consumidor final (App), permitindo otimizações de bundle e injeção de tokens de design em tempo de execução.
- **Vantagem:** Total compatibilidade com Tailwind CSS v4 e motores de estilização modernos.

## 🛡️ O Princípio de Autonomia
O grande diferencial da Sarak UI é sua capacidade de **Auto-Cura (Self-Healing)**. Se o módulo for carregado em um ambiente vazio, ele ativa seu próprio motor de estado. Se for carregado dentro do ecossistema Sarak, ele se "acopla" ao estado global de forma transparente.

---
[Próximo: Anatomia do Tema](./1-anatomia-do-tema.md)
