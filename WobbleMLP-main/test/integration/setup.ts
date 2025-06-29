import { createServer } from 'http';
import request from 'supertest';
import { vi } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequestWithUser } from '../mocks/auth';

// Mock the Next.js API route handler
type ApiHandler = (
  req: NextApiRequest | NextApiRequestWithUser,
  res: NextApiResponse
) => Promise<void> | void;

// Create a simple test server that routes to our API handler
export const createTestServer = (handler: ApiHandler) => {
  return createServer(async (req, res) => {
    // Convert IncomingMessage to NextApiRequest
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const query = Object.fromEntries(url.searchParams.entries());
    
    const mockReq: any = {
      ...req,
      url: req.url,
      method: req.method,
      query,
      body: {},
      headers: req.headers,
      cookies: {},
    };

    // Parse JSON body if content-type is application/json
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (body) {
          mockReq.body = JSON.parse(body);
        }

        // Create a mock response
        const mockRes: any = {
          statusCode: 200,
          _headers: {},
          _json: null,
          status: function(code: number) {
            this.statusCode = code;
            return this;
          },
          json: function(data: any) {
            this._json = data;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return this;
          },
          send: function(data: any) {
            res.end(data);
            return this;
          },
          setHeader: function(name: string, value: string) {
            this._headers[name.toLowerCase()] = value;
            res.setHeader(name, value);
            return this;
          },
          end: function() {
            res.end();
            return this;
          }
        };

        // Call the handler
        await handler(mockReq, mockRes);
      } catch (error) {
        console.error('Test server error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
  });
};

// Mock process.env for tests
vi.stubGlobal('process', {
  ...process,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  },
});
