import{a as l}from"./chunk-KLP74R7C.js";import{g as t,ma as n}from"./chunk-SLIBLIPL.js";import*as o from"reactflow";import{jsx as a,jsxs as i}from"react/jsx-runtime";var d=o.default,{Background:c,Controls:p,MiniMap:f,Panel:g}=o,h="reactflow",w=()=>!!(d&&c&&p&&f&&g&&o.BackgroundVariant);w()&&import("reactflow/dist/style.css").catch(r=>{console.error("[SarakFlowEngine] Could not load the React Flow stylesheet.",r)});var x={dots:"dots",lines:"lines"},s="color-mix(in srgb, var(--text-main, #f2f6fb) 5%, transparent)",F=({nodes:r,edges:k,onConnect:m})=>{let{design:b}=n(),{primaryColor:e,flowGridStyle:u,flowNodeRadius:v}=b||{};return i("div",{className:"w-full h-full min-h-[var(--sarak-engine-min-h-lg,500px)] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-theme-tint overflow-hidden relative",children:[i(d,{nodes:r,edges:k,onConnect:m,fitView:!0,className:"sarak-flow-instance",children:[a(c,{variant:x[String(u)]??"dots",gap:24,size:1,color:s}),a(p,{className:"bg-theme-tint border-theme-tint-hover text-[var(--text-main,#f2f6fb)] fill-[var(--text-main,#f2f6fb)]"}),a(f,{style:{backgroundColor:"color-mix(in srgb, var(--sarak-card-bg, #101622) 50%, transparent)",borderRadius:"var(--sarak-layout-gap-md,16px)"},nodeColor:()=>e,maskColor:s}),a(g,{position:"top-right",className:"bg-[var(--theme-card)] p-2 rounded-lg border border-theme-tint backdrop-blur-md",children:a("span",{className:"text-2xs font-bold uppercase tracking-widest text-[var(--text-muted,rgba(242,246,251,0.55))]",children:"Flow Optimizer Active"})})]}),a(t,{children:`
                .react-flow__node {
                    border-radius: var(--sarak-flow-node-radius, ${v||12}px);
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
            `})]})},R=r=>w()?a(F,{...r}):a(l,{component:"SarakFlowEngine",packages:[h]}),_=R;export{_ as default};
