"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe("Auth API", () => {
    it("login OK", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/auth/login")
            .send({
            email: "medecin@medical.local",
            password: "Password123!"
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
    it("login KO", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/auth/login")
            .send({
            email: "medecin@medical.local",
            password: "wrong"
        });
        expect(res.status).toBe(401);
    });
});
