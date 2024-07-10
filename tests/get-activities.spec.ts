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

describe("Create link", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to get a trip activities grouped by date and ordered by time", async () => {
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

    await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Beach",
        occursAt: dayjs().add(12, "day").set("hour", 10),
      });

    await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Lunch",
        occursAt: dayjs().add(12, "day").set("hour", 14),
      });

    await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Museum",
        occursAt: dayjs().add(8, "day").set("hour", 10),
      });

    await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Night party",
        occursAt: dayjs().add(13, "day").set("hour", 22),
      });

    const response = await request(app.server).get(
      `/trips/${tripId}/activities`
    );
    expect(response.body.activities).toEqual([
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({
        activities: [expect.objectContaining({ title: "Museum" })],
      }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({
        activities: [
          expect.objectContaining({ title: "Beach" }),
          expect.objectContaining({ title: "Lunch" }),
        ],
      }),
      expect.objectContaining({
        activities: [expect.objectContaining({ title: "Night party" })],
      }),
      expect.objectContaining({ activities: [] }),
    ]);
  });

  it("should not be able to get a trip activities if invalid trip id", async () => {
    const tripId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).get(
      `/trips/${tripId}/activities`
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Trip not found");
  });
});
