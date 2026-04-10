const request = require("supertest");
const app = require("../server");

// backend integration tests for the Auth API (login, register)
// run tests: cd into server folder and run `npm test` in command line

describe("Login API", () => {
  test("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ password: "somepassword" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email and password are required.");
  });

  test("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "someone@example.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email and password are required.");
  });

  test("returns 401 for wrong credentials", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "notreal@example.com", password: "wrongpassword" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password.");
  });
});

describe("Register API", () => {
  test("returns 400 if firstName is missing", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ lastName: "Smith", email: "test@example.com", password: "password123" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  test("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ firstName: "Bob", lastName: "Bobson", password: "password123" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });

  test("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ firstName: "Bob", lastName: "Bobson", email: "test@example.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });
});
