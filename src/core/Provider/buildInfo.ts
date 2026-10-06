export const SARAK_BUILD_INFO = {
    "baseCommit": "d117cc399d4829106bf1e8876ab305771ac3228e",
    "baseCommitShort": "d117cc3",
    "builtAt": "2026-10-06T02:52:26.715Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
