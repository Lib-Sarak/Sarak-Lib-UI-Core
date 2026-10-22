import { SARAK_CSS } from './__sarakCss';
import { injectSarakStyles } from './injectStyles';

export const readCspNonceFromMeta = (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const nonceMeta = document.querySelector<HTMLMetaElement>('meta[property="csp-nonce"]');
    const metaNonce = nonceMeta?.nonce?.trim();
    return metaNonce || undefined;
};

injectSarakStyles(SARAK_CSS, readCspNonceFromMeta());
