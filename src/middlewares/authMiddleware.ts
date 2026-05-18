// Intercepta requisições em rotas protegidas e verifica se o token enviado
// no header Authorization é válido. Se for, extrai o ID do usuário e
// o anexa ao objeto req para uso nos controllers.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Lê o header Authorization da requisição
  const authHeader = req.headers.authorization;

  // Verifica se o header existe ou esta na formatação correta
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica e decodifica o token usando a chave secreta do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}