import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TokenManager } from "../src/http.js";
import { AuthenticationError } from "../src/errors.js";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function tokenResponse(expiresIn = 600) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        access_token: `token_${Date.now()}`,
        token_type: "Bearer",
        expires_in: expiresIn,
      }),
  };
}

function errorResponse(status = 400) {
  return {
    ok: false,
    status,
    text: () => Promise.resolve("invalid_client"),
  };
}

describe("TokenManager", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches a token on first call", async () => {
    mockFetch.mockResolvedValueOnce(tokenResponse());

    const tm = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
    });

    const token = await tm.getToken();
    expect(token).toMatch(/^token_/);
    expect(mockFetch).toHaveBeenCalledOnce();

    // Verify request body
    const [url, opts] = mockFetch.mock.calls[0]!;
    expect(url).toBe("https://example.com/oauth2/token");
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    const body = new URLSearchParams(opts.body);
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("client_id")).toBe("cid");
    expect(body.get("client_secret")).toBe("csec");
  });

  it("returns cached token on subsequent calls", async () => {
    mockFetch.mockResolvedValueOnce(tokenResponse());

    const tm = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
    });

    const t1 = await tm.getToken();
    const t2 = await tm.getToken();
    expect(t1).toBe(t2);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("refreshes token when expired", async () => {
    // Token expires in 61s — after we advance time past expiry it should refresh
    mockFetch
      .mockResolvedValueOnce(tokenResponse(61))
      .mockResolvedValueOnce(tokenResponse(600));

    const tm = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
    });

    const t1 = await tm.getToken();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Advance time past the 1s window (61s - 60s buffer = 1s)
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 2000);

    const t2 = await tm.getToken();
    expect(t2).not.toBe(t1);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("deduplicates concurrent refresh calls", async () => {
    let resolveToken: (v: any) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((r) => {
        resolveToken = r;
      })
    );

    const tm = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
    });

    // Fire 3 concurrent calls
    const p1 = tm.getToken();
    const p2 = tm.getToken();
    const p3 = tm.getToken();

    // Only one fetch call should be made
    expect(mockFetch).toHaveBeenCalledOnce();

    resolveToken!(tokenResponse().json().then((d: any) => ({ ok: true, json: () => Promise.resolve(d) })));

    // Actually let's resolve with a proper response
    // Reset and redo properly
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(tokenResponse());

    const tm2 = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
    });

    const promises = [tm2.getToken(), tm2.getToken(), tm2.getToken()];
    const tokens = await Promise.all(promises);

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(tokens[0]).toBe(tokens[1]);
    expect(tokens[1]).toBe(tokens[2]);
  });

  it("throws AuthenticationError on failed token exchange", async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(401))
      .mockResolvedValueOnce(errorResponse(401));

    const tm = new TokenManager({
      clientId: "bad_id",
      clientSecret: "bad_secret",
      tokenUrl: "https://example.com/oauth2/token",
    });

    await expect(tm.getToken()).rejects.toThrow(AuthenticationError);
    await expect(tm.getToken()).rejects.toThrow("OAuth2 token exchange failed");
  });

  it("invalidate() forces a new token fetch", async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: `token_call_${callCount}`,
            token_type: "Bearer",
            expires_in: 600,
          }),
      });
    });

    const tm = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
    });

    const t1 = await tm.getToken();
    expect(t1).toBe("token_call_1");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    tm.invalidate();

    const t2 = await tm.getToken();
    expect(t2).toBe("token_call_2");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("sends scopes when provided", async () => {
    mockFetch.mockResolvedValueOnce(tokenResponse());

    const tm = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
      scopes: ["ndc.read", "npi.read"],
    });

    await tm.getToken();

    const body = new URLSearchParams(mockFetch.mock.calls[0]![1].body);
    expect(body.get("scope")).toBe("ndc.read npi.read");
  });

  it("does not send scope param when scopes is empty", async () => {
    mockFetch.mockResolvedValueOnce(tokenResponse());

    const tm = new TokenManager({
      clientId: "cid",
      clientSecret: "csec",
      tokenUrl: "https://example.com/oauth2/token",
      scopes: [],
    });

    await tm.getToken();

    const body = new URLSearchParams(mockFetch.mock.calls[0]![1].body);
    expect(body.has("scope")).toBe(false);
  });
});
