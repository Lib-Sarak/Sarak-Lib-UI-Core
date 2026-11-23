import DecisionConfig from '../config/design-decisions.json';
import type { DecisionDef } from './decisions';

const BARS_QUESTIONS = (DecisionConfig as DecisionDef[]).find((decision) => decision.id === 'bars')?.questions ?? [];
const BAR_TOKEN_IDS: ReadonlySet<string> = new Set(BARS_QUESTIONS.flatMap((question) => question.tokens));
const BAR_TOKEN_PATTERNS: readonly RegExp[] = BARS_QUESTIONS.flatMap((question) => (question.fineMatch ? [new RegExp(question.fineMatch)] : []));

/** O token é da decisão Barras: uma pergunta dela o cita, ou o `fineMatch` de uma o reclama. */
export const isBarToken = (tokenId: string): boolean => BAR_TOKEN_IDS.has(tokenId) || BAR_TOKEN_PATTERNS.some((pattern) => pattern.test(tokenId));

/** O token pertence ao pedaço do pilar que a decisão lê (`tokenScope`); sem escopo, a decisão lê tudo. */
export const inScope = (def: DecisionDef, tokenId: string): boolean => {
    if (def.tokenScope === 'bars') return isBarToken(tokenId);
    return def.tokenScope === 'notBars' ? !isBarToken(tokenId) : true;
};

