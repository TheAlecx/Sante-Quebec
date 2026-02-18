"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTests = void 0;
require("dotenv/config");
const globals_1 = require("@jest/globals");
const prisma_1 = require("../utils/prisma");
(0, globals_1.beforeAll)(async () => {
    await prisma_1.prisma.$connect();
});
(0, globals_1.afterAll)(async () => {
    await prisma_1.prisma.$disconnect();
});
const setupTests = () => {
    (0, globals_1.beforeAll)(async () => {
        await prisma_1.prisma.$connect();
    });
    (0, globals_1.afterAll)(async () => {
        await prisma_1.prisma.$disconnect();
    });
};
exports.setupTests = setupTests;
