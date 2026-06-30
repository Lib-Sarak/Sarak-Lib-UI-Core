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
                className="w-5 h-5 rounded-full z-20 relative border border-[var(--border-color,#334155)]"
            />

            {isOpen && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--sarak-modal-overlay-color,rgba(0,0,0,0.5))] backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                    style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}
                >
                    <div
                        className="bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)] rounded-[var(--sarak-card-radius,12px)] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animationDuration: 'var(--duration-normal, 0.3s)' }}
                    >
                        <div className="flex items-center justify-between border-b border-[var(--border-color,#334155)] bg-white/5" style={{ padding: 'var(--sarak-layout-gap-md,16px)', gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                            <h3 className="text-sm font-bold text-white flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
                                <div className="w-6 h-6 rounded-full bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] flex items-center justify-center text-[var(--sarak-primary-color,#3b82f6)] font-black">?</div>
                                Indicator Information
                            </h3>
                            <SarakIconButton
                                onClick={() => setIsOpen(false)}
                                icon={<X size={20} />}
                                variant="ghost"
                                className="text-slate-400 hover:text-white"
                            />
                        </div>
                        <div style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                {text}
                            </p>
                        </div>
                        <div className="border-t border-[var(--border-color,#334155)] flex justify-end" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
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

