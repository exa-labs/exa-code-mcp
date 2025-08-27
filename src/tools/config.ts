// Configuration for API
export const API_CONFIG = {
  BASE_URL: process.env.EXA_API_URL || 'https://api.exa.ai',
  ENDPOINTS: {
    CODE: '/context'
  },
  DEFAULT_NUM_RESULTS: 5,
  DEFAULT_MAX_CHARACTERS: 3000
} as const;