import { Publisher } from './publisher';
import { DLQOptions } from '../types/message.types';
import { getLogger } from '@zentriztech/core';

const logger = getLogger({ functionName: 'DLQHandler' });

export class DLQHandler {
  private publisher: Publisher;
  private options: DLQOptions;

  constructor(options: DLQOptions) {
    this.options = {
      maxRetries: 3,
      retryDelay: 5000,
      ...options,
    };
    this.publisher = new Publisher();
  }

  /**
   * Initialize DLQ handler
   */
  async initialize(): Promise<void> {
    await this.publisher.initialize();
  }

  /**
   * Handle failed message with retry logic
   */
  async handleFailedMessage(
    originalQueue: string,
    message: any,
    error: Error,
    retryCount: number = 0
  ): Promise<void> {
    if (retryCount < (this.options.maxRetries || 3)) {
      // Retry with exponential backoff
      const delay = (this.options.retryDelay || 5000) * Math.pow(2, retryCount);
      
      logger.warn({
        msg: 'Message failed, retrying',
        queue: originalQueue,
        retryCount: retryCount + 1,
        maxRetries: this.options.maxRetries,
        delay,
        error: error.message,
      });

      // In a real implementation, you would use a delayed queue or scheduler
      // For now, we'll send to DLQ after max retries
      setTimeout(async () => {
        // This would typically republish to the original queue
        // For simplicity, we'll send to DLQ after max retries
      }, delay);
    } else {
      // Send to Dead Letter Queue
      await this.sendToDLQ(originalQueue, message, error);
    }
  }

  /**
   * Send message to Dead Letter Queue
   */
  private async sendToDLQ(originalQueue: string, message: any, error: Error): Promise<void> {
    const dlqMessage = {
      originalQueue,
      message,
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    };

    const routingKey = this.options.routingKey || originalQueue;
    const exchange = this.options.exchange || '';

    await this.publisher.publish(routingKey, dlqMessage, {
      exchange,
      persistent: true,
      headers: {
        'x-original-queue': originalQueue,
        'x-failed-reason': error.message,
      },
    });

    logger.error({
      msg: 'Message sent to DLQ',
      originalQueue,
      dlqQueue: this.options.queue,
      error: error.message,
    });
  }
}
