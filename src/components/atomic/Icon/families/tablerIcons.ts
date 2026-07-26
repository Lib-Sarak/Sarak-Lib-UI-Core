/**
 * Família `tabler` do contrato de ícones (Spec 41 §2.2).
 *
 * Imports NOMEADOS e estáticos. Como o phosphor, este pacote NÃO é `external`
 * no `build:js` — cada ícone daqui custa ~0,28 KB no `dist/` da lib.
 */
import type React from 'react';
import {
    IconAlertCircle, IconAlertTriangle, IconCheck, IconCircleCheck, IconX,
    IconInfoCircle, IconHelpCircle,
    IconMenu2, IconSearch, IconBell, IconFilter, IconList, IconGridDots,
    IconLayout, IconLayoutDashboard, IconHome,
    IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp,
    IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown, IconArrowsVertical,
    IconCornerDownRight,
    IconDotsVertical, IconDots, IconMaximize, IconMinimize, IconLoader2, IconRefresh,
    IconUser, IconUserPlus, IconUsers, IconLogin, IconLogout, IconLock, IconShield, IconEye,
    IconFile, IconFileText, IconFileSpreadsheet, IconFolder, IconPhoto, IconPaperclip,
    IconScript, IconClipboard, IconCopy, IconDownload, IconUpload, IconCloudUpload,
    IconPrinter, IconDeviceFloppy,
    IconEdit, IconPencil, IconPlus, IconTrash, IconTypography, IconAlignLeft, IconHash,
    IconActivity, IconChartBar, IconChartLine, IconChartPie, IconChartDots, IconTrendingUp,
    IconDatabase, IconStack2, IconNetwork, IconBox, IconPackage, IconCpu, IconCloud,
    IconTerminal, IconThermometer, IconHistory, IconCalendar, IconClock,
    IconMessage, IconMail, IconSend, IconPhone, IconRobot, IconWorld, IconLink,
    IconExternalLink,
    IconBriefcase, IconBuilding, IconCreditCard, IconCurrencyDollar, IconMapPin, IconTag,
    IconStar, IconPlayerPlay,
    IconPalette, IconSettings, IconBolt, IconBrandChrome, IconBrandGithub,
} from '@tabler/icons-react';
import type { IconName } from '../iconNames';

export const TABLER_ICONS: Record<IconName, React.ElementType> = {
    AlertCircle: IconAlertCircle, AlertTriangle: IconAlertTriangle, Check: IconCheck,
    CheckCircle2: IconCircleCheck, X: IconX, Info: IconInfoCircle, HelpCircle: IconHelpCircle,
    Menu: IconMenu2, Search: IconSearch, Bell: IconBell, Filter: IconFilter, List: IconList,
    Grid: IconGridDots, Layout: IconLayout, LayoutDashboard: IconLayoutDashboard, Home: IconHome,
    ChevronDown: IconChevronDown, ChevronLeft: IconChevronLeft,
    ChevronRight: IconChevronRight, ChevronUp: IconChevronUp,
    ArrowRight: IconArrowRight, ArrowLeft: IconArrowLeft, ArrowUp: IconArrowUp,
    ArrowDown: IconArrowDown, ArrowUpDown: IconArrowsVertical,
    CornerDownRight: IconCornerDownRight,
    MoreVertical: IconDotsVertical, MoreHorizontal: IconDots, Maximize2: IconMaximize,
    Minimize2: IconMinimize, Loader2: IconLoader2, RefreshCw: IconRefresh,
    User: IconUser, UserPlus: IconUserPlus, Users: IconUsers, LogIn: IconLogin,
    LogOut: IconLogout, Lock: IconLock, Shield: IconShield, Eye: IconEye,
    File: IconFile, FileText: IconFileText, FileSpreadsheet: IconFileSpreadsheet,
    Folder: IconFolder, Image: IconPhoto, Paperclip: IconPaperclip, ScrollText: IconScript,
    Clipboard: IconClipboard, Copy: IconCopy, Download: IconDownload, Upload: IconUpload,
    UploadCloud: IconCloudUpload, Printer: IconPrinter, Save: IconDeviceFloppy,
    Edit: IconEdit, Edit3: IconPencil, Plus: IconPlus, Trash2: IconTrash,
    Type: IconTypography, AlignLeft: IconAlignLeft, Hash: IconHash,
    Activity: IconActivity, BarChart3: IconChartBar, LineChart: IconChartLine,
    PieChart: IconChartPie, ScatterChart: IconChartDots, TrendingUp: IconTrendingUp,
    Database: IconDatabase, Layers: IconStack2, Network: IconNetwork, Box: IconBox,
    Package: IconPackage, Cpu: IconCpu, Cloud: IconCloud, Terminal: IconTerminal,
    Thermometer: IconThermometer, History: IconHistory, Calendar: IconCalendar,
    Clock: IconClock,
    MessageSquare: IconMessage, Mail: IconMail, Send: IconSend, Phone: IconPhone,
    Bot: IconRobot, Globe: IconWorld, Link: IconLink, ExternalLink: IconExternalLink,
    Briefcase: IconBriefcase, Building: IconBuilding, CreditCard: IconCreditCard,
    DollarSign: IconCurrencyDollar, MapPin: IconMapPin, Tag: IconTag, Star: IconStar,
    Play: IconPlayerPlay,
    Palette: IconPalette, Settings: IconSettings, Zap: IconBolt,
    Chrome: IconBrandChrome, Github: IconBrandGithub,
};
