import React from 'react';
import {
    Zap, Ghost, Smile, Sparkles, Wand2,
    Monitor, Cpu, Shield, Database,
    Rocket, Flame, Droplets, Leaf,
    Cloud, Sun, Moon, Star,
    Lock, Key, UserCheck, Gamepad2, Sword, Settings, Landmark, Wallet, BarChart3, Scale, Briefcase, User,
    Brain, Fingerprint, Binary, Dna, Microscope, Bot
} from 'lucide-react';

export const ICON_PACKS: any = {
    none: {
        id: 'none',
        name: 'System Default',
        icons: {
            dashboard: <Zap className="w-full h-full" />,
            data: <Database className="w-full h-full" />,
            analysis: <Cpu className="w-full h-full" />,
            audit: <Shield className="w-full h-full" />,
            settings: <Monitor className="w-full h-full" />,
            profile: <Smile className="w-full h-full" />
        }
    },
    cyber: {
        id: 'cyber',
        name: 'Cyber Protocol',
        icons: {
            dashboard: <Zap className="w-full h-full" />,
            data: <Database className="w-full h-full" />,
            analysis: <Cpu className="w-full h-full" />,
            audit: <Shield className="w-full h-full" />,
            settings: <Monitor className="w-full h-full" />,
            profile: <Ghost className="w-full h-full" />
        }
    },
    nature: {
        id: 'nature',
        name: 'Organic Flow',
        icons: {
            dashboard: <Leaf className="w-full h-full" />,
            data: <Droplets className="w-full h-full" />,
            analysis: <Cloud className="w-full h-full" />,
            audit: <Shield className="w-full h-full" />,
            settings: <Sun className="w-full h-full" />,
            profile: <Smile className="w-full h-full" />
        }
    },
    cosmic: {
        id: 'cosmic',
        name: 'Deep Cosmic',
        icons: {
            dashboard: <Rocket className="w-full h-full" />,
            data: <Star className="w-full h-full" />,
            analysis: <Sparkles className="w-full h-full" />,
            audit: <Moon className="w-full h-full" />,
            settings: <Wand2 className="w-full h-full" />,
            profile: <Ghost className="w-full h-full" />
        }
    },
    security: {
        id: 'security',
        name: 'Cyber Shield',
        icons: {
            dashboard: <Shield className="w-full h-full" />,
            data: <Database className="w-full h-full" />,
            analysis: <Lock className="w-full h-full" />,
            audit: <Key className="w-full h-full" />,
            settings: <Monitor className="w-full h-full" />,
            profile: <UserCheck className="w-full h-full" />
        }
    },
    gamer: {
        id: 'gamer',
        name: 'Pro Gamer',
        icons: {
            dashboard: <Gamepad2 className="w-full h-full" />,
            data: <Zap className="w-full h-full" />,
            analysis: <Flame className="w-full h-full" />,
            audit: <Sword className="w-full h-full" />,
            settings: <Settings className="w-full h-full" />,
            profile: <Ghost className="w-full h-full" />
        }
    },
    finance: {
        id: 'finance',
        name: 'Wall Street',
        icons: {
            dashboard: <Landmark className="w-full h-full" />,
            data: <Wallet className="w-full h-full" />,
            analysis: <BarChart3 className="w-full h-full" />,
            audit: <Scale className="w-full h-full" />,
            settings: <Briefcase className="w-full h-full" />,
            profile: <User className="w-full h-full" />
        }
    },
    intelligence: {
        id: 'intelligence',
        name: 'AI Neural',
        icons: {
            dashboard: <Brain className="w-full h-full" />,
            data: <Fingerprint className="w-full h-full" />,
            analysis: <Binary className="w-full h-full" />,
            audit: <Dna className="w-full h-full" />,
            settings: <Microscope className="w-full h-full" />,
            profile: <Bot className="w-full h-full" />
        }
    }
};

export const EMOJI_SETS: any = Object.keys(ICON_PACKS).reduce((acc: any, key: string) => {
    acc[key] = ICON_PACKS[key].icons;
    return acc;
}, {});

