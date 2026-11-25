import type { SarakThemePayload } from './types';
import type { SarakDesignFormat, SarakSavedDesign } from './designFormatTypes';

/** As portas e a chave de persistência do design (`options.persistence`). */
export interface SarakPersistenceOptions {
    /** Estratégia de persistência (ADR-009 §2.2). Default `'hybrid'` = localStorage + onSave/onLoad; `'local'` ignora as duas portas; `'remote'` para de gravar localStorage e SUBSTITUI pelo que `onLoad` resolver, degradando para `'local'` com aviso único sem porta configurada. */
    strategy?: 'local' | 'remote' | 'hybrid';
    storageKey?: string;
    /** Escopa a chave por tenant (ADR-009 §2.1): vira `${storageKey}::tenant:${tenantId}`. Opaco, não validado. */
    tenantId?: string;
    /** Quando true, o config fornecido pelo host vence o cache local no primeiro quadro. Default false preserva cache-wins. */
    preferConfigOverCache?: boolean;
    /** Liga quando o `config` é o design gravado do usuário (white label): as escolhas dele sobrevivem à troca de tema. Desligado (padrão), o `config` é valor do host e não é gravado como escolha. */
    configIsSavedDesign?: boolean;
    /** `activeThemeId` (2º parâmetro, ADITIVO): o id do tema EFETIVAMENTE
     *  no ar (`resolvedThemeId`) no instante deste save. Vem preenchido sempre que a
     *  sessão resolveu um tema (seed ou aplicado em runtime); vem `undefined` só
     *  quando não há tema resolvido ainda. NÃO faz parte de `design` — é identidade,
     *  não token; o payload continua sendo o mesmo objeto que o export de tema
     *  produz. Quem já implementa `onSave(design)` continua funcionando: em
     *  JavaScript, argumento extra não declarado é ignorado. `format` (3º): `2` quando `design` traz só as escolhas;
     *  devolva-o no `onLoad` (`SarakSavedDesign`) — sem ele, o gravado é lido como do formato anterior. */
    onSave?: (design: SarakThemePayload, activeThemeId?: string, format?: SarakDesignFormat) => Promise<void> | void;
    onLoad?: () => Promise<SarakThemePayload | SarakSavedDesign | null | undefined>
        | SarakThemePayload | SarakSavedDesign | null | undefined;
    /** Segura os filhos até `onLoad` resolver — troca flash por tela vazia (ver "o primeiro paint" em `docs/persistencia-de-tema.md`). Default `false`. */
    strictBackendSync?: boolean;
    /** Sincroniza o tema entre abas/apps que compartilham a `storageKey`. Escuta `storage` e reaplica o design (validado) quando outra aba grava a mesma chave. Default `true`. */
    crossTabSync?: boolean;
}
