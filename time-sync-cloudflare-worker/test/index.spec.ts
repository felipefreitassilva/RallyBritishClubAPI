import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("time-sync worker", () => {
	it("responds with the current server time in ms (unit style)", async () => {
		const request = new IncomingRequest("http://example.com");
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const before = Date.now();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		const after = Date.now();

		expect(response.headers.get("Content-Type")).toBe("application/json");
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");

		const body = (await response.json()) as { now: number };
		expect(body.now).toBeGreaterThanOrEqual(before);
		expect(body.now).toBeLessThanOrEqual(after);
	});

	it("responds with the current server time in ms (integration style)", async () => {
		const response = await SELF.fetch("https://example.com");
		const body = (await response.json()) as { now: number };
		expect(typeof body.now).toBe("number");
	});
});
