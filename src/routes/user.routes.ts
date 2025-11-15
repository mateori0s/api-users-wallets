import express from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const userController = new UserController();

// Sign up
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  (req, res) => userController.signUp(req, res)
);

// Sign in
router.post(
  '/signin',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  (req, res) => userController.signIn(req, res)
);

// Sign out (requires authentication)
router.post('/signout', authenticate, (req, res) => userController.signOut(req, res));

export default router;

