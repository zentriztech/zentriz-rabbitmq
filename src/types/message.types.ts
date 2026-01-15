export interface MessageOptions {
  persistent?: boolean;
  expiration?: string; // e.g., "3600000" (milliseconds)
  priority?: number; // 0-255
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
  noAck?: boolean; // Auto-acknowledge messages
  prefetch?: number; // Prefetch count
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
  retryDelay?: number; // milliseconds
}
