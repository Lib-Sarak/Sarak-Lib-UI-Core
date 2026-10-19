export const SARAK_BUILD_INFO = {
    "baseCommit": "9756d5f3ec00defdabc40336ec5a36fc093a9039",
    "baseCommitShort": "9756d5f",
    "builtAt": "2026-10-19T04:56:20.941Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
