export interface NotifierInterface {
    notifyAdmin(event: string, data: Record<string, any>): Promise<void>;
}
