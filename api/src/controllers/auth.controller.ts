import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (e) {
    res.status(401).json({ message: "Identifiants invalides" });
  }
}

export async function me(req: Request, res: Response) {
  res.json(req.user);
}
