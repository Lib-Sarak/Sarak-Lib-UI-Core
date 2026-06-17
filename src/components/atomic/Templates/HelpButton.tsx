import React, { useState } from "react";
import { X, HelpCircle } from "lucide-react";
import { SarakButton, SarakIconButton } from '../Buttons';

const HelpButton = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <SarakIconButton
                onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
                icon={<HelpCircle size={14} />}
                variant="ghost"
                className="w-5 h-5 rounded-full z-20 relative border border-theme"
            />

            {isOpen && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                    style={{ padding: 'var(--theme-pad)' }}
                >
                    <div
                        className="bg-theme-card border border-theme rounded-theme shadow-theme w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animationDuration: 'var(--animation-speed, 0.2s)' }}
                    >
                        <div className="flex items-center justify-between border-b border-theme bg-white/5" style={{ padding: 'var(--theme-pad)', gap: 'calc(var(--theme-gap) / 2)' }}>
                            <h3 className="text-sm font-bold text-white flex items-center" style={{ gap: 'calc(var(--theme-gap) / 3)' }}>
                                <div className="w-6 h-6 rounded-full bg-[var(--theme-primary-bg)] flex items-center justify-center text-[var(--theme-primary)] font-black">?</div>
                                Indicator Information
                            </h3>
                            <SarakIconButton
                                onClick={() => setIsOpen(false)}
                                icon={<X size={20} />}
                                variant="ghost"
                                className="text-slate-400 hover:text-white"
                            />
                        </div>
                        <div style={{ padding: 'calc(var(--theme-pad) * 1.5)' }}>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                {text}
                            </p>
                        </div>
                        <div className="border-t border-theme flex justify-end" style={{ padding: 'var(--theme-pad)' }}>
                            <SarakButton
                                onClick={() => setIsOpen(false)}
                                variant="primary"
                            >
                                Got it
                            </SarakButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HelpButton;

