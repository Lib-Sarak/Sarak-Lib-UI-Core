import type { SarakThemePayload } from '../types';

/** O `config` que não é referência do host: a composição de tema o trata como se o host não declarasse nada. */
export const NO_HOST_CONFIG = {} as SarakThemePayload;

/**
 * O `config` como REFERÊNCIA DO HOST — a porta única por onde toda composição de tema o lê. Com `persistence.configIsSavedDesign`,
 * o `config` é o design gravado do usuário e não a imposição do host: compô-lo como host arrastaria o resto do tema
 * anterior para o tema novo.
 */
export const resolveHostConfig = (config: SarakThemePayload | undefined, configIsSavedDesign: boolean): SarakThemePayload | undefined =>
    configIsSavedDesign ? NO_HOST_CONFIG : config;
