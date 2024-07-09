import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("Confirm trip", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to confirm a trip", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).get(`/trips/${id}/confirm`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(id);
  });
});
