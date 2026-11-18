import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** As notas que o painel põe junto do controle de um token: a preferência pessoal por cima do tema, o controle que não vale agora e o intervalo da largura. */
export const CATALOG_TOKEN_NOTES = {
    tokenNotePersonal: {
        pt: 'Sua preferência pessoal ({value}) está por cima do tema: o que você muda aqui não aparece para você.',
        en: 'Your personal preference ({value}) is on top of the theme: what you change here does not show for you.',
        es: 'Su preferencia personal ({value}) está por encima del tema: lo que cambie aquí no se ve para usted.',
        fr: 'Votre préférence personnelle ({value}) prime sur le thème : ce que vous changez ici ne s’affiche pas pour vous.',
        de: 'Ihre persönliche Einstellung ({value}) liegt über dem Theme: Was Sie hier ändern, sehen Sie nicht.',
        it: 'La tua preferenza personale ({value}) ha la precedenza sul tema: ciò che cambi qui non lo vedi.',
    },
    tokenNotePersonalClear: {
        pt: 'Apagar minha preferência', en: 'Clear my preference', es: 'Borrar mi preferencia',
        fr: 'Effacer ma préférence', de: 'Meine Einstellung löschen', it: 'Cancella la mia preferenza',
    },
    tokenNoteOnlyTopbar: {
        pt: 'Só vale com navegação no topo. O tema usa a navegação lateral.',
        en: 'Only applies with top navigation. The theme uses side navigation.',
        es: 'Solo vale con navegación superior. El tema usa navegación lateral.',
        fr: 'Ne s’applique qu’avec la navigation en haut. Le thème utilise la navigation latérale.',
        de: 'Gilt nur bei Navigation oben. Das Theme nutzt die seitliche Navigation.',
        it: 'Vale solo con la navigazione in alto. Il tema usa la navigazione laterale.',
    },
    tokenNoteOnlySidebar: {
        pt: 'Só vale com navegação lateral. O tema usa a navegação no topo.',
        en: 'Only applies with side navigation. The theme uses top navigation.',
        es: 'Solo vale con navegación lateral. El tema usa navegación superior.',
        fr: 'Ne s’applique qu’avec la navigation latérale. Le thème utilise la navigation en haut.',
        de: 'Gilt nur bei seitlicher Navigation. Das Theme nutzt die Navigation oben.',
        it: 'Vale solo con la navigazione laterale. Il tema usa la navigazione in alto.',
    },
    tokenNoteWidthRange: {
        pt: 'Entre {min} e {max} px: o piso e o teto da lateral.',
        en: 'Between {min} and {max} px: the sidebar floor and ceiling.',
        es: 'Entre {min} y {max} px: el piso y el techo de la lateral.',
        fr: 'Entre {min} et {max} px : le plancher et le plafond de la barre latérale.',
        de: 'Zwischen {min} und {max} px: Unter- und Obergrenze der Seitenleiste.',
        it: 'Tra {min} e {max} px: il minimo e il massimo della laterale.',
    },
    tokenNoteValueSidebar: { pt: 'Lateral', en: 'Side', es: 'Lateral', fr: 'Latérale', de: 'Seitlich', it: 'Laterale' },
    tokenNoteValueTopbar: { pt: 'Topo', en: 'Top', es: 'Superior', fr: 'Haut', de: 'Oben', it: 'Alto' },
    tokenNoteValueCollapsed: { pt: 'recolhida', en: 'collapsed', es: 'recogida', fr: 'réduite', de: 'eingeklappt', it: 'ridotta' },
    tokenNoteValueExpanded: { pt: 'aberta', en: 'open', es: 'abierta', fr: 'ouverte', de: 'offen', it: 'aperta' },
    tokenNoteValueSystem: { pt: 'do sistema', en: 'system', es: 'del sistema', fr: 'du système', de: 'System', it: 'di sistema' },
} satisfies Record<string, LibraryTextEntry>;
