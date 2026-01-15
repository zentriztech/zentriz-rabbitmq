import * as amqp from 'amqplib';
import { getLogger } from '@zentriztech/core';

const logger = getLogger({ functionName: 'RabbitMQConnection' });

let connection: any = null;
let channel: amqp.ConfirmChannel | null = null;

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
export async function getRabbitMQConnection(
  options?: RabbitMQConnectionOptions
): Promise<any> {
  if (connection) {
    return connection;
  }

  const config = {
    hostname: options?.hostname || process.env.RABBITMQ_HOST || 'localhost',
    port: options?.port || parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    username: options?.username || process.env.RABBITMQ_USER || 'guest',
    password: options?.password || process.env.RABBITMQ_PASSWORD || 'guest',
    vhost: options?.vhost || process.env.RABBITMQ_VHOST || '/',
    protocol: options?.protocol || 'amqp',
  };

  const connectionString = `${config.protocol}://${config.username}:${config.password}@${config.hostname}:${config.port}${config.vhost}`;

  try {
    const conn = await amqp.connect(connectionString);
    connection = conn;
    
    conn.on('error', (error: Error) => {
      logger.error({ msg: 'RabbitMQ connection error', error: error.message });
      connection = null;
      channel = null;
    });

    conn.on('close', () => {
      logger.warn({ msg: 'RabbitMQ connection closed' });
      connection = null;
      channel = null;
    });

    logger.info({ msg: 'RabbitMQ connected', hostname: config.hostname, port: config.port });
    return conn;
  } catch (error: any) {
    logger.error({ msg: 'Failed to connect to RabbitMQ', error: error.message });
    throw error;
  }
}

/**
 * Get or create RabbitMQ channel
 */
export async function getRabbitMQChannel(): Promise<amqp.ConfirmChannel> {
  if (channel) {
    return channel;
  }

  const conn = await getRabbitMQConnection();
  const ch = await conn.createConfirmChannel();
  channel = ch;
  
  ch.on('error', (error: Error) => {
    logger.error({ msg: 'RabbitMQ channel error', error: error.message });
    channel = null;
  });

  ch.on('close', () => {
    logger.warn({ msg: 'RabbitMQ channel closed' });
    channel = null;
  });

  return ch;
}

/**
 * Close RabbitMQ connection
 */
export async function closeRabbitMQConnection(): Promise<void> {
  if (channel) {
    await channel.close();
    channel = null;
  }
  
  if (connection) {
    await connection.close();
    connection = null;
    logger.info({ msg: 'RabbitMQ connection closed' });
  }
}
