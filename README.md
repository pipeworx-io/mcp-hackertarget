# @pipeworx/hackertarget

[HackerTarget](https://hackertarget.com/ip-tools/) MCP — DNS and network-recon
utilities. Eleven of the fourteen tools need no credential; three
(`whois`, `mtr`, `traceroute`) require the caller's own HackerTarget key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

Responses are line-oriented plain text from upstream; this pack parses them into
structured JSON when reasonable (`lines[]` plus the verbatim `raw`).

## Tools

Keyless — call with just `target`:

- `dns_lookup(target)` — A/AAAA/MX/NS/SOA records for a hostname
- `reverse_dns(target)` — reverse DNS (PTR) for an IP
- `nping(target)` — ICMP ping from HackerTarget's probe host
- `dns_host_search(target)` — passive DNS subdomain search
- `find_shared_dns(target)` — domains sharing the same nameserver
- `geoip(target)` — IP geolocation (country / region / city / coords)
- `reverse_ip(target)` — hostnames resolving to the same IP
- `as_lookup(target)` — ASN, announced prefix and network name
- `http_headers(target)` — HTTP response headers for a host or URL
- `subnet_lookup(target)` — subnet arithmetic for a CIDR block
- `page_links(target)` — links extracted from one page (full URL)

Require a caller-supplied key — call with `target` **and** `_apiKey`:

- `whois(target, _apiKey)` — WHOIS record for a domain or IP
- `mtr(target, _apiKey)` — per-hop loss/latency report
- `traceroute(target, _apiKey)` — routers between HackerTarget and the target

## Auth

Pipeworx fronts **no** platform key for HackerTarget. The eleven keyless tools
work with no credential at all; `whois`, `mtr` and `traceroute` are gated behind
a HackerTarget membership and are bring-your-own-key (Bruce's ruling, fleet
#2132, 2026-09-16).

Get a key from the HackerTarget member dashboard
(<https://hackertarget.com/ip-tools/>) and pass it as `_apiKey`. It is forwarded
as the `apikey=` query parameter HackerTarget documents.

A keyless call to one of the three gated tools is refused **before** any request
leaves the gateway, with `error: auth_required` and a message saying the tool
*requires an API key* and where to get one. It is not an outage and does not
count as a tool failure. A key that is supplied and then rejected by HackerTarget
gets a different `auth_required` message — "the key you supplied was refused" —
so a caller who already holds a key is not sent to fetch it again.

Passing `_apiKey` to the eleven keyless tools is allowed and useful: it bills the
call against the caller's own member quota instead of the shared free tier.

## Rate limits

HackerTarget's free tier is **50 calls/day per source IP** at up to 2 requests/s
(their FAQ, re-read 2026-09-16 — older copies of this file said 100). That source
IP is the gateway's shared egress, so an exhausted quota surfaces as an
`API count exceeded` body rather than an HTTP 429. Pipeworx's own rate limit is
the outer envelope. Callers who bring `_apiKey` draw on their own quota.

## Data sources

- `https://api.hackertarget.com` — every tool in this pack
- <https://hackertarget.com/ip-tools/> — endpoint, auth and quota documentation

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "hackertarget": {
      "url": "https://gateway.pipeworx.io/hackertarget/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/hackertarget/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/hackertarget_dns_lookup \
  -H 'Content-Type: application/json' \
  -d '{"target":"pipeworx.io"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/hackertarget_dns_lookup`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "hackertarget": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-hackertarget"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-hackertarget
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Hackertarget data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
