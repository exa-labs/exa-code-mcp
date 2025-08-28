export default {
  esbuild: {
    // Mark MCP SDK and other dependencies as external to avoid bundling issues
    external: [
      "@modelcontextprotocol/sdk/server/mcp.js",
      "zod",
      "axios"
    ],
  },
};
