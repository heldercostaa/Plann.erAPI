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

describe("Remove link", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to remove a link from a trip", async () => {
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
    const createLinkResponse = await request(app.server)
      .post(`/trips/${tripId}/links`)
      .send({
        title: "Airbnb reservation",
        url: "https://airbnb.com",
      });
    const linkId = createLinkResponse.body.linkId;

    await request(app.server).delete(`/links/${linkId}`).expect(200);

    const tripLinksResponse = await request(app.server).get(
      `/trips/${tripId}/links`
    );

    expect(tripLinksResponse.body.links).toEqual([]);
  });

  it("should not be able to delete a non existing link", async () => {
    const linkId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).delete(`/links/${linkId}`);

    expect(response.body.message).toBe("Link not found");
    expect(response.statusCode).toBe(400);
  });
});
