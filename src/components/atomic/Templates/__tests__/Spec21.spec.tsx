import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';

// Sarak UI Provider
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

// Components
import { AuthForm } from '../components/AuthForm';
import { AuthHero } from '../components/AuthHero';
import { AuthSocialLogin } from '../components/AuthSocialLogin';
import { AuthFormFields } from '../components/AuthFormFields';
import { SarakCoreCard } from '../components/SarakCoreCard';
import { RecursiveMatrixNode } from '../components/RecursiveMatrixNode';
import { PremiumSwitch } from '../components/PremiumSwitch';
import { ManagementGroupCard } from '../components/ManagementGroupCard';

const dummyVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 }
};

const dummyLayout = { className: '', style: {} };

test.describe('Spec 21 Visual Validations', () => {
  test('AuthForm', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <AuthForm
            isRegistering={false}
            setIsRegistering={() => {}}
            mfaStep={false}
            setMfaStep={() => {}}
            username="test"
            setUsername={() => {}}
            onSubmit={() => {}}
          />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('AuthForm.png');
  });

  test('AuthHero', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <AuthHero />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('AuthHero.png');
  });

  test('AuthSocialLogin', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <AuthSocialLogin socialConfig={{ enabled: true, display: 'compact', providers: [] }} />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('AuthSocialLogin.png');
  });

  test('AuthFormFields', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <AuthFormFields mfaStep={false} setMfaStep={() => {}} isRegistering={false} username="" setUsername={() => {}} />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('AuthFormFields.png');
  });

  test('SarakCoreCard', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <SarakCoreCard item={{ title: 'Core Card Test', type: 'model' }} mapping={{ title: 'title' }} />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('SarakCoreCard.png');
  });

  test('RecursiveMatrixNode', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <RecursiveMatrixNode
            item={{ id: '1', name: 'Node' }}
            parentId="root"
            level={0}
            activeMapping={() => false}
            onToggle={() => {}}
            manifest={{}}
          />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('RecursiveMatrixNode.png');
  });

  test('PremiumSwitch', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <PremiumSwitch checked={true} onChange={() => {}} />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('PremiumSwitch.png');
  });

  test('ManagementGroupCard', async ({ mount }) => {
    const component = await mount(
      <SarakUIProvider>
        <div className="p-5 w-full bg-slate-900">
          <ManagementGroupCard
            groupName="Management Group"
            items={[{ id: '1', title: 'Item 1', status: 'ok', isActive: 'true' }]}
            isConfigured={true}
            containerLayout={dummyLayout}
            groupActions={[]}
            mapping={{ id: 'id', title: 'title', status: 'status', isActive: 'isActive' }}
            handleAction={() => {}}
            handleToggle={() => {}}
            handleDelete={() => {}}
            getVal={(obj, path) => (obj as Record<string, unknown>)[path]}
          />
        </div>
      </SarakUIProvider>
    );
    await expect(component).toHaveScreenshot('ManagementGroupCard.png');
  });
});
