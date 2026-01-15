"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeMessage = serializeMessage;
exports.deserializeMessage = deserializeMessage;
/**
 * Serialize message payload
 */
function serializeMessage(payload) {
    if (Buffer.isBuffer(payload)) {
        return payload;
    }
    if (typeof payload === 'string') {
        return Buffer.from(payload, 'utf8');
    }
    return Buffer.from(JSON.stringify(payload), 'utf8');
}
/**
 * Deserialize message payload
 */
function deserializeMessage(content) {
    try {
        const str = content.toString('utf8');
        return JSON.parse(str);
    }
    catch {
        // If parsing fails, return as string
        return content.toString('utf8');
    }
}
