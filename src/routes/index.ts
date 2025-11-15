import express from 'express';
import userRoutes from './user.routes';
import walletRoutes from './wallet.routes';

const router = express.Router();

router.use('/auth', userRoutes);
router.use('/wallets', walletRoutes);

export default router;

