/**
 * Serialize message payload
 */
export declare function serializeMessage(payload: any): Buffer;
/**
 * Deserialize message payload
 */
export declare function deserializeMessage<T = any>(content: Buffer): T;
