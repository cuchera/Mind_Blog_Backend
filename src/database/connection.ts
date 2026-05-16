import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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