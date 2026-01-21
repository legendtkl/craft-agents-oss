/**
 * Auth environment variable management
 *
 * Centralizes the pattern of setting/clearing environment variables
 * when switching between authentication modes.
 *
 * Supports:
 * - Standard API key authentication
 * - Claude Max OAuth token authentication
 * - Proxy/custom API authentication with ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN/ANTHROPIC_API_KEY
 */

import type { AuthType } from '../config/storage.ts';

export interface ApiKeyCredentials {
  apiKey: string;
  baseUrl?: string;
}

export interface ClaudeMaxCredentials {
  oauthToken: string;
}

export interface ProxyCredentials {
  authToken?: string;
  apiKey?: string;
  baseUrl: string;
}

export type AuthCredentials =
  | { type: 'api_key'; credentials: ApiKeyCredentials }
  | { type: 'oauth_token'; credentials: ClaudeMaxCredentials }
  | { type: 'proxy'; credentials: ProxyCredentials };

/**
 * Set environment variables for the specified auth type.
 *
 * This clears conflicting env vars and sets the appropriate ones
 * for the selected authentication mode.
 *
 * @param auth - The auth type and credentials to configure
 */
export function setAuthEnvironment(auth: AuthCredentials): void {
  // Clear all auth-related env vars first
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.ANTHROPIC_BASE_URL;

  switch (auth.type) {
    case 'api_key':
      process.env.ANTHROPIC_API_KEY = auth.credentials.apiKey;
      if (auth.credentials.baseUrl) {
        process.env.ANTHROPIC_BASE_URL = auth.credentials.baseUrl;
      }
      break;

    case 'oauth_token':
      process.env.CLAUDE_CODE_OAUTH_TOKEN = auth.credentials.oauthToken;
      break;

    case 'proxy':
      process.env.ANTHROPIC_BASE_URL = auth.credentials.baseUrl;
      if (auth.credentials.authToken) {
        process.env.ANTHROPIC_AUTH_TOKEN = auth.credentials.authToken;
      }
      if (auth.credentials.apiKey) {
        process.env.ANTHROPIC_API_KEY = auth.credentials.apiKey;
      }
      break;
  }
}

/**
 * Clear all auth-related environment variables.
 */
export function clearAuthEnvironment(): void {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.ANTHROPIC_BASE_URL;
}

/**
 * Check if proxy authentication is configured via environment variables.
 */
export function isProxyAuthConfigured(): boolean {
  return !!(process.env.ANTHROPIC_BASE_URL && (process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY));
}
