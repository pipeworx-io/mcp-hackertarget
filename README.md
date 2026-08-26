# @pipeworx/hackertarget

[HackerTarget](https://hackertarget.com/ip-tools/) MCP — keyless DNS/recon utilities. Free tier 100 queries/day per source IP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

Responses are line-oriented plain text from upstream; this pack parses them into structured JSON when reasonable.

## Tools

- `dns_lookup(target)` — A records (line-per-result)
- `reverse_dns(target)` — reverse DNS for an IP
- `mtr(target)` — mtr (network path)
- `nping(target)` — ping
- `dns_host_search(target)` — passive DNS host search
- `find_shared_dns(target)` — domains sharing the same DNS server
- `geoip(target)` — IP geolocation
- `reverse_ip(target)` — hosts on the same IP
- `as_lookup(target)` — AS lookup
- `whois(target)` — whois
- `http_headers(target)` — fetch HTTP headers
- `traceroute(target)` — traceroute
- `subnet_lookup(target)` — subnet info
- `page_links(target)` — links extracted from a page (URL)

## Notes

- Pipeworx-side rate limit is the outer envelope; HackerTarget's own daily 100/IP cap applies per gateway egress IP.

## Data source

`https://api.hackertarget.com`

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

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

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
