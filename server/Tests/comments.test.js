const request = require("supertest");
const app = require("../server");

// backend integration tests for the Comments API
// run tests: cd into server folder and run `npm test` in command line

describe("Comments API", () => {
  test("returns 400 if eventId is missing", async () => {
    const res = await request(app)
      .post("/api/comments")
      .send({ userId: "000000000000000000000001", content: "hello" });
    expect(res.statusCode).toBe(400);
  });

  test("returns 400 if userId is missing", async () => {
    const res = await request(app)
      .post("/api/comments")
      .send({ eventId: "000000000000000000000001", content: "hello" });
    expect(res.statusCode).toBe(400);
  });

  test("returns 400 if content is missing", async () => {
    const res = await request(app)
      .post("/api/comments")
      .send({ eventId: "000000000000000000000001", userId: "000000000000000000000002" });
    expect(res.statusCode).toBe(400);
  });

  test("returns 400 if content is only whitespace", async () => {
    const res = await request(app)
      .post("/api/comments")
      .send({ eventId: "000000000000000000000001", userId: "000000000000000000000002", content: "   " });
    expect(res.statusCode).toBe(400);
  });
});
