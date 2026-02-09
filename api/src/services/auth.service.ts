import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

export async function login(email: string, password: string) {
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
        throw new Error('utilisateur non trouvé');
    };
    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
    if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
    };
    const token = jwt.sign(
        {
            userId: user.id_utilisateur,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h'}
        );
    return { token };
}