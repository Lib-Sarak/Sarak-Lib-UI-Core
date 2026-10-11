export const SARAK_BUILD_INFO = {
    "baseCommit": "a72e0bca1312394de5aaa787442b4171ea7e574f",
    "baseCommitShort": "a72e0bc",
    "builtAt": "2026-10-11T20:29:04.450Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
