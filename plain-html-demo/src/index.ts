import { serve } from '@hono/node-server';
import app from './app.js';

const port = 4321;

serve({
  fetch: app.fetch,
  port
});
