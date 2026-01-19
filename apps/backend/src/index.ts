import 'dotenv/config';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load .env from root directory
config({ path: resolve(process.cwd(), '../../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

const PORT = Number(process.env.PORT ?? 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? true;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error('Missing env: JWT_ACCESS_SECRET');
}

const app = Fastify({ logger: true });

await app.register(cors, { origin: CORS_ORIGIN });
await app.register(rateLimit, { global: true, max: 300, timeWindow: '1 minute' });
await app.register(jwt, { secret: JWT_ACCESS_SECRET });

app.get('/health', async () => ({ ok: true }));

app.listen({ port: PORT, host: '0.0.0.0' });
