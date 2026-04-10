const request = require("supertest");
const app = require("../server");

// backend integration tests for the Saved Events API
// run tests: cd into server folder and run `npm test` in command line

describe("Saved Events API", () => {
  test("returns 400 on save if userId is missing", async () => {
    const res = await request(app)
      .post("/api/savedevents")
      .send({ eventId: "000000000000000000000001" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("userId and eventId are required");
  });

  test("returns 400 on save if eventId is missing", async () => {
    const res = await request(app)
      .post("/api/savedevents")
      .send({ userId: "000000000000000000000001" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("userId and eventId are required");
  });

  test("returns 400 on unsave if userId is missing", async () => {
    const res = await request(app)
      .delete("/api/savedevents")
      .send({ eventId: "000000000000000000000001" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("userId and eventId are required");
  });

  test("returns 400 on unsave if eventId is missing", async () => {
    const res = await request(app)
      .delete("/api/savedevents")
      .send({ userId: "000000000000000000000001" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("userId and eventId are required");
  });
});
