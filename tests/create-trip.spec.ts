import dayjs from "dayjs";
import { beforeEach } from "node:test";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app";
import resetDb from "./helpers/reset-db";

describe("Server", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to create a new trip", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  it("should not be able to create trip with destination less than 4 words", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "For",
        startsAt: dayjs().add(-1, "day"),
        endsAt: dayjs().add(14, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain(
      "String must contain at least 4 character(s)"
    );
  });

  it("should not be able to create trip with start date before today", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(-1, "day"),
        endsAt: dayjs().add(14, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid trip start date");
  });

  it("should not be able to create trip with end date before start date", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(6, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid trip end date");
  });
});
