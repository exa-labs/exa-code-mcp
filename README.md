# Exa Code MCP Server

Experimental MCP implementation of the Exa Code API.

## Setup

1. Build the server:
```bash
npm run build:stdio
```

2. Configure Claude Code by adding to your `.mcp.json`:
```json
{
  "mcpServers": {
    "exa-code": {
      "command": "node",
      "args": [".smithery/index.cjs"],
      "env": {
        "EXA_API_KEY": "***"
      }
    }
  }
}
```

## Tools

- `find_library_exa` - Find libraries available for exa-code search
- `get_library_context_exa` - Get contextual code snippets from open source libraries
