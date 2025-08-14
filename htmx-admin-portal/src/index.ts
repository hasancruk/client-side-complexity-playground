import { serve } from '@hono/node-server';
import app from './app.js';

const port = 5678;

serve({
  fetch: app.fetch,
  port
});
