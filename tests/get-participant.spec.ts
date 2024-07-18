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
import { resetDb } from "./helpers/reset-db";

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

describe("Get participant", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to get a participant", async () => {
    const createTripResponse = await request(app.server)
      .post("/trips")
      .send({
        destination: "Paris, France",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const tripId = createTripResponse.body.tripId;
    const getTripResponse = await request(app.server).get(`/trips/${tripId}`);
    const jakeParticipantId = getTripResponse.body.trip.participants[1].id;

    const response = await request(app.server).get(
      `/participants/${jakeParticipantId}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.participant.id).toBe(jakeParticipantId);
    expect(response.body.participant.email).toBe("jake.doe@mail.com");
    expect(response.body.participant.isConfirmed).toBeFalsy();
  });

  it("should not be able to get a participant if invalid id", async () => {
    const participantId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).get(
      `/participants/${participantId}`
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Participant not found");
  });
});
