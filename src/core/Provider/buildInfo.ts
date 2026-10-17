export const SARAK_BUILD_INFO = {
    "baseCommit": "da46a80712ed816b38e818de024723be3c730833",
    "baseCommitShort": "da46a80",
    "builtAt": "2026-10-16T23:36:26.817Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
