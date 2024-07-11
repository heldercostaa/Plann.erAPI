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
import { env } from "../src/env";

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

describe("Create invite", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to create a new invite", async () => {
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
      .post(`/trips/${tripId}/invites`)
      .send({ email: "sarah.doe@mail.com" });

    expect(response.statusCode).toBe(200);
    expect(response.body.participantId).toBeDefined();
  });

  it("should not be able to create an invite for invalid trip", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server)
      .post(`/trips/${id}/invites`)
      .send({ email: "sarah.doe@mail.com" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Trip not found");
  });

  it("should send email to invited person", async () => {
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

    sendMailMock.mockClear();

    const formattedStartDate = dayjs(dayjs().add(7, "day")).format("LL");
    const formattedEndDate = dayjs(dayjs().add(14, "day")).format("LL");

    const tripId = createTripResponse.body.tripId;
    const response = await request(app.server)
      .post(`/trips/${tripId}/invites`)
      .send({ email: "sarah.doe@mail.com" });

    const confirmationUrl = `${env.API_BASE_URL}/participants/${response.body.participantId}/confirm`;

    expect(sendMailMock).toHaveBeenCalledOnce();
    expect(sendMailMock).toHaveBeenCalledWith({
      from: {
        name: "Plann.er Team",
        address: "hello@plann.er",
      },
      to: "sarah.doe@mail.com",
      subject: `Confirm your presence to Fortaleza on ${formattedStartDate}`,
      html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>You were invited to participate in a trip to <strong>Fortaleza</strong> between <strong>${formattedStartDate}</strong> and <strong>${formattedEndDate}</strong>.</p>
            <p></p>
            <p>To confirm your present in the trip, click the link below:</p>
            <p></p>
            <p>
              <a href="${confirmationUrl}">Confirm trip</a>
            </p>
            <p></p>
            <p>If you don't know what this email is about, please disconsider this message.</p>
          </div>`.trim(),
    });
  });

  it("should not invite if invalid email", async () => {
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
      .post(`/trips/${tripId}/invites`)
      .send({ email: "sarah.doemail. com" });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid input",
      errors: { email: ["Invalid email"] },
    });
  });
});
