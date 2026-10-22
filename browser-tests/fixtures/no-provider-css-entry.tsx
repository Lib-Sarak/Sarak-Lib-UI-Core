import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakButton } from '@sarak/lib-ui-core';

const root = document.getElementById('root');
if (!root) throw new Error('no-provider-css-entry: #root ausente no harness.');

createRoot(root).render(<SarakButton>Sem Provider</SarakButton>);
