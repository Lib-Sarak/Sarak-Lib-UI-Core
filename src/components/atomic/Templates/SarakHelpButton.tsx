import { SarakIcon } from "../Icon/SarakIcon";
import React, { useState } from "react";

import { SarakButton, SarakIconButton } from '../Buttons';

const SarakHelpButton = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <SarakIconButton
                onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
                icon={<SarakIcon name="HelpCircle" size={14} />}
                variant="ghost"
                className="w-5 h-5 rounded-full z-20 relative border border-[var(--border-color,#334155)]"
            />

            {isOpen && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--sarak-modal-overlay-color,rgba(0,0,0,0.4))] backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                    style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}
                >
                    <div
                        className="card border rounded-[var(--sarak-card-radius,12px)] shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animationDuration: 'var(--duration-normal, 0.3s)' }}
                    >
                        <div className="flex items-center justify-between border-b border-[var(--border-color,#334155)] bg-theme-tint" style={{ padding: 'var(--sarak-layout-gap-md,16px)', gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                            <h3 className="text-sm font-bold text-[var(--color-theme-title,#ffffff)] flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
                                <div className="w-6 h-6 rounded-full bg-[var(--sarak-primary-color-bg,rgba(0,242,255,0.15))] flex items-center justify-center text-[var(--sarak-primary-color,#00f2ff)] font-black">?</div>
                                Indicator Information
                            </h3>
                            <SarakIconButton
                                onClick={() => setIsOpen(false)}
                                icon={<SarakIcon name="X" size={20} />}
                                variant="ghost"
                                className="text-[var(--text-muted,#94a3b8)] hover:text-[var(--color-theme-title,#ffffff)]"
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

export default SarakHelpButton;

