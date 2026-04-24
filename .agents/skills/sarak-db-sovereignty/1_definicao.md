# Skill: Sarak DB Sovereignty — Definição

## O que é
A `sarak-db-sovereignty` é a guia técnica para a descentralização de dados no ecossistema Sarak. Na arquitetura Atômica, o conceito de "Banco de Dados Central" é abolido em favor da **Soberania de Módulo**. 

Isso significa que cada módulo é o único responsável por criar, migrar e gerenciar suas tabelas. Nenhuma tabela de um módulo deve depender de uma `Foreign Key` (FK) física para uma tabela de outro módulo no nível do banco de dados (o vínculo deve ser lógico/aplicacional).

## Objetivo
- Mover toda a lógica de persistência para dentro do respectivo diretório do módulo (`/database`).
- Garantir que um módulo possa ser instalado em um novo ambiente e criar sua estrutura de dados automaticamente.
- Eliminar o acoplamento SQL entre módulos, permitindo que cada um use o dialeto ou tecnologia de banco que melhor lhe couber.

## Responsabilidades Exclusivas desta Skill
1. Identificar e extrair scripts SQL de arquivos globais para pastas `/database` locais.
2. Auditar schemas para identificar acoplamento via FKs cross-module.
3. Projetar scripts de inicialização (`init.sql`) e migrations que garantam o estado "Zero-Conf" do módulo.

## Quando usar
- Ao detectar arquivos de migração ou seeds em diretórios centrais (como no antigo `Shared`).
- Ao adicionar novas tabelas a um módulo `Sarak-Lib-*`.
- Durante o processo de "splitting" de um banco de dados monolítico para microsserviços.
