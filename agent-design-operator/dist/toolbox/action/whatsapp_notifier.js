import { logger } from '../../utils/logger.js';
export class WhatsAppNotifier {
    apiToken;
    phoneNumberId;
    targetPhone;
    constructor(apiToken, phoneNumberId, targetPhone) {
        this.apiToken = apiToken;
        this.phoneNumberId = phoneNumberId;
        this.targetPhone = targetPhone;
    }
    async notifyAdmin(event, data) {
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
        }
        catch (error) {
            logger.error(`[WhatsAppNotifier] Exception sending WhatsApp message: ${error}`);
        }
    }
}
