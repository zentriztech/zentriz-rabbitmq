import { RabbitMQClient } from '../clients/rabbitmq-client';
import { ConsumeOptions } from '../types/message.types';
import { deserializeMessage } from '../utils/serialization';
import { getLogger } from '@zentriztech/core';
import * as amqp from 'amqplib';

const logger = getLogger({ functionName: 'Consumer' });

export type MessageHandler<T = any> = (message: T, originalMessage: amqp.ConsumeMessage) => Promise<void> | void;

export class Consumer {
  private client: RabbitMQClient;
  private consumers: Map<string, amqp.Replies.Consume> = new Map();

  constructor() {
    this.client = new RabbitMQClient();
  }

  /**
   * Initialize consumer
   */
  async initialize(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Consume messages from queue
   */
  async consume<T = any>(
    options: ConsumeOptions,
    handler: MessageHandler<T>
  ): Promise<void> {
    try {
      const channel = this.client.getChannel();
      
      // Set prefetch if specified
      if (options.prefetch) {
        await channel.prefetch(options.prefetch);
      }

      const consumeResult = await channel.consume(
        options.queue,
        async (msg) => {
          if (!msg) {
            return;
          }

          try {
            const payload = deserializeMessage<T>(msg.content);
            await handler(payload, msg);
            
            if (!options.noAck) {
              channel.ack(msg);
            }
          } catch (error: any) {
            logger.error({ msg: 'Message processing error', queue: options.queue, error: error.message });
            
            if (!options.noAck) {
              // Reject and requeue on error
              channel.nack(msg, false, true);
            }
          }
        },
        {
          noAck: options.noAck || false,
          exclusive: options.exclusive || false,
        }
      );

      this.consumers.set(options.queue, consumeResult);
      logger.info({ msg: 'Consumer started', queue: options.queue });
    } catch (error: any) {
      logger.error({ msg: 'Consume error', queue: options.queue, error: error.message });
      throw error;
    }
  }

  /**
   * Cancel consumer
   */
  async cancel(queue: string): Promise<void> {
    const consumerTag = this.consumers.get(queue);
    if (consumerTag) {
      const channel = this.client.getChannel();
      await channel.cancel(consumerTag.consumerTag);
      this.consumers.delete(queue);
      logger.info({ msg: 'Consumer cancelled', queue });
    }
  }

  /**
   * Cancel all consumers
   */
  async cancelAll(): Promise<void> {
    for (const queue of this.consumers.keys()) {
      await this.cancel(queue);
    }
  }
}
