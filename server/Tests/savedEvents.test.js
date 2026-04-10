const request = require("supertest");
const app = require("../server");

// Provides testing for server/controllers/savedEvents/ files
// getSavedEvents.js, saveEvent.js, and unsaveEvent.js
// to run test: `cd server`, `npm test`
jest.mock("../models/SavedEvent");
jest.mock("../models/Event");
jest.mock("../models/User");
jest.mock("../models/Notification");

const SavedEvent = require("../models/SavedEvent");
const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");

describe("Saved Events Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/savedevents/
  describe("GET /api/savedevents/", () => {
    test("returns 400 if the userId is missing", async () => {
      const res = await request(app).get("/api/savedevents/");

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId query parameter is required");
    });

    test("returns 400 if the userId is blank whitespace", async () => {
      const res = await request(app).get("/api/savedevents/?userId=%20%20");

      expect(res.statusCode).toBe(400);
    });

    test("returns saved events for a user", async () => {
      const mockSavedRecords = [
        { eventId: { _id: "e1", title: "Event 1" } },
        { eventId: { _id: "e2", title: "Event 2" } },
      ];
      SavedEvent.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSavedRecords),
      });

      const res = await request(app).get("/api/savedevents/?userId=u1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([
        { _id: "e1", title: "Event 1" },
        { _id: "e2", title: "Event 2" },
      ]);
    });

    test("filters out null eventId entries", async () => {
      const mockSavedRecords = [
        { eventId: { _id: "e1", title: "Event 1" } },
        { eventId: null },
      ];
      SavedEvent.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSavedRecords),
      });

      const res = await request(app).get("/api/savedevents/?userId=u1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ _id: "e1", title: "Event 1" }]);
    });

    test("returns 500 if the database throws an error", async () => {
      SavedEvent.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const res = await request(app).get("/api/savedevents/?userId=u1");

      expect(res.statusCode).toBe(500);
    });
  });

  // POST /api/savedevents/
  describe("POST /api/savedevents/", () => {
    test("returns 400 if userId is missing", async () => {
      const res = await request(app)
        .post("/api/savedevents/")
        .send({ eventId: "e1" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId and eventId are required");
    });

    test("returns 400 if the eventId is missing", async () => {
      const res = await request(app)
        .post("/api/savedevents/")
        .send({ userId: "u1" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId and eventId are required");
    });

    test("returns 409 if the event is already saved", async () => {
      SavedEvent.findOne.mockResolvedValue({ _id: "s1", userId: "u1", eventId: "e1" });

      const res = await request(app)
        .post("/api/savedevents/")
        .send({ userId: "u1", eventId: "e1" });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe("Event already saved");
    });

    test("saves the event and returns 201", async () => {
      SavedEvent.findOne.mockResolvedValue(null);
      SavedEvent.create.mockResolvedValue({});
      Event.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/savedevents/")
        .send({ userId: "u1", eventId: "e1" });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Event saved successfully");
    });

    test("sends a notification to the event owner when event is saved", async () => {
      SavedEvent.findOne.mockResolvedValue(null);
      SavedEvent.create.mockResolvedValue({});
      Event.findById.mockResolvedValue({ ownerId: "owner1", title: "Test Event" });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ userName: "john" }),
      });
      Notification.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/savedevents/")
        .send({ userId: "u1", eventId: "e1" });

      expect(res.statusCode).toBe(201);
      expect(Notification.create).toHaveBeenCalled();
    });

    test("returns 500 if the database throws an error", async () => {
      SavedEvent.findOne.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .post("/api/savedevents/")
        .send({ userId: "u1", eventId: "e1" });

      expect(res.statusCode).toBe(500);
    });
  });

  // DELETE /api/savedevents/
  describe("DELETE /api/savedevents/", () => {
    test("returns 400 if userId is missing", async () => {
      const res = await request(app)
        .delete("/api/savedevents/")
        .send({ eventId: "e1" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId and eventId are required");
    });

    test("returns 400 if the eventId is missing", async () => {
      const res = await request(app)
        .delete("/api/savedevents/")
        .send({ userId: "u1" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId and eventId are required");
    });

    test("unsaves the event and returns a success message", async () => {
      SavedEvent.deleteOne.mockResolvedValue({});

      const res = await request(app)
        .delete("/api/savedevents/")
        .send({ userId: "u1", eventId: "e1" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Event unsaved successfully");
    });

    test("returns 500 if the database throws an error", async () => {
      SavedEvent.deleteOne.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .delete("/api/savedevents/")
        .send({ userId: "u1", eventId: "e1" });

      expect(res.statusCode).toBe(500);
    });
  });
});
