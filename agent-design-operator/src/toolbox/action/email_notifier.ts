import { NotifierInterface } from './notifier.interface.js';
import { logger } from '../../utils/logger.js';

export class EmailNotifier implements NotifierInterface {
    constructor(
        private apiKey: string,
        private fromEmail: string,
        private toEmail: string,
        private apiUrl: string = 'https://api.resend.com/emails'
    ) {}

    async notifyAdmin(event: string, data: Record<string, any>): Promise<void> {
        if (!this.apiKey || !this.toEmail) {
            logger.warn('[EmailNotifier] Missing API Key or Target Email. Skipping.');
            return;
        }

        try {
            const payload = {
                from: this.fromEmail,
                to: [this.toEmail],
                subject: `Lead captured: ${event}`,
                html: `<p><strong>New Event:</strong> ${event}</p><pre>${JSON.stringify(data, null, 2)}</pre>`
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                logger.error(`[EmailNotifier] Failed to send email. Status: ${response.status}`);
            }
        } catch (error) {
            logger.error(`[EmailNotifier] Exception sending email: ${error}`);
        }
    }
}
