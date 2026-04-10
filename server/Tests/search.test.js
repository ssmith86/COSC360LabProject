const request = require("supertest");
const app = require("../server");

// to run test: `cd server`, `npm test`

// use jest.mock so no real Mongo DB conn is required
jest.mock("../models/Event");
jest.mock("../models/User");

const Event = require("../models/Event");
const User = require("../models/User");

describe("Search Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /search/
  describe("GET /search/", () => {
    test("returns matching events by title", async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });
      const mockEvents = [{ _id: "e1", title: "Music Festival" }];
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvents),
      });

      const res = await request(app).get("/search/?q=music");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockEvents);
    });

    test("returns empty array when no results match", async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app).get("/search/?q=nonexistent");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("returns results when query matches a username (owner)", async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: "u1" }]),
      });
      const mockEvents = [
        { _id: "e1", title: "John's Party", ownerId: "u1" },
      ];
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvents),
      });

      const res = await request(app).get("/search/?q=john");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockEvents);
    });

    test("handles empty query parameter", async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app).get("/search/");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
