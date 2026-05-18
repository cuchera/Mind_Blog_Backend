// Módulo responsável por criar e exportar o pool de conexões com o banco de dados MySQL.
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// verificar se a conexão com o MySQL deu certo
pool.getConnection()
  .then(() => console.log('MySQL conectado'))
  .catch((err) => console.error('Erro MySQL:', err));

export default pool;