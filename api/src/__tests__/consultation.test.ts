import request from "supertest";
import app from "../app";

let medecinToken: string;

beforeAll(async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({
      email: "medecin@medical.local",
      password: "Password123!"
    });

  medecinToken = res.body.token;
});

it("create consultation OK", async () => {
  const res = await request(app)
    .post(`/consultations/dossier/${process.env.TEST_DOSSIER_ID}`)
    .set("Authorization", `Bearer ${medecinToken}`)
    .send({ motif: "Test", diagnostic: "Test diag" });

  expect(res.status).toBe(201);
});
