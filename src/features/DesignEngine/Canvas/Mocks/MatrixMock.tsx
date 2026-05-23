import React from 'react';
import { motion } from 'framer-motion';
import { SarakExpandableMatrix } from '../../../../components/atomic/Templates/SarakExpandableMatrix';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

interface MatrixMockProps {
    tokens: any;
    config: any;
    animationVariants: any;
    animationStyle: string;
}

export const MockMatrix: React.FC<MatrixMockProps> = ({ tokens, animationVariants, animationStyle }) => {
    const roles = [
        { id: 'admin', title: 'Administrator', description: 'Full system access and control', icon: <SarakIcon name="Shield" size={18} /> },
        { id: 'editor', title: 'Editor', description: 'Can manage content and basic settings', icon: <SarakIcon name="Edit" size={18} /> },
        { id: 'viewer', title: 'Viewer', description: 'Read-only access to specific dashboards', icon: <SarakIcon name="Eye" size={18} /> },
    ];

    const permissions = [
        { id: 'user_create', title: 'Create Users', icon: <SarakIcon name="UserPlus" size={14} /> },
        { id: 'user_delete', title: 'Delete Users', icon: <SarakIcon name="Trash2" size={14} /> },
        { id: 'db_access', title: 'Database Access', icon: <SarakIcon name="Database" size={14} /> },
        { id: 'cloud_config', title: 'Cloud Configuration', icon: <SarakIcon name="Cloud" size={14} /> },
        { id: 'security_settings', title: 'Security Settings', icon: <SarakIcon name="Lock" size={14} /> },
        { id: 'system_logs', title: 'View Logs', icon: <SarakIcon name="Settings" size={14} /> },
    ];

    const [mapping, setMapping] = React.useState<Record<string, string[]>>({
        admin: ['user_create', 'user_delete', 'db_access', 'cloud_config', 'security_settings', 'system_logs'],
        editor: ['user_create', 'cloud_config', 'system_logs'],
        viewer: ['system_logs'],
    });

    const handleToggle = (roleId: string, permId: string) => {
        setMapping(prev => {
            const current = prev[roleId] || [];
            if (current.includes(permId)) {
                return { ...prev, [roleId]: current.filter(id => id !== permId) };
            }
            return { ...prev, [roleId]: [...current, permId] };
        });
    };

    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col gap-6"
        >
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">Advanced Matrix</h2>
                <p className="text-sm text-white/40 uppercase tracking-tighter">Real-time Data-Driven Control Preview</p>
            </div>

            <div className="flex-1 overflow-hidden rounded-[var(--sarak-matrix-radius)] border border-white/5 bg-black/20 backdrop-blur-md">
                <SarakExpandableMatrix
                    data={roles}
                    subItems={permissions}
                    activeMapping={(roleId, permId) => mapping[roleId]?.includes(permId) || false}
                    onToggle={handleToggle}
                    renderItemHeader={(role) => (
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                                {role.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white uppercase tracking-widest">{role.title}</span>
                                <span className="text-xs text-white/40 uppercase tracking-tighter">{role.description}</span>
                            </div>
                        </div>
                    )}
                />
            </div>
        </motion.div>
    );
};
