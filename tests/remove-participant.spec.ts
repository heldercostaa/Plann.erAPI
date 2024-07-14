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
import { createTrip } from "../src/routes/create-trip";

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

describe("Remove participant", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to remove a participant from a trip", async () => {
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

    const getTripParticipants = await request(app.server).get(
      `/trips/${tripId}/participants`
    );
    const jakeId = getTripParticipants.body.participants.find(
      (participant: any) => participant.email === "jake.doe@mail.com"
    ).id;

    await request(app.server).delete(`/participants/${jakeId}`).expect(200);

    const newGetTripParticipants = await request(app.server).get(
      `/trips/${tripId}/participants`
    );
    const deletedJake = newGetTripParticipants.body.participants.find(
      (participant: any) => participant.email === "jake.doe@mail.com"
    )?.id;

    expect(deletedJake).toBeUndefined();
  });

  it("should not be able to delete a non existing participant", async () => {
    const participantId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).delete(
      `/participants/${participantId}`
    );

    expect(response.body.message).toBe("Participant not found");
    expect(response.statusCode).toBe(400);
  });
});
