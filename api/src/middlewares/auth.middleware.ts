import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Middleware d’authentification JWT
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.utilisateur.findUnique({
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
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
