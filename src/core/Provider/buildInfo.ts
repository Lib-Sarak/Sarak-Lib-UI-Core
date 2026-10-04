export const SARAK_BUILD_INFO = {
    "baseCommit": "9117ece34c5f3a4adfb89aef78c3115dc67131fe",
    "baseCommitShort": "9117ece",
    "builtAt": "2026-10-04T20:25:31.126Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
