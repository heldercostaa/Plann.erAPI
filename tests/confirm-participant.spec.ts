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
import { env } from "../src/env";
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

describe("Confirm participant", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to confirm a participant", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza, CE",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;
    await request(app.server).get(`/trips/${tripId}/confirm`);

    const getTripResponse = await request(app.server).get(`/trips/${tripId}`);
    const [jakeParticipant] = getTripResponse.body.trip.participants.filter(
      (participant: any) => participant.email === "jake.doe@mail.com"
    );

    const response = await request(app.server)
      .post(`/participants/${jakeParticipant.id}/confirm`)
      .send({ name: "Jake Doe" });
    expect(response.statusCode).toBe(200);

    const tripWithConfirmedParticipantResponse = await request(app.server).get(
      `/trips/${tripId}`
    );
    const [jakeParticipantConfirmed] =
      tripWithConfirmedParticipantResponse.body.trip.participants.filter(
        (participant: any) => participant.email === "jake.doe@mail.com"
      );
    expect(jakeParticipantConfirmed.isConfirmed).toBeTruthy();
    expect(jakeParticipantConfirmed.name).toBe("Jake Doe");
  });

  it("should not be able to confirm a non-existing participant", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server)
      .post(`/participants/${id}/confirm`)
      .send({ name: "John" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Participant not found");
  });
});
