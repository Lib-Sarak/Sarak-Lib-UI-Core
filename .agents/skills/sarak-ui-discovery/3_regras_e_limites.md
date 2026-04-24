# Regras e Limites: Sarak UI Discovery

Para garantir a integridade da Arquitetura Atômica, estas regras são inegociáveis.

1. **NÃO importe código**: É terminantemente proibido importar qualquer arquivo (JS/TS/CSS) de módulos `Sarak-Lib-*` (exceto peerDependencies de base como React). A comunicação é 100% via rede.
2. **NUNCA quebre o Shell**: Se um módulo falhar no `fetch` do manifesto ou estiver offline, a UI deve apenas omitir a aba ou exibir um sinalizador de erro local. O `UI-Core` deve permanecer funcional.
3. **NÃO saia do escopo**: Esta skill trata apenas de **Descoberta e Renderização Agnóstica**. Se detectar problemas de segurança ou banco de dados, registre-os e use as skills especialistas correspondentes (`auth-security` ou `db-sovereignty`).
4. **PROIBIDO Registry Global**: Não utilize variáveis globais ou estados compartilhados fora do motor de descoberta do `UI-Core` para gerenciar os módulos.
5. **NÃO ignore o Cache**: Implemente um mecanismo de cache curto (Memory ou SessionStorage) para o manifesto para evitar chamadas de rede excessivas a cada re-render da Sidebar.
