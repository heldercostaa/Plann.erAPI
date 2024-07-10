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

describe("Get trip", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to get a trip with participants, activities and links", async () => {
    const startsAt = dayjs().add(7, "day");
    const endsAt = dayjs().add(14, "day");

    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt,
        endsAt,
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });
    const tripId = createTripResponse.body.tripId;

    await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Beach",
        occursAt: dayjs().add(12, "day").set("hour", 10),
      });

    await request(app.server).post(`/trips/${tripId}/links`).send({
      title: "Airbnb reservation",
      url: "https://airbnb.com",
    });

    const response = await request(app.server).get(`/trips/${tripId}`);
    expect(response.body.trip).toEqual(
      expect.objectContaining({
        destination: "Fortaleza",
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_confirmed: false,
        participants: [
          expect.objectContaining({ email: "john.doe@mail.com" }),
          expect.objectContaining({ email: "jake.doe@mail.com" }),
          expect.objectContaining({ email: "sarah.doe@mail.com" }),
        ],
        activities: [expect.objectContaining({ title: "Beach" })],
        links: [expect.objectContaining({ title: "Airbnb reservation" })],
      })
    );
  });

  it("should not be able to get a trip if invalid trip id", async () => {
    const tripId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).get(`/trips/${tripId}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Trip not found");
  });
});
