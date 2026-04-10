const request = require("supertest");
const app = require("../server");

// Use jest mock to skip Mongo DB Conn
// Provides testing for server/controllers/notifications/ files
// getNotifications.js, markAllRead.js, markOneRead.js, deleteAllNotifications.js, and deleteOneNotification.js
// to run test: `cd server`, `npm test`
jest.mock("../models/Notification");

const Notification = require("../models/Notification");

describe("Notification Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/notifications/
  describe("GET /api/notifications/", () => {
    test("returns 400 if userId is missing", async () => {
      const res = await request(app).get("/api/notifications/");

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId is required");
    });

    test("returns notifications for a user", async () => {
      const mockNotifications = [
        {
          _id: "n1",
          userId: "u1",
          message: "Someone commented",
          isRead: false,
        },
        { _id: "n2", userId: "u1", message: "Event updated", isRead: true },
      ];
      Notification.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNotifications),
      });

      const res = await request(app).get("/api/notifications/?userId=u1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockNotifications);
    });

    test("returns 500 if the database throws an error", async () => {
      Notification.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const res = await request(app).get("/api/notifications/?userId=u1");

      expect(res.statusCode).toBe(500);
    });
  });

  // PATCH /api/notifications/read-all
  describe("PATCH /api/notifications/read-all", () => {
    test("returns 400 if userId is missing", async () => {
      const res = await request(app)
        .patch("/api/notifications/read-all")
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId is required");
    });

    test("marks all notifications as read and returns success", async () => {
      Notification.updateMany.mockResolvedValue({});

      const res = await request(app)
        .patch("/api/notifications/read-all")
        .send({ userId: "u1" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("returns 500 if the database throws an error", async () => {
      Notification.updateMany.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .patch("/api/notifications/read-all")
        .send({ userId: "u1" });

      expect(res.statusCode).toBe(500);
    });
  });

  // PATCH /api/notifications/:id
  describe("PATCH /api/notifications/:id", () => {
    test("returns 400 if id is not a valid ObjectId", async () => {
      const res = await request(app).patch("/api/notifications/not-a-valid-id");

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid notification id");
    });

    test("marks one notification as read and returns success", async () => {
      Notification.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(app).patch(
        "/api/notifications/507f1f77bcf86cd799439011",
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("returns 500 if the database throws an error", async () => {
      Notification.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

      const res = await request(app).patch(
        "/api/notifications/507f1f77bcf86cd799439011",
      );

      expect(res.statusCode).toBe(500);
    });
  });

  // DELETE /api/notifications/clear-all
  describe("DELETE /api/notifications/clear-all", () => {
    test("returns 400 if userId is missing", async () => {
      const res = await request(app)
        .delete("/api/notifications/clear-all")
        .send({});

      expect(Notification.deleteMany).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("userId is required");
    });

    test("deletes all notifications for a user and returns success", async () => {
      Notification.deleteMany.mockResolvedValue({});

      const res = await request(app)
        .delete("/api/notifications/clear-all")
        .send({ userId: "u1" });

      expect(Notification.deleteMany).toHaveBeenCalledWith({ userId: "u1" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("deletes notifications by category and returns success", async () => {
      Notification.deleteMany.mockResolvedValue({});

      const res = await request(app)
        .delete("/api/notifications/clear-all")
        .send({ userId: "u1", category: "system" });

      expect(Notification.deleteMany).toHaveBeenCalledWith({
        userId: "u1",
        category: "system",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("treats an invalid category as all notifications and returns success", async () => {
      Notification.deleteMany.mockResolvedValue({});

      const res = await request(app)
        .delete("/api/notifications/clear-all")
        .send({ userId: "u1", category: "invalid" });

      expect(Notification.deleteMany).toHaveBeenCalledWith({ userId: "u1" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("returns 500 if the database throws an error", async () => {
      Notification.deleteMany.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .delete("/api/notifications/clear-all")
        .send({ userId: "u1" });

      expect(res.statusCode).toBe(500);
    });
  });

  // DELETE /api/notifications/:id
  describe("DELETE /api/notifications/:id", () => {
    test("returns 400 if id is not a valid ObjectId", async () => {
      const res = await request(app).delete(
        "/api/notifications/not-a-valid-id",
      );

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid notification id");
    });

    test("returns 404 if the notification does not exist", async () => {
      Notification.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete(
        "/api/notifications/507f1f77bcf86cd799439011",
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Notification not found");
    });

    test("deletes one notification and returns success", async () => {
      Notification.findByIdAndDelete.mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
      });

      const res = await request(app).delete(
        "/api/notifications/507f1f77bcf86cd799439011",
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("returns 500 if the database throws an error", async () => {
      Notification.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

      const res = await request(app).delete(
        "/api/notifications/507f1f77bcf86cd799439011",
      );

      expect(res.statusCode).toBe(500);
    });
  });
});
