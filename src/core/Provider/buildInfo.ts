export const SARAK_BUILD_INFO = {
    "baseCommit": "f7091e4b366959e396939e07e8541f2cbfcb2356",
    "baseCommitShort": "f7091e4",
    "builtAt": "2026-10-25T00:29:51.231Z",
    "libVersion": "8.0.0-rc.2",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
