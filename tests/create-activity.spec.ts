import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { app } from "../src/app";
import { dayjs } from "../src/lib/dayjs";
import resetDb from "./helpers/reset-db";

// Mock the nodemailer module
const sendMailMock = vi.fn();
vi.mock("nodemailer", () => {
  return {
    getTestMessageUrl: vi.fn(),
    createTestAccount: vi.fn().mockReturnValue({ user: "user", pass: "pass" }),
    createTransport: vi
      .fn()
      .mockReturnValue({ sendMail: (obj: any) => sendMailMock(obj) }),
  };
});

describe("Create activity", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to create a new activity", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;
    const response = await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Lunch",
        occursAt: dayjs().add(8, "day"),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.activityId).toBeDefined();
  });

  it("should not be able to create a new activity for invalid trip", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server)
      .post(`/trips/${id}/activities`)
      .send({
        title: "Lunch",
        occursAt: dayjs().add(8, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Trip not found");
  });

  it("should not be able to create a new activity if occursAt before trip start", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;
    const response = await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Lunch",
        occursAt: dayjs().add(6, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid activity date");
  });

  it("should not be able to create a new activity if occursAt after trip ends", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;
    const response = await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Lunch",
        occursAt: dayjs().add(15, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid activity date");
  });

  it("should not be able to create a new activity with title less than 4 chars", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;
    const response = await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Lun",
        occursAt: dayjs().add(15, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid input",
      errors: { title: ["String must contain at least 4 character(s)"] },
    });
  });
});
