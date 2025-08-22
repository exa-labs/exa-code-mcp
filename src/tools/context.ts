import { z } from "zod";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { API_CONFIG } from "./config.js";
import { createRequestLogger } from "../utils/logger.js";

// Context API request/response types based on flattened discriminated union
type ContextRequest = {
  action: "findLibrary";
  githubLibraryName: string;
  libraryVersion?: string;
} | {
  action: "getLibraryContext";
  githubLibraryName: string;
  libraryVersion?: string;
  tokensNum: number;
  query: string;
};

type ContextResponse = {
  action: "findLibrary";
  requestId: string;
  library_name: string;
  library_version?: string;
  response: {
    exists: boolean;
  };
} | {
  action: "getLibraryContext";
  requestId: string;
  query: string;
  repository: string;
  response: string;
  resultsCount: number;
  costDollars: string;
  searchTime: number;
};

export function registerContextTool(server: McpServer, config?: { exaApiKey?: string }): void {
  // Register findLibrary tool
  server.tool(
    "find_library_exa",
    "Find a library in Exa /context to check if it's available for context search. You can use % as a wildcard in the library name.",
    {
      githubLibraryName: z.string().describe("GitHub library name (e.g., 'facebook/react'). Use % as wildcard (e.g., 'facebook/%' or '%/react')"),
      libraryVersion: z.string().optional().describe("Optional version of the library")
    },
    async ({ githubLibraryName, libraryVersion }) => {
      const requestId = `find_library_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'find_library_exa');
      
      logger.start(`Finding library ${githubLibraryName}${libraryVersion ? `@${libraryVersion}` : ''}`);
      
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

        const contextRequest: ContextRequest = {
          action: "findLibrary",
          githubLibraryName,
          ...(libraryVersion && { libraryVersion })
        };
        
        logger.log("Sending findLibrary request to Exa API");
        
        const response = await axiosInstance.post<ContextResponse>(
          '/context',
          contextRequest,
          { timeout: 30000 }
        );
        
        logger.log("Received findLibrary response from Exa API");
        logger.complete();
        
        // Return the response content directly
        const responseContent = response.data.response || response.data;
        
        return {
          content: [{
            type: "text" as const,
            text: typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent, null, 2)
          }]
        };
      } catch (error) {
        logger.error(error);
        
        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status || 'unknown';
          const errorMessage = error.response?.data?.message || error.message;
          
          return {
            content: [{
              type: "text" as const,
              text: `Find library error (${statusCode}): ${errorMessage}`
            }],
            isError: true,
          };
        }
        
        return {
          content: [{
            type: "text" as const,
            text: `Find library error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Register getLibraryContext tool
  server.tool(
    "get_library_context_exa",
    "Get contextual code snippets from a specific library version using Exa /context API endpoint.",
    {
      githubLibraryName: z.string().describe("GitHub library name (e.g., 'facebook/react')"),
      libraryVersion: z.string().optional().describe("Optional version of the library"),
      query: z.string().min(1).max(2000).describe("Search query to find relevant code context"),
      tokensNum: z.number().min(50).max(500000).describe("Maximum number of tokens to return in the context")
    },
    async ({ githubLibraryName, libraryVersion, query, tokensNum }) => {
      const requestId = `get_library_context_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'get_library_context_exa');
      
      logger.start(`${query} in ${githubLibraryName}${libraryVersion ? `@${libraryVersion}` : ''}`);
      
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

        const contextRequest: ContextRequest = {
          action: "getLibraryContext",
          githubLibraryName,
          libraryVersion,
          tokensNum,
          query
        };
        
        logger.log("Sending getLibraryContext request to Exa API");
        
        const response = await axiosInstance.post<ContextResponse>(
          '/context',
          contextRequest,
          { timeout: 30000 }
        );
        
        logger.log("Received getLibraryContext response from Exa API");

        if (!response.data) {
          logger.log("Warning: Empty response from Exa /context API");
          return {
            content: [{
              type: "text" as const,
              text: "No context found. Please try a different query or library."
            }]
          };
        }

        logger.log(`Context search completed with ${response.data.resultsCount || 0} results`);
        
        // Return the actual context content from the response field
        const contextContent = response.data.response || '';
        
        logger.complete();
        return {
          content: [{
            type: "text" as const,
            text: contextContent
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
              text: `Context search error (${statusCode}): ${errorMessage}`
            }],
            isError: true,
          };
        }
        
        return {
          content: [{
            type: "text" as const,
            text: `Context search error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );
}