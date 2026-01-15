import * as amqp from 'amqplib';
import { RabbitMQClient } from '../clients/rabbitmq-client';
import { PublishOptions } from '../types/message.types';
import { serializeMessage } from '../utils/serialization';
import { getLogger } from '@zentriztech/core';

const logger = getLogger({ functionName: 'Publisher' });

export class Publisher {
  private client: RabbitMQClient;
  private defaultExchange: string;

  constructor(defaultExchange: string = '') {
    this.client = new RabbitMQClient();
    this.defaultExchange = defaultExchange;
  }

  /**
   * Initialize publisher
   */
  async initialize(): Promise<void> {
    await this.client.connect();
    if (this.defaultExchange) {
      await this.client.assertExchange(this.defaultExchange, 'direct', { durable: true });
    }
  }

  /**
   * Publish message
   */
  async publish(
    routingKey: string,
    payload: any,
    options: PublishOptions = {}
  ): Promise<boolean> {
    try {
      const channel = this.client.getChannel();
      const exchange = options.exchange || this.defaultExchange || '';
      const messageOptions: amqp.Options.Publish = {
        persistent: options.persistent !== false,
        expiration: options.expiration,
        priority: options.priority,
        messageId: options.messageId,
        correlationId: options.correlationId,
        replyTo: options.replyTo,
        timestamp: options.timestamp || Date.now(),
        headers: options.headers,
      };

      const content = serializeMessage(payload);
      const result = channel.publish(exchange, routingKey, content, messageOptions);

      if (result) {
        logger.info({ msg: 'Message published', exchange, routingKey });
      } else {
        logger.warn({ msg: 'Message buffer full', exchange, routingKey });
      }

      return result;
    } catch (error: any) {
      logger.error({ msg: 'Publish error', routingKey, error: error.message });
      throw error;
    }
  }

  /**
   * Publish to exchange
   */
  async publishToExchange(
    exchange: string,
    routingKey: string,
    payload: any,
    options: PublishOptions = {}
  ): Promise<boolean> {
    return this.publish(routingKey, payload, { ...options, exchange });
  }
}
