"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = void 0;
const rabbitmq_client_1 = require("../clients/rabbitmq-client");
const serialization_1 = require("../utils/serialization");
const core_1 = require("@zentriztech/core");
const logger = (0, core_1.getLogger)({ functionName: 'Consumer' });
class Consumer {
    client;
    consumers = new Map();
    constructor() {
        this.client = new rabbitmq_client_1.RabbitMQClient();
    }
    /**
     * Initialize consumer
     */
    async initialize() {
        await this.client.connect();
    }
    /**
     * Consume messages from queue
     */
    async consume(options, handler) {
        try {
            const channel = this.client.getChannel();
            // Set prefetch if specified
            if (options.prefetch) {
                await channel.prefetch(options.prefetch);
            }
            const consumeResult = await channel.consume(options.queue, async (msg) => {
                if (!msg) {
                    return;
                }
                try {
                    const payload = (0, serialization_1.deserializeMessage)(msg.content);
                    await handler(payload, msg);
                    if (!options.noAck) {
                        channel.ack(msg);
                    }
                }
                catch (error) {
                    logger.error({ msg: 'Message processing error', queue: options.queue, error: error.message });
                    if (!options.noAck) {
                        // Reject and requeue on error
                        channel.nack(msg, false, true);
                    }
                }
            }, {
                noAck: options.noAck || false,
                exclusive: options.exclusive || false,
            });
            this.consumers.set(options.queue, consumeResult);
            logger.info({ msg: 'Consumer started', queue: options.queue });
        }
        catch (error) {
            logger.error({ msg: 'Consume error', queue: options.queue, error: error.message });
            throw error;
        }
    }
    /**
     * Cancel consumer
     */
    async cancel(queue) {
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
    async cancelAll() {
        for (const queue of this.consumers.keys()) {
            await this.cancel(queue);
        }
    }
}
exports.Consumer = Consumer;
