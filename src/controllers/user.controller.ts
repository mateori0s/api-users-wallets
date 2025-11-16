import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { addToBlacklist } from '../utils/token-blacklist.util';

const userService = new UserService();

export class UserController {
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await userService.signUp({ email, password });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create user',
      });
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await userService.signIn({ email, password });

      res.status(200).json({
        success: true,
        message: 'Sign in successful',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Invalid credentials',
      });
    }
  }

  async signOut(req: Request, res: Response): Promise<void> {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Add token to blacklist to invalidate it
        addToBlacklist(token);
      }

      res.status(200).json({
        success: true,
        message: 'Sign out successful. Token has been invalidated.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sign out',
      });
    }
  }
}
