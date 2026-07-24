import { MODES } from './constants.mjs';

function assertOneOf({ value, allowed, label }) {
    if (!allowed.includes(value)) {
        throw new Error(`[sarak-ui init] ${label} inválido: "${value}" (esperado um de: ${allowed.join(', ')})`);
    }
}

function assertPort({ value, label }) {
    if (!Number.isInteger(value) || value <= 0 || value > 65535) {
        throw new Error(`[sarak-ui init] ${label} inválida: "${value}" (esperado um inteiro entre 1 e 65535)`);
    }
}

/** Valida a entrevista (Spec 21 §2.2; simplificada pela Spec 45) antes de qualquer geração de arquivo. */
export function validateAnswers(answers) {
    assertOneOf({ value: answers.mode, allowed: MODES, label: 'Modo' });
    assertPort({ value: answers.frontendPort, label: 'Porta do frontend' });
    return answers;
}
