// Ponto de entrada da aplicação.
// Configura o servidor Express com os middlewares globais e registra todas as rotas.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import articleRoutes from './routes/articleRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
// Permite que o Express leia o body das requisições no formato JSON
app.use(express.json());

// Registra as rotas da aplicação com seus prefixos
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});