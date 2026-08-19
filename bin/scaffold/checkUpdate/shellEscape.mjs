/**
 * O `^` de um spec `#semver:^N.0.0` sobrevive a `execFileSync('git', [...])` (argv,
 * sem shell) mas NÃO sobrevive a `execSync(comandoComposto)` no Windows — o shell
 * default do Node lá é `cmd.exe`, que trata `^` como caractere de escape FORA de
 * aspas, e o consome em silêncio. Medido nesta plan, em consumidor real: `npm
 * install …#semver:^6.0.0` chegou ao `package.json` como `…#semver:6.0.0`.
 *
 * **Dobrar o `^` (`^^`) NÃO resolve** — medido também: `npm` no Windows roda atrás
 * de `npm.cmd`, um script batch que reencaminha os argumentos (`%*`) para o `node`
 * real, e esse segundo salto consome o caractere que sobrou da primeira dobra. O que
 * sobrevive aos DOIS saltos é o clássico: colocar o token inteiro entre aspas duplas
 * — `cmd.exe` suspende a interpretação de `^` dentro de uma string entre aspas, e a
 * aspa acompanha o argumento no reencaminhamento do batch. Só no Windows: em POSIX
 * `^` não é metacaractere e as aspas, aqui, seriam inofensivas mas desnecessárias.
 */
const TOKEN_WITH_CARET_RE = /(\S*\^\S*)/g;

export const escapeCaretForWindowsShell = (command, platform = process.platform) =>
    platform === 'win32' ? command.replace(TOKEN_WITH_CARET_RE, '"$1"') : command;
