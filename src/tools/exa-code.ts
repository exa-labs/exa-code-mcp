import { z } from "zod";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { API_CONFIG } from "./config.js";
import { createRequestLogger } from "../utils/logger.js";

// Exa Code API request/response types for simplified interface
type ExaCodeRequest = {
  query: string;
  tokensNum: number;
  flags?: string[];
};

type ExaCodeResponse = {
  requestId: string;
  query: string;
  response: string;
  resultsCount: number;
  costDollars: string;
  searchTime: number;
  outputTokens: number;
  traces?: any;
};

export function registerExaCodeTool(server: McpServer, config?: { exaApiKey?: string }): void {
  // Register simplified context tool
  server.tool(
    "get_code_context",
    "Get contextual code snippets using Exa Code API endpoint.",
    {
      query: z.string().min(1).max(2000).describe("Search query to find relevant code snippets"),
      tokensNum: z.number().min(50).max(500000).describe("Maximum number of tokens to return in the response")
    },
    async ({ query, tokensNum }) => {
      const requestId = `get_code_context-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'get_code_context');
      
      logger.start(`Searching for: ${query}`);
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: 30000
        });

        const exaCodeRequest: ExaCodeRequest = {
          query,
          tokensNum
        };
        
        logger.log("Sending context request to Exa API");
        
        const response = await axiosInstance.post<ExaCodeResponse>(
          '/context',
          exaCodeRequest,
          { timeout: 30000 }
        );
        
        logger.log("Received context response from Exa API");

        if (!response.data) {
          logger.log("Warning: Empty response from Exa Code API");
          return {
            content: [{
              type: "text" as const,
              text: "No code snippets found. Please try a different query or library."
            }]
          };
        }

        logger.log(`Code search completed with ${'resultsCount' in response.data ? response.data.resultsCount : 0} results`);
        
        // Return the actual code content from the response field
        const codeContent = typeof response.data.response === 'string' ? response.data.response : JSON.stringify(response.data.response, null, 2);
        
        logger.complete();
        return {
          content: [{
            type: "text" as const,
            text: codeContent
          }]
        };
      } catch (error) {
        logger.error(error);
        
        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status || 'unknown';
          const errorMessage = error.response?.data?.message || error.message;
          
          logger.log(`Axios error (${statusCode}): ${errorMessage}`);
          return {
            content: [{
              type: "text" as const,
              text: `Code search error (${statusCode}): ${errorMessage}`
            }],
            isError: true,
          };
        }
        
        return {
          content: [{
            type: "text" as const,
            text: `Code search error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );
}