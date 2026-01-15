import * as amqp from 'amqplib';
import { ExchangeOptions, QueueOptions } from '../types/message.types';
export declare class RabbitMQClient {
    private channel;
    /**
     * Initialize client connection
     */
    connect(): Promise<void>;
    /**
     * Assert exchange
     */
    assertExchange(exchange: string, type?: ExchangeOptions['type'], options?: ExchangeOptions): Promise<void>;
    /**
     * Assert queue
     */
    assertQueue(name: string, options?: QueueOptions): Promise<amqp.Replies.AssertQueue>;
    /**
     * Bind queue to exchange
     */
    bindQueue(queue: string, exchange: string, pattern?: string): Promise<void>;
    /**
     * Delete queue
     */
    deleteQueue(queue: string, options?: {
        ifUnused?: boolean;
        ifEmpty?: boolean;
    }): Promise<void>;
    /**
     * Get channel instance
     */
    getChannel(): amqp.ConfirmChannel;
}
