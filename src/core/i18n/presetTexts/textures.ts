import type { PresetTextTuple } from './types';

type NamedText = { pt: string; others: PresetTextTuple };
type SixTuple = readonly [string, string, string, string, string, string];

/** Nomes das texturas: pt limpo + en, es, fr, de, it. */
export const TEXTURE_NAMES: Readonly<Record<string, NamedText>> = {
    'grid': { pt: 'Grade técnica', others: ['Technical grid', 'Cuadrícula técnica', 'Grille technique', 'Technisches Raster', 'Griglia tecnica'] },
    'dots': { pt: 'Pontos', others: ['Dots', 'Puntos', 'Points', 'Punkte', 'Punti'] },
    'noise': { pt: 'Ruído analógico', others: ['Analog noise', 'Ruido analógico', 'Bruit analogique', 'Analoges Rauschen', 'Rumore analogico'] },
    'grain': { pt: 'Grão fotográfico', others: ['Photographic grain', 'Grano fotográfico', 'Grain photographique', 'Fotokorn', 'Grana fotografica'] },
    'mesh': { pt: 'Malha orgânica', others: ['Organic mesh', 'Malla orgánica', 'Maillage organique', 'Organisches Netz', 'Maglia organica'] },
    'waves': { pt: 'Ondas senoidais', others: ['Sine waves', 'Ondas senoidales', 'Ondes sinusoïdales', 'Sinuswellen', 'Onde sinusoidali'] },
    'squares': { pt: 'Quadrados industriais', others: ['Industrial squares', 'Cuadrados industriales', 'Carrés industriels', 'Industrielle Quadrate', 'Quadrati industriali'] },
    'stripes': { pt: 'Listras militares', others: ['Military stripes', 'Rayas militares', 'Rayures militaires', 'Militärstreifen', 'Strisce militari'] },
    'topo': { pt: 'Topografia', others: ['Topography', 'Topografía', 'Topographie', 'Topografie', 'Topografia'] },
    'diamond': { pt: 'Diamante', others: ['Diamond', 'Diamante', 'Diamant', 'Diamant', 'Diamante'] },
    'prestige': { pt: 'Prestígio', others: ['Prestige', 'Prestigio', 'Prestige', 'Prestige', 'Prestigio'] },
    'carbon': { pt: 'Fibra de carbono', others: ['Carbon fiber', 'Fibra de carbono', 'Fibre de carbone', 'Kohlefaser', 'Fibra di carbonio'] },
    'brushed': { pt: 'Metal escovado', others: ['Brushed metal', 'Metal cepillado', 'Métal brossé', 'Gebürstetes Metall', 'Metallo spazzolato'] },
    'frosted': { pt: 'Vidro fosco', others: ['Frosted glass', 'Vidrio esmerilado', 'Verre dépoli', 'Milchglas', 'Vetro smerigliato'] },
    'circuit': { pt: 'Circuitos clássicos', others: ['Classic circuits', 'Circuitos clásicos', 'Circuits classiques', 'Klassische Schaltkreise', 'Circuiti classici'] },
    'paper': { pt: 'Papel kraft', others: ['Kraft paper', 'Papel kraft', 'Papier kraft', 'Kraftpapier', 'Carta kraft'] },
    'scanlines': { pt: 'Linhas de monitor antigo', others: ['Old monitor lines', 'Líneas de monitor antiguo', 'Lignes d\'ancien écran', 'Linien alter Monitore', 'Linee da vecchio monitor'] },
    'hexagon': { pt: 'Hexagonais', others: ['Hexagons', 'Hexágonos', 'Hexagones', 'Sechsecke', 'Esagoni'] },
    'silk': { pt: 'Seda líquida', others: ['Liquid silk', 'Seda líquida', 'Soie liquide', 'Flüssige Seide', 'Seta liquida'] },
    'blueprint': { pt: 'Cianótipo', others: ['Cyanotype', 'Cianotipo', 'Cyanotype', 'Cyanotypie', 'Cianotipia'] },
    'aurora': { pt: 'Aurora boreal', others: ['Northern lights', 'Aurora boreal', 'Aurore boréale', 'Nordlicht', 'Aurora boreale'] },
    'stars': { pt: 'Campo estelar', others: ['Starfield', 'Campo estelar', 'Champ d\'étoiles', 'Sternenfeld', 'Campo stellare'] },
    'honeycomb': { pt: 'Favo de mel', others: ['Honeycomb', 'Panal de miel', 'Nid d\'abeilles', 'Honigwabe', 'Favo di miele'] },
    'isometric': { pt: 'Projeção isométrica', others: ['Isometric projection', 'Proyección isométrica', 'Projection isométrique', 'Isometrische Projektion', 'Proiezione isometrica'] },
    'radar': { pt: 'Radar tático', others: ['Tactical radar', 'Radar táctico', 'Radar tactique', 'Taktisches Radar', 'Radar tattico'] },
    'crosshatch': { pt: 'Hachura cruzada', others: ['Cross-hatching', 'Sombreado cruzado', 'Hachures croisées', 'Kreuzschraffur', 'Tratteggio incrociato'] },
    'micro-dots': { pt: 'Micropontos', others: ['Micro dots', 'Micropuntos', 'Micropoints', 'Mikropunkte', 'Micropunti'] },
    'pinstripes': { pt: 'Listras finas', others: ['Pinstripes', 'Rayas finas', 'Fines rayures', 'Nadelstreifen', 'Righe sottili'] },
    'constellation': { pt: 'Constelação', others: ['Constellation', 'Constelación', 'Constellation', 'Sternbild', 'Costellazione'] },
    'circuit-pro': { pt: 'Circuitos avançados', others: ['Advanced circuits', 'Circuitos avanzados', 'Circuits avancés', 'Fortgeschrittene Schaltkreise', 'Circuiti avanzati'] },
    'carbon-tech': { pt: 'Fibra de carbono técnica', others: ['Technical carbon fiber', 'Fibra de carbono técnica', 'Fibre de carbone technique', 'Technische Kohlefaser', 'Fibra di carbonio tecnica'] },
    'topo-deep': { pt: 'Topografia profunda', others: ['Deep topography', 'Topografía profunda', 'Topographie profonde', 'Tiefe Topografie', 'Topografia profonda'] },
    'prism-mesh': { pt: 'Malha de prismas', others: ['Prism mesh', 'Malla de prismas', 'Maillage de prismes', 'Prismennetz', 'Maglia di prismi'] },
    'cyber-binary': { pt: 'Código binário', others: ['Binary code', 'Código binario', 'Code binaire', 'Binärcode', 'Codice binario'] },
    'blueprint-pro': { pt: 'Projeto azul avançado', others: ['Advanced blueprint', 'Plano azul avanzado', 'Plan bleu avancé', 'Fortgeschrittener Bauplan', 'Progetto blu avanzato'] },
    'wave-pulse': { pt: 'Pulso de onda', others: ['Wave pulse', 'Pulso de onda', 'Impulsion d\'onde', 'Wellenpuls', 'Impulso d\'onda'] },
    'none': { pt: 'Nenhuma', others: ['None', 'Ninguna', 'Aucune', 'Keine', 'Nessuna'] },
    'wood': { pt: 'Madeira', others: ['Wood', 'Madera', 'Bois', 'Holz', 'Legno'] },
    'stucco': { pt: 'Reboco', others: ['Stucco', 'Estuco', 'Stuc', 'Stuck', 'Stucco'] },
    'fluid': { pt: 'Fluido dinâmico', others: ['Dynamic fluid', 'Fluido dinámico', 'Fluide dynamique', 'Dynamische Flüssigkeit', 'Fluido dinamico'] },
    'nebula': { pt: 'Nebulosa', others: ['Nebula', 'Nebulosa', 'Nébuleuse', 'Nebel', 'Nebulosa'] },
};

/** Modelos de descrição com o marcador {name}. Ordem da tupla: pt, en, es, fr, de, it. */
export const TEXTURE_DESCRIPTION_TEMPLATES: Readonly<Record<'background' | 'card', SixTuple>> = {
    background: ['Fundo da tela com a textura {name}.', 'Screen background with the {name} texture.', 'Fondo de pantalla con la textura {name}.', 'Fond d\'écran avec la texture {name}.', 'Bildschirmhintergrund mit der Textur {name}.', 'Sfondo dello schermo con la texture {name}.'],
    card: ['Card com a textura de superfície {name}.', 'Card with the {name} surface texture.', 'Tarjeta con la textura de superficie {name}.', 'Carte avec la texture de surface {name}.', 'Karte mit der Oberflächentextur {name}.', 'Scheda con la texture di superficie {name}.'],
};

/** Descrição das categorias de fonte. Ordem da tupla: pt, en, es, fr, de, it. */
export const FONT_CATEGORY_DESCRIPTIONS: Readonly<Record<string, SixTuple>> = {
    'Sans-Serif': ['Fonte sem serifa.', 'Sans-serif font.', 'Fuente sin serifa.', 'Police sans empattement.', 'Serifenlose Schrift.', 'Font senza grazie.'],
    'Serif': ['Fonte com serifa.', 'Serif font.', 'Fuente con serifa.', 'Police à empattement.', 'Schrift mit Serifen.', 'Font con grazie.'],
    'Display': ['Fonte de destaque.', 'Display font.', 'Fuente de titulares.', 'Police d\'affichage.', 'Auszeichnungsschrift.', 'Font da titolo.'],
    'Monospace': ['Fonte de espaçamento fixo.', 'Fixed-width font.', 'Fuente de ancho fijo.', 'Police à chasse fixe.', 'Festbreitenschrift.', 'Font a spaziatura fissa.'],
    'Handwriting': ['Fonte manuscrita.', 'Handwritten font.', 'Fuente manuscrita.', 'Police manuscrite.', 'Handschrift.', 'Font calligrafico.'],
};

/** Nomes dos estilos de botão: pt + en, es, fr, de, it. */
export const BUTTON_STYLE_NAMES: Readonly<Record<string, NamedText>> = {
    'btn-style-matte': { pt: 'Fosco', others: ['Matte', 'Mate', 'Mat', 'Matt', 'Opaco'] },
    'btn-style-neon': { pt: 'Neon', others: ['Neon', 'Neón', 'Néon', 'Neon', 'Neon'] },
    'btn-style-frosted': { pt: 'Vidro fosco', others: ['Frosted glass', 'Vidrio esmerilado', 'Verre dépoli', 'Milchglas', 'Vetro smerigliato'] },
    'btn-style-borderline': { pt: 'Contorno', others: ['Outline', 'Contorno', 'Contour', 'Umriss', 'Contorno'] },
    'btn-style-cyberpunk': { pt: 'Esquema técnico', others: ['Technical scheme', 'Esquema técnico', 'Schéma technique', 'Technisches Schema', 'Schema tecnico'] },
    'btn-style-neumorphism': { pt: 'Relevo suave', others: ['Soft relief', 'Relieve suave', 'Relief doux', 'Sanftes Relief', 'Rilievo morbido'] },
};

/** Modelo de descrição dos botões. Ordem da tupla: pt, en, es, fr, de, it. */
export const BUTTON_STYLE_DESCRIPTION: SixTuple = ['Botão com o estilo {name}.', 'Button with the {name} style.', 'Botón con el estilo {name}.', 'Bouton au style {name}.', 'Schaltfläche im Stil {name}.', 'Pulsante con lo stile {name}.'];
