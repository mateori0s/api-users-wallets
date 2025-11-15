import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await userService.signUp({ email, password });

      res.status(201).json({
        message: 'User created successfully',
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create user' });
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
    // Sign out is handled client-side by removing the token
    // This endpoint validates the token and confirms successful sign out
    res.status(200).json({
      success: true,
      message: 'Sign out successful',
    });
  }
}
