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

describe("Create trip", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to create a new trip", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.tripId).toBeDefined();
  });

  it("should not be able to create trip with destination less than 4 chars", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "For",
        startsAt: dayjs().add(-1, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain(
      "String must contain at least 4 character(s)"
    );
  });

  it("should not be able to create trip with start date before today", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(-1, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid trip start date");
  });

  it("should not be able to create trip with end date before start date", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(6, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid trip end date");
  });

  it("should not be able to create trip with invalid owner email", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(6, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Invalid email");
  });

  it("should not be able to create trip with invalid participants emails", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(6, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.com", "sarah.doe@mail.com"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Invalid email");
  });

  it("should send email to owner when creating a trip", async () => {
    const response = await request(app.server)
      .post("/trips")
      .send({
        destination: "Fortaleza",
        startsAt: dayjs().add(7, "day"),
        endsAt: dayjs().add(14, "day"),
        ownerName: "John Doe",
        ownerEmail: "john.doe@mail.com",
        emailsToInvite: ["jake.doe@mail.com", "sarah.doe@mail.com"],
      });

    const formattedStartDate = dayjs(dayjs().add(7, "day")).format("LL");
    const formattedEndDate = dayjs(dayjs().add(14, "day")).format("LL");
    const confirmationUrl = `http://localhost:3333/trips/${response.body.tripId}/confirm`;

    expect(sendMailMock).toHaveBeenCalledOnce();
    expect(sendMailMock).toHaveBeenLastCalledWith({
      from: {
        name: "Plann.er Team",
        address: "hello@plann.er",
      },
      to: {
        address: "john.doe@mail.com",
        name: "John Doe",
      },
      subject: `Confirm you trip to Fortaleza on ${formattedStartDate}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>You requested a trip creation to <strong>Fortaleza</strong> between <strong>${formattedStartDate}</strong> and <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>To confirm and plan your trip, click the link below:</p>
          <p></p>
          <p>
            <a href="${confirmationUrl}>Confirm trip</a>
          </p>
          <p></p>
          <p>If you don't know what this email is about, please disconsider this message.</p>
        </div>
        `.trim(),
    });
  });
});
