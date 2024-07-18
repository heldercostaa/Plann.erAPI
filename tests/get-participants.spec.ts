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

describe("Get participants", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to get a trip participants", async () => {
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

    const response = await request(app.server).get(
      `/trips/${tripId}/participants`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.participants).toHaveLength(3);
    expect(response.body.participants[0].email).toBe("john.doe@mail.com");
    expect(response.body.participants[1].email).toBe("jake.doe@mail.com");
    expect(response.body.participants[2].email).toBe("sarah.doe@mail.com");
  });

  it("should not be able to get a participant if invalid trip id", async () => {
    const tripId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).get(
      `/trips/${tripId}/participants`
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Trip not found");
  });
});
