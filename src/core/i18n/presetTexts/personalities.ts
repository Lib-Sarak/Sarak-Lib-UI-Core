import type { PresetTextTable } from './types';

/** Textos das Personalidades do painel. Ordem das tuplas: en, es, fr, de, it. O português é o do próprio preset. */
export const PRESET_TEXTS_PERSONALITIES: PresetTextTable = {
    'personality-corporate': {
        name: ['Corporate', 'Corporativo', 'Corporate', 'Unternehmen', 'Aziendale'],
        description: [
            'Sober and dense, with strong tables and a dark side bar: the look of a company system.',
            'Sobrio y denso, con tablas marcadas y la barra lateral oscura: el aire de un sistema de empresa.',
            "Sobre et dense, avec des tableaux marqués et la barre latérale sombre : l'allure d'un système d'entreprise.",
            'Nüchtern und dicht, mit kräftigen Tabellen und dunkler Seitenleiste: der Look eines Unternehmenssystems.',
            "Sobrio e denso, con tabelle marcate e la barra laterale scura: l'aspetto di un sistema aziendale.",
        ],
    },
    'personality-executive': {
        name: ['Executive', 'Ejecutivo', 'Exécutif', 'Executive', 'Esecutivo'],
        description: [
            'Roomy and serif, with navigation on top: few things per screen, each with room to breathe.',
            'Espacioso y con serifa, con la navegación arriba: pocas cosas por pantalla, cada una con aire.',
            "Aéré et à empattements, avec la navigation en haut : peu d'éléments par écran, chacun avec de la place.",
            'Großzügig und mit Serifen, Navigation oben: wenige Dinge pro Bildschirm, jedes mit Luft.',
            'Spazioso e con grazie, con la navigazione in alto: poche cose per schermata, ognuna con il suo respiro.',
        ],
    },
    'personality-technical': {
        name: ['Technical', 'Técnico', 'Technique', 'Technisch', 'Tecnico'],
        description: [
            'Code font, square corners and everything compact: the look of an engineering tool.',
            'Fuente de código, esquinas rectas y todo compacto: el aire de una herramienta de ingeniería.',
            "Police de code, coins droits et tout compact : l'allure d'un outil d'ingénierie.",
            'Code-Schrift, eckige Ecken und alles kompakt: der Look eines Ingenieurwerkzeugs.',
            "Font da codice, angoli retti e tutto compatto: l'aspetto di uno strumento da ingegneria.",
        ],
    },
    'personality-modern': {
        name: ['Modern', 'Moderno', 'Moderne', 'Modern', 'Moderno'],
        description: [
            'Rounded and light: the side bar floats free of the screen, in the brand color, and the motion has a bounce.',
            'Redondeado y ligero: la barra lateral flota suelta de la pantalla, en el color de la marca, y el movimiento rebota.',
            "Arrondi et léger : la barre latérale flotte, détachée de l'écran, aux couleurs de la marque, et le mouvement a du rebond.",
            'Abgerundet und leicht: die Seitenleiste schwebt frei vom Bildschirm, in Markenfarbe, und die Bewegung federt nach.',
            'Arrotondato e leggero: la barra laterale fluttua staccata dallo schermo, nel colore del brand, e il movimento rimbalza.',
        ],
    },
    'personality-soft': {
        name: ['Soft', 'Suave', 'Doux', 'Sanft', 'Morbido'],
        description: [
            'No borders and with soft shadows: everything is set apart by volume, not by lines.',
            'Sin bordes y con sombras suaves: todo se separa por volumen y no por líneas.',
            'Sans bordures et avec des ombres douces : tout se distingue par le volume et non par des lignes.',
            'Ohne Rahmen und mit weichen Schatten: alles trennt sich durch Volumen statt durch Linien.',
            'Senza bordi e con ombre morbide: tutto si separa per volume e non per linee.',
        ],
    },
    'personality-editorial': {
        name: ['Editorial', 'Editorial', 'Éditorial', 'Redaktionell', 'Editoriale'],
        description: [
            'The text is the star: large, light headings, discreet bars and loose line spacing.',
            'El texto es el protagonista: títulos grandes y ligeros, barras discretas e interlineado suelto.',
            'Le texte est la vedette : titres grands et légers, barres discrètes et interligne aéré.',
            'Der Text steht im Mittelpunkt: große, leichte Überschriften, dezente Leisten und lockerer Zeilenabstand.',
            "Il testo è il protagonista: titoli grandi e leggeri, barre discrete e interlinea ampia.",
        ],
    },
    'personality-brutalist': {
        name: ['Brutalist', 'Brutalista', 'Brutaliste', 'Brutalistisch', 'Brutalista'],
        description: [
            'Thick borders, square corners and heavy headings: high contrast, no disguise.',
            'Bordes gruesos, esquinas rectas y títulos pesados: contraste alto, sin disfraz.',
            'Bordures épaisses, coins droits et titres lourds : fort contraste, sans fard.',
            'Dicke Rahmen, eckige Ecken und schwere Überschriften: hoher Kontrast, ohne Verkleidung.',
            'Bordi spessi, angoli retti e titoli pesanti: contrasto alto, senza travestimenti.',
        ],
    },
    'personality-glass': {
        name: ['Glass', 'Vidrio', 'Verre', 'Glas', 'Vetro'],
        description: [
            'Translucent with atmosphere: crystal glass over a background of color blobs, and the top bar in pills.',
            'Translúcido y con atmósfera: vidrio cristalino sobre un fondo de manchas de color, y la barra superior en píldoras.',
            "Translucide et plein d'atmosphère : verre cristallin sur un fond de taches de couleur, et la barre du haut en pilules.",
            'Durchscheinend und mit Atmosphäre: Kristallglas über einem Hintergrund aus Farbflecken, die obere Leiste in Pillenform.',
            'Traslucido e con atmosfera: vetro cristallino su uno sfondo di macchie di colore, e la barra in alto a pillole.',
        ],
    },
    'personality-erp': {
        name: ['High-density ERP', 'ERP de alta densidad', 'ERP haute densité', 'ERP mit hoher Dichte', 'ERP ad alta densità'],
        description: [
            'The most data per screen: minimal spacing, a spreadsheet-style table and the brand at the bottom of the side bar.',
            'El máximo de datos por pantalla: espacios mínimos, tabla de hoja de cálculo y la marca en la base de la barra lateral.',
            "Le maximum de données par écran : espaces minimaux, tableau façon tableur et la marque en bas de la barre latérale.",
            'So viele Daten wie möglich pro Bildschirm: minimale Abstände, eine Tabelle wie in der Tabellenkalkulation und die Marke am Fuß der Seitenleiste.',
            'Il massimo dei dati per schermata: spazi minimi, tabella in stile foglio di calcolo e il marchio in fondo alla barra laterale.',
        ],
    },
    'personality-operations': {
        name: ['Operations panel', 'Panel de operación', "Panneau d'exploitation", 'Betriebsanzeige', 'Pannello operativo'],
        description: [
            'For screens left on all day: no animation, firm icons, a filled active item and striped rows.',
            'Para pantallas encendidas todo el día: sin animación, iconos firmes, elemento activo relleno y filas con rayas.',
            "Pour les écrans allumés toute la journée : sans animation, icônes marquées, élément actif rempli et lignes rayées.",
            'Für Bildschirme, die den ganzen Tag laufen: ohne Animation, kräftige Symbole, gefülltes aktives Element und gestreifte Zeilen.',
            "Per schermi sempre accesi: senza animazioni, icone decise, voce attiva piena e righe a strisce.",
        ],
    },
};
