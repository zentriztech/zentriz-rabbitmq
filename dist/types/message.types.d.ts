export interface MessageOptions {
    persistent?: boolean;
    expiration?: string;
    priority?: number;
    messageId?: string;
    correlationId?: string;
    replyTo?: string;
    timestamp?: number;
    headers?: Record<string, any>;
}
export interface PublishOptions extends MessageOptions {
    exchange?: string;
    routingKey?: string;
}
export interface ConsumeOptions {
    queue: string;
    noAck?: boolean;
    prefetch?: number;
    exclusive?: boolean;
}
export interface QueueOptions {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    arguments?: Record<string, any>;
}
export interface ExchangeOptions {
    type?: 'direct' | 'topic' | 'fanout' | 'headers';
    durable?: boolean;
    autoDelete?: boolean;
    arguments?: Record<string, any>;
}
export interface DLQOptions {
    queue: string;
    exchange?: string;
    routingKey?: string;
    maxRetries?: number;
    retryDelay?: number;
}
