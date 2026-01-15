"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRabbitMQConnection = getRabbitMQConnection;
exports.getRabbitMQChannel = getRabbitMQChannel;
exports.closeRabbitMQConnection = closeRabbitMQConnection;
const amqp = __importStar(require("amqplib"));
const core_1 = require("@zentriztech/core");
const logger = (0, core_1.getLogger)({ functionName: 'RabbitMQConnection' });
let connection = null;
let channel = null;
/**
 * Get or create RabbitMQ connection singleton
 */
async function getRabbitMQConnection(options) {
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
        conn.on('error', (error) => {
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
    }
    catch (error) {
        logger.error({ msg: 'Failed to connect to RabbitMQ', error: error.message });
        throw error;
    }
}
/**
 * Get or create RabbitMQ channel
 */
async function getRabbitMQChannel() {
    if (channel) {
        return channel;
    }
    const conn = await getRabbitMQConnection();
    const ch = await conn.createConfirmChannel();
    channel = ch;
    ch.on('error', (error) => {
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
async function closeRabbitMQConnection() {
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
