// Provides testing for user controllers:
// deleteUser.js, getAllUsers.js, getUserById.js, searchUsers.js, updateAvatar.js, and updateUser.js
// to run test: `cd server`, `npm test`

const request = require("supertest");
const app = require("../server");

jest.mock("../models/User");
jest.mock("../models/Event");
jest.mock("../models/SavedEvent");
jest.mock("../models/Notification");
jest.mock("../models/Comment");
jest.mock("bcrypt");

const User = require("../models/User");
const Event = require("../models/Event");
const SavedEvent = require("../models/SavedEvent");
const Notification = require("../models/Notification");
const Comment = require("../models/Comment");
const bcrypt = require("bcrypt");

// checkAdmin requires a valid ObjectId format to pass through
const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/users/
  describe("GET /api/users/", () => {
    test("returns all users without passwords", async () => {
      const mockUsers = [
        { _id: "u1", userName: "john", email: "john@test.com" },
        { _id: "u2", userName: "jane", email: "jane@test.com" },
      ];
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      const res = await request(app).get("/api/users/");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUsers);
    });

    test("returns 500 if the database throws an error", async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const res = await request(app).get("/api/users/");

      expect(res.statusCode).toBe(500);
    });
  });

  // GET /api/users/search
  describe("GET /api/users/search", () => {
    test("returns empty results if no query term is provided", async () => {
      const res = await request(app).get("/api/users/search");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ users: [], events: [] });
    });

    test("returns empty results if query term is blank whitespace", async () => {
      const res = await request(app).get("/api/users/search?q=%20%20");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ users: [], events: [] });
    });

    test("returns matching users and events for a search term", async () => {
      const mockUsers = [{ _id: "u1", userName: "john" }];
      const mockEvents = [{ _id: "e1", title: "John's Party" }];
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvents),
      });

      const res = await request(app).get("/api/users/search?q=john");

      expect(res.statusCode).toBe(200);
      expect(res.body.users).toEqual(mockUsers);
      expect(res.body.events).toEqual(mockEvents);
    });

    test("returns 500 if the database throws an error", async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const res = await request(app).get("/api/users/search?q=john");

      expect(res.statusCode).toBe(500);
    });
  });

  // GET /api/users/:id
  describe("GET /api/users/:id", () => {
    test("returns 404 if user is not found", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get("/api/users/u1");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

    test("returns the user by id", async () => {
      const mockUser = { _id: "u1", userName: "john", email: "john@test.com" };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).get("/api/users/u1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    test("returns 500 if the database throws an error", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const res = await request(app).get("/api/users/u1");

      expect(res.statusCode).toBe(500);
    });
  });

  // DELETE /api/users/:id
  describe("DELETE /api/users/:id", () => {
    test("returns 401 if no userId is provided (checkAdmin)", async () => {
      const res = await request(app).delete("/api/users/u1").send({});

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    test("returns 403 if the requesting user is not an admin (checkAdmin)", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ isAdmin: false }),
      });

      const res = await request(app)
        .delete("/api/users/u1")
        .send({ userId: VALID_OBJECT_ID });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden: admin access required");
    });

    test("deletes the user and their saved events", async () => {
      User.findById.mockReturnValue({
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

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("returns 500 if the database throws an error", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ isAdmin: true }),
      });
      User.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .delete("/api/users/u1")
        .send({ userId: VALID_OBJECT_ID });

      expect(res.statusCode).toBe(500);
    });
  });

  // PATCH /api/users/:id/avatar
  describe("PATCH /api/users/:id/avatar", () => {
    test("returns 400 if no file is uploaded", async () => {
      const res = await request(app).patch("/api/users/u1/avatar");

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("No file uploaded");
    });
  });

  // PATCH /api/users/:id

  describe("PATCH /api/users/:id", () => {
    test("returns 404 if user is not found", async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .patch("/api/users/u1")
        .send({ firstName: "John" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

    test("updates user fields and returns success", async () => {
      User.findById.mockResolvedValue({ _id: "u1", isBanned: false });
      User.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .patch("/api/users/u1")
        .send({ firstName: "John", lastName: "Doe" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("returns 401 if current password is incorrect", async () => {
      User.findById.mockResolvedValue({
        _id: "u1",
        password: "hashed_old_password",
        isBanned: false,
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .patch("/api/users/u1")
        .send({ password: "newpass", currentPassword: "wrongpass" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Current password is incorrect");
    });

    test("updates password when current password is correct", async () => {
      User.findById.mockResolvedValue({
        _id: "u1",
        password: "hashed_old_password",
        isBanned: false,
      });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashed_new_password");
      User.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .patch("/api/users/u1")
        .send({ password: "newpass", currentPassword: "correctpass" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("sends a ban notification when a user is banned", async () => {
      User.findById.mockResolvedValue({ _id: "u1", isBanned: false });
      Notification.create.mockResolvedValue({});
      Event.find.mockResolvedValue([]); // no events to cancel
      User.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .patch("/api/users/u1")
        .send({ isBanned: true });

      expect(res.statusCode).toBe(200);
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: "account_banned" }),
      );
    });

    test("sends an unban notification when a user is unbanned", async () => {
      User.findById.mockResolvedValue({ _id: "u1", isBanned: true });
      Notification.create.mockResolvedValue({});
      Event.find.mockResolvedValue([]); // no events to restore
      User.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .patch("/api/users/u1")
        .send({ isBanned: false });

      expect(res.statusCode).toBe(200);
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: "account_unbanned" }),
      );
    });

    test("returns 500 if the database throws an error", async () => {
      User.findById.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .patch("/api/users/u1")
        .send({ firstName: "John" });

      expect(res.statusCode).toBe(500);
    });
  });
});
