import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, ViteDevServer } from 'vite';
import fs from 'fs';
import type { Connect } from 'vite';
import type { ServerResponse } from 'http';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/v1/messages': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          secure: true,
          headers: {
            'x-api-key': env.VITE_CLAUDE_API_KEY || '',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
        },
      },
      middlewares: [
        {
          name: 'data-directory-listing',
          configureServer(server: ViteDevServer) {
            server.middlewares.use('/data', (
              req: Connect.IncomingMessage,
              res: ServerResponse,
              next: Connect.NextFunction
            ) => {
              if (req.url === '/') {
                const dataPath = path.resolve(__dirname, 'data');
                try {
                  const allFiles = fs.readdirSync(dataPath);
                  const jsonFiles = allFiles.filter(file => file.endsWith('.json'));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(jsonFiles));
                } catch (error) {
                  console.error('Error reading data directory:', error);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Failed to read directory' }));
                }
              } else {
                // Only allow access to .json files
                if (!req.url?.endsWith('.json')) {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Not found' }));
                  return;
                }
                next();
              }
            });
          },
        },
      ],
    },
    publicDir: 'data',
  };
});
