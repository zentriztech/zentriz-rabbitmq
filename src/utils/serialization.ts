/**
 * Serialize message payload
 */
export function serializeMessage(payload: any): Buffer {
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
export function deserializeMessage<T = any>(content: Buffer): T {
  try {
    const str = content.toString('utf8');
    return JSON.parse(str) as T;
  } catch {
    // If parsing fails, return as string
    return content.toString('utf8') as T;
  }
}
