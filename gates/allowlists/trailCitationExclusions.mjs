/**
 * ALLOWLIST do gate de citação do rastro de execução (`check-trail-citation.mjs`).
 *
 * Arquivos cujo DOMÍNIO é o identificador de plan — o próprio detector, o próprio
 * índice de plans e os testes deles. Citar um identificador ali não é rastro
 * deixado por acidente: é exemplo do padrão que o código detecta, ou dado de
 * fixture do teste. Nenhuma outra entrada é aceita por diretório ou padrão
 * genérico — cada uma é um caminho exato, com o motivo escrito ao lado.
 *
 * Regras de manutenção:
 *  - Arquivo que parou de citar identificador de plan → REMOVA a entrada daqui.
 *  - Entrada sem motivo, ou de arquivo que não existe mais → o gate reprova
 *    (exclusão obsoleta), mesmo idioma de `barrelExclusions.mjs`.
 */
export const TRAIL_CITATION_EXCLUSIONS = Object.freeze({
    'gates/scripts/contrato/check-trail-citation.mjs':
        'É o próprio gate — o cabeçalho e os exemplos de padrão mostram a forma exata dos ' +
        'identificadores que ele reconhece.',
    'gates/scripts/contrato/__tests__/check-trail-citation.test.mjs':
        'Self-test do gate — os casos pegos e liberados plantam identificadores de exemplo no ' +
        'formato reconhecido, lado a lado.',
    'scripts/generate-plan-index.mjs':
        'Gerador da fila de plans — a prosa do cabeçalho nomeia a plan de onde veio a decisão de ' +
        'desenho do próprio gerador.',
    'scripts/__tests__/generate-plan-index.test.mjs':
        'Teste do gerador acima — as fixtures citam identificadores de plan como dado de exemplo ' +
        'da fila.',
    'gates/scripts/contrato/check-plan-index-sync.mjs':
        'Gate irmão de sincronia plan × índice — a prosa do cabeçalho nomeia as plans que ' +
        'motivaram o vão que ele fecha.',
    'gates/scripts/contrato/__tests__/check-plan-index-sync.test.mjs':
        'Self-test do gate acima — a fixture cita um identificador fictício como dado de exemplo.',
});
