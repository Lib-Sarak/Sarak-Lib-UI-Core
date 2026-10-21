/**
 * Família `phosphor` do contrato de ícones (Spec 41 §2.2).
 *
 * Imports NOMEADOS e estáticos. Diferente do lucide, este pacote NÃO é
 * `external` no `build:js` — cada ícone daqui custa ~2,35 KB no `dist/` da lib
 * (o módulo de cada ícone embute os 6 pesos), o que é o motivo de `ICON_NAMES`
 * ser uma lista curada e não a biblioteca inteira.
 */
import type React from 'react';
import {
    WarningCircle, Warning, Check, CheckCircle, X, XCircle, Info, Question,
    List as ListBullets, ListNumbers, MagnifyingGlass, MagnifyingGlassPlus, MagnifyingGlassMinus, Bell, Funnel, List, GridFour, Layout, SquaresFour, House,
    CaretDown, CaretLeft, CaretRight, CaretUp,
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowsVertical, ArrowBendDownRight,
    DotsThreeVertical, DotsThree, ArrowsOut, ArrowsIn, Spinner, ArrowsClockwise,
    User, UserPlus, Users, SignIn, SignOut, LockKey, Shield, ShieldCheck, Eye, EyeSlash,
    File, FileText, FileCsv, Folder, Image, Paperclip, Scroll,
    Clipboard, Copy, DownloadSimple, Upload, CloudArrowUp, Printer, FloppyDisk,
    Pencil, PencilSimple, TextB, TextItalic, Plus, Trash, TextT, TextAlignLeft, Hash, Binary,
    Pulse, ChartBar, ChartLineUp, ChartPie, ChartScatter, TrendUp,
    Database, Stack, ShareNetwork, Cube, Package, Cpu, Cloud, Terminal,
    Thermometer, ClockCounterClockwise, Calendar, Clock,
    ChatCircle, Envelope, PaperPlaneTilt, Phone, Robot, Globe, Link, LinkSimple, ArrowSquareOut, Command, Compass,
    Briefcase, Buildings, CreditCard, CurrencyDollar, MapPin, Tag, Star, Play,
    Palette, Gear, GearFine, Lightning, Sparkle, Sun, Moon, ToggleLeft, ToggleRight,
} from '@phosphor-icons/react';
import type { SarakIconName } from '../iconNames';

export const PHOSPHOR_ICONS: Record<SarakIconName, React.ElementType> = {
    AlertCircle: WarningCircle, AlertTriangle: Warning, Check, CheckCircle2: CheckCircle,
    X, Info, HelpCircle: Question,
    Menu: ListBullets, Search: MagnifyingGlass, Bell, Filter: Funnel, List, ListOrdered: ListNumbers,
    Grid: GridFour, Layout, LayoutDashboard: SquaresFour, LayoutGrid: SquaresFour, Home: House,
    ChevronDown: CaretDown, ChevronLeft: CaretLeft, ChevronRight: CaretRight, ChevronUp: CaretUp,
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown: ArrowsVertical,
    CornerDownRight: ArrowBendDownRight,
    MoreVertical: DotsThreeVertical, MoreHorizontal: DotsThree,
    Maximize2: ArrowsOut, Minimize2: ArrowsIn, Loader2: Spinner, RefreshCw: ArrowsClockwise,
    ZoomIn: MagnifyingGlassPlus, ZoomOut: MagnifyingGlassMinus,
    User, UserPlus, Users, LogIn: SignIn, LogOut: SignOut, Lock: LockKey, Shield, ShieldCheck, Eye, EyeOff: EyeSlash,
    File, FileText, FileSpreadsheet: FileCsv, Folder, Image, Paperclip, ScrollText: Scroll,
    Clipboard, Copy, Download: DownloadSimple, Upload, UploadCloud: CloudArrowUp,
    Printer, Save: FloppyDisk,
    Edit: Pencil, Edit3: PencilSimple, Bold: TextB, Italic: TextItalic, Plus, Trash2: Trash, Type: TextT,
    AlignLeft: TextAlignLeft, Hash,
    Activity: Pulse, BarChart3: ChartBar, LineChart: ChartLineUp, PieChart: ChartPie,
    ScatterChart: ChartScatter, TrendingUp: TrendUp,
    Database, Layers: Stack, Network: ShareNetwork, Box: Cube, Package, Cpu, Cloud, Terminal,
    Thermometer, History: ClockCounterClockwise, Calendar, Clock, Binary,
    MessageSquare: ChatCircle, Mail: Envelope, Send: PaperPlaneTilt, Phone, Bot: Robot,
    Globe, Link, Link2: LinkSimple, ExternalLink: ArrowSquareOut, Command, Compass,
    Briefcase, Building: Buildings, CreditCard, DollarSign: CurrencyDollar, MapPin, Tag, Star, Play,
    Palette, Settings: Gear, Settings2: GearFine, Zap: Lightning, Sparkles: Sparkle,
    Sun, Moon, XCircle, ToggleLeft, ToggleRight,
};
