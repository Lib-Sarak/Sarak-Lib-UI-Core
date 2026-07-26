/**
 * Onde o kit `sarak-ui/` (Spec 50) mora no projeto do CONSUMIDOR.
 *
 * Estes caminhos são o contrato entre três coisas que precisam concordar: o que o
 * `START-HERE.md` manda o agente do importador fazer, o que o `init` escreve e o
 * que o `sarak:update` re-sincroniza. Mudou aqui, muda no START-HERE.
 */

/** A pasta do kit na raiz do consumidor — sempre re-sincronizada (é conteúdo gerado). */
export const KIT_DIR = 'sarak-ui';

/**
 * Cópias que o importador MOVE para o lugar canônico do projeto dele. O refresh só
 * toca nelas se já existirem: quem não moveu não recebe arquivo novo do nada, e quem
 * moveu não fica com um guia velho depois de atualizar a lib.
 */
export const MOVED_COPIES = [
    { from: 'GUIA-FRONTEND.md', to: 'specs/sarak-ui-guia-frontend.md', kind: 'file' },
    { from: 'skill', to: '.claude/skills/ui-integra-consumidor', kind: 'dir' },
    { from: 'skill', to: '.agents/skills/ui-integra-consumidor', kind: 'dir' },
];
