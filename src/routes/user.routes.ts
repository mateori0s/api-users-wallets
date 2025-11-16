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
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required')
      .isLength({ max: 255 })
      .withMessage('Email must be at most 255 characters'),
    body('password')
      .isString()
      .isLength({ min: 6, max: 100 })
      .withMessage('Password must be between 6 and 100 characters'),
  ],
  validateRequest,
  (req, res) => userController.signUp(req, res)
);

// Sign in
router.post(
  '/signin',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required')
      .isLength({ max: 255 })
      .withMessage('Email must be at most 255 characters'),
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ max: 100 })
      .withMessage('Password must be at most 100 characters'),
  ],
  validateRequest,
  (req, res) => userController.signIn(req, res)
);

// Sign out (requires authentication)
router.post('/signout', authenticate, (req, res) => userController.signOut(req, res));

export default router;

