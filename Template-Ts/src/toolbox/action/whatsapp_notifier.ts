import { NotifierInterface } from './notifier.interface.js';
import { logger } from '../../utils/logger.js';

export class WhatsAppNotifier implements NotifierInterface {
    constructor(
        private apiToken: string,
        private phoneNumberId: string,
        private targetPhone: string
    ) {}

    async notifyAdmin(event: string, data: Record<string, any>): Promise<void> {
        if (!this.apiToken || !this.phoneNumberId || !this.targetPhone) {
            logger.warn('[WhatsAppNotifier] Missing credentials or target phone. Skipping.');
            return;
        }

        const url = `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`;

        try {
            const payload = {
                messaging_product: 'whatsapp',
                to: this.targetPhone,
                type: 'text',
                text: {
                    body: `*New Event: ${event}*\n\n${JSON.stringify(data, null, 2)}`
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                logger.error(`[WhatsAppNotifier] Failed to send WhatsApp message. Status: ${response.status}`);
            }
        } catch (error) {
            logger.error(`[WhatsAppNotifier] Exception sending WhatsApp message: ${error}`);
        }
    }
}
