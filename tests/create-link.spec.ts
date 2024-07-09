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

  it("should be able to create a new link", async () => {
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
    const response = await request(app.server)
      .post(`/trips/${tripId}/links`)
      .send({
        title: "Airbnb reservation",
        url: "https://airbnb.com",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  it("should not be able to create a new link for invalid trip", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).post(`/trips/${id}/links`).send({
      title: "Airbnb reservation",
      url: "https://airbnb.com",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Trip not found");
  });

  it("should not be able to create a new link if invalid url", async () => {
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
    const response = await request(app.server)
      .post(`/trips/${tripId}/links`)
      .send({
        title: "Airbnb reservation",
        url: "https://airbnb .com",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Invalid url");
  });

  it("should not be able to create a new link with title less than 4 chars", async () => {
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
    const response = await request(app.server)
      .post(`/trips/${tripId}/links`)
      .send({
        title: "Air",
        occursAt: dayjs().add(15, "day"),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain(
      "String must contain at least 4 character(s)"
    );
  });
});
