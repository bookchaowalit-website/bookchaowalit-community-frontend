import { NextRequest } from 'next/server';

export const runtime = 'edge';

interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

async function getData() {
  return { message: 'Sample data' };
}

export async function POST(request: NextRequest) {
  let requestId: number | string = 0;

  try {
    const body: MCPRequest = await request.json();
    requestId = body.id;
    const { method, params, id } = body;

    let result: any = {};

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'MCP Server', version: '1.0.0' }
        };
        break;

      case 'tools/list':
        result = {
          tools: [
            {
              name: 'get_data',
              description: 'Get sample data',
              inputSchema: { type: 'object', properties: {} }
            }
          ]
        };
        break;

      case 'tools/call':
        result = await getData();
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return Response.json({ jsonrpc: '2.0', id, result });

  } catch (error) {
    return Response.json({
      jsonrpc: '2.0',
      id: requestId,
      error: { code: -32603, message: error instanceof Error ? error.message : 'Internal error' }
    }, { status: 500 });
  }
}

