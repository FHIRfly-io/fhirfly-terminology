import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpClient, TokenManager } from "../src/http.js";
import { AuthenticationError } from "../src/errors.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    headers: new Headers(),
    json: () => Promise.resolve(data),
  };
}

function errorJsonResponse(status: number, body: Record<string, unknown> = {}) {
  return {
    ok: false,
    status,
    statusText: "Error",
    headers: new Headers(),
    json: () => Promise.resolve(body),
  };
}

describe("HttpClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("API key auth", () => {
    it("sends x-api-key header", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ code: "123" }));

      const http = new HttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "api-key", apiKey: "ffly_test_key" },
        maxRetries: 0,
      });

      await http.get("/v1/ndc/123");

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.headers["x-api-key"]).toBe("ffly_test_key");
      expect(opts.headers["Authorization"]).toBeUndefined();
    });
  });

  describe("OAuth auth", () => {
    it("sends Authorization: Bearer header", async () => {
      const tm = new TokenManager({
        clientId: "cid",
        clientSecret: "csec",
        tokenUrl: "https://auth.example.com/oauth2/token",
      });
      vi.spyOn(tm, "getToken").mockResolvedValue("jwt_token_123");

      mockFetch.mockResolvedValueOnce(jsonResponse({ code: "123" }));

      const http = new HttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "oauth", tokenManager: tm },
        maxRetries: 0,
      });

      await http.get("/v1/ndc/123");

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.headers["Authorization"]).toBe("Bearer jwt_token_123");
      expect(opts.headers["x-api-key"]).toBeUndefined();
    });

    it("retries once on 401 after invalidating token", async () => {
      const tm = new TokenManager({
        clientId: "cid",
        clientSecret: "csec",
        tokenUrl: "https://auth.example.com/oauth2/token",
      });
      const getTokenSpy = vi
        .spyOn(tm, "getToken")
        .mockResolvedValueOnce("expired_token")
        .mockResolvedValueOnce("fresh_token");
      const invalidateSpy = vi.spyOn(tm, "invalidate");

      mockFetch
        .mockResolvedValueOnce(errorJsonResponse(401, { error: "invalid_token" }))
        .mockResolvedValueOnce(jsonResponse({ code: "123" }));

      const http = new HttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "oauth", tokenManager: tm },
        maxRetries: 0,
      });

      const result = await http.get<{ code: string }>("/v1/ndc/123");

      expect(invalidateSpy).toHaveBeenCalledOnce();
      expect(getTokenSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ code: "123" });

      // Second request should use fresh token
      const [, secondOpts] = mockFetch.mock.calls[1]!;
      expect(secondOpts.headers["Authorization"]).toBe("Bearer fresh_token");
    });

    it("throws on 401 after retry exhausted", async () => {
      const tm = new TokenManager({
        clientId: "cid",
        clientSecret: "csec",
        tokenUrl: "https://auth.example.com/oauth2/token",
      });
      vi.spyOn(tm, "getToken").mockResolvedValue("bad_token");
      vi.spyOn(tm, "invalidate");

      mockFetch
        .mockResolvedValueOnce(errorJsonResponse(401, { error: "invalid_token" }))
        .mockResolvedValueOnce(errorJsonResponse(401, { error: "invalid_token" }));

      const http = new HttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "oauth", tokenManager: tm },
        maxRetries: 0,
      });

      await expect(http.get("/v1/ndc/123")).rejects.toThrow(AuthenticationError);
    });

    it("does not retry 401 with API key auth", async () => {
      mockFetch.mockResolvedValueOnce(
        errorJsonResponse(401, { error: "invalid_token" })
      );

      const http = new HttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "api-key", apiKey: "bad_key" },
        maxRetries: 0,
      });

      await expect(http.get("/v1/ndc/123")).rejects.toThrow(AuthenticationError);
      expect(mockFetch).toHaveBeenCalledOnce();
    });
  });
});
