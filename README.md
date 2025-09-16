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

- `get_code_context` - Get grounding context for your coding agent
