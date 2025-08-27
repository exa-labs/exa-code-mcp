// Exa Code API Types - only exa-code-related interfaces
export interface ExaCodeRequest {
  query: string;
  tokensNum: number;
}

export interface ExaCodeResult {
  id: string;
  title: string;
  url: string;
  text: string;
  score?: number;
}

export interface ExaCodeResponse {
  requestId: string;
  query: string;
  repository: string;
  response: string;
  resultsCount: number;
  costDollars: string;
  searchTime: number;
}

// Tool Types
export interface CodeArgs {
  githubLibraryName: string;
  libraryVersion?: string;
  query: string;
  tokensNum: number;
}