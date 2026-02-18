"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
let medecinToken;
beforeAll(async () => {
    const res = await (0, supertest_1.default)(app_1.default)
        .post("/auth/login")
        .send({
        email: "medecin@medical.local",
        password: "Password123!"
    });
    medecinToken = res.body.token;
});
it("create consultation OK", async () => {
    const res = await (0, supertest_1.default)(app_1.default)
        .post(`/consultations/dossier/${process.env.TEST_DOSSIER_ID}`)
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({ motif: "Test", diagnostic: "Test diag" });
    expect(res.status).toBe(201);
});
