const request = require("supertest");
const app = require("../server");

// backend integration tests for the Users API
// run tests: cd into server folder and run `npm test` in command line

const fakeId = "000000000000000000000001";

describe("Users API", () => {
  test("returns 404 when getting a user that does not exist", async () => {
    const res = await request(app).get(`/api/users/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  test("returns 404 when updating a user that does not exist", async () => {
    const res = await request(app)
      .patch(`/api/users/${fakeId}`)
      .send({ firstName: "New Name" });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

});
