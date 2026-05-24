interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * HackerTarget MCP.
 */


const BASE = 'https://api.hackertarget.com';
const UA = 'pipeworx-mcp-hackertarget/1.0 (+https://pipeworx.io)';

const ENDPOINTS = {
  dns_lookup: 'dnslookup',
  reverse_dns: 'reversedns',
  mtr: 'mtr',
  nping: 'nping',
  dns_host_search: 'hostsearch',
  find_shared_dns: 'findshareddns',
  geoip: 'geoip',
  reverse_ip: 'reverseiplookup',
  as_lookup: 'aslookup',
  whois: 'whois',
  http_headers: 'httpheaders',
  traceroute: 'mtr',
  subnet_lookup: 'subnetcalc',
  page_links: 'pagelinks',
};

const shape = {
  type: 'object' as const,
  properties: { target: { type: 'string' as const } },
  required: ['target'] as const,
};

const tools: McpToolExport['tools'] = Object.keys(ENDPOINTS).map((k) => ({
  name: k,
  description: `HackerTarget ${k} lookup.`,
  inputSchema: shape,
}));

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const path = (ENDPOINTS as Record<string, string>)[name];
  if (!path) throw new Error(`Unknown tool: ${name}`);
  const target = args.target;
  if (typeof target !== 'string' || !target.trim()) throw new Error('Required argument "target" is missing. Pass a string like "example.com".');
  const res = await fetch(`${BASE}/${path}/?q=${encodeURIComponent(target)}`, {
    headers: { Accept: 'text/plain', 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`HackerTarget: ${res.status}`);
  const text = await res.text();
  if (text.startsWith('error') || text.startsWith('API count exceeded')) throw new Error(`HackerTarget: ${text.split('\n')[0]}`);
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return { target, tool: name, lines, raw: text };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
