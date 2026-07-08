import { NotifierInterface } from './notifier.interface.js';
import { logger } from '../../utils/logger.js';

export class SlackNotifier implements NotifierInterface {
    constructor(private webhookUrl: string) {}

    async notifyAdmin(event: string, data: Record<string, any>): Promise<void> {
        if (!this.webhookUrl) {
            logger.warn('[SlackNotifier] Webhook URL not provided. Skipping notification.');
            return;
        }

        try {
            const payload = {
                text: `*New Event: ${event}*\n\`\`\`${JSON.stringify(data, null, 2)}\`\`\``
            };

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                logger.error(`[SlackNotifier] Failed to send message. Status: ${response.status}`);
            }
        } catch (error) {
            logger.error(`[SlackNotifier] Exception sending message: ${error}`);
        }
    }
}
