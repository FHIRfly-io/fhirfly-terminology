// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import {
  ApiError,
  AuthenticationError,
  NetworkError,
  NotFoundError,
  QuotaExceededError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from "./errors.js";
import type { LookupOptions } from "./types/common.js";

/**
 * OAuth2 token response from the token endpoint.
 */
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * OAuth2 client credentials configuration.
 */
export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scopes?: string[];
}

/**
 * Manages OAuth2 access tokens with automatic refresh.
 */
export class TokenManager {
  private readonly credentials: OAuthCredentials;
  private accessToken: string | null = null;
  private expiresAt = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(credentials: OAuthCredentials) {
    this.credentials = credentials;
  }

  /**
   * Get a valid access token, refreshing if needed.
   * Deduplicates concurrent refresh calls.
   */
  async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = this.fetchToken();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Invalidate the cached token (e.g., after a 401 response).
   */
  invalidate(): void {
    this.accessToken = null;
    this.expiresAt = 0;
  }

  private async fetchToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
    });
    if (this.credentials.scopes?.length) {
      body.set("scope", this.credentials.scopes.join(" "));
    }

    const response = await fetch(this.credentials.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new AuthenticationError(
        `OAuth2 token exchange failed (${response.status}): ${text}`
      );
    }

    const data = (await response.json()) as TokenResponse;
    this.accessToken = data.access_token;
    // Refresh 60s before expiry
    this.expiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }
}

/**
 * Authentication mode for the HTTP client.
 */
type AuthMode =
  | { type: "api-key"; apiKey: string }
  | { type: "oauth"; tokenManager: TokenManager };

/**
 * HTTP client configuration.
 */
export interface HttpClientConfig {
  baseUrl: string;
  auth: AuthMode;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  userAgent?: string;
}

/**
 * HTTP response from the API.
 */
interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Internal HTTP client for making API requests.
 */
export class HttpClient {
  private readonly config: Required<Omit<HttpClientConfig, "auth">> & { auth: AuthMode };

  constructor(config: HttpClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      auth: config.auth,
      timeout: config.timeout ?? 30000,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      userAgent: config.userAgent ?? `@fhirfly/sdk/0.1.0 Node.js/${process.version}`,
    };
  }

  /**
   * Build query string from options.
   */
  private buildQueryString(options?: LookupOptions): string {
    if (!options) return "";

    const params = new URLSearchParams();

    if (options.shape) {
      params.set("shape", options.shape);
    }

    if (options.include?.length) {
      params.set("include", options.include.join(","));
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Build query string from search params object.
   */
  buildSearchQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;

      if (typeof value === "boolean") {
        searchParams.set(key, value.toString());
      } else if (typeof value === "number") {
        searchParams.set(key, value.toString());
      } else if (typeof value === "string" && value.length > 0) {
        searchParams.set(key, value);
      } else if (Array.isArray(value) && value.length > 0) {
        searchParams.set(key, value.join(","));
      }
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Parse error response from API.
   */
  private async parseErrorResponse(
    response: Response,
    endpoint: string
  ): Promise<never> {
    const status = response.status;
    let body: { message?: string; code?: string; error?: string; details?: unknown } = {};

    try {
      body = await response.json() as typeof body;
    } catch {
      // Response body is not JSON
    }

    const message = body.message || body.error || response.statusText;

    // Handle specific status codes
    switch (status) {
      case 401:
        throw new AuthenticationError(message);

      case 404: {
        // Extract code type and value from endpoint
        const match = endpoint.match(/\/v1\/(\w+)\/(.+)/);
        if (match) {
          throw new NotFoundError(match[1]!.toUpperCase(), match[2]!);
        }
        throw new NotFoundError("Resource", endpoint);
      }

      case 400:
        throw new ValidationError(message);

      case 429: {
        const retryAfter = response.headers.get("retry-after");
        const limit = response.headers.get("x-ratelimit-limit");
        const remaining = response.headers.get("x-ratelimit-remaining");
        const reset = response.headers.get("x-ratelimit-reset");

        // Check if it's a quota error vs rate limit
        if (body.code === "QUOTA_EXCEEDED") {
          throw new QuotaExceededError(message);
        }

        throw new RateLimitError(
          message,
          retryAfter ? parseInt(retryAfter, 10) : undefined,
          limit ? parseInt(limit, 10) : undefined,
          remaining ? parseInt(remaining, 10) : undefined,
          reset ? new Date(parseInt(reset, 10) * 1000) : undefined
        );
      }

      default:
        if (status >= 500) {
          throw new ServerError(message, status);
        }
        throw new ApiError(message, status, body.code, body.details);
    }
  }

  /**
   * Sleep for a given number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get auth headers for the current request.
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.config.auth.type === "api-key") {
      return { "x-api-key": this.config.auth.apiKey };
    }
    const token = await this.config.auth.tokenManager.getToken();
    return { "Authorization": `Bearer ${token}` };
  }

  /**
   * Make an HTTP request with retries.
   */
  private async request<T>(
    method: "GET" | "POST",
    endpoint: string,
    body?: unknown,
    isRetryAfter401 = false
  ): Promise<HttpResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout
        );

        const authHeaders = await this.getAuthHeaders();

        const response = await fetch(url, {
          method,
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
            "User-Agent": this.config.userAgent,
            "Accept": "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // On 401 with OAuth, invalidate token and retry once
          if (
            response.status === 401 &&
            this.config.auth.type === "oauth" &&
            !isRetryAfter401
          ) {
            this.config.auth.tokenManager.invalidate();
            return this.request<T>(method, endpoint, body, true);
          }

          // Don't retry client errors (except rate limits)
          if (response.status < 500 && response.status !== 429) {
            await this.parseErrorResponse(response, endpoint);
          }

          // For rate limits, check retry-after header
          if (response.status === 429) {
            const retryAfter = response.headers.get("retry-after");
            if (retryAfter && attempt < this.config.maxRetries) {
              await this.sleep(parseInt(retryAfter, 10) * 1000);
              continue;
            }
            await this.parseErrorResponse(response, endpoint);
          }

          // Retry server errors
          if (attempt < this.config.maxRetries) {
            await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
            continue;
          }

          await this.parseErrorResponse(response, endpoint);
        }

        const data = await response.json() as T;
        return { data, status: response.status, headers: response.headers };
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new TimeoutError(this.config.timeout);
          }

          lastError = error;

          // Retry on network errors
          if (attempt < this.config.maxRetries) {
            await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
            continue;
          }
        }

        throw new NetworkError(
          lastError?.message || "Unknown network error",
          lastError
        );
      }
    }

    throw new NetworkError(
      lastError?.message || "Request failed after retries",
      lastError
    );
  }

  /**
   * Make a GET request.
   */
  async get<T>(endpoint: string, options?: LookupOptions): Promise<T> {
    const queryString = this.buildQueryString(options);
    const response = await this.request<T>("GET", `${endpoint}${queryString}`);
    return response.data;
  }

  /**
   * Make a POST request.
   */
  async post<T>(endpoint: string, body: unknown, options?: LookupOptions): Promise<T> {
    const queryString = this.buildQueryString(options);
    const response = await this.request<T>("POST", `${endpoint}${queryString}`, body);
    return response.data;
  }

  /**
   * Make a GET request with search parameters.
   */
  async search<T>(endpoint: string, params: Record<string, unknown>): Promise<T> {
    const queryString = this.buildSearchQueryString(params);
    const response = await this.request<T>("GET", `${endpoint}${queryString}`);
    return response.data;
  }
}
