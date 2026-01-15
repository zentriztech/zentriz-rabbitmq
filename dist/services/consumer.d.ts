import { ConsumeOptions } from '../types/message.types';
import * as amqp from 'amqplib';
export type MessageHandler<T = any> = (message: T, originalMessage: amqp.ConsumeMessage) => Promise<void> | void;
export declare class Consumer {
    private client;
    private consumers;
    constructor();
    /**
     * Initialize consumer
     */
    initialize(): Promise<void>;
    /**
     * Consume messages from queue
     */
    consume<T = any>(options: ConsumeOptions, handler: MessageHandler<T>): Promise<void>;
    /**
     * Cancel consumer
     */
    cancel(queue: string): Promise<void>;
    /**
     * Cancel all consumers
     */
    cancelAll(): Promise<void>;
}
