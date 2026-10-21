import{g as o,ma as t}from"./chunk-BA2LKZDB.js";import b,{Background as m,Controls as g,MiniMap as k,BackgroundVariant as a,Panel as v}from"reactflow";import"reactflow/dist/style.css";import{jsx as r,jsxs as s}from"react/jsx-runtime";var w={dots:a.Dots,lines:a.Lines},n="color-mix(in srgb, var(--text-main, #f2f6fb) 5%, transparent)",x=({nodes:i,edges:d,onConnect:l})=>{let{design:c}=t(),{primaryColor:e,flowGridStyle:p,flowNodeRadius:f}=c||{};return s("div",{className:"w-full h-full min-h-[var(--sarak-engine-min-h-lg,500px)] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-theme-tint overflow-hidden relative",children:[s(b,{nodes:i,edges:d,onConnect:l,fitView:!0,className:"sarak-flow-instance",children:[r(m,{variant:w[String(p)]??a.Dots,gap:24,size:1,color:n}),r(g,{className:"bg-theme-tint border-theme-tint-hover text-[var(--text-main,#f2f6fb)] fill-[var(--text-main,#f2f6fb)]"}),r(k,{style:{backgroundColor:"color-mix(in srgb, var(--sarak-card-bg, #101622) 50%, transparent)",borderRadius:"var(--sarak-layout-gap-md,16px)"},nodeColor:()=>e,maskColor:n}),r(v,{position:"top-right",className:"bg-[var(--theme-card)] p-2 rounded-lg border border-theme-tint backdrop-blur-md",children:r("span",{className:"text-2xs font-bold uppercase tracking-widest text-[var(--text-muted,rgba(242,246,251,0.55))]",children:"Flow Optimizer Active"})})]}),r(o,{children:`
                .react-flow__node {
                    border-radius: var(--sarak-flow-node-radius, ${f||12}px);
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
            `})]})},S=x;export{S as default};
