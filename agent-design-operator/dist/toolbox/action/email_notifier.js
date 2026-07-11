import { logger } from '../../utils/logger.js';
export class EmailNotifier {
    apiKey;
    fromEmail;
    toEmail;
    apiUrl;
    constructor(apiKey, fromEmail, toEmail, apiUrl = 'https://api.resend.com/emails') {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.toEmail = toEmail;
        this.apiUrl = apiUrl;
    }
    async notifyAdmin(event, data) {
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
        }
        catch (error) {
            logger.error(`[EmailNotifier] Exception sending email: ${error}`);
        }
    }
}
