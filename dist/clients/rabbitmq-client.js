"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQClient = void 0;
const connection_1 = require("../connection");
const core_1 = require("@zentriztech/core");
const logger = (0, core_1.getLogger)({ functionName: 'RabbitMQClient' });
class RabbitMQClient {
    channel = null;
    /**
     * Initialize client connection
     */
    async connect() {
        this.channel = await (0, connection_1.getRabbitMQChannel)();
    }
    /**
     * Assert exchange
     */
    async assertExchange(exchange, type = 'direct', options = {}) {
        if (!this.channel) {
            await this.connect();
        }
        await this.channel.assertExchange(exchange, type, {
            durable: options.durable !== false,
            autoDelete: options.autoDelete || false,
            arguments: options.arguments,
        });
        logger.info({ msg: 'Exchange asserted', exchange, type });
    }
    /**
     * Assert queue
     */
    async assertQueue(name, options = {}) {
        if (!this.channel) {
            await this.connect();
        }
        const result = await this.channel.assertQueue(name, {
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
    async bindQueue(queue, exchange, pattern = '') {
        if (!this.channel) {
            await this.connect();
        }
        await this.channel.bindQueue(queue, exchange, pattern);
        logger.info({ msg: 'Queue bound', queue, exchange, pattern });
    }
    /**
     * Delete queue
     */
    async deleteQueue(queue, options = {}) {
        if (!this.channel) {
            await this.connect();
        }
        await this.channel.deleteQueue(queue, options);
        logger.info({ msg: 'Queue deleted', queue });
    }
    /**
     * Get channel instance
     */
    getChannel() {
        if (!this.channel) {
            throw new Error('Channel not initialized. Call connect() first.');
        }
        return this.channel;
    }
}
exports.RabbitMQClient = RabbitMQClient;
