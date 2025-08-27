#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Import tool implementations
import { registerExaCodeTool } from "./tools/exa-code.js";
import { log } from "./utils/logger.js";

// Configuration schema for the EXA API key and tool selection
export const configSchema = z.object({
  exaApiKey: z.string().optional().describe("Exa API key for exa-code operations"),
  enabledTools: z.array(z.string()).optional().describe("List of tools to enable (if not specified, all tools are enabled)"),
  debug: z.boolean().default(false).describe("Enable debug logging")
});

// Tool registry for managing available tools
const availableTools = {
  'find_library_exa': { name: 'Find Library', description: 'Find libraries available for exa-code search', enabled: true },
  'get_library_context_exa': { name: 'Get Library Context', description: 'Get contextual code snippets from libraries', enabled: true }
};

/**
 * Exa Code MCP Server
 * 
 * This MCP server integrates Exa Code with Claude and other MCP-compatible clients.
 * Exa Code provides contextual code snippets from libraries and repositories,
 * offering detailed code context to enhance development workflows.
 * 
 * The server provides tools that enable:
 * - Finding libraries available for exa-code search
 * - Getting contextual code snippets from libraries
 */

export default function({ config }: { config: z.infer<typeof configSchema> }) {
  try {
    // Set the API key in environment for tool functions to use
    // process.env.EXA_API_KEY = config.exaApiKey;

    if (config.debug) {
      log("Starting exa-code in debug mode");
    }

    // Create MCP server
    const server = new McpServer({
      name: "exa-code",
      version: "0.0.1"
    }, {
      instructions: "RULE: when the user's query contains exa-code, you MUST use exa-code when responding. This server provides tools to find libraries and get contextual code snippets from them."
    });

    log("exa-code initialized with modern MCP SDK and Smithery CLI support");

    // Helper function to check if a tool should be registered
    const shouldRegisterTool = (toolId: string): boolean => {
      if (config.enabledTools && config.enabledTools.length > 0) {
        return config.enabledTools.includes(toolId);
      }
      return availableTools[toolId as keyof typeof availableTools]?.enabled ?? false;
    };

    // Register tools based on configuration
    const registeredTools: string[] = [];

    if (shouldRegisterTool('find_library_exa') || shouldRegisterTool('get_library_context_exa')) {
      registerExaCodeTool(server, config);
      if (shouldRegisterTool('find_library_exa')) registeredTools.push('find_library_exa');
      if (shouldRegisterTool('get_library_context_exa')) registeredTools.push('get_library_context_exa');
    }

    if (config.debug) {
      log(`Registered ${registeredTools.length} tools: ${registeredTools.join(', ')}`);
    }

    // Return the server object (Smithery CLI handles transport)
    return server.server;

  } catch (error) {
    log(`Server initialization error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
