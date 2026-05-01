import{v as o}from"./chunk-2W5QBH4X.js";import g,{Background as b,Controls as w,MiniMap as h,BackgroundVariant as a,Panel as m}from"reactflow";import"reactflow/dist/style.css";import{jsx as e,jsxs as t}from"react/jsx-runtime";var f=({nodes:i,edges:d,onConnect:n})=>{let{design:l}=o(),{primaryColor:r,mode:s,flowGridStyle:p,flowNodeRadius:c}=l||{};return t("div",{className:"w-full h-full min-h-[500px] bg-[var(--theme-card)]/10 rounded-[var(--radius-theme)] border border-white/5 overflow-hidden relative",children:[t(g,{nodes:i,edges:d,onConnect:n,fitView:!0,className:"sarak-flow-instance",children:[e(b,{variant:p==="lines"?a.Lines:a.Dots,gap:24,size:1,color:s==="dark"?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}),e(w,{className:"bg-white/5 border-white/10 text-white fill-white"}),e(h,{style:{backgroundColor:"rgba(0,0,0,0.5)",borderRadius:"12px"},nodeColor:()=>r,maskColor:"rgba(255,255,255,0.05)"}),e(m,{position:"top-right",className:"bg-[var(--theme-card)] p-2 rounded-lg border border-white/5 backdrop-blur-md",children:e("span",{className:"text-2xs font-bold uppercase tracking-widest text-white/40",children:"Flow Optimizer Active"})})]}),e("style",{children:`
                .react-flow__node {
                    border-radius: ${c||12}px;
                    background: rgba(15, 15, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 11px;
                    padding: 10px;
                    backdrop-filter: blur(5px);
                }
                .react-flow__handle {
                    width: 8px;
                    height: 8px;
                    background: ${r};
                    border: 2px solid white;
                }
                .react-flow__edge-path {
                    stroke: rgba(255, 255, 255, 0.2);
                    stroke-width: 2;
                }
            `})]})},v=f;export{v as default};
