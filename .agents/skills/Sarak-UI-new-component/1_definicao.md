# 1. Definição do Escopo

## Objetivo
O objetivo principal desta skill é permitir que desenvolvedores ou agentes de IA adicionem novos componentes visuais/tokens de design ao sistema garantindo a integridade e arquitetura híbrida (Script + Database) estabelecida pela regra 1:1:1:1.

## O Que É a Paridade 1:1:1:1?
Quando criamos um token (ex: `buttonNeonGlow`), ele não existe isoladamente. Ele obrigatoriamente deve residir de forma síncrona em 4 pilares:
1. **Schema Atômico**: Estar tipado e catalogado em seu respectivo grupo em `src/core/Design/schema/*`.
2. **MasterMap**: A categoria do schema precisa estar vinculada no `MASTER_DESIGN_MAP`.
3. **Database Theme Map**: O token deve estar mapeado no `theme_table_mapping.json` (que será lido pelo backend para salvar a propriedade no banco de dados na coluna JSONB correta).
4. **Gêmeo Digital**: A variável CSS do token (ex: `--btn-neon-glow`) deve ser extraída e injetada na interface no provider.

Se qualquer uma das 4 pontas estiver ausente, o sistema estará quebrado em ambientes de produção.
