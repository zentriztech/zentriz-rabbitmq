import { PublishOptions } from '../types/message.types';
export declare class Publisher {
    private client;
    private defaultExchange;
    constructor(defaultExchange?: string);
    /**
     * Initialize publisher
     */
    initialize(): Promise<void>;
    /**
     * Publish message
     */
    publish(routingKey: string, payload: any, options?: PublishOptions): Promise<boolean>;
    /**
     * Publish to exchange
     */
    publishToExchange(exchange: string, routingKey: string, payload: any, options?: PublishOptions): Promise<boolean>;
}
