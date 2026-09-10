/**
 * Tabela única do conjunto que `isSafeMediaString` aceita/recusa, exercitada
 * nas DUAS barreiras (`validateDesign` e `useDesignVariables`) para provar que
 * elas aceitam e recusam exatamente o mesmo conjunto. Não é prova de que as
 * duas "chamam o mesmo predicado" — é prova de que o mesmo valor tem o mesmo
 * destino nas duas, valor a valor.
 */

const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

export interface MediaPredicateCase {
    value: string;
    accepted: boolean;
    reason: string;
}

export const MEDIA_PREDICATE_TABLE: MediaPredicateCase[] = [
    { value: '', accepted: true, reason: 'sem mídia — defaultValue/legacyValue do token e o preset "Nenhuma (Sem Mídia)"' },
    { value: 'https://cdn.example.com/bg.png', accepted: true, reason: 'URL https, sob a trava geral de breakout' },
    { value: 'http://intranet.local/bg.png', accepted: true, reason: 'mesma classe de risco que https — quem busca é o browser, não a lib' },
    { value: '/local/bg.png', accepted: true, reason: 'caminho relativo do próprio consumidor (ativo do host)' },
    { value: 'bg.png', accepted: true, reason: 'caminho relativo sem barra inicial — mesmo caso' },
    { value: `data:image/png;base64,${PNG_1PX}`, accepted: true, reason: 'mídia embutida bem-formada (imagem)' },
    { value: 'data:video/mp4;base64,AAAAAA==', accepted: true, reason: 'mídia embutida bem-formada (vídeo)' },
    { value: 'url("https://images.unsplash.com/photo-x?a=1")', accepted: true, reason: 'invólucro legado de CSS cru em volta de uma https:// válida' },
    { value: 'url(/local/bg.png)', accepted: true, reason: 'invólucro legado em volta de um caminho relativo' },
    { value: 'javascript:alert(1)', accepted: false, reason: 'esquema de URI perigoso' },
    { value: 'vbscript:msgbox(1)', accepted: false, reason: 'outro esquema de URI perigoso, fora da allowlist' },
    { value: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==', accepted: false, reason: 'data: com MIME que não é imagem/vídeo' },
    { value: 'data:image/png;base64,not_base64!!!', accepted: false, reason: 'data: de imagem com payload fora do alfabeto base64' },
    { value: `data:image/png;base64,${PNG_1PX}<script>alert(1)</script>`, accepted: false, reason: 'breakout anexado a uma data: bem-formada' },
    { value: 'https://evil.com/x?a=1;background:url(javascript:alert(1))', accepted: false, reason: 'breakout dentro de uma https:// válida' },
    { value: '/local/bg.png; } body{background:red}', accepted: false, reason: 'breakout dentro de um caminho relativo' },
    { value: ' javascript:alert(1)', accepted: false, reason: 'espaço antes do esquema não pode abrir o ramo de caminho relativo' },
    { value: '\tjavascript:alert(1)', accepted: false, reason: 'tab antes do esquema — mesma classe do caso anterior' },
    { value: '\njavascript:alert(1)', accepted: false, reason: 'quebra de linha antes do esquema — mesma classe do caso anterior' },
    { value: `${String.fromCharCode(0)}javascript:alert(1)`, accepted: false, reason: 'controle C0 (NUL) antes do esquema — fora do alcance de \\s, mesma classe' },
    { value: `${String.fromCharCode(1)}javascript:alert(1)`, accepted: false, reason: 'controle C0 (SOH) antes do esquema — mesma classe' },
];
