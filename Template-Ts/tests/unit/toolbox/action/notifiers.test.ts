import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SlackNotifier } from '../../../../src/toolbox/action/slack_notifier.js';
import { EmailNotifier } from '../../../../src/toolbox/action/email_notifier.js';
import { WhatsAppNotifier } from '../../../../src/toolbox/action/whatsapp_notifier.js';

describe('Toolbox Notifiers', () => {
    let fetchMock: any;

    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({})
        });
        global.fetch = fetchMock;
    });

    describe('SlackNotifier', () => {
        it('Should send message to webhook url', async () => {
            const notifier = new SlackNotifier('https://hooks.slack.com/test');
            await notifier.notifyAdmin('TEST_EVENT', { key: 'value' });

            expect(fetchMock).toHaveBeenCalledWith('https://hooks.slack.com/test', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('TEST_EVENT')
            }));
        });

        it('Should handle network errors silently', async () => {
            fetchMock.mockRejectedValue(new Error('Network Error'));
            const notifier = new SlackNotifier('https://hooks.slack.com/test');
            
            await expect(notifier.notifyAdmin('TEST_EVENT', {})).resolves.toBeUndefined();
        });
    });

    describe('EmailNotifier', () => {
        it('Should send email via API', async () => {
            const notifier = new EmailNotifier('sk_test', 'from@test.com', 'to@test.com');
            await notifier.notifyAdmin('TEST_EVENT', { key: 'value' });

            expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer sk_test'
                }),
                body: expect.stringContaining('to@test.com')
            }));
        });
    });

    describe('WhatsAppNotifier', () => {
        it('Should send message via Meta Graph API', async () => {
            const notifier = new WhatsAppNotifier('token_123', 'phone_123', '5511999999999');
            await notifier.notifyAdmin('TEST_EVENT', { key: 'value' });

            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('phone_123'), expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer token_123'
                }),
                body: expect.stringContaining('5511999999999')
            }));
        });
    });
});
