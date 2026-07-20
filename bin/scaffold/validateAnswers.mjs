import { STACKS, STORAGES, MODES } from './constants.mjs';

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

/** Valida a entrevista (Spec 21 §2.2) antes de qualquer geração de arquivo. */
export function validateAnswers(answers) {
    assertOneOf({ value: answers.mode, allowed: MODES, label: 'Modo' });
    assertOneOf({ value: answers.stack, allowed: STACKS, label: 'Stack' });
    assertOneOf({ value: answers.storage, allowed: STORAGES, label: 'Storage' });
    assertPort({ value: answers.backendPort, label: 'Porta do backend' });
    assertPort({ value: answers.frontendPort, label: 'Porta do frontend' });
    return answers;
}
