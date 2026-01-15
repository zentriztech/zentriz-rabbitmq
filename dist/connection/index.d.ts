import * as amqp from 'amqplib';
export interface RabbitMQConnectionOptions {
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    vhost?: string;
    protocol?: string;
}
/**
 * Get or create RabbitMQ connection singleton
 */
export declare function getRabbitMQConnection(options?: RabbitMQConnectionOptions): Promise<any>;
/**
 * Get or create RabbitMQ channel
 */
export declare function getRabbitMQChannel(): Promise<amqp.ConfirmChannel>;
/**
 * Close RabbitMQ connection
 */
export declare function closeRabbitMQConnection(): Promise<void>;
