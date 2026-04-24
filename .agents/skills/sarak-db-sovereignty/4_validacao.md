# Checklist de Validação: Sarak DB Sovereignty

Aplique este checklist para validar se o módulo atingiu a Soberania de Dados.

## Fase de Estrutura
- [ ] A pasta `/database` na raiz do módulo contém os scripts `init.sql` e `migrations/`?
- [ ] Scripts legados fora do diretório do módulo foram deletados ou migrados?

## Fase de Desacoplamento
- [ ] Busca por `REFERENCES` no SQL: todos os alvos pertencem ao próprio módulo?
- [ ] O módulo usa um schema próprio (ex: `CREATE SCHEMA IF NOT EXISTS [nome_modulo]`)?
- [ ] Não existem dependências de "Shared DB" hardcoded?

## Fase de Funcionalidade
- [ ] O comando de inicialização do backend funciona e cria as tabelas corretamente?
- [ ] Foi realizado um teste de "Banco Limpo" (instalação do zero)?
- [ ] O módulo consegue rodar sem que outros bancos/schemas de módulos vizinhos existam?

## Fase de Registro
- [ ] O resultado foi registrado no `gsd-registro-sessao`?

---
**Critério de Sucesso:** O módulo deve ser "Portável". Se você copiar a pasta do módulo para um novo projeto e apontar um banco vazio, ele deve funcionar perfeitamente.
