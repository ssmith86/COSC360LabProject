const request = require("supertest");
const app = require("../server");

// Mock models and bcrypt to skip MongoDB connection
jest.mock("../models/User");
jest.mock("bcrypt");

const User = require("../models/User");
const bcrypt = require("bcrypt");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // POST /api/register
  describe("POST /api/register", () => {
    test("returns 400 if firstName is missing", async () => {
      const res = await request(app)
        .post("/api/register")
        .send({ lastName: "Doe", email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("All fields are required.");
    });

    test("returns 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/register")
        .send({ firstName: "John", lastName: "Doe", password: "123456" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("All fields are required.");
    });

    test("returns 400 if password is missing", async () => {
      const res = await request(app)
        .post("/api/register")
        .send({ firstName: "John", lastName: "Doe", email: "john@test.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("All fields are required.");
    });

    test("returns 409 if email is already registered", async () => {
      User.findOne.mockResolvedValueOnce({ _id: "u1", email: "john@test.com" });

      const res = await request(app)
        .post("/api/register")
        .send({ firstName: "John", lastName: "Doe", userName: "john", email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe("Email already registered.");
    });

    test("returns 409 if username is already taken", async () => {
      User.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ _id: "u2", userName: "john" });

      const res = await request(app)
        .post("/api/register")
        .send({ firstName: "John", lastName: "Doe", userName: "john", email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe("Username already exists");
    });

    test("creates an account and returns 201 with welcome message", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_password");
      User.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/register")
        .send({ firstName: "John", lastName: "Doe", userName: "john", email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Welcome, John! Your account has been created.");
    });

    test("returns 500 if the database throws an error", async () => {
      User.findOne.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .post("/api/register")
        .send({ firstName: "John", lastName: "Doe", userName: "john", email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(500);
    });
  });

  // POST /api/login
  describe("POST /api/login", () => {
    test("returns 400 if email is missing", async () => {
      const res = await request(app).post("/api/login").send({ password: "123456" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email and password are required.");
    });

    test("returns 400 if password is missing", async () => {
      const res = await request(app).post("/api/login").send({ email: "john@test.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email and password are required.");
    });

    test("returns 401 if email is not found", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/login")
        .send({ email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid email or password.");
    });

    test("returns 401 if password is incorrect", async () => {
      User.findOne.mockResolvedValue({ _id: "u1", password: "hashed_password" });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post("/api/login")
        .send({ email: "john@test.com", password: "wrongpass" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid email or password.");
    });

    test("returns 200 with user info on successful login", async () => {
      User.findOne.mockResolvedValue({
        _id: { toString: () => "u1" },
        firstName: "John",
        password: "hashed_password",
        isAdmin: false,
        isBanned: false,
        lastLogin: null,
        save: jest.fn().mockResolvedValue({}),
      });
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post("/api/login")
        .send({ email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Welcome back, John!");
      expect(res.body.userId).toBe("u1");
      expect(res.body.isAdmin).toBe(false);
    });

    test("returns 500 if the database throws an error", async () => {
      User.findOne.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .post("/api/login")
        .send({ email: "john@test.com", password: "123456" });

      expect(res.statusCode).toBe(500);
    });
  });
});
