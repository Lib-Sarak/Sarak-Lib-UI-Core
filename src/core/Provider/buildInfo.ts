export const SARAK_BUILD_INFO = {
    "baseCommit": "c4a8c2091240cfb4be2e64bffc1a47e3bc257cd7",
    "baseCommitShort": "c4a8c20",
    "builtAt": "2026-10-22T07:50:07.123Z",
    "libVersion": "8.0.0-rc.2",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
