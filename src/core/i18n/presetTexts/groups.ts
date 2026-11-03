/** Títulos de grupos do painel de personalização. Ordem da tupla: pt, en, es, fr, de, it. */
type SixTuple = readonly [string, string, string, string, string, string];

export const PRESET_GROUP_TITLES: Readonly<Record<string, SixTuple>> = {
    sidebar: ['Barra lateral', 'Sidebar', 'Barra lateral', 'Barre latérale', 'Seitenleiste', 'Barra laterale'],
    topbar: ['Barra de topo', 'Top bar', 'Barra superior', 'Barre du haut', 'Obere Leiste', 'Barra superiore'],
    contentWidth: ['Largura do conteúdo', 'Content width', 'Ancho del contenido', 'Largeur du contenu', 'Inhaltsbreite', 'Larghezza del contenuto'],
    cards: ['Estilo dos cards', 'Card style', 'Estilo de las tarjetas', 'Style des cartes', 'Kartenstil', 'Stile delle schede'],
    cardTextures: ['Textura dos cards', 'Card texture', 'Textura de las tarjetas', 'Texture des cartes', 'Kartentextur', 'Texture delle schede'],
    corners: ['Cantos', 'Corners', 'Esquinas', 'Coins', 'Ecken', 'Angoli'],
    density: ['Densidade', 'Density', 'Densidad', 'Densité', 'Dichte', 'Densità'],
    shadow: ['Sombra', 'Shadow', 'Sombra', 'Ombre', 'Schatten', 'Ombra'],
    shadowDirection: ['Direção da sombra', 'Shadow direction', 'Dirección de la sombra', 'Direction de l\'ombre', 'Schattenrichtung', 'Direzione dell\'ombra'],
    border: ['Moldura', 'Border', 'Marco', 'Bordure', 'Rahmen', 'Cornice'],
    material: ['Material da superfície', 'Surface material', 'Material de la superficie', 'Matière de la surface', 'Oberflächenmaterial', 'Materiale della superficie'],
    glass: ['Vidro', 'Glass', 'Vidrio', 'Verre', 'Glas', 'Vetro'],
    atmosphere: ['Atmosfera', 'Atmosphere', 'Atmósfera', 'Atmosphère', 'Atmosphäre', 'Atmosfera'],
    gradient: ['Degradê do fundo', 'Background gradient', 'Degradado del fondo', 'Dégradé du fond', 'Hintergrundverlauf', 'Sfumatura dello sfondo'],
    textures: ['Texturas de fundo', 'Background textures', 'Texturas de fondo', 'Textures de fond', 'Hintergrundtexturen', 'Texture di sfondo'],
    buttons: ['Botões', 'Buttons', 'Botones', 'Boutons', 'Schaltflächen', 'Pulsanti'],
    buttonStyles: ['Botões por estilo', 'Buttons by style', 'Botones por estilo', 'Boutons par style', 'Schaltflächen nach Stil', 'Pulsanti per stile'],
    inputs: ['Campos', 'Fields', 'Campos', 'Champs', 'Felder', 'Campi'],
    tables: ['Tabelas', 'Tables', 'Tablas', 'Tableaux', 'Tabellen', 'Tabelle'],
    charts: ['Gráficos', 'Charts', 'Gráficos', 'Graphiques', 'Diagramme', 'Grafici'],
    modal: ['Janelas', 'Windows', 'Ventanas', 'Fenêtres', 'Fenster', 'Finestre'],
    notice: ['Dicas e avisos', 'Tips and notices', 'Consejos y avisos', 'Astuces et avis', 'Tipps und Hinweise', 'Suggerimenti e avvisi'],
    switch: ['Interruptores', 'Switches', 'Interruptores', 'Interrupteurs', 'Schalter', 'Interruttori'],
    scroll: ['Barra de rolagem', 'Scroll bar', 'Barra de desplazamiento', 'Barre de défilement', 'Bildlaufleiste', 'Barra di scorrimento'],
    badge: ['Selos e progresso', 'Badges and progress', 'Sellos y progreso', 'Badges et progression', 'Marken und Fortschritt', 'Etichette e avanzamento'],
    emptyState: ['Estados vazios', 'Empty states', 'Estados vacíos', 'États vides', 'Leere Zustände', 'Stati vuoti'],
    motion: ['Movimento', 'Motion', 'Movimiento', 'Mouvement', 'Bewegung', 'Movimento'],
    pageTransition: ['Troca de página', 'Page transition', 'Cambio de página', 'Changement de page', 'Seitenwechsel', 'Cambio di pagina'],
    icons: ['Ícones', 'Icons', 'Iconos', 'Icônes', 'Symbole', 'Icone'],
    fontPairs: ['Pares de fontes', 'Font pairs', 'Pares de fuentes', 'Paires de polices', 'Schriftpaare', 'Coppie di font'],
    typeScale: ['Escala tipográfica', 'Type scale', 'Escala tipográfica', 'Échelle typographique', 'Schriftskala', 'Scala tipografica'],
    fonts: ['Todas as fontes', 'All fonts', 'Todas las fuentes', 'Toutes les polices', 'Alle Schriften', 'Tutti i font'],
};

export const PRESET_FAMILY_TITLES: Readonly<Record<string, SixTuple>> = {
    technical: ['Técnicas', 'Technical', 'Técnicas', 'Techniques', 'Technisch', 'Tecniche'],
    organic: ['Orgânicas', 'Organic', 'Orgánicas', 'Organiques', 'Organisch', 'Organiche'],
    geometric: ['Geométricas', 'Geometric', 'Geométricas', 'Géométriques', 'Geometrisch', 'Geometriche'],
    materials: ['Materiais', 'Materials', 'Materiales', 'Matières', 'Materialien', 'Materiali'],
};

export const PRESET_FONT_CATEGORY_TITLES: Readonly<Record<string, SixTuple>> = {
    'Sans-Serif': ['Sem serifa', 'Sans-serif', 'Sin serifa', 'Sans empattement', 'Serifenlos', 'Senza grazie'],
    Serif: ['Com serifa', 'Serif', 'Con serifa', 'Avec empattement', 'Mit Serifen', 'Con grazie'],
    Display: ['De destaque', 'Display', 'De titulares', 'D\'affichage', 'Auszeichnung', 'Da titolo'],
    Monospace: ['Espaçamento fixo', 'Monospace', 'Ancho fijo', 'Chasse fixe', 'Festbreite', 'Spaziatura fissa'],
    Handwriting: ['Manuscritas', 'Handwriting', 'Manuscritas', 'Manuscrites', 'Handschrift', 'Calligrafiche'],
};

export const PRESET_UI_TEXT: Readonly<Record<'seeAll' | 'seeFewer' | 'seeAllCount' | 'searchOptionsPresets' | 'newBadge', SixTuple>> = {
    seeAll: ['Ver todas', 'See all', 'Ver todas', 'Tout voir', 'Alle anzeigen', 'Vedi tutte'],
    seeFewer: ['Ver menos', 'See fewer', 'Ver menos', 'Voir moins', 'Weniger anzeigen', 'Vedi meno'],
    seeAllCount: ['Ver todas ({count})', 'See all ({count})', 'Ver todas ({count})', 'Tout voir ({count})', 'Alle anzeigen ({count})', 'Vedi tutte ({count})'],
    searchOptionsPresets: ['Opções', 'Options', 'Opciones', 'Options', 'Optionen', 'Opzioni'],
    newBadge: ['Novo', 'New', 'Nuevo', 'Nouveau', 'Neu', 'Nuovo'],
};
