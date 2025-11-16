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
    body('chain')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Chain is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Chain must be between 1 and 100 characters'),
    body('address')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Address is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Address must be between 1 and 255 characters'),
    body('tag')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Tag must be at most 255 characters'),
  ],
  validateRequest,
  (req: AuthRequest, res: Response) => walletController.createWallet(req, res)
);

// Update a wallet
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid wallet ID'),
    body('tag')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Tag must be at most 255 characters'),
    body('chain')
      .optional({ nullable: true })
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Chain cannot be empty if provided')
      .isLength({ min: 1, max: 100 })
      .withMessage('Chain must be between 1 and 100 characters'),
    body('address')
      .optional({ nullable: true })
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Address cannot be empty if provided')
      .isLength({ min: 1, max: 255 })
      .withMessage('Address must be between 1 and 255 characters'),
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

