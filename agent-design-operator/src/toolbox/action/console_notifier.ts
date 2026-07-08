import { NotifierInterface } from './notifier.interface.js';

export class ConsoleNotifier implements NotifierInterface {
    async notifyAdmin(event: string, data: Record<string, any>): Promise<void> {
        console.log(`[ConsoleNotifier] Event: ${event}`, JSON.stringify(data, null, 2));
    }
}
