const request = require("supertest");
const app = require("../server");

// backend integration tests for Events CRUD API
// This test covers "Edge Case" and "Logic-Heavy" code tests
// run tests: cd into server folder and run `npm test` in command line

describe("Event API", () => {
  test("returns 400 if event_name is missing", async () => {
    const res = await request(app)
      .post("/api/events/")
      .send({ description: "a test event" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid event data received.");
  });

  test("returns 400 if no data is sent", async () => {
    const res = await request(app).post("/api/events/").send({});
    expect(res.statusCode).toBe(400);
  });

  test("returns 400 if no ownerId is provided", async () => {
    const res = await request(app).get("/api/events/myevents");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("ownerId query parameter is required");
  });
});
