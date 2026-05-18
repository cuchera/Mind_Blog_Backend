// Gerencia todas as operações do CRUD

import { Request, Response } from 'express';
import pool from '../database/connection';
import fs from 'fs';

export async function listArticles(req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.title, a.content, a.published_at, a.updated_at,
             u.id as author_id, u.name as author_name
      FROM articles a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.published_at DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar artigos.' });
  }
}

// pesquisa artigo específico pelo ID.
export async function getArticle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.title, a.content, a.published_at, a.updated_at,
             u.id as author_id, u.name as author_name
      FROM articles a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    const articles = rows as any[];
    if (articles.length === 0) {
      res.status(404).json({ message: 'Artigo não encontrado.' });
      return;
    }
    res.json(articles[0]);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar artigo.' });
  }
}

// Cria um novo artigo vinculado ao usuário autenticado.
export async function createArticle(req: Request, res: Response): Promise<void> {
  const { title, content } = req.body;
  const userId = req.userId;

  if (!title || !content) {
    res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
    return;
  }

  try {
    let banner: Buffer | null = null;
    let bannerMime: string | null = null;

    if (req.file) {
      banner = fs.readFileSync(req.file.path);
      bannerMime = req.file.mimetype;
      fs.unlinkSync(req.file.path); // remove arquivo temporário
    }

    // Insere o artigo no banco
    const [result] = await pool.query(
      'INSERT INTO articles (user_id, title, content, banner, banner_mime) VALUES (?, ?, ?, ?, ?)',
      [userId, title, content, banner, bannerMime]
    );

    res.status(201).json({ message: 'Artigo criado.', id: (result as any).insertId });
  } catch {
    res.status(500).json({ message: 'Erro ao criar artigo.' });
  }
}

//Atualiza título, conteúdo e opcionalmente o banner de um artigo em caso de o usario ser o autor.
export async function updateArticle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.userId;

  try {
    // Busca o artigo para verificar se existe e quem é o autor
    const [rows] = await pool.query('SELECT user_id FROM articles WHERE id = ?', [id]);
    const articles = rows as any[];

    if (articles.length === 0) {
      res.status(404).json({ message: 'Artigo não encontrado.' });
      return;
    }
    // Apenas o autor pode editar o próprio artigo
    if (articles[0].user_id !== userId) {
      res.status(403).json({ message: 'Você não tem permissão para editar este artigo.' });
      return;
    }

    let bannerFields = '';
    let params: any[] = [title, content];

    if (req.file) {
      const banner = fs.readFileSync(req.file.path);
      const bannerMime = req.file.mimetype;
      fs.unlinkSync(req.file.path);
      bannerFields = ', banner = ?, banner_mime = ?';
      params.push(banner, bannerMime);
    }

    params.push(id);
    await pool.query(
      `UPDATE articles SET title = ?, content = ?${bannerFields} WHERE id = ?`,
      params
    );

    res.json({ message: 'Artigo atualizado.' });
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar artigo.' });
  }
}

//Remoção de Artigo em caso de o usario ser o autor.
export async function deleteArticle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Busca o artigo para verificar se existe e quem é o autor
    const [rows] = await pool.query('SELECT user_id FROM articles WHERE id = ?', [id]);
    const articles = rows as any[];

    if (articles.length === 0) {
      res.status(404).json({ message: 'Artigo não encontrado.' });
      return;
    }
     // Apenas o autor pode deletar o próprio artigo
    if (articles[0].user_id !== userId) {
      res.status(403).json({ message: 'Você não tem permissão para deletar este artigo.' });
      return;
    }

    await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Artigo deletado.' });
  } catch {
    res.status(500).json({ message: 'Erro ao deletar artigo.' });
  }
}

// Retorna a imagem banner de um artigo diretamente como resposta binária.
export async function getBanner(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT banner, banner_mime FROM articles WHERE id = ?', [id]);
    const articles = rows as any[];

    if (articles.length === 0 || !articles[0].banner) {
      res.status(404).json({ message: 'Banner não encontrado.' });
      return;
    }

    // Define o Content-Type correto para o navegador renderizar a imagem
    res.setHeader('Content-Type', articles[0].banner_mime);
    res.send(articles[0].banner);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar banner.' });
  }
}