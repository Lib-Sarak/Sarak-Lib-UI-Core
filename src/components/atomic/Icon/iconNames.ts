/**
 * Contrato público de nomes de ícone da Sarak UI Core (Spec 41 §2.3).
 *
 * Esta lista é a FONTE ÚNICA: dela derivam o tipo `IconName`, os três mapas de
 * família (`families/`) — que o TypeScript obriga a cobrir 1:1 — e a seção de
 * ícones do catálogo gerado (`docs/component-catalog.*`).
 *
 * Um nome fora desta lista NÃO renderiza o ícone pedido: o `SarakIcon` degrada
 * para o ícone de aviso e emite `console.warn` (postura da Spec 17). Antes da
 * Spec 41 qualquer nome do `lucide-react` funcionava, porque o componente caía
 * num acesso dinâmico ao barril (`LucideIcons[nome]`) — o que impedia o
 * tree-shaking e arrastava ~1500 ícones para o bundle do consumidor.
 *
 * Para acrescentar um nome: some-o aqui e o compilador vai cobrar a entrada
 * correspondente nas três famílias. Cada nome novo custa ~2,6 KB no `dist/` da
 * lib (phosphor ~2,35 KB + tabler ~0,28 KB — o lucide é `external`), então a
 * lista é curada de propósito, não exaustiva.
 */
export const ICON_NAMES = [
    // Núcleo de interface — estados, navegação e ações elementares.
    'AlertCircle', 'AlertTriangle', 'Check', 'CheckCircle2', 'X', 'Info', 'HelpCircle',
    'Menu', 'Search', 'Bell', 'Filter', 'List', 'Grid', 'Layout', 'LayoutDashboard', 'Home',
    'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp',
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowUpDown', 'CornerDownRight',
    'MoreVertical', 'MoreHorizontal', 'Maximize2', 'Minimize2', 'Loader2', 'RefreshCw',

    // Identidade, acesso e segurança.
    'User', 'UserPlus', 'Users', 'LogIn', 'LogOut', 'Lock', 'Shield', 'Eye',

    // Conteúdo, arquivos e mídia.
    'File', 'FileText', 'FileSpreadsheet', 'Folder', 'Image', 'Paperclip', 'ScrollText',
    'Clipboard', 'Copy', 'Download', 'Upload', 'UploadCloud', 'Printer', 'Save',
    'Edit', 'Edit3', 'Plus', 'Trash2', 'Type', 'AlignLeft', 'Hash',

    // Dados, métricas e infraestrutura.
    'Activity', 'BarChart3', 'LineChart', 'PieChart', 'ScatterChart', 'TrendingUp',
    'Database', 'Layers', 'Network', 'Box', 'Package', 'Cpu', 'Cloud', 'Terminal',
    'Thermometer', 'History', 'Calendar', 'Clock',

    // Comunicação e colaboração.
    'MessageSquare', 'Mail', 'Send', 'Phone', 'Bot', 'Globe', 'Link', 'ExternalLink',

    // Negócio.
    'Briefcase', 'Building', 'CreditCard', 'DollarSign', 'MapPin', 'Tag', 'Star', 'Play',

    // Aparência e marcas.
    'Palette', 'Settings', 'Zap', 'Chrome', 'Github',
] as const;

/** Nome de ícone válido no contrato público. */
export type IconName = (typeof ICON_NAMES)[number];

/** Ícone usado quando o nome pedido não existe no contrato (degradação visível). */
export const ICONE_DESCONHECIDO: IconName = 'AlertCircle';
