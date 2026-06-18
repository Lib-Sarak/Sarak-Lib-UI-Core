import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

export interface SarakPageTransitionProps {
    children: React.ReactNode;
    /** Usado como key pela AnimatePresence para saber quando a rota mudou */
    locationKey: string;
}

const variantsMap = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    'slide-up': {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    'slide-side': {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    },
    zoom: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
    },
    none: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
    }
};

export const SarakPageTransition: React.FC<SarakPageTransitionProps> = ({ children, locationKey }) => {
    const { design } = useSarakUI();
    const { getContainerStyles } = useStructuralStyles();
    
    const type = (design?.pageTransitionType || 'fade') as keyof typeof variantsMap;
    const isEnabled = design?.animEnabled !== false && type !== 'none';

    if (!isEnabled) {
        return <>{children}</>;
    }

    const selectedVariants = variantsMap[type] || variantsMap.fade;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={locationKey}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={selectedVariants}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full h-full flex-1 ${getContainerStyles().className}`}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
