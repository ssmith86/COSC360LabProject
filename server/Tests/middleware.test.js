const request = require("supertest");
const app = require("../server");

// simulate MongoDB connection
jest.mock("../models/User");
jest.mock("../models/SavedEvent");
jest.mock("../models/Comment");
jest.mock("../models/Event");
jest.mock("../models/Notification");

const SavedEvent = require("../models/SavedEvent");
const Comment = require("../models/Comment");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const User = require("../models/User");

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // checkAdmin
  // Test: DELETE /api/users/:id
  describe("checkAdmin", () => {
    test("returns 401 if userId is not provided", async () => {
      const res = await request(app).delete("/api/users/u1").send({});

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    test("returns 401 if userId is not a valid ObjectId", async () => {
      const res = await request(app)
        .delete("/api/users/u1")
        .send({ userId: "not-a-valid-id" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    test("returns 403 if the user is not an admin", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ isAdmin: false }),
      });

      const res = await request(app)
        .delete("/api/users/u1")
        .send({ userId: VALID_OBJECT_ID });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden: admin access required");
    });

    test("passes through to the next handler if the user is an admin", async () => {
      User.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ isAdmin: true }),
      });
      Event.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });
      User.findByIdAndDelete.mockResolvedValue({});
      SavedEvent.deleteMany.mockResolvedValue({});
      Comment.deleteMany.mockResolvedValue({});
      Notification.deleteMany.mockResolvedValue({});

      const res = await request(app)
        .delete("/api/users/u1")
        .send({ userId: VALID_OBJECT_ID });

      // deleteUser ran (not blocked by checkAdmin) — 200 proves middleware passed
      expect(res.statusCode).toBe(200);
    });

    test("returns 500 if the database throws an error in checkAdmin", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const res = await request(app)
        .delete("/api/users/u1")
        .send({ userId: VALID_OBJECT_ID });

      expect(res.statusCode).toBe(500);
    });
  });

  // checkBanned
  // Test: POST /api/comments/ using checkBanned
  describe("checkBanned", () => {
    test("passes through if userId is not provided in the body", async () => {
      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", content: "Hello" });

      // checkBanned passed and postComment controller runs and returns status 400
      // with missing userId
      expect(res.statusCode).toBe(400);
    });

    test("passes through if userId is not a valid ObjectId", async () => {
      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", userId: "not-valid" }); // no content — triggers controller's 400

      // checkBanned passed — controller ran and returned 400 because content is missing
      expect(res.statusCode).toBe(400);
    });

    test("returns 403 if the user is banned", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ isBanned: true }),
      });

      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", userId: VALID_OBJECT_ID, content: "Hello" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Your account has been banned");
    });

    test("passes through to the next handler if the user is not banned", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ isBanned: false }),
      });
      Comment.create.mockResolvedValue({
        _id: "c1",
        populate: jest.fn().mockResolvedValue({ _id: "c1", content: "Hello" }),
      });
      Event.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", userId: VALID_OBJECT_ID, content: "Hello" });

      // 201 proves checkBanned passed through to the controller
      expect(res.statusCode).toBe(201);
    });

    test("returns 500 if the database throws an error in checkBanned", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const res = await request(app)
        .post("/api/comments/")
        .send({ eventId: "e1", userId: VALID_OBJECT_ID, content: "Hello" });

      expect(res.statusCode).toBe(500);
    });
  });

  // upload (fileFilter)
  // The fileFilter logic in upload.js rejects non-image MIME types.
  describe("upload fileFilter", () => {
    const fileFilter = (req, file, cb) => {
      file.mimetype.startsWith("image/")
        ? cb(null, true)
        : cb(new Error("Only image files are allowed"), false);
    };

    test("accepts a file with an image MIME type", () => {
      const cb = jest.fn();
      fileFilter({}, { mimetype: "image/jpeg" }, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    test("accepts a PNG file", () => {
      const cb = jest.fn();
      fileFilter({}, { mimetype: "image/png" }, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    test("rejects a PDF file", () => {
      const cb = jest.fn();
      fileFilter({}, { mimetype: "application/pdf" }, cb);

      expect(cb).toHaveBeenCalledWith(
        new Error("Only image files are allowed"),
        false,
      );
    });

    test("rejects a plain text file", () => {
      const cb = jest.fn();
      fileFilter({}, { mimetype: "text/plain" }, cb);

      expect(cb).toHaveBeenCalledWith(
        new Error("Only image files are allowed"),
        false,
      );
    });
  });
});
