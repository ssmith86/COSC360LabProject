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
});
