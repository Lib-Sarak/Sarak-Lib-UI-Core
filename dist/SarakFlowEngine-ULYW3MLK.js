import{da as o}from"./chunk-HTOTCKUV.js";import p,{Background as g,Controls as m,MiniMap as b,BackgroundVariant as r,Panel as k}from"reactflow";import"reactflow/dist/style.css";import{jsx as a,jsxs as n}from"react/jsx-runtime";var v={dots:r.Dots,lines:r.Lines},t="color-mix(in srgb, var(--text-main, #ffffff) 5%, transparent)",w=({nodes:s,edges:i,onConnect:l})=>{let{design:d}=o(),{primaryColor:e,flowGridStyle:f,flowNodeRadius:c}=d||{};return n("div",{className:"w-full h-full min-h-[var(--sarak-engine-min-h-lg,500px)] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-theme-tint overflow-hidden relative",children:[n(p,{nodes:s,edges:i,onConnect:l,fitView:!0,className:"sarak-flow-instance",children:[a(g,{variant:v[String(f)]??r.Dots,gap:24,size:1,color:t}),a(m,{className:"bg-theme-tint border-theme-tint-hover text-[var(--text-main,#ffffff)] fill-[var(--text-main,#ffffff)]"}),a(b,{style:{backgroundColor:"color-mix(in srgb, var(--sarak-card-bg, rgba(15, 23, 42, 0.6)) 50%, transparent)",borderRadius:"var(--sarak-layout-gap-md,16px)"},nodeColor:()=>e,maskColor:t}),a(k,{position:"top-right",className:"bg-[var(--theme-card)] p-2 rounded-lg border border-theme-tint backdrop-blur-md",children:a("span",{className:"text-2xs font-bold uppercase tracking-widest text-[var(--text-muted,rgba(255,255,255,0.4))]",children:"Flow Optimizer Active"})})]}),a("style",{children:`
                .react-flow__node {
                    border-radius: var(--sarak-flow-node-radius, ${c||12}px);
                    background: color-mix(in srgb, var(--sarak-card-bg, var(--theme-card, rgba(15, 23, 42, 0.6))) 80%, transparent);
                    border: var(--sarak-border-width, 1px) solid color-mix(in srgb, var(--text-main, #ffffff) 10%, transparent);
                    color: var(--text-main, #ffffff);
                    font-size: var(--sarak-type-scale-xs, 11px);
                    padding: var(--sarak-flow-node-padding, 10px);
                    backdrop-filter: blur(var(--sarak-flow-node-blur, 5px));
                }
                .react-flow__handle {
                    width: var(--sarak-flow-handle-size, 8px);
                    height: var(--sarak-flow-handle-size, 8px);
                    background: ${e};
                    border: var(--sarak-border-width, 1px) solid var(--sarak-bg-base, #0a0a0c);
                }
                .react-flow__edge-path {
                    stroke: color-mix(in srgb, var(--text-main, #ffffff) 20%, transparent);
                    stroke-width: 2;
                }
            `})]})},F=w;export{F as default};
