export const SARAK_BUILD_INFO = {
    "baseCommit": "f20bc4b984b841842e66f68c9749cf0b32c9f592",
    "baseCommitShort": "f20bc4b",
    "builtAt": "2026-10-05T19:57:43.493Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
