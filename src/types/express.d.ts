// Estende a interface Request do Express para incluir a propriedade userId,
// que é inserida pelo middleware de autenticação após validar o token JWT.

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export {};