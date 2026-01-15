"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
const rabbitmq_client_1 = require("../clients/rabbitmq-client");
const serialization_1 = require("../utils/serialization");
const core_1 = require("@zentriztech/core");
const logger = (0, core_1.getLogger)({ functionName: 'Publisher' });
class Publisher {
    client;
    defaultExchange;
    constructor(defaultExchange = '') {
        this.client = new rabbitmq_client_1.RabbitMQClient();
        this.defaultExchange = defaultExchange;
    }
    /**
     * Initialize publisher
     */
    async initialize() {
        await this.client.connect();
        if (this.defaultExchange) {
            await this.client.assertExchange(this.defaultExchange, 'direct', { durable: true });
        }
    }
    /**
     * Publish message
     */
    async publish(routingKey, payload, options = {}) {
        try {
            const channel = this.client.getChannel();
            const exchange = options.exchange || this.defaultExchange || '';
            const messageOptions = {
                persistent: options.persistent !== false,
                expiration: options.expiration,
                priority: options.priority,
                messageId: options.messageId,
                correlationId: options.correlationId,
                replyTo: options.replyTo,
                timestamp: options.timestamp || Date.now(),
                headers: options.headers,
            };
            const content = (0, serialization_1.serializeMessage)(payload);
            const result = channel.publish(exchange, routingKey, content, messageOptions);
            if (result) {
                logger.info({ msg: 'Message published', exchange, routingKey });
            }
            else {
                logger.warn({ msg: 'Message buffer full', exchange, routingKey });
            }
            return result;
        }
        catch (error) {
            logger.error({ msg: 'Publish error', routingKey, error: error.message });
            throw error;
        }
    }
    /**
     * Publish to exchange
     */
    async publishToExchange(exchange, routingKey, payload, options = {}) {
        return this.publish(routingKey, payload, { ...options, exchange });
    }
}
exports.Publisher = Publisher;
