import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/auction',
  authenticateJWT,
  authorizeRoles('admin', 'bid-creator'),
  (req, res) => {
    res.json({ message: 'Asta creata' });
  }
);