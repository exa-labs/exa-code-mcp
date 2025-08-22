# Exa /context MCP Server

Experimental MCP implementation of the Exa /context API.

## Setup

1. Build the server:
```bash
npm run build:stdio
```

2. Configure Claude Code by adding to your `.mcp.json`:
```json
{
  "mcpServers": {
    "/context": {
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

- `find_library_exa` - Find libraries available for context search
- `get_library_context_exa` - Get contextual code snippets from libraries