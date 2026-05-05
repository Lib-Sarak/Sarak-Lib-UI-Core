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
    }
};

export const ICON_PRESETS = Object.keys(ICON_PACKS).map(key => ({
    id: key,
    name: ICON_PACKS[key].name,
    icons: ICON_PACKS[key].icons
}));
