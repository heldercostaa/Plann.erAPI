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

describe("Update trip", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to update a trip", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza, CE",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;

    const startsAt = dayjs().add(6, "day");
    const endsAt = dayjs().add(15, "day");

    const response = await request(app.server).put(`/trips/${tripId}`).send({
      destination: "Jericoacoara",
      startsAt,
      endsAt,
    });
    expect(response.statusCode).toBe(200);

    const getTripResponse = await request(app.server).get(`/trips/${tripId}`);
    const trip = getTripResponse.body.trip;

    expect(trip.destination).toEqual("Jericoacoara");
    expect(trip.startsAt).toEqual(startsAt.toISOString());
    expect(trip.endsAt).toEqual(endsAt.toISOString());
  });

  it("should not be able to update a trip if invalid trip id", async () => {
    const tripId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server)
      .put(`/trips/${tripId}`)
      .send({
        destination: "Jericoacoara",
        startsAt: dayjs().add(6, "day"),
        endsAt: dayjs().add(15, "day"),
      });

    expect(response.body.message).toBe("Trip not found");
    expect(response.statusCode).toBe(400);
  });

  it("should not be able to update a trip if destination too small", async () => {
    const response = await request(app.server)
      .put(`/trips/00000000-0000-0000-0000-000000000000`)
      .send({ destination: "Jer" });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid input",
      errors: { destination: ["String must contain at least 4 character(s)"] },
    });
  });

  it("should be able to update a trip if start date before today", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza, CE",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;

    const response = await request(app.server)
      .put(`/trips/${tripId}`)
      .send({ startsAt: dayjs().add(-1, "day") });

    expect(response.statusCode).toBe(200);
    expect(response.body.tripId).toBeDefined();
  });

  it("should not be able to update a trip if invalid end date", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza, CE",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;

    const response = await request(app.server)
      .put(`/trips/${tripId}`)
      .send({ endsAt: dayjs().add(6, "day") });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual(
      "New end date cannot be before current start date"
    );
  });

  it("should not be able to update a trip if end date before start date", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza, CE",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;

    const response = await request(app.server)
      .put(`/trips/${tripId}`)
      .send({
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(6, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual(
      "New end date cannot be before new start date"
    );
  });
});
