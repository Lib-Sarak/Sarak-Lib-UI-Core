export const SARAK_BUILD_INFO = {
    "baseCommit": "f7e9218f4e7c3f1625da49bcee1700a376e877ac",
    "baseCommitShort": "f7e9218",
    "builtAt": "2026-10-24T01:04:33.032Z",
    "libVersion": "8.0.0-rc.2",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
