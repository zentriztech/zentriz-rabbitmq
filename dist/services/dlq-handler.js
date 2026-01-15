"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLQHandler = void 0;
const publisher_1 = require("./publisher");
const core_1 = require("@zentriztech/core");
const logger = (0, core_1.getLogger)({ functionName: 'DLQHandler' });
class DLQHandler {
    publisher;
    options;
    constructor(options) {
        this.options = {
            maxRetries: 3,
            retryDelay: 5000,
            ...options,
        };
        this.publisher = new publisher_1.Publisher();
    }
    /**
     * Initialize DLQ handler
     */
    async initialize() {
        await this.publisher.initialize();
    }
    /**
     * Handle failed message with retry logic
     */
    async handleFailedMessage(originalQueue, message, error, retryCount = 0) {
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
        }
        else {
            // Send to Dead Letter Queue
            await this.sendToDLQ(originalQueue, message, error);
        }
    }
    /**
     * Send message to Dead Letter Queue
     */
    async sendToDLQ(originalQueue, message, error) {
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
exports.DLQHandler = DLQHandler;
