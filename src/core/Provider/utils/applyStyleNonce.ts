export const applyStyleNonce = (style: HTMLStyleElement, nonce?: string): void => {
    if (nonce) style.setAttribute('nonce', nonce);
};
