"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../utils/prisma");
async function login(email, password) {
    const user = await prisma_1.prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
        throw new Error('utilisateur non trouvé');
    }
    ;
    const isPasswordValid = await bcrypt_1.default.compare(password, user.mot_de_passe);
    if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
    }
    ;
    const token = jsonwebtoken_1.default.sign({
        userId: user.id_utilisateur,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET_KEY, { expiresIn: '8h' });
    return {
        token,
        id: user.id_utilisateur,
        email: user.email,
        role: user.role,
    };
}
