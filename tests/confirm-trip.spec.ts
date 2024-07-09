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

describe("Confirm trip", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to confirm a trip and be redirected", async () => {
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

    const tripId = createTripResponse.body.id;
    const response = await request(app.server).get(`/trips/${tripId}/confirm`);
    expect(response.statusCode).toBe(302);

    const getTripResponse = await request(app.server).get(`/trips/${tripId}`);
    expect(getTripResponse.body.trip.is_confirmed).toBeTruthy();
  });

  it("should not be able to confirm a non-existing trip", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).get(`/trips/${id}/confirm`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Trip not found");
  });

  it("should send email to participants when confirming a trip", async () => {
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

    const tripId = createTripResponse.body.id;
    await request(app.server).get(`/trips/${tripId}/confirm`);

    expect(sendMailMock).toHaveBeenCalledTimes(3);
  });

  it("should be redirected if a trip is alredy confirmed and not send email to participants", async () => {
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

    const tripId = createTripResponse.body.id;
    const response = await request(app.server).get(`/trips/${tripId}/confirm`);
    expect(response.statusCode).toBe(302);

    const confirmTripAgainResponse = await request(app.server).get(
      `/trips/${tripId}/confirm`
    );
    expect(confirmTripAgainResponse.statusCode).toBe(302);
    expect(sendMailMock).toHaveBeenCalledTimes(3);
  });
});
