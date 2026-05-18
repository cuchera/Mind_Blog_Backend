// Define as rotas públicas de autenticação.
import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Cadastra um novo usuário
router.post('/register', register);

// POST /auth/login — autentica o usuário e retorna o token JWT
router.post('/login', login);

export default router;