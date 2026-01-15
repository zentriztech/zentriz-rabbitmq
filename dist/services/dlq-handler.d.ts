import { DLQOptions } from '../types/message.types';
export declare class DLQHandler {
    private publisher;
    private options;
    constructor(options: DLQOptions);
    /**
     * Initialize DLQ handler
     */
    initialize(): Promise<void>;
    /**
     * Handle failed message with retry logic
     */
    handleFailedMessage(originalQueue: string, message: any, error: Error, retryCount?: number): Promise<void>;
    /**
     * Send message to Dead Letter Queue
     */
    private sendToDLQ;
}
