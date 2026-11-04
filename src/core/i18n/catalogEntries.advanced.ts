import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos do painel arrastável, do mapa, da assinatura, do tour e do carrossel. */
export const CATALOG_ADVANCED = {
    dashboardGridLoading: {
        pt: 'Carregando o painel…', en: 'Loading the dashboard…', es: 'Cargando el panel…',
        fr: 'Chargement du tableau de bord…', de: 'Dashboard wird geladen…', it: 'Caricamento del pannello…',
    },
    dashboardWidgetHint: {
        pt: 'Setas movem o widget; Shift com as setas redimensiona.', en: 'Arrow keys move the widget; Shift with arrow keys resizes it.',
        es: 'Las flechas mueven el widget; Shift con las flechas lo redimensiona.', fr: 'Les flèches déplacent le widget ; Maj avec les flèches le redimensionne.',
        de: 'Pfeiltasten verschieben das Widget; Umschalt mit Pfeiltasten ändert die Größe.', it: 'Le frecce spostano il widget; Maiusc con le frecce lo ridimensiona.',
    },
    mapLoading: {
        pt: 'Carregando o mapa…', en: 'Loading the map…', es: 'Cargando el mapa…',
        fr: 'Chargement de la carte…', de: 'Karte wird geladen…', it: 'Caricamento della mappa…',
    },
    mapNoTileUrl: {
        pt: 'Informe a URL dos blocos do mapa (tileUrl) para exibi-lo.', en: 'Provide the map tile URL (tileUrl) to display it.',
        es: 'Indique la URL de los mosaicos del mapa (tileUrl) para mostrarlo.', fr: 'Indiquez l’URL des tuiles de la carte (tileUrl) pour l’afficher.',
        de: 'Geben Sie die Kachel-URL der Karte (tileUrl) an, um sie anzuzeigen.', it: 'Indica l’URL dei riquadri della mappa (tileUrl) per mostrarla.',
    },
    mapAriaLabel: {
        pt: 'Mapa', en: 'Map', es: 'Mapa', fr: 'Carte', de: 'Karte', it: 'Mappa',
    },
    mapZoomIn: {
        pt: 'Aproximar', en: 'Zoom in', es: 'Acercar', fr: 'Zoom avant', de: 'Vergrößern', it: 'Ingrandisci',
    },
    mapZoomOut: {
        pt: 'Afastar', en: 'Zoom out', es: 'Alejar', fr: 'Zoom arrière', de: 'Verkleinern', it: 'Riduci',
    },
    signatureAriaLabel: {
        pt: 'Área de assinatura', en: 'Signature area', es: 'Área de firma',
        fr: 'Zone de signature', de: 'Unterschriftsfeld', it: 'Area di firma',
    },
    signatureClear: {
        pt: 'Limpar', en: 'Clear', es: 'Borrar', fr: 'Effacer', de: 'Löschen', it: 'Cancella',
    },
    signatureUndo: {
        pt: 'Desfazer traço', en: 'Undo stroke', es: 'Deshacer trazo', fr: 'Annuler le trait', de: 'Strich rückgängig', it: 'Annulla tratto',
    },
    signatureTypeInstead: {
        pt: 'Digitar o nome', en: 'Type the name', es: 'Escribir el nombre', fr: 'Saisir le nom', de: 'Namen eingeben', it: 'Digita il nome',
    },
    signatureDrawInstead: {
        pt: 'Desenhar a assinatura', en: 'Draw the signature', es: 'Dibujar la firma',
        fr: 'Dessiner la signature', de: 'Unterschrift zeichnen', it: 'Disegna la firma',
    },
    signatureTypedLabel: {
        pt: 'Nome completo', en: 'Full name', es: 'Nombre completo', fr: 'Nom complet', de: 'Vollständiger Name', it: 'Nome completo',
    },
    tourNext: {
        pt: 'Próximo', en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', it: 'Avanti',
    },
    tourBack: {
        pt: 'Voltar', en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück', it: 'Indietro',
    },
    tourSkip: {
        pt: 'Pular', en: 'Skip', es: 'Omitir', fr: 'Passer', de: 'Überspringen', it: 'Salta',
    },
    tourDone: {
        pt: 'Concluir', en: 'Done', es: 'Terminar', fr: 'Terminer', de: 'Fertig', it: 'Fine',
    },
    tourStepOf: {
        pt: 'Passo {current} de {total}', en: 'Step {current} of {total}', es: 'Paso {current} de {total}',
        fr: 'Étape {current} sur {total}', de: 'Schritt {current} von {total}', it: 'Passo {current} di {total}',
    },
    carouselLabel: {
        pt: 'Carrossel', en: 'Carousel', es: 'Carrusel', fr: 'Carrousel', de: 'Karussell', it: 'Carosello',
    },
    carouselPrevious: {
        pt: 'Slide anterior', en: 'Previous slide', es: 'Diapositiva anterior', fr: 'Diapositive précédente', de: 'Vorherige Folie', it: 'Diapositiva precedente',
    },
    carouselNext: {
        pt: 'Próximo slide', en: 'Next slide', es: 'Diapositiva siguiente', fr: 'Diapositive suivante', de: 'Nächste Folie', it: 'Diapositiva successiva',
    },
    carouselGoTo: {
        pt: 'Ir ao slide {number}', en: 'Go to slide {number}', es: 'Ir a la diapositiva {number}',
        fr: 'Aller à la diapositive {number}', de: 'Zu Folie {number}', it: 'Vai alla diapositiva {number}',
    },
    carouselPause: {
        pt: 'Pausar rotação', en: 'Pause rotation', es: 'Pausar rotación', fr: 'Mettre en pause', de: 'Rotation anhalten', it: 'Metti in pausa',
    },
    carouselPlay: {
        pt: 'Retomar rotação', en: 'Resume rotation', es: 'Reanudar rotación', fr: 'Reprendre la rotation', de: 'Rotation fortsetzen', it: 'Riprendi la rotazione',
    },
} satisfies Record<string, LibraryTextEntry>;
