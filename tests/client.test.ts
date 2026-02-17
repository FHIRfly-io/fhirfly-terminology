import { describe, it, expect } from "vitest";
import { Fhirfly } from "../src/index.js";

describe("Fhirfly", () => {
  describe("API key config", () => {
    it("creates client with valid API key", () => {
      const client = new Fhirfly({ apiKey: "test-key" });
      expect(client).toBeDefined();
      expect(client.ndc).toBeDefined();
      expect(client.npi).toBeDefined();
    });

    it("throws if apiKey is empty string", () => {
      expect(() => new Fhirfly({ apiKey: "" })).toThrow(
        "FHIRfly requires either an apiKey or clientId+clientSecret"
      );
    });
  });

  describe("OAuth2 config", () => {
    it("creates client with clientId and clientSecret", () => {
      const client = new Fhirfly({
        clientId: "ffly_client_test",
        clientSecret: "ffly_secret_test",
      });
      expect(client).toBeDefined();
      expect(client.ndc).toBeDefined();
    });

    it("creates client with explicit tokenUrl", () => {
      const client = new Fhirfly({
        clientId: "ffly_client_test",
        clientSecret: "ffly_secret_test",
        tokenUrl: "https://custom.example.com/oauth2/token",
      });
      expect(client).toBeDefined();
    });

    it("creates client with scopes", () => {
      const client = new Fhirfly({
        clientId: "ffly_client_test",
        clientSecret: "ffly_secret_test",
        scopes: ["ndc.read", "npi.read"],
      });
      expect(client).toBeDefined();
    });
  });

  describe("invalid config", () => {
    it("throws if neither apiKey nor clientId is provided", () => {
      // @ts-expect-error - testing runtime validation with empty object
      expect(() => new Fhirfly({})).toThrow(
        "FHIRfly requires either an apiKey or clientId+clientSecret"
      );
    });

    it("throws if clientId is provided without clientSecret", () => {
      // @ts-expect-error - testing runtime validation
      expect(() => new Fhirfly({ clientId: "ffly_client_test" })).toThrow(
        "FHIRfly requires either an apiKey or clientId+clientSecret"
      );
    });
  });
});
