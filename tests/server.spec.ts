import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("Server", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a new server", async () => {
    const response = await request(app.server).get("/");
    expect(response.text).toEqual("🌎 Hello World!");
  });
});
