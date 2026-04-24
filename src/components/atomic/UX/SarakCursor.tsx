import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

/**
 * SarakCursor (v6.0 High-End Physics)
 * 
 * Implementa um cursor magnético e reativo com cauda de luz.
 * Ativado via design engine.
 */
export const SarakCursor: React.FC = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const { design } = useSarakUI();
    const { cursorPhysics, interfaceElasticity } = design || {};
    
    const springConfig = { 
        damping: 25 / (interfaceElasticity || 1), 
        stiffness: 200 * (interfaceElasticity || 1) 
    };
    
    const trailX = useSpring(mouseX, springConfig);
    const trailY = useSpring(mouseY, springConfig);

    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            const target = e.target as HTMLElement;
            setIsPointer(
                window.getComputedStyle(target).cursor === 'pointer' || 
                target.tagName === 'BUTTON' || 
                target.tagName === 'A'
            );
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            {/* Main Cursor Dot */}
            <motion.div
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isPointer ? 1.5 : 1,
                    backgroundColor: isPointer ? 'var(--theme-primary)' : 'rgba(255,255,255,0.8)'
                }}
                className="w-2 h-2 rounded-full absolute"
            />

            {/* Light Trail / Elastic Ring */}
            {cursorPhysics && (
                <>
                    <motion.div
                        style={{
                            x: trailX,
                            y: trailY,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                        animate={{
                            scale: isPointer ? 2.5 : 1,
                            borderColor: 'var(--theme-primary)',
                            borderWidth: isPointer ? '1px' : '2px',
                            opacity: isPointer ? 0.6 : 0.3
                        }}
                        className="w-8 h-8 rounded-full border border-[var(--theme-primary)] absolute blur-[1px]"
                    />
                    
                    {/* Specular Glow */}
                    <motion.div
                        style={{
                            x: trailX,
                            y: trailY,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                        className="w-24 h-24 rounded-full bg-[var(--theme-primary)] opacity-5 blur-[40px] absolute"
                    />
                </>
            )}
        </div>
    );
};

export default SarakCursor;
