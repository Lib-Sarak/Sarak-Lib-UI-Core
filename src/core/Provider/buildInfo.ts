export const SARAK_BUILD_INFO = {
    "baseCommit": "54233d24003f1db6a9939cebf644ca424373a315",
    "baseCommitShort": "54233d2",
    "builtAt": "2026-10-16T04:02:57.659Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
