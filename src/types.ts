// Exa /context API Types - only context-related interfaces
export interface ExaContextRequest {
  query: string;
  tokensNum: number;
}

export interface ExaContextResult {
  id: string;
  title: string;
  url: string;
  text: string;
  score?: number;
}

export interface ExaContextResponse {
  requestId: string;
  query: string;
  repository: string;
  response: string;
  resultsCount: number;
  costDollars: string;
  searchTime: number;
}

// Tool Types
export interface ContextArgs {
  githubLibraryName: string;
  libraryVersion?: string;
  query: string;
  tokensNum: number;
}