import * as amqp from 'amqplib';
import { getRabbitMQChannel } from '../connection';
import { ExchangeOptions, QueueOptions } from '../types/message.types';
import { getLogger } from '@zentriztech/core';

const logger = getLogger({ functionName: 'RabbitMQClient' });

export class RabbitMQClient {
  private channel: amqp.ConfirmChannel | null = null;

  /**
   * Initialize client connection
   */
  async connect(): Promise<void> {
    this.channel = await getRabbitMQChannel();
  }

  /**
   * Assert exchange
   */
  async assertExchange(
    exchange: string,
    type: ExchangeOptions['type'] = 'direct',
    options: ExchangeOptions = {}
  ): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel!.assertExchange(exchange, type, {
      durable: options.durable !== false,
      autoDelete: options.autoDelete || false,
      arguments: options.arguments,
    });

    logger.info({ msg: 'Exchange asserted', exchange, type });
  }

  /**
   * Assert queue
   */
  async assertQueue(name: string, options: QueueOptions = {}): Promise<amqp.Replies.AssertQueue> {
    if (!this.channel) {
      await this.connect();
    }

    const result = await this.channel!.assertQueue(name, {
      durable: options.durable !== false,
      exclusive: options.exclusive || false,
      autoDelete: options.autoDelete || false,
      arguments: options.arguments,
    });

    logger.info({ msg: 'Queue asserted', queue: name });
    return result;
  }

  /**
   * Bind queue to exchange
   */
  async bindQueue(
    queue: string,
    exchange: string,
    pattern: string = ''
  ): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel!.bindQueue(queue, exchange, pattern);
    logger.info({ msg: 'Queue bound', queue, exchange, pattern });
  }

  /**
   * Delete queue
   */
  async deleteQueue(queue: string, options: { ifUnused?: boolean; ifEmpty?: boolean } = {}): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel!.deleteQueue(queue, options);
    logger.info({ msg: 'Queue deleted', queue });
  }

  /**
   * Get channel instance
   */
  getChannel(): amqp.ConfirmChannel {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }
    return this.channel;
  }
}
