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

describe("Remove activity", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("should be able to remove a activity from a trip", async () => {
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
    const createActivityResponse = await request(app.server)
      .post(`/trips/${tripId}/activities`)
      .send({
        title: "Lunch",
        occursAt: dayjs().add(8, "day"),
      });
    const activityId = createActivityResponse.body.activityId;

    await request(app.server).delete(`/activities/${activityId}`).expect(200);

    const tripActivitiesResponse = await request(app.server).get(
      `/trips/${tripId}/activities`
    );

    expect(tripActivitiesResponse.body.activities).toEqual([
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
      expect.objectContaining({ activities: [] }),
    ]);
  });

  it("should not be able to delete a non existing activity", async () => {
    const activityId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app.server).delete(
      `/activities/${activityId}`
    );

    expect(response.body.message).toBe("Activity not found");
    expect(response.statusCode).toBe(400);
  });
});
