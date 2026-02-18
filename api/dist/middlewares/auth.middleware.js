"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
/**
 * Middleware d’authentification JWT
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token manquant" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
        const user = await prisma_1.prisma.utilisateur.findUnique({
            where: { id_utilisateur: decoded.userId }
        });
        if (!user || !user.actif) {
            return res.status(401).json({ message: "Utilisateur invalide" });
        }
        // 🔗 Injection dans la requête
        req.user = {
            id: user.id_utilisateur,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
}
