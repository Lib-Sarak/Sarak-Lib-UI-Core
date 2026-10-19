export const SARAK_BUILD_INFO = {
    "baseCommit": "7393c4a9e1d84021b3eba76dbf838219cc63f794",
    "baseCommitShort": "7393c4a",
    "builtAt": "2026-10-19T15:41:07.334Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
