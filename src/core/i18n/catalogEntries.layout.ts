import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da lib para layout e cromo; cada plan da rc.4 acrescenta aqui os seus. */
export const CATALOG_LAYOUT = {
    tabsMoreLabel: {
        pt: 'Mais abas', en: 'More tabs', es: 'Más pestañas',
        fr: 'Plus d’onglets', de: 'Weitere Tabs', it: 'Altre schede',
    },
    barQuestionWhere: {
        pt: 'Onde fica a barra', en: 'Where the bar sits', es: 'Dónde queda la barra',
        fr: 'Où se place la barre', de: 'Wo die Leiste sitzt', it: 'Dove sta la barra',
    },
    barQuestionHow: {
        pt: 'Como é a barra', en: 'What the bar looks like', es: 'Cómo es la barra',
        fr: 'À quoi ressemble la barre', de: 'Wie die Leiste aussieht', it: 'Come appare la barra',
    },
    barQuestionWhat: {
        pt: 'O que aparece na barra', en: 'What shows on the bar', es: 'Qué aparece en la barra',
        fr: 'Ce qui apparaît sur la barre', de: 'Was in der Leiste erscheint', it: 'Cosa appare nella barra',
    },
    barQuestionBrand: {
        pt: 'Marca', en: 'Brand', es: 'Marca', fr: 'Marque', de: 'Marke', it: 'Marchio',
    },
    barQuestionBehavior: {
        pt: 'Comportamento da barra', en: 'How the bar behaves', es: 'Comportamiento de la barra',
        fr: 'Comportement de la barre', de: 'Verhalten der Leiste', it: 'Comportamento della barra',
    },
    barSampleHome: { pt: 'Início', en: 'Home', es: 'Inicio', fr: 'Accueil', de: 'Start', it: 'Home' },
    barSampleSales: { pt: 'Vendas', en: 'Sales', es: 'Ventas', fr: 'Ventes', de: 'Verkauf', it: 'Vendite' },
    barSampleOrders: { pt: 'Pedidos', en: 'Orders', es: 'Pedidos', fr: 'Commandes', de: 'Bestellungen', it: 'Ordini' },
    barSampleBrand: { pt: 'Sua marca', en: 'Your brand', es: 'Su marca', fr: 'Votre marque', de: 'Ihre Marke', it: 'Il tuo marchio' },
    barSampleUser: { pt: 'Usuário', en: 'User', es: 'Usuario', fr: 'Utilisateur', de: 'Benutzer', it: 'Utente' },
    chromeSidebarResizeLabel: {
        pt: 'Ajustar a largura da barra lateral', en: 'Resize the sidebar', es: 'Ajustar el ancho de la barra lateral',
        fr: 'Ajuster la largeur de la barre latérale', de: 'Breite der Seitenleiste anpassen', it: 'Regola la larghezza della barra laterale',
    },
} satisfies Record<string, LibraryTextEntry>;
