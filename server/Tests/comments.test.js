// Test server/controllers/comments backend functionality
// deleteComment.js, getComments.js and postComment.js
// to run test: `cd server`, `npm test`
const request = require("supertest");
const app = require("../server");

// use jest.mock so no real Mongo DB conn is required
jest.mock("../models/Comment");
jest.mock("../models/Event");
jest.mock("../models/User");
jest.mock("../models/Notification");

const Comment = require("../models/Comment");
const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");

describe("Comment Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/comments/:eventId
  describe("GET /api/comments/:eventId", () => {
    test("returns comments for an event", async () => {
      const mockComments = [{ _id: "c1", eventId: "e1", content: "Hello" }];
      Comment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockComments),
        }),
      });

      const res = await request(app).get("/api/comments/e1");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockComments);
    });

    test("returns 500 if the database throws an error", async () => {
      Comment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });

      const res = await request(app).get("/api/comments/e1");
      expect(res.statusCode).toBe(500);
    });
  });

  // POST /api/comments/
  // checkBanned middleware passes because "u1" is not a valid Monggose ObjectId
  describe("POST /api/comments/", () => {
    test("returns 400 if eventId is missing", async () => {
      const res = await request(app)
        .post("/api/comments/")
        .send({ userId: "u1", content: "Hello" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("eventId, userId, and content are required");
    });

    test("returns 400 if content is blank", async () => {
      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", userId: "u1", content: "   " });

      expect(res.statusCode).toBe(400);
    });

    test("creates a comment and returns 201", async () => {
      const mockPopulated = { _id: "c1", content: "Hello" };
      const mockComment = {
        _id: "c1",
        populate: jest.fn().mockResolvedValue(mockPopulated),
      };
      Comment.create.mockResolvedValue(mockComment);
      Event.findById.mockResolvedValue(null); // no owner → no notification

      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", userId: "u1", content: "Hello" });

      expect(res.statusCode).toBe(201);
    });

    test("sends a notification to event owner when a top-level comment is posted", async () => {
      const mockPopulated = { _id: "c1", content: "Hello" };
      const mockComment = {
        _id: "c1",
        populate: jest.fn().mockResolvedValue(mockPopulated),
      };
      Comment.create.mockResolvedValue(mockComment);
      Event.findById.mockResolvedValue({
        ownerId: "owner1",
        title: "Test Event",
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ userName: "john" }),
      });
      Notification.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", userId: "u1", content: "Hello" });

      expect(res.statusCode).toBe(201);
      expect(Notification.create).toHaveBeenCalled();
    });
  });

  // DELETE /api/comments/:commentId
  describe("DELETE /api/comments/:commentId", () => {
    test("returns 404 if comment is not found", async () => {
      Comment.findById.mockResolvedValue(null);

      const res = await request(app).delete("/api/comments/c1");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Comment not found");
    });

    test("deletes a top-level comment and all its replies", async () => {
      Comment.findById.mockResolvedValue({ _id: "c1", parentCommentId: null });
      Comment.deleteMany.mockResolvedValue({});

      const res = await request(app).delete("/api/comments/c1");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Comment and replies deleted");
    });

    test("deletes only a reply comment", async () => {
      Comment.findById.mockResolvedValue({ _id: "c2", parentCommentId: "c1" });
      Comment.findByIdAndDelete.mockResolvedValue({});

      const res = await request(app).delete("/api/comments/c2");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Reply deleted");
    });
  });
});
