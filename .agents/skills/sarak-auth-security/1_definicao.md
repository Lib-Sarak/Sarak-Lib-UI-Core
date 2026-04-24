# Skill: Sarak Auth Security — Definição

## O que é
A `sarak-auth-security` é a guardiã da integridade de cada módulo. No modelo legado, a autenticação era tratada pelo Shared e injetada via Contextos Globais no React ou Middleware compartilhado no backend. Se o Shared fosse comprometido ou falhasse, a segurança de todos os módulos ruía.

A Segurança Atômica v5.5 implementa o princípio de **Zero Trust**. Cada módulo atua como um sistema independente que não "confia" cegamente no que a UI está dizendo. Ele recebe um Token e utiliza uma API de Identidade (central ou local) para validar esse Token a cada requisição sensível.

## Objetivo
- Eliminar o compartilhamento de contextos de autenticação via código.
- Garantir que cada módulo tenha seu próprio `SecurityMiddleware` que valida credenciais via rede.
- Proteger o sistema contra bypass de segurança entre módulos independentes.

## Responsabilidades Exclusivas desta Skill
1. Implementar Middlewares de verificação de Token (JWT/OAuth) que usem chamadas de API de rede.
2. Configurar chaves de API e Segredos (.env) específicos para que cada módulo se identifique perante o orquestrador.
3. Garantir a higienização de inputs para prevenir injeções em bancos soberanos.

## Quando usar
- Ao remover o `AuthContext` vindo do Shared de um módulo de interface.
- Ao criar novos endpoints de backend que exigem proteção por papel (RBAC).
- Quando for necessário isolar as permissões de um módulo específico sem afetar o resto do sistema.
