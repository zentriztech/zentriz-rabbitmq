# @zentriztech/rabbitmq

Zentriz RabbitMQ Package - RabbitMQ client for messaging.

> **Status**: Ready for production use

## Installation

```bash
npm install @zentriztech/rabbitmq
```

## Usage

### Publisher

```typescript
import { Publisher } from '@zentriztech/rabbitmq';

const publisher = new Publisher('my-exchange');
await publisher.initialize();

// Publish message
await publisher.publish('user.created', {
  userId: 123,
  email: 'user@example.com',
}, {
  persistent: true,
  messageId: 'msg-123',
});

// Publish to specific exchange
await publisher.publishToExchange(
  'events',
  'user.created',
  { userId: 123 }
);
```

### Consumer

```typescript
import { Consumer } from '@zentriztech/rabbitmq';

const consumer = new Consumer();
await consumer.initialize();

// Consume messages
await consumer.consume(
  {
    queue: 'user-queue',
    prefetch: 10,
    noAck: false,
  },
  async (message, originalMessage) => {
    console.log('Received:', message);
    // Process message
  }
);
```

### Queue and Exchange Setup

```typescript
import { RabbitMQClient } from '@zentriztech/rabbitmq';

const client = new RabbitMQClient();
await client.connect();

// Create exchange
await client.assertExchange('my-exchange', 'topic', {
  durable: true,
});

// Create queue
await client.assertQueue('my-queue', {
  durable: true,
});

// Bind queue to exchange
await client.bindQueue('my-queue', 'my-exchange', 'user.*');
```

### Dead Letter Queue

```typescript
import { DLQHandler } from '@zentriztech/rabbitmq';

const dlq = new DLQHandler({
  queue: 'dlq-queue',
  exchange: 'dlq-exchange',
  maxRetries: 3,
  retryDelay: 5000,
});

await dlq.initialize();

// Handle failed message
await dlq.handleFailedMessage('original-queue', message, error, retryCount);
```

## Configuration

Set environment variables:

```bash
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Clean
npm run clean
```

## Links

- [GitHub Repository](https://github.com/zentriztech/zentriz-rabbitmq)
- [GitHub Packages](https://github.com/orgs/zentriztech/packages/npm/package/rabbitmq)

## License

MIT
