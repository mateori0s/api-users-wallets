import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { WalletController } from '../controllers/wallet.controller';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = express.Router();
const walletController = new WalletController();

// All routes require authentication
router.use(authenticate);

// Get all wallets for the authenticated user
router.get('/', (req: AuthRequest, res: Response) => walletController.getAllWallets(req, res));

// Get a specific wallet by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid wallet ID')],
  validateRequest,
  (req: AuthRequest, res: Response) => walletController.getWalletById(req, res)
);

// Create a new wallet
router.post(
  '/',
  [
    body('chain').notEmpty().withMessage('Chain is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('tag').optional().isString(),
  ],
  validateRequest,
  (req: AuthRequest, res: Response) => walletController.createWallet(req, res)
);

// Update a wallet
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid wallet ID'),
    body('tag').optional().isString(),
    body('chain').notEmpty().withMessage('Chain is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ],
  validateRequest,
  (req: AuthRequest, res: Response) => walletController.updateWallet(req, res)
);

// Delete a wallet
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid wallet ID')],
  validateRequest,
  (req: AuthRequest, res: Response) => walletController.deleteWallet(req, res)
);

export default router;

