const request = require("supertest");
const app = require("../server");

// use jest.mock so no real Mongo DB conn is required
jest.mock("../models/User");
jest.mock("../models/Event");
jest.mock("../models/SavedEvent");
jest.mock("../models/Comment");

const User = require("../models/User");
const Event = require("../models/Event");
const SavedEvent = require("../models/SavedEvent");
const Comment = require("../models/Comment");

const ADMIN_ID = "507f1f77bcf86cd799439011";

// checkAdmin requires a valid ObjectId and admin privileges to pass through
function mockAdmin() {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue({ isAdmin: true }),
  });
}

describe("Analytics Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // checkAdmin guard
  describe("checkAdmin guard", () => {
    test("returns 401 if userId is missing on a protected route", async () => {
      const res = await request(app).get("/api/analytics/event-trends");

      expect(res.statusCode).toBe(401);
    });

    test("returns 403 if the user is not an admin", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ isAdmin: false }),
      });

      const res = await request(app).get(
        `/api/analytics/event-trends?userId=${ADMIN_ID}`,
      );

      expect(res.statusCode).toBe(403);
    });
  });

  // GET /api/analytics/event-trends
  describe("GET /api/analytics/event-trends", () => {
    test("returns event trends grouped by month", async () => {
      mockAdmin();
      Event.find.mockResolvedValue([
        { publishedAt: new Date("2025-01-15") },
        { publishedAt: new Date("2025-01-20") },
        { publishedAt: new Date("2025-02-10") },
      ]);

      const res = await request(app).get(
        `/api/analytics/event-trends?userId=${ADMIN_ID}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.granularity).toBe("month");
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: "2025-01", count: 2 }),
          expect.objectContaining({ label: "2025-02", count: 1 }),
        ]),
      );
    });

    test("returns day granularity when date range is within 31 days", async () => {
      mockAdmin();
      Event.find.mockResolvedValue([
        { publishedAt: new Date("2025-03-10") },
        { publishedAt: new Date("2025-03-10") },
      ]);

      const res = await request(app).get(
        `/api/analytics/event-trends?userId=${ADMIN_ID}&from=2025-03-01&to=2025-03-15`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.granularity).toBe("day");
    });

    test("returns empty data when no events exist", async () => {
      mockAdmin();
      Event.find.mockResolvedValue([]);

      const res = await request(app).get(
        `/api/analytics/event-trends?userId=${ADMIN_ID}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    test("returns 500 if the database throws an error", async () => {
      mockAdmin();
      Event.find.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get(
        `/api/analytics/event-trends?userId=${ADMIN_ID}`,
      );

      expect(res.statusCode).toBe(500);
    });
  });

  // GET /api/analytics/popular-events
  describe("GET /api/analytics/popular-events", () => {
    test("returns top saved events", async () => {
      SavedEvent.aggregate.mockResolvedValue([
        { _id: "e1", saveCount: 5 },
        { _id: "e2", saveCount: 3 },
      ]);
      Event.find.mockResolvedValue([
        { _id: { toString: () => "e1" }, title: "Concert" },
        { _id: { toString: () => "e2" }, title: "Workshop" },
      ]);

      const res = await request(app).get("/api/analytics/popular-events");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([
        { eventId: "e1", eventName: "Concert", saveCount: 5 },
        { eventId: "e2", eventName: "Workshop", saveCount: 3 },
      ]);
    });

    test("returns empty array when no saved events exist", async () => {
      SavedEvent.aggregate.mockResolvedValue([]);
      Event.find.mockResolvedValue([]);

      const res = await request(app).get("/api/analytics/popular-events");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("returns 500 if the database throws an error", async () => {
      SavedEvent.aggregate.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/analytics/popular-events");

      expect(res.statusCode).toBe(500);
    });
  });

  // GET /api/analytics/location-distribution
  describe("GET /api/analytics/location-distribution", () => {
    test("returns event counts grouped by city", async () => {
      Event.find.mockResolvedValue([
        { location: { city: "Vancouver" } },
        { location: { city: "Vancouver" } },
        { location: { city: "Toronto" } },
      ]);

      const res = await request(app).get(
        "/api/analytics/location-distribution",
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([
        { city: "Vancouver", count: 2 },
        { city: "Toronto", count: 1 },
      ]);
    });

    test("uses 'Unknown' for events without a city", async () => {
      Event.find.mockResolvedValue([{ location: {} }, { location: null }]);

      const res = await request(app).get(
        "/api/analytics/location-distribution",
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ city: "Unknown", count: 2 }]);
    });

    test("returns 500 if the database throws an error", async () => {
      Event.find.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get(
        "/api/analytics/location-distribution",
      );

      expect(res.statusCode).toBe(500);
    });
  });

  // GET /api/analytics/user-growth
  describe("GET /api/analytics/user-growth", () => {
    test("returns user growth data grouped by month", async () => {
      mockAdmin();
      User.find.mockResolvedValue([
        { createdAt: new Date("2025-01-10T12:00:00") },
        { createdAt: new Date("2025-01-20T12:00:00") },
        { createdAt: new Date("2025-02-15T12:00:00") },
      ]);

      const res = await request(app).get(
        `/api/analytics/user-growth?userId=${ADMIN_ID}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: "2025-01", count: 2 }),
          expect.objectContaining({ label: "2025-02", count: 1 }),
        ]),
      );
    });

    test("returns 500 if the database throws an error", async () => {
      mockAdmin();
      User.find.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get(
        `/api/analytics/user-growth?userId=${ADMIN_ID}`,
      );

      expect(res.statusCode).toBe(500);
    });
  });
});
