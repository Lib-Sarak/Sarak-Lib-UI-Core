export class ConsoleNotifier {
    async notifyAdmin(event, data) {
        console.log(`[ConsoleNotifier] Event: ${event}`, JSON.stringify(data, null, 2));
    }
}
