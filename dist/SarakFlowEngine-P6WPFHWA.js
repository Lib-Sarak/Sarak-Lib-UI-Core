import{v as r}from"./chunk-UNER6VKK.js";import w,{Background as g,Controls as b,MiniMap as h,BackgroundVariant as o,Panel as k}from"reactflow";import"reactflow/dist/style.css";import{jsx as e,jsxs as t}from"react/jsx-runtime";var f=({nodes:l,edges:d,onConnect:s})=>{let{design:n}=r(),{primaryColor:a,mode:i,flowGridStyle:p,flowNodeRadius:c}=n||{};return t("div",{className:"w-full h-full min-h-[var(--sarak-engine-min-h-lg,500px)] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-white/5 overflow-hidden relative",children:[t(w,{nodes:l,edges:d,onConnect:s,fitView:!0,className:"sarak-flow-instance",children:[e(g,{variant:p==="lines"?o.Lines:o.Dots,gap:24,size:1,color:i==="dark"?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}),e(b,{className:"bg-white/5 border-white/10 text-white fill-white"}),e(h,{style:{backgroundColor:"rgba(0,0,0,0.5)",borderRadius:"var(--sarak-layout-gap-md,16px)"},nodeColor:()=>a,maskColor:"rgba(255,255,255,0.05)"}),e(k,{position:"top-right",className:"bg-[var(--theme-card)] p-2 rounded-lg border border-white/5 backdrop-blur-md",children:e("span",{className:"text-2xs font-bold uppercase tracking-widest text-white/40",children:"Flow Optimizer Active"})})]}),e("style",{children:`
                .react-flow__node {
                    border-radius: var(--sarak-flow-node-radius, ${c||12}px);
                    background: rgba(15, 15, 20, 0.8);
                    border: var(--sarak-border-width, 1px) solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: var(--sarak-type-scale-xs, 11px);
                    padding: var(--sarak-flow-node-padding, 10px);
                    backdrop-filter: blur(var(--sarak-flow-node-blur, 5px));
                }
                .react-flow__handle {
                    width: var(--sarak-flow-handle-size, 8px);
                    height: var(--sarak-flow-handle-size, 8px);
                    background: ${a};
                    border: var(--sarak-border-width, 2px) solid white;
                }
                .react-flow__edge-path {
                    stroke: rgba(255, 255, 255, 0.2);
                    stroke-width: 2;
                }
            `})]})},R=f;export{R as default};
