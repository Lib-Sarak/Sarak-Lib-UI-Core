import fs from 'fs';
import path from 'path';

function replaceInFile(file, replacer) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated', file);
  }
}

const animFiles = [
  'src/components/atomic/Cards/SarakActionCard.tsx',
  'src/components/atomic/Cards/SarakSearchCard.tsx',
  'src/components/atomic/Cards/SarakTitleCard.tsx',
  'src/components/atomic/Templates/Chat/ChatInput.tsx',
  'src/components/atomic/Templates/components/ManagementGroupCard.tsx',
  'src/components/atomic/Templates/components/SarakCoreCard.tsx',
  'src/components/atomic/Templates/HelpButton.tsx',
  'src/components/atomic/Templates/SarakChart.tsx',
  'src/components/atomic/Templates/SarakStats.tsx'
];
animFiles.forEach(f => replaceInFile(f, c => c.replace(/var\(--animation-speed\s*(?:,[^)]+)?\)/g, 'var(--duration-normal, 0.3s)')));

const spacingSmFiles = ['src/features/DesignEngine/Canvas/components/ButtonPresetPreview.tsx'];
spacingSmFiles.forEach(f => replaceInFile(f, c => c.replace(/var\(--sarak-spacing-sm\s*(?:,[^)]+)?\)/g, 'var(--sarak-layout-gap-sm, 8px)')));

const sxFiles = [
  'src/components/atomic/DataDisplay/SarakDataGrid/SarakDataGridImpl.tsx',
  'src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableImpl.tsx',
  'src/components/atomic/DataDisplay/SarakKanban/SarakKanbanImpl.tsx',
  'src/components/atomic/DataDisplay/SarakTreeView.tsx',
  'src/components/atomic/Feedback/SarakSkeleton.tsx',
  'src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx',
  'src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx'
];
sxFiles.forEach(f => replaceInFile(f, c => c.replace(/var\(--sx-\*/g, 'var(--sarak-*') ));

replaceInFile('src/components/atomic/Atoms/SocialButton.tsx', c => {
  let res = c;
  res = res.replace(/var\(--sarak-brand-google-blue\s*(?:,[^)]+)?\)/g, '#4285F4');
  res = res.replace(/var\(--sarak-brand-google-green\s*(?:,[^)]+)?\)/g, '#34A853');
  res = res.replace(/var\(--sarak-brand-google-yellow\s*(?:,[^)]+)?\)/g, '#FBBC05');
  res = res.replace(/var\(--sarak-brand-google-red\s*(?:,[^)]+)?\)/g, '#EA4335');
  res = res.replace(/var\(--social-button-radius\s*(?:,[^)]+)?\)/g, 'var(--radius-btn, 12px)');
  res = res.replace(/var\(--button-radius\s*(?:,[^)]+)?\)/g, 'var(--radius-btn, 12px)');
  res = res.replace(/var\(--sarak-social-bg\s*(?:,[^)]+)?\)/g, 'var(--color-theme-card, rgba(255,255,255,0.03))');
  res = res.replace(/var\(--input-bg\s*(?:,[^)]+)?\)/g, 'var(--color-theme-card, rgba(255,255,255,0.03))');
  res = res.replace(/var\(--sarak-social-text\s*(?:,[^)]+)?\)/g, 'var(--color-theme-text, rgba(255,255,255,0.5))');
  return res;
});

replaceInFile('src/components/atomic/Templates/components/AuthHero.tsx', c => {
  let res = c;
  res = res.replace(/var\(--button-radius\s*(?:,[^)]+)?\)/g, 'var(--radius-btn, 12px)');
  res = res.replace(/var\(--sarak-auth-noise-url\s*(?:,[^)]+)?\)/g, 'url("/noise.png")');
  res = res.replace(/var\(--sarak-auth-noise-enabled\s*(?:,[^)]+)?\)/g, '1');
  res = res.replace(/var\(--sarak-auth-gap\s*(?:,[^)]+)?\)/g, 'var(--sarak-layout-gap-md, 16px)');
  return res;
});

replaceInFile('src/components/atomic/hooks/useAtomicStyles.ts', c => {
  let res = c;
  res = res.replace(/var\(--sarak-btn-border-frosted\s*(?:,[^)]+)?\)/g, 'var(--color-theme-border, rgba(255,255,255,0.1))');
  res = res.replace(/var\(--sarak-btn-shadow-frosted\s*(?:,[^)]+)?\)/g, 'var(--sarak-dynamic-shadow, 0 4px 12px rgba(0,0,0,0.1))');
  res = res.replace(/var\(--sarak-input-focus-ring\s*(?:,[^)]+)?\)/g, 'var(--color-theme-primary, #3b82f6)');
  res = res.replace(/var\(--sarak-input-shadow-neumorphism-focus\s*(?:,[^)]+)?\)/g, '0 0 0 2px var(--color-theme-primary, #3b82f6)');
  res = res.replace(/var\(--sarak-input-shadow-neumorphism\s*(?:,[^)]+)?\)/g, 'inset 2px 2px 5px rgba(0,0,0,0.2)');
  res = res.replace(/var\(--sarak-switch-inactive-bg\s*(?:,[^)]+)?\)/g, 'var(--color-theme-card, rgba(255,255,255,0.1))');
  res = res.replace(/var\(--sarak-switch-inactive-glass\s*(?:,[^)]+)?\)/g, 'var(--color-theme-card, rgba(255,255,255,0.1))');
  res = res.replace(/var\(--sarak-switch-border-glass\s*(?:,[^)]+)?\)/g, 'var(--color-theme-border, rgba(255,255,255,0.1))');
  return res;
});

replaceInFile('src/components/atomic/Inputs/SarakRangeSlider.tsx', c => {
  let res = c;
  res = res.replace(/var\(--sarak-range-active-bg\s*(?:,[^)]+)?\)/g, 'var(--color-theme-primary, #00f2ff)');
  res = res.replace(/var\(--sarak-range-track-bg\s*(?:,[^)]+)?\)/g, 'var(--color-theme-border, rgba(255,255,255,0.1))');
  return res;
});

replaceInFile('src/components/atomic/Templates/components/SecurityOrchestratorSetup.tsx', c => c.replace(/var\(--sarak-qr-size\s*(?:,[^)]+)?\)/g, '200px'));

const gapFiles = [
  'src/components/atomic/Templates/SarakCardGrid.tsx',
  'src/components/atomic/Templates/SarakExpandableMatrix.tsx',
  'src/components/atomic/Templates/components/RecursiveMatrixNode.tsx'
];
gapFiles.forEach(f => replaceInFile(f, c => {
  let res = c;
  res = res.replace(/var\(--sarak-grid-gap\s*(?:,[^)]+)?\)/g, 'var(--sarak-layout-gap-md, 16px)');
  res = res.replace(/var\(--matrix-gap\s*(?:,[^)]+)?\)/g, 'var(--sarak-layout-gap-md, 16px)');
  res = res.replace(/var\(--sx-spacing-2xs\s*(?:,[^)]+)?\)/g, 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)');
  return res;
}));

const zFiles = ['src/components/atomic/Feedback/SarakToast.tsx', 'src/components/atomic/UX/SarakContextMenu.tsx', 'src/components/atomic/UX/SarakTooltip.tsx'];
zFiles.forEach(f => replaceInFile(f, c => {
  let res = c;
  res = res.replace(/var\(--z-index-toast\s*(?:,[^)]+)?\)/g, 'var(--z-index-tooltip, 9000)');
  res = res.replace(/var\(--z-index-popover\s*(?:,[^)]+)?\)/g, 'var(--z-index-tooltip, 9000)');
  return res;
}));

const mockFiles = [
  'src/features/DesignEngine/Canvas/components/InputPresetPreview.tsx',
  'src/features/DesignEngine/Canvas/components/ButtonPresetPreview.tsx',
  'src/components/engines/visuals/SarakVisualEngine.tsx',
  'src/components/Layout/SarakAnalyticalPage.tsx',
  'src/features/DesignEngine/Canvas/components/CardsCatalog.tsx',
  'src/features/DesignEngine/Canvas/components/TypographyCatalog.tsx',
  'src/features/DesignEngine/Canvas/components/PresetCard.tsx',
  'src/features/DesignEngine/Main/ThemeCustomizationTab.tsx',
  'src/features/DesignEngine/Canvas/PreviewCanvas.tsx',
  'src/features/DesignEngine/Main/MasterControlPanel.tsx',
  'src/features/DesignEngine/__e2e__/Boot.spec.tsx',
  'src/features/DesignEngine/__e2e__/RealtimeInjection.spec.tsx'
];
mockFiles.forEach(f => replaceInFile(f, c => {
  let res = c;
  res = res.replace(/var\(--accent-color\s*(?:,[^)]+)?\)/g, 'var(--color-theme-primary, #00f2ff)');
  res = res.replace(/var\(--sarak-container-lg\s*(?:,[^)]+)?\)/g, '1024px');
  res = res.replace(/var\(--sarak-bg-hover\s*(?:,[^)]+)?\)/g, 'var(--color-theme-card, #1e293b)');
  res = res.replace(/var\(--sarak-text-sm\s*(?:,[^)]+)?\)/g, 'var(--color-theme-text, #ffffff)');
  res = res.replace(/var\(--sarak-text-primary\s*(?:,[^)]+)?\)/g, 'var(--color-theme-primary, #00f2ff)');
  res = res.replace(/var\(--sarak-preview-width\s*(?:,[^)]+)?\)/g, '320px');
  res = res.replace(/var\(--sarak-surface-sunken\s*(?:,[^)]+)?\)/g, 'var(--color-theme-bg, #0a0a0c)');
  res = res.replace(/var\(--sarak-accent-alt\s*(?:,[^)]+)?\)/g, 'var(--color-theme-secondary, #7000ff)');
  res = res.replace(/var\(--sarak-accent\s*(?:,[^)]+)?\)/g, 'var(--color-theme-primary, #00f2ff)');
  res = res.replace(/var\(--sarak-surface-dark\s*(?:,[^)]+)?\)/g, 'var(--color-theme-bg, #0a0a0c)');
  res = res.replace(/var\(--sarak-canvas-bg\s*(?:,[^)]+)?\)/g, 'var(--color-theme-bg, #0a0a0c)');
  res = res.replace(/var\(--device-max-height\s*(?:,[^)]+)?\)/g, '812px');
  res = res.replace(/var\(--device-width\s*(?:,[^)]+)?\)/g, '375px');
  res = res.replace(/var\(--device-height\s*(?:,[^)]+)?\)/g, '812px');
  res = res.replace(/var\(--sarak-mobile-h\s*(?:,[^)]+)?\)/g, '812px');
  res = res.replace(/var\(--sarak-tablet-h\s*(?:,[^)]+)?\)/g, '1024px');
  res = res.replace(/var\(--sarak-cutout-bg\s*(?:,[^)]+)?\)/g, 'var(--color-theme-card, #000000)');
  res = res.replace(/var\(--target-width\s*(?:,[^)]+)?\)/g, '375px');
  res = res.replace(/var\(--sarak-panel-hover\s*(?:,[^)]+)?\)/g, 'var(--color-theme-card, #1e293b)');
  res = res.replace(/var\(--engine-sidebar-width\s*(?:,[^)]+)?\)/g, 'var(--sarak-sidebar-w, 240px)');
  res = res.replace(/var\(--theme-base\s*(?:,[^)]+)?\)/g, 'var(--color-theme-bg, #0a0a0c)');
  res = res.replace(/var\(--test-color\s*(?:,[^)]+)?\)/g, '#ff0000');
  res = res.replace(/var\(--test-size-lg\s*(?:,[^)]+)?\)/g, '20px');
  res = res.replace(/var\(--test-size-sm\s*(?:,[^)]+)?\)/g, '10px');
  res = res.replace(/var\(--theme-on-primary\s*(?:,[^)]+)?\)/g, 'var(--color-theme-on-primary, #020617)');
  return res;
}));
