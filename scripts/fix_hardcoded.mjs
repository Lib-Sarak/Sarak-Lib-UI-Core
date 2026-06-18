import fs from 'fs';
import path from 'path';

const filesToFix = [
  {
    path: 'src/components/atomic/Atoms/SocialButton.tsx',
    replacements: [
      { from: /#4285F4/g, to: 'var(--sarak-brand-google-blue, #4285F4)' },
      { from: /#34A853/g, to: 'var(--sarak-brand-google-green, #34A853)' },
      { from: /#FBBC05/g, to: 'var(--sarak-brand-google-yellow, #FBBC05)' },
      { from: /#EA4335/g, to: 'var(--sarak-brand-google-red, #EA4335)' }
    ]
  },
  {
    path: 'src/components/atomic/Buttons/SarakIconButton.tsx',
    replacements: [
      { from: /"#ffffff"/g, to: '"var(--sarak-text-inverse, #ffffff)"' }
    ]
  },
  {
    path: 'src/components/atomic/Cards/SarakTitleCard.tsx',
    replacements: [
      { from: /4px/g, to: 'var(--sarak-border-width, 4px)' }
    ]
  },
  {
    path: 'src/components/engines/chat/SarakChatEngine.tsx',
    replacements: [
      { from: /"#ffffff"/g, to: '"var(--sarak-text-inverse, #ffffff)"' }
    ]
  },
  {
    path: 'src/components/engines/flows/SarakFlowEngine.tsx',
    replacements: [
      { from: /12px/g, to: 'var(--sarak-spacing-md, 12px)' }
    ]
  },
  {
    path: 'src/components/engines/visuals/SarakVisualEngine.tsx',
    replacements: [
      { from: /#3b82f6/g, to: 'var(--sarak-accent, #3b82f6)' },
      { from: /1000px/g, to: 'var(--sarak-container-lg, 1000px)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Canvas/components/ButtonPresetPreview.tsx',
    replacements: [
      { from: /8px/g, to: 'var(--sarak-spacing-sm, 8px)' },
      { from: /14px/g, to: 'var(--sarak-text-sm, 14px)' },
      { from: /180px/g, to: 'var(--sarak-preview-width, 180px)' },
      { from: /#000/g, to: 'var(--sarak-text-primary, #000000)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Canvas/components/CardsCatalog.tsx',
    replacements: [
      { from: /1px/g, to: 'var(--sarak-border-base, 1px)' },
      { from: /12px/g, to: 'var(--sarak-spacing-md, 12px)' },
      { from: /#0a0a0b/g, to: 'var(--sarak-surface-sunken, #0a0a0b)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Canvas/components/InputPresetPreview.tsx',
    replacements: [
      { from: /1px/g, to: 'var(--sarak-border-base, 1px)' },
      { from: /180px/g, to: 'var(--sarak-preview-width, 180px)' },
      { from: /14px/g, to: 'var(--sarak-text-sm, 14px)' },
      { from: /#ffffff/g, to: 'var(--sarak-text-inverse, #ffffff)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Canvas/components/PresetCard.tsx',
    replacements: [
      { from: /#3b82f6/g, to: 'var(--sarak-accent, #3b82f6)' },
      { from: /#8b5cf6/g, to: 'var(--sarak-accent-alt, #8b5cf6)' },
      { from: /#000000/g, to: 'var(--sarak-surface-dark, #000000)' },
      { from: /1px/g, to: 'var(--sarak-border-base, 1px)' },
      { from: /12px/g, to: 'var(--sarak-spacing-md, 12px)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Canvas/components/TypographyCatalog.tsx',
    replacements: [
      { from: /#0a0a0b/g, to: 'var(--sarak-surface-sunken, #0a0a0b)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Canvas/PreviewCanvas.tsx',
    replacements: [
      { from: /#050505/g, to: 'var(--sarak-canvas-bg, #050505)' },
      { from: /#1a1a1c/g, to: 'var(--sarak-panel-bg, #1a1a1c)' },
      { from: /#0a0a0c/g, to: 'var(--sarak-cutout-bg, #0a0a0c)' },
      { from: /812px/g, to: 'var(--sarak-mobile-h, 812px)' },
      { from: /1024px/g, to: 'var(--sarak-tablet-h, 1024px)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/components/controls/ColorControl.tsx',
    replacements: [
      { from: /"#000000"/g, to: '"var(--sarak-default-color, #000000)"' },
      { from: /'#000000'/g, to: "'var(--sarak-default-color, #000000)'" }
    ]
  },
  {
    path: 'src/features/DesignEngine/Main/MasterControlPanel.tsx',
    replacements: [
      { from: /#080809/g, to: 'var(--sarak-panel-bg, #080809)' },
      { from: /#111/g, to: 'var(--sarak-panel-hover, #111111)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Main/TemplatesTab.tsx',
    replacements: [
      { from: /#080809/g, to: 'var(--sarak-panel-bg, #080809)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Main/ThemeCustomizationTab.tsx',
    replacements: [
      { from: /#3b82f6/g, to: 'var(--sarak-accent, #3b82f6)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Panels/HyperGranularityTab.tsx',
    replacements: [
      { from: /#050505/g, to: 'var(--sarak-panel-bg, #050505)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/Panels/LayoutTab.tsx',
    replacements: [
      { from: /#10b981/g, to: 'var(--theme-success, #10b981)' }
    ]
  },
  {
    path: 'src/features/DesignEngine/__e2e__/RealtimeInjection.spec.tsx',
    replacements: [
      { from: /#ff0000/g, to: 'var(--test-color, #ff0000)' },
      { from: /100px/g, to: 'var(--test-size-lg, 100px)' },
      { from: /16px/g, to: 'var(--test-size-sm, 16px)' }
    ]
  }
];

let totalReplaced = 0;

for (const fileDef of filesToFix) {
  const fullPath = path.resolve(fileDef.path);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    for (const rep of fileDef.replacements) {
      if (rep.from.test(content)) {
        content = content.replace(rep.from, rep.to);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      totalReplaced++;
      console.log(`[FIXED] ${fileDef.path}`);
    }
  } else {
    console.warn(`[NOT FOUND] ${fileDef.path}`);
  }
}

console.log(`Finished fixing ${totalReplaced} files.`);
