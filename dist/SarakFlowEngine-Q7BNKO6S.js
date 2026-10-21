import{ja as o}from"./chunk-A4GCKWUB.js";import f,{Background as b,Controls as g,MiniMap as m,BackgroundVariant as a,Panel as k}from"reactflow";import"reactflow/dist/style.css";import{jsx as r,jsxs as n}from"react/jsx-runtime";var v={dots:a.Dots,lines:a.Lines},t="color-mix(in srgb, var(--text-main, #f2f6fb) 5%, transparent)",w=({nodes:s,edges:i,onConnect:d})=>{let{design:l}=o(),{primaryColor:e,flowGridStyle:c,flowNodeRadius:p}=l||{};return n("div",{className:"w-full h-full min-h-[var(--sarak-engine-min-h-lg,500px)] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-theme-tint overflow-hidden relative",children:[n(f,{nodes:s,edges:i,onConnect:d,fitView:!0,className:"sarak-flow-instance",children:[r(b,{variant:v[String(c)]??a.Dots,gap:24,size:1,color:t}),r(g,{className:"bg-theme-tint border-theme-tint-hover text-[var(--text-main,#f2f6fb)] fill-[var(--text-main,#f2f6fb)]"}),r(m,{style:{backgroundColor:"color-mix(in srgb, var(--sarak-card-bg, #101622) 50%, transparent)",borderRadius:"var(--sarak-layout-gap-md,16px)"},nodeColor:()=>e,maskColor:t}),r(k,{position:"top-right",className:"bg-[var(--theme-card)] p-2 rounded-lg border border-theme-tint backdrop-blur-md",children:r("span",{className:"text-2xs font-bold uppercase tracking-widest text-[var(--text-muted,rgba(242,246,251,0.55))]",children:"Flow Optimizer Active"})})]}),r("style",{children:`
                .react-flow__node {
                    border-radius: var(--sarak-flow-node-radius, ${p||12}px);
                    background: color-mix(in srgb, var(--sarak-card-bg, var(--theme-card, #101622)) 80%, transparent);
                    border: var(--sarak-border-width, 1px) solid color-mix(in srgb, var(--text-main, #f2f6fb) 10%, transparent);
                    color: var(--text-main, #f2f6fb);
                    font-size: var(--sarak-type-scale-xs, 11px);
                    padding: var(--sarak-flow-node-padding, 10px);
                    backdrop-filter: blur(var(--sarak-flow-node-blur, 5px));
                }
                .react-flow__handle {
                    width: var(--sarak-flow-handle-size, 8px);
                    height: var(--sarak-flow-handle-size, 8px);
                    background: ${e};
                    border: var(--sarak-border-width, 1px) solid var(--sarak-bg-base, #06080d);
                }
                .react-flow__edge-path {
                    stroke: color-mix(in srgb, var(--text-main, #f2f6fb) 20%, transparent);
                    stroke-width: 2;
                }
            `})]})},F=w;export{F as default};
