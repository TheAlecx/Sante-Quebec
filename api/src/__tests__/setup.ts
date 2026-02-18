import "dotenv/config";
import { beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../utils/prisma";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export const setupTests = () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
};
