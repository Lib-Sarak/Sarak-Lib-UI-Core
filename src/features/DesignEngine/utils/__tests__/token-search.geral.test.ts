import { describe, expect, it } from 'vitest';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { buildSearchableTokens } from '../../Main/hooks/searchableTokens';
import { buildCatalogMap, searchTokens } from '../token-search';

const catalogMap = buildCatalogMap(TokenCatalog);
const tokens = buildSearchableTokens('pt', catalogMap);
const top = (query: string): string | undefined => searchTokens(query, tokens, catalogMap)[0]?.id;

/** Frase vaga de quem não sabe o nome do ajuste: abre o ajuste geral do grupo, não o de um componente específico. */
describe('busca do painel — frase vaga abre o token geral', () => {
    it.each([
        ['quero bordas mais grossas', 'borderWidth'],
        ['cor do título da página', 'titleColor'],
        ['velocidade das animações', 'motionDurationNormal'],
        ['deixar os cantos mais retos', 'borderRadius'],
        ['como deixo o site escuro', 'mode'],
    ])('`%s` abre %s', (query, expected) => {
        expect(top(query)).toBe(expected);
    });

    it('quem nomeia o componente continua no específico', () => {
        expect(top('arredondamento da tabela')).toBe('tableBorderRadius');
        expect(top('velocidade de digitação do chat')).toBe('chatAnimationSpeed');
    });
});
