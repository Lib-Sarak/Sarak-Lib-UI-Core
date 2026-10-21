/**
 * Família `lucide` do contrato de ícones (Spec 41 §2.2).
 *
 * Imports NOMEADOS e estáticos — nunca `import * as` com índice dinâmico, que é
 * o que impedia o tree-shaking e trazia os ~1500 ícones do pacote.
 * O `Record<IconName, ...>` faz o compilador cobrar a paridade com `ICON_NAMES`.
 */
import type React from 'react';
import {
    AlertCircle, AlertTriangle, Check, CheckCircle2, X, Info, HelpCircle,
    Menu, Search, Bell, Filter, List, ListOrdered, Grid, Layout, LayoutDashboard, LayoutGrid, Home,
    ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, CornerDownRight,
    MoreVertical, MoreHorizontal, Maximize2, Minimize2, Loader2, RefreshCw, ZoomIn, ZoomOut,
    User, UserPlus, Users, LogIn, LogOut, Lock, Shield, ShieldCheck, Eye, EyeOff,
    File, FileText, FileSpreadsheet, Folder, Image, Paperclip, ScrollText,
    Clipboard, Copy, Download, Upload, UploadCloud, Printer, Save,
    Edit, Edit3, Bold, Italic, Plus, Trash2, Type, AlignLeft, Hash,
    Activity, BarChart3, LineChart, PieChart, ScatterChart, TrendingUp,
    Database, Layers, Network, Box, Package, Cpu, Cloud, Terminal, Binary,
    Thermometer, History, Calendar, Clock,
    MessageSquare, Mail, Send, Phone, Bot, Globe, Link, Link2, ExternalLink, Command,
    Briefcase, Building, CreditCard, DollarSign, MapPin, Tag, Star, Play,
    Palette, Settings, Settings2, Zap, Sparkles, Compass, Sun, Moon, XCircle, ToggleLeft, ToggleRight,
} from 'lucide-react';
import type { SarakIconName } from '../iconNames';

export const LUCIDE_ICONS: Record<SarakIconName, React.ElementType> = {
    AlertCircle, AlertTriangle, Check, CheckCircle2, X, Info, HelpCircle,
    Menu, Search, Bell, Filter, List, ListOrdered, Grid, Layout, LayoutDashboard, LayoutGrid, Home,
    ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, CornerDownRight,
    MoreVertical, MoreHorizontal, Maximize2, Minimize2, Loader2, RefreshCw, ZoomIn, ZoomOut,
    User, UserPlus, Users, LogIn, LogOut, Lock, Shield, ShieldCheck, Eye, EyeOff,
    File, FileText, FileSpreadsheet, Folder, Image, Paperclip, ScrollText,
    Clipboard, Copy, Download, Upload, UploadCloud, Printer, Save,
    Edit, Edit3, Bold, Italic, Plus, Trash2, Type, AlignLeft, Hash,
    Activity, BarChart3, LineChart, PieChart, ScatterChart, TrendingUp,
    Database, Layers, Network, Box, Package, Cpu, Cloud, Terminal, Binary,
    Thermometer, History, Calendar, Clock,
    MessageSquare, Mail, Send, Phone, Bot, Globe, Link, Link2, ExternalLink, Command,
    Briefcase, Building, CreditCard, DollarSign, MapPin, Tag, Star, Play,
    Palette, Settings, Settings2, Zap, Sparkles, Compass, Sun, Moon, XCircle, ToggleLeft, ToggleRight,
};
