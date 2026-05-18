// Responsável pelo cadastro e login de usuários.

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/connection';

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    return;
  }

  try {
    // Verifica se já existe um usuário com esse email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      res.status(409).json({ message: 'Email já cadastrado.' });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    // Insere o usuário no banco com a senha já criptografada
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    const insertId = (result as any).insertId;
    res.status(201).json({ message: 'Usuário criado com sucesso.', id: insertId });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Valida se os campos foram enviados
  if (!email || !password) {
    res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    return;
  }

  try {
     // Busca o usuário pelo email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const users = rows as any[];

    if (users.length === 0) {
      res.status(401).json({ message: 'Email ou senha inválidos.' });
      return;
    }

    const user = users[0];
    // Compara a senha enviada com o hash armazenado no banco
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(401).json({ message: 'Email ou senha inválidos.' });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d', // Token válido por 7 dias
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}