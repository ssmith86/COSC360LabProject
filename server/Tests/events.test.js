const request = require("supertest");
const app = require("../server");

// backend integration tests for the Events API
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

  test("returns 404 when getting an event that does not exist", async () => {
    const fakeId = "000000000000000000000001";
    const res = await request(app).get(`/api/events/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Event not found in database.");
  });

  test("returns 404 when deleting an event that does not exist", async () => {
    const fakeId = "000000000000000000000001";
    const res = await request(app).delete(`/api/events/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Event not found.");
  });
});
