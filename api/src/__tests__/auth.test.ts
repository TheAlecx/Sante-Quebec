import request from "supertest";
import app from "../app";

describe("Auth API", () => {

  it("login OK", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "medecin@medical.local",
        password: "Password123!"
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("login KO", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "medecin@medical.local",
        password: "wrong"
      });

    expect(res.status).toBe(401);
  });

});
