// Define as rotas com autenticação.
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getBanner,
} from '../controllers/articleController';

const upload = multer({ dest: 'uploads/' });
const router = Router();

// Rotas públicas
router.get('/', listArticles);
router.get('/:id', getArticle);
router.get('/:id/banner', getBanner);

// Rotas protegidas — exigem token JWT válido no header Authorization
router.post('/', authMiddleware, upload.single('banner'), createArticle);
router.put('/:id', authMiddleware, upload.single('banner'), updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

export default router;